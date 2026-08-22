import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IconCircleCheck, IconSparkles } from '@tabler/icons-react';
import { BrandLogo } from '@/components/BrandLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PaletteComposer } from '@/components/studio/PaletteComposer';
import { StudioNavigation } from '@/components/studio/StudioNavigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { toastManager } from '@/components/ui/toast';
import { OFFICIAL_PRESETS } from '@/data/official-presets';
import { PRESETS } from '@/data/presets';
import { useAccentTheme } from '@/hooks/use-accent-theme';
import { getNextAccentPalette } from '@/lib/accent-palettes';
import { copyTextToClipboard } from '@/lib/clipboard';
import { parseCustomPresetText } from '@/lib/custom-presets';
import {
  ensureAvailablePreset,
  readStoredCustomPresetsWithStatus,
  readStoredSettingsWithStatus,
  writeStoredCustomPresets,
  writeStoredSettings,
} from '@/lib/storage';
import { readStoredStudioStateWithStatus, writeStoredStudioState } from '@/lib/studio-storage';
import type { PresetRegistry, ThemeMode } from '@/types/palette';
import type { StudioNotifyOptions, StudioToolId } from '@/types/studio';

const GradientEditor = lazy(() =>
  import('@/components/studio/GradientEditor').then(({ GradientEditor }) => ({
    default: GradientEditor,
  })),
);
const ScaleWorkspace = lazy(() =>
  import('@/components/studio/ScaleWorkspace').then(({ ScaleWorkspace }) => ({
    default: ScaleWorkspace,
  })),
);
const ContrastTool = lazy(() =>
  import('@/components/studio/ContrastTool').then(({ ContrastTool }) => ({
    default: ContrastTool,
  })),
);

const mergePresetRegistries = (customPresets: PresetRegistry): PresetRegistry => ({
  ...PRESETS,
  ...OFFICIAL_PRESETS,
  ...customPresets,
});

const UNDO_TOAST_TIMEOUT_MS = 8000;

const notify = (message: string, options: StudioNotifyOptions = {}) => {
  const { type = 'success', undo } = options;
  toastManager.add({
    description: message,
    type,
    ...(undo
      ? {
          timeout: UNDO_TOAST_TIMEOUT_MS,
          actionProps: { children: 'Undo', onClick: undo },
        }
      : {}),
  });
};

const applyTheme = (theme: ThemeMode) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  root.dataset.theme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#12110F' : '#E9E5DC');
};

const TOOL_TITLES: Record<StudioToolId, string> = {
  palette: 'Palette Composer',
  gradient: 'Gradient Lab',
  scale: 'Scale Lab',
  contrast: 'Contrast + Mix',
};

const SHORTCUT_TOOLS: Record<string, StudioToolId> = {
  1: 'palette',
  2: 'gradient',
  3: 'scale',
  4: 'contrast',
};

