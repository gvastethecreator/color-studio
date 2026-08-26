import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OFFICIAL_PRESETS } from '@/data/official-presets';
import { PRESETS } from '@/data/presets';
import { useAccentTheme } from '@/hooks/use-accent-theme';
import { getNextAccentPalette } from '@/lib/accent-palettes';
import { copyTextToClipboard } from '@/lib/clipboard';
import { parseCustomPresetText } from '@/lib/custom-presets';
import { notify, notifyAfterToastReady } from '@/lib/studio-notify';
import {
  ensureAvailablePreset,
  readStoredCustomPresetsWithStatus,
  readStoredSettingsWithStatus,
  writeStoredCustomPresets,
  writeStoredSettings,
} from '@/lib/storage';
import { readStoredStudioStateWithStatus, writeStoredStudioState } from '@/lib/studio-storage';
import { createStopId, createStopInLargestGap, sortGradientStops } from '@/lib/gradient';
import type { PresetRegistry, ThemeMode } from '@/types/palette';
import type { StudioState, StudioToolId } from '@/types/studio';

const WORKBENCH_WRITE_MS = 280;

const mergePresetRegistries = (customPresets: PresetRegistry): PresetRegistry => ({
  ...PRESETS,
  ...OFFICIAL_PRESETS,
  ...customPresets,
});

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

const SHORTCUT_TOOLS: Record<string, StudioToolId> = {
  1: 'palette',
  2: 'gradient',
  3: 'scale',
  4: 'contrast',
};

export function useStudioSession() {
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
  const studioRef = useRef(studio);
  studioRef.current = studio;

  useEffect(() => {
    if (corruptionReported.current) return;
    const discarded =
      initialStorage.studio.discarded ||
      initialStorage.settings.discarded ||
      initialStorage.customPresets.discarded;

    if (discarded) {
      corruptionReported.current = true;
      notifyAfterToastReady('Saved data was invalid, so defaults were restored.', {
        type: 'warning',
      });
    }
  }, [initialStorage]);

  useEffect(() => {
    setSettings((previous) => ensureAvailablePreset(previous, presetRegistry));
  }, [presetRegistry]);

  useEffect(() => writeStoredSettings(settings), [settings]);
  useEffect(() => writeStoredCustomPresets(customPresets), [customPresets]);
  useEffect(() => {
    const timer = window.setTimeout(
      () => writeStoredStudioState(studioRef.current),
      WORKBENCH_WRITE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [studio]);
  useEffect(() => () => writeStoredStudioState(studioRef.current), []);
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
      notifyAfterToastReady(`${theme === 'dark' ? 'Dark' : 'Light'} theme enabled.`);
      return { ...previous, theme };
    });
  }, []);

  const handleCycleAccent = useCallback(() => {
    setSettings((previous) => {
      const nextPalette = getNextAccentPalette(previous.accentPalette);
      notifyAfterToastReady(`Studio accent: ${nextPalette.label}.`);
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

  const handleAddToGradient = useCallback((color: string) => {
    setStudio((previous) => {
      const stops = sortGradientStops(previous.gradient.stops);
      if (stops.length < 8) {
        const id = createStopId();
        const stop = { ...createStopInLargestGap(stops, id), color };
        return {
          ...previous,
          activeTool: 'gradient',
          gradient: {
            ...previous.gradient,
            stops: [...previous.gradient.stops, stop],
            selectedStopId: id,
          },
        };
      }
      const selectedId = previous.gradient.selectedStopId;
      return {
        ...previous,
        activeTool: 'gradient',
        gradient: {
          ...previous.gradient,
          stops: previous.gradient.stops.map((stop) =>
            stop.id === selectedId ? { ...stop, color } : stop,
          ),
        },
      };
    });
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

  const handleRemovePreset = (presetId: string) => {
    if (!customPresets[presetId]) return;
    setCustomPresets((previous) => {
      const next = { ...previous };
      delete next[presetId];
      return next;
    });
    notify(`Removed custom preset “${presetId}”.`);
  };

  return {
    studio,
    setStudio,
    settings,
    setSettings,
    customPresets,
    presetRegistry,
    notify,
    setActiveTool,
    handleThemeToggle,
    handleCycleAccent,
    handleCopy,
    handleTestInContrast,
    handleAddToGradient,
    handleImportPreset,
    handleRemovePreset,
  };
}

export type { StudioState };
