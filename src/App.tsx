import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { IconLayoutGrid, IconDeviceDesktop, IconRotate } from '@tabler/icons-react';
import ControlPanel from '@/components/ControlPanel';
import ExportMenu from '@/components/ExportMenu';
import PaletteGrid from '@/components/PaletteGrid';
import PreviewPanel from '@/components/PreviewPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ViewModeSelector } from '@/components/ViewModeSelector';
import type { PaletteViewMode } from '@/components/ViewModeSelector';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTab } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ColorFormatSelect } from '@/components/ColorFormatSelect';
import { PRESETS } from '@/data/presets';
import { OFFICIAL_PRESETS } from '@/data/official-presets';
import { generatePalettes, getSafeActiveFamily } from '@/lib/color';
import { parseCustomPresetText } from '@/lib/custom-presets';
import { getNextAccentPalette } from '@/lib/accent-palettes';
import { useAccentTheme } from '@/hooks/use-accent-theme';
import { toastManager } from '@/components/ui/toast';
import {
  ensureAvailablePreset,
  readStoredCustomPresets,
  readStoredSettings,
  writeStoredCustomPresets,
  writeStoredSettings,
} from '@/lib/storage';
import { createDefaultSettings } from '@/types/palette';
import type { GeneratorSettings, PresetRegistry, ThemeMode } from '@/types/palette';

gsap.registerPlugin(useGSAP);

const mergePresetRegistries = (customPresets: PresetRegistry): PresetRegistry => ({
  ...PRESETS,
  ...OFFICIAL_PRESETS,
  ...customPresets,
});

const notify = (message: string, type: 'success' | 'error' = 'success') => {
  toastManager.add({
    description: message,
    type,
  });
};

const applyTheme = (theme: ThemeMode) => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  root.dataset.theme = theme;
};

type ViewState = {
  activeTab: 'palette' | 'preview';
  paletteView: PaletteViewMode;
  copySwatchId: string | null;
};

type ViewAction =
  | { type: 'setActiveTab'; value: 'palette' | 'preview' }
  | { type: 'setPaletteView'; value: PaletteViewMode }
  | { type: 'copySwatch'; copyId: string }
  | { type: 'clearCopySwatch' };

const viewReducer = (state: ViewState, action: ViewAction): ViewState => {
  switch (action.type) {
    case 'setActiveTab':
      return { ...state, activeTab: action.value };
    case 'setPaletteView':
      return { ...state, paletteView: action.value };
    case 'copySwatch':
      return { ...state, copySwatchId: action.copyId };
    case 'clearCopySwatch':
      return { ...state, copySwatchId: null };
  }
};

