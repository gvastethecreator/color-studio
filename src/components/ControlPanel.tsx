import type { Dispatch, SetStateAction } from 'react';
import { Grid, Palette, RefreshCcw, RotateCcw, Settings2, Sliders, Sun } from 'lucide-react';
import { PRESETS } from '@/data/presets';
import { DEFAULT_OVERRIDE } from '@/types/palette';
import type { FamilyOverride, GeneratorSettings } from '@/types/palette';

interface ControlPanelProps {
  settings: GeneratorSettings;
  setSettings: Dispatch<SetStateAction<GeneratorSettings>>;
  onReset: () => void;
  activeFamilyId: string;
  activeFamilyDisplayName: string;
}

type OverrideKey = keyof Pick<FamilyOverride, 'hueShift' | 'chromaScale' | 'lightnessScale'>;

export default function ControlPanel({
  settings,
  setSettings,
  onReset,
  activeFamilyId,
  activeFamilyDisplayName,
}: ControlPanelProps) {
  const currentOverride = settings.overrides[activeFamilyId] ?? DEFAULT_OVERRIDE;

  const handleGlobalChange = (
    key: keyof Omit<GeneratorSettings, 'overrides'>,
    value: number | string,
  ) => {
    setSettings((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleOverrideChange = (key: OverrideKey, value: number) => {
    setSettings((previous) => ({
      ...previous,
      overrides: {
        ...previous.overrides,
        [activeFamilyId]: {
          ...(previous.overrides[activeFamilyId] ?? DEFAULT_OVERRIDE),
          [key]: value,
        },
      },
    }));
  };

  const resetOverride = () => {
    setSettings((previous) => {
      const nextOverrides = { ...previous.overrides };
      delete nextOverrides[activeFamilyId];

      return {
        ...previous,
        overrides: nextOverrides,
      };
    });
  };

  return (
    <aside className="sticky top-0 flex h-auto w-full shrink-0 flex-col gap-8 overflow-y-auto border-b border-(--color-border-default) bg-(--color-surface-1) p-6 md:h-screen md:w-80 md:border-r md:border-b-0">
      <div className="mb-2 flex items-center gap-3" data-animate="enter">
        <div className="rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 p-2">
          <Palette className="h-6 w-6 text-white" />
        </div>
        <h1 className="bg-linear-to-r from-white to-gray-400 bg-clip-text text-xl font-bold text-transparent">
          Prism Architect
        </h1>
      </div>

      <div className="space-y-8">
        <section className="space-y-2" data-animate="enter">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-(--color-text-muted)">
            <Grid className="h-3 w-3" /> Preset Collection
          </label>
          <div className="relative">
            <select
              value={settings.preset}
              onChange={(event) => handleGlobalChange('preset', event.target.value)}
              className="w-full cursor-pointer appearance-none rounded-lg border border-(--color-border-default) bg-(--color-surface-2) p-2.5 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            >
              {Object.entries(PRESETS).map(([key, preset]) => (
                <option key={key} value={key}>
                  {preset.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
          <p className="text-[10px] text-(--color-text-muted)">
            {PRESETS[settings.preset]?.description}
          </p>
        </section>

        <section className="space-y-6 border-t border-[#222] pt-4" data-animate="enter">
          <h2 className="text-xs font-bold uppercase tracking-wider text-(--color-text-muted)">
            Global Controls
          </h2>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <RefreshCcw className="h-4 w-4" /> Global Rotation
              </label>
              <span className="font-mono text-xs text-(--color-text-muted)">
                {settings.hueShift}°
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={settings.hueShift}
              onChange={(event) => handleGlobalChange('hueShift', Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-800 accent-indigo-500"
            />
            <div className="h-1.5 w-full rounded-full bg-linear-to-r from-red-500 via-green-500 to-blue-500 opacity-20" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Settings2 className="h-4 w-4" /> Global Saturation
              </label>
              <span className="font-mono text-xs text-(--color-text-muted)">
                x{settings.chromaScale.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.05"
              value={settings.chromaScale}
              onChange={(event) => handleGlobalChange('chromaScale', Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-800 accent-pink-500"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <Sun className="h-4 w-4" /> Global Brightness
              </label>
              <span className="font-mono text-xs text-(--color-text-muted)">
                x{settings.lightnessScale.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={settings.lightnessScale}
              onChange={(event) => handleGlobalChange('lightnessScale', Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-800 accent-yellow-500"
            />
          </div>
        </section>

        <section
          className="space-y-5 rounded-xl border border-(--color-border-default) bg-(--color-surface-2) p-4"
          data-animate="enter"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span className="max-w-[150px] truncate text-sm font-bold text-white">
                {activeFamilyDisplayName}
              </span>
            </div>
            {(currentOverride.hueShift !== 0 ||
              currentOverride.chromaScale !== 1 ||
              currentOverride.lightnessScale !== 1) && (
              <button
                type="button"
                onClick={resetOverride}
                title="Reset Family"
                className="text-(--color-text-muted) transition-colors hover:text-white"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Tone Shift (Hue)</label>
              <span className="font-mono text-xs text-(--color-text-muted)">
                {currentOverride.hueShift > 0 ? '+' : ''}
                {currentOverride.hueShift}°
              </span>
            </div>
            <input
              type="range"
              min="-30"
              max="30"
              value={currentOverride.hueShift}
              onChange={(event) => handleOverrideChange('hueShift', Number(event.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-800 accent-indigo-400"
            />
            <div className="flex justify-between font-mono text-[10px] text-gray-600">
              <span>-30°</span>
              <span>0</span>
              <span>+30°</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Saturation Boost</label>
              <span className="font-mono text-xs text-(--color-text-muted)">
                x{currentOverride.chromaScale.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={currentOverride.chromaScale}
              onChange={(event) => handleOverrideChange('chromaScale', Number(event.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-800 accent-indigo-400"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">Brightness Boost</label>
              <span className="font-mono text-xs text-(--color-text-muted)">
                x{currentOverride.lightnessScale.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={currentOverride.lightnessScale}
              onChange={(event) =>
                handleOverrideChange('lightnessScale', Number(event.target.value))
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-gray-800 accent-indigo-400"
            />
          </div>
        </section>

        <button
          type="button"
          onClick={onReset}
          className="w-full rounded-md border border-gray-800 bg-[#222] px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-[#333]"
          data-animate="enter"
        >
          Reset All Global & Local
        </button>
      </div>

      <div className="mt-auto border-t border-(--color-border-default) pt-6">
        <p className="text-xs leading-relaxed text-(--color-text-muted)">
          Select a row in the grid to enable the fine-tune controls for that specific family. Tone
          Shift is limited to ±30° to preserve harmony.
        </p>
      </div>
    </aside>
  );
}
