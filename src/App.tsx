import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
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
  readStoredCustomPresets,
  readStoredSettings,
  writeStoredCustomPresets,
  writeStoredSettings,
} from '@/lib/storage';
import { readStoredStudioState, writeStoredStudioState } from '@/lib/studio-storage';
import type { GeneratorSettings, PresetRegistry, ThemeMode } from '@/types/palette';
import type { StudioState, StudioToolId } from '@/types/studio';

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

const notify = (message: string, type: 'success' | 'error' = 'success') => {
  toastManager.add({ description: message, type });
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

export default function App() {
  const [customPresets, setCustomPresets] = useState<PresetRegistry>(readStoredCustomPresets);
  const [settings, setSettings] = useState<GeneratorSettings>(readStoredSettings);
  const [studio, setStudio] = useState<StudioState>(readStoredStudioState);
  const presetRegistry = useMemo(() => mergePresetRegistries(customPresets), [customPresets]);

  useEffect(() => {
    setSettings((previous) => ensureAvailablePreset(previous, presetRegistry));
  }, [presetRegistry]);

  useEffect(() => writeStoredSettings(settings), [settings]);
  useEffect(() => writeStoredCustomPresets(customPresets), [customPresets]);
  useEffect(() => writeStoredStudioState(studio), [studio]);
  useEffect(() => applyTheme(settings.theme), [settings.theme]);

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
      copied ? 'success' : 'error',
    );
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
      notify(
        error instanceof Error ? error.message : 'Unable to import custom preset JSON.',
        'error',
      );
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
                />
              )}
              {studio.activeTool === 'gradient' && (
                <GradientEditor
                  state={studio.gradient}
                  onChange={(gradient) => setStudio((previous) => ({ ...previous, gradient }))}
                  onCopy={(text, label) => void handleCopy(text, label)}
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