export default function App() {
  const [customPresets, setCustomPresets] = useState<PresetRegistry>(readStoredCustomPresets);
  const presetRegistry = useMemo(() => mergePresetRegistries(customPresets), [customPresets]);
  const [settings, setSettings] = useState<GeneratorSettings>(readStoredSettings);
  const [view, dispatchView] = useReducer(viewReducer, {
    activeTab: 'palette',
    paletteView: 'rows',
    copySwatchId: null,
  });
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);

  const palettes = useMemo(
    () => generatePalettes(settings, presetRegistry),
    [presetRegistry, settings],
  );

  const prevPresetRegistryRef = useRef(presetRegistry);
  if (presetRegistry !== prevPresetRegistryRef.current) {
    prevPresetRegistryRef.current = presetRegistry;
    const adjusted = ensureAvailablePreset(settings, presetRegistry);
    if (adjusted !== settings) {
      setSettings(adjusted);
    }
  }

  if (palettes.length === 0) {
    if (selectedFamilyId !== null) {
      setSelectedFamilyId(null);
    }
  } else if (!selectedFamilyId || !palettes.some((palette) => palette.id === selectedFamilyId)) {
    setSelectedFamilyId(palettes[0].id);
  }

  useEffect(() => {
    writeStoredSettings(settings);
  }, [settings]);

  useEffect(() => {
    writeStoredCustomPresets(customPresets);
  }, [customPresets]);

  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  useAccentTheme(settings.accentPalette);

  const handleImportPreset = async (file: File) => {
    try {
      const importedPresets = parseCustomPresetText(await file.text());
      const importedIds = Object.keys(importedPresets);
      const nextPresetId = importedIds[0];

      setCustomPresets((previous) => ({
        ...previous,
        ...importedPresets,
      }));

      if (nextPresetId) {
        setSettings((previous) => ({
          ...previous,
          preset: nextPresetId,
          overrides: {},
        }));
        setSelectedFamilyId(null);
        dispatchView({ type: 'setActiveTab', value: 'palette' });
      }

      notify(
        importedIds.length === 1
          ? `Imported custom preset "${importedIds[0]}".`
          : `Imported ${importedIds.length} custom presets.`,
      );
    } catch (error) {
      notify(
        error instanceof Error ? error.message : 'Unable to import custom preset JSON.',
        'error',
      );
    }
  };

  const activeFamily = useMemo(
    () => getSafeActiveFamily(palettes, selectedFamilyId),
    [palettes, selectedFamilyId],
  );

  useEffect(() => {
    if (!view.copySwatchId) {
      return undefined;
    }

    const timer = window.setTimeout(() => dispatchView({ type: 'clearCopySwatch' }), 1400);
    return () => window.clearTimeout(timer);
  }, [view.copySwatchId]);

  useGSAP(
    () => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return undefined;
      }

      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-animate="enter"]', {
          opacity: 0,
          y: 8,
          duration: 0.3,
          ease: 'power2.out',
          stagger: 0.04,
        });
      });

      return () => media.revert();
    },
    { dependencies: [view.activeTab] },
  );

  const handleColorFormatChange = (format: GeneratorSettings['colorFormat']) => {
    setSettings((previous) => ({ ...previous, colorFormat: format }));
  };

  const handleThemeToggle = useCallback(() => {
    setSettings((previous) => {
      const nextTheme: ThemeMode = previous.theme === 'dark' ? 'light' : 'dark';
      // Schedule the notification after this tick to avoid updating context during rendering/dispatching state updates
      setTimeout(() => notify(`${nextTheme === 'dark' ? 'Dark' : 'Light'} theme enabled.`), 0);
      return { ...previous, theme: nextTheme };
    });
  }, []);

  const handleCycleAccent = useCallback(() => {
    setSettings((previous) => {
      const nextPalette = getNextAccentPalette(previous.accentPalette);
      // Schedule the notification after this tick
      setTimeout(() => notify(`Accent: ${nextPalette.label}.`), 0);
      return { ...previous, accentPalette: nextPalette.id };
    });
  }, []);

  const handleCopySwatch = (copyId: string) => {
    dispatchView({ type: 'copySwatch', copyId });
  };

  if (!activeFamily) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        No families are available for the selected preset.
      </div>
    );
  }

  return (
    <TooltipProvider delay={120}>
      <div className="isolate flex h-dvh flex-col overflow-hidden bg-background text-foreground md:flex-row">
        <ControlPanel
          settings={settings}
          setSettings={setSettings}
          onReset={() => {
            setSettings(createDefaultSettings());
            notify('Settings reset to defaults.');
          }}
          activeFamilyId={activeFamily.id}
          activeFamilyDisplayName={activeFamily.name}
          presetOptions={presetRegistry}
          customPresetCount={Object.keys(customPresets).length}
          onImportPreset={handleImportPreset}
          accentPalette={settings.accentPalette}
          onCycleAccent={handleCycleAccent}
        />

        <main className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <header className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/80 px-3 text-[12px] backdrop-blur-md sm:px-4">
            <div className="flex items-center gap-1.5" data-animate="enter">
              <Tabs
                value={view.activeTab}
                onValueChange={(value: string) =>
                  dispatchView({
                    type: 'setActiveTab',
                    value: value === 'preview' ? 'preview' : 'palette',
                  })
                }
                className="flex-1 justify-center"
              >
                <TabsList variant="default" className="mx-auto h-8">
                  <TabsTab value="palette" className="h-7 text-[12px]">
                    <IconLayoutGrid aria-hidden="true" />
                    Palette
                  </TabsTab>
                  <TabsTab value="preview" className="h-7 text-[12px]">
                    <IconDeviceDesktop aria-hidden="true" />
                    Preview
                  </TabsTab>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-1" data-animate="enter">
              <ViewModeSelector
                value={view.paletteView}
                onChange={(value) => dispatchView({ type: 'setPaletteView', value })}
              />

              <Separator orientation="vertical" className="mx-0.5 h-4" />

              <ColorFormatSelect value={settings.colorFormat} onChange={handleColorFormatChange} />

              <Separator orientation="vertical" className="mx-0.5 h-4" />

              <ExportMenu
                palettes={palettes}
                colorFormat={settings.colorFormat}
                onNotify={notify}
              />

              <Button
                type="button"
                size="icon-xs"
                variant="ghost"
                onClick={() => {
                  setSettings(createDefaultSettings());
                  notify('Settings reset to defaults.');
                }}
                aria-label="Reset all settings"
                title="Reset all settings"
              >
                <IconRotate aria-hidden="true" />
              </Button>

              <ThemeToggle theme={settings.theme} onToggle={handleThemeToggle} />
            </div>
          </header>

          {view.activeTab === 'palette' ? (
            <div className="flex-1 min-h-0 flex flex-col">
              <PaletteGrid
                palettes={palettes}
                colorFormat={settings.colorFormat}
                onSelectFamily={setSelectedFamilyId}
                selectedFamilyId={activeFamily.id}
                onNotify={notify}
                copiedSwatchId={view.copySwatchId}
                onCopySwatch={handleCopySwatch}
                viewMode={view.paletteView}
              />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <div className="mx-auto flex h-full max-w-5xl flex-col gap-3" data-animate="enter">
                <PreviewPanel activeFamily={activeFamily} />
                <p className="text-center text-muted-foreground text-xs">
                  Previewing{' '}
                  <span className="font-semibold text-foreground">{activeFamily.name}</span> family.
                  Return to the grid view to choose a different base.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </TooltipProvider>
  );
}