export default function App() {
  const initialStorage = useMemo(
    () => ({
      studio: readStoredStudioStateWithStatus(),
      settings: readStoredSettingsWithStatus(),
      customPresets: readStoredCustomPresetsWithStatus(),
    }),
    [],
  );
  const [customPresets, setCustomPresets] = useState(initialStorage.customPresets.value);
  const [settings, setSettings] = useState(initialStorage.settings.value);
  const [studio, setStudio] = useState(initialStorage.studio.value);
  const presetRegistry = useMemo(() => mergePresetRegistries(customPresets), [customPresets]);
  const corruptionReported = useRef(false);

  useEffect(() => {
    if (corruptionReported.current) return;
    const discarded =
      initialStorage.studio.discarded ||
      initialStorage.settings.discarded ||
      initialStorage.customPresets.discarded;

    if (discarded) {
      corruptionReported.current = true;
      // Defer one tick: the ToastProvider above this component subscribes to the
      // toast manager in its own effect, which runs after this one on mount.
      window.setTimeout(() => {
        notify('Saved data was invalid, so defaults were restored.', { type: 'warning' });
      }, 0);
    }
  }, [initialStorage]);

  useEffect(() => {
    setSettings((previous) => ensureAvailablePreset(previous, presetRegistry));
  }, [presetRegistry]);

  useEffect(() => writeStoredSettings(settings), [settings]);
  useEffect(() => writeStoredCustomPresets(customPresets), [customPresets]);
  useEffect(() => writeStoredStudioState(studio), [studio]);
  useEffect(() => applyTheme(settings.theme), [settings.theme]);

  useEffect(() => {
    const handleToolShortcut = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (
        target.isContentEditable ||
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) ||
        target.closest('[role="dialog"], [role="listbox"], [role="menu"]')
      ) {
        return;
      }
      const tool = SHORTCUT_TOOLS[event.key];
      if (!tool) return;
      setStudio((previous) =>
        previous.activeTool === tool ? previous : { ...previous, activeTool: tool },
      );
    };

    window.addEventListener('keydown', handleToolShortcut);
    return () => window.removeEventListener('keydown', handleToolShortcut);
  }, []);

  useAccentTheme(settings.accentPalette);

  const setActiveTool = (activeTool: StudioToolId) =>
    setStudio((previous) => ({ ...previous, activeTool }));

  const handleThemeToggle = useCallback(() => {
    setSettings((previous) => {
      const theme: ThemeMode = previous.theme === 'dark' ? 'light' : 'dark';
      window.setTimeout(() => notify(`${theme === 'dark' ? 'Dark' : 'Light'} theme enabled.`), 0);
      return { ...previous, theme };
    });
  }, []);

  const handleCycleAccent = useCallback(() => {
    setSettings((previous) => {
      const nextPalette = getNextAccentPalette(previous.accentPalette);
      window.setTimeout(() => notify(`Studio accent: ${nextPalette.label}.`), 0);
      return { ...previous, accentPalette: nextPalette.id };
    });
  }, []);

  const handleCopy = useCallback(async (text: string, label: string) => {
    const copied = await copyTextToClipboard(text);
    notify(
      copied
        ? `${label} copied.`
        : 'Clipboard is unavailable. Select the visible value and copy it manually.',
      { type: copied ? 'success' : 'error' },
    );
  }, []);

  const handleTestInContrast = useCallback((color: string) => {
    setStudio((previous) => ({
      ...previous,
      activeTool: 'contrast',
      contrast: { ...previous.contrast, foreground: color },
    }));
  }, []);

  const handleImportPreset = async (file: File) => {
    try {
      const importedPresets = parseCustomPresetText(await file.text());
      const importedIds = Object.keys(importedPresets);
      const nextPresetId = importedIds[0];
      setCustomPresets((previous) => ({ ...previous, ...importedPresets }));

      if (nextPresetId) {
        setSettings((previous) => ({ ...previous, preset: nextPresetId, overrides: {} }));
        setActiveTool('scale');
      }

      notify(
        importedIds.length === 1
          ? `Imported custom preset “${importedIds[0]}”.`
          : `Imported ${importedIds.length} custom presets.`,
      );
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Unable to import custom preset JSON.', {
        type: 'error',
      });
    }
  };

  return (
    <TooltipProvider delay={120}>
      <div className="studio-shell">
        <a className="studio-skip-link" href="#studio-workspace">
          Skip to workspace
        </a>

        <header className="studio-global-header">
          <div className="studio-brand-block">
            <BrandLogo paletteId={settings.accentPalette} onCycle={handleCycleAccent} />
            <div>
              <h1>Color Studio</h1>
              <span>Local color workbench</span>
            </div>
          </div>

          <div className="studio-project-state" aria-label="Project status">
            <IconCircleCheck aria-hidden="true" />
            <span>
              Untitled color study
              <small>Changes saved locally</small>
            </span>
          </div>

          <div className="studio-global-actions">
            <span className="studio-current-tool">
              <IconSparkles aria-hidden="true" />
              {TOOL_TITLES[studio.activeTool]}
            </span>
            <ThemeToggle theme={settings.theme} onToggle={handleThemeToggle} />
          </div>
        </header>

        <div className="studio-body">
          <StudioNavigation activeTool={studio.activeTool} onChange={setActiveTool} />

          <main id="studio-workspace" className="studio-workspace" tabIndex={-1}>
            <Suspense
              fallback={
                <div className="studio-tool-loading" role="status">
                  Loading {TOOL_TITLES[studio.activeTool]}…
                </div>
              }
            >
              {studio.activeTool === 'palette' && (
                <PaletteComposer
                  state={studio.palette}
                  onChange={(palette) => setStudio((previous) => ({ ...previous, palette }))}
                  onCopy={(text, label) => void handleCopy(text, label)}
                  onTestInContrast={handleTestInContrast}
                />
              )}
              {studio.activeTool === 'gradient' && (
                <GradientEditor
                  state={studio.gradient}
                  onChange={(gradient) => setStudio((previous) => ({ ...previous, gradient }))}
                  onCopy={(text, label) => void handleCopy(text, label)}
                  onNotify={notify}
                />
              )}
              {studio.activeTool === 'scale' && (
                <ScaleWorkspace
                  settings={settings}
                  setSettings={setSettings}
                  presetRegistry={presetRegistry}
                  customPresetCount={Object.keys(customPresets).length}
                  onImportPreset={handleImportPreset}
                  accentPalette={settings.accentPalette}
                  onCycleAccent={handleCycleAccent}
                  onNotify={notify}
                />
              )}
              {studio.activeTool === 'contrast' && (
                <ContrastTool
                  contrast={studio.contrast}
                  mixer={studio.mixer}
                  onContrastChange={(contrast) =>
                    setStudio((previous) => ({ ...previous, contrast }))
                  }
                  onMixerChange={(mixer) => setStudio((previous) => ({ ...previous, mixer }))}
                  onCopy={(text, label) => void handleCopy(text, label)}
                />
              )}
            </Suspense>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
