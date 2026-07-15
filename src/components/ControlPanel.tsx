import { useRef } from 'react';
import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import {
  IconBrandGithub,
  IconFileUpload,
  IconRotate,
  IconAdjustments,
  IconAdjustmentsHorizontal,
  IconSparkles,
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field';
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Slider, SliderValue } from '@/components/ui/slider';
import { useDebouncedCommit } from '@/hooks/use-debounced-commit';
import { BrandLogo } from '@/components/BrandLogo';
import { PRESETS } from '@/data/presets';
import { DEFAULT_OVERRIDE } from '@/types/palette';
import type {
  AccentPaletteId,
  FamilyOverride,
  GeneratorSettings,
  PresetRegistry,
} from '@/types/palette';

interface ControlPanelProps {
  embedded?: boolean;
  settings: GeneratorSettings;
  setSettings: Dispatch<SetStateAction<GeneratorSettings>>;
  onReset: () => void;
  activeFamilyId: string;
  activeFamilyDisplayName: string;
  presetOptions?: PresetRegistry;
  customPresetCount?: number;
  onImportPreset?: (file: File) => Promise<void> | void;
  accentPalette?: AccentPaletteId;
  onCycleAccent?: () => void;
}

type OverrideKey = keyof Pick<FamilyOverride, 'hueShift' | 'chromaScale' | 'lightnessScale'>;

interface PresetOption {
  id: string;
  name: string;
}

type DebouncedCommitApi<T> = ReturnType<typeof useDebouncedCommit<T>>;

const formatRangeValue = (value: number, decimals: number): string => {
  const rounded = Math.round(value * 10 ** decimals) / 10 ** decimals;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(decimals);
};

const SLIDER_DEBOUNCE_MS = 800;

function GlobalControlsSection({
  hueRotation,
  saturation,
  brightness,
}: {
  hueRotation: DebouncedCommitApi<number>;
  saturation: DebouncedCommitApi<number>;
  brightness: DebouncedCommitApi<number>;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-card/60 p-2.5 py-4">
      <div className="flex min-w-0 items-center gap-1">
        <IconAdjustmentsHorizontal aria-hidden="true" className="size-3 shrink-0 text-primary" />
        <span className="truncate font-medium text-[11px] px-1">Global</span>
      </div>

      <Field data-animate="enter" className="mt-2">
        <Slider
          value={hueRotation.localValue}
          min={0}
          max={360}
          onValueChange={(value) => {
            const val = Array.isArray(value) ? value[0] : value;
            hueRotation.update(val);
          }}
          onValueCommitted={() => hueRotation.commitNow()}
          trackClassName="slider-track-hue"
        >
          <div className="mb-3 flex items-center justify-between gap-1">
            <FieldLabel className="font-medium text-[10px]">Hue rotation</FieldLabel>
            <SliderValue className="font-mono text-[10.5px] text-muted-foreground">
              {(values) => <span>{Math.round(Number(values[0] ?? 0))}°</span>}
            </SliderValue>
          </div>
        </Slider>
      </Field>

      <Field data-animate="enter" className="mt-2">
        <Slider
          value={saturation.localValue}
          min={0}
          max={2}
          step={0.05}
          onValueChange={(value) => {
            const val = Array.isArray(value) ? value[0] : value;
            saturation.update(val);
          }}
          onValueCommitted={() => saturation.commitNow()}
        >
          <div className="mb-3 flex items-center justify-between gap-1">
            <FieldLabel className="font-medium text-[10px]">Saturation</FieldLabel>
            <SliderValue className="font-mono text-[10.5px] text-muted-foreground">
              {(values) => <span>×{formatRangeValue(Number(values[0] ?? 0), 2)}</span>}
            </SliderValue>
          </div>
        </Slider>
      </Field>

      <Field data-animate="enter" className="mt-2">
        <Slider
          value={brightness.localValue}
          min={0.5}
          max={1.5}
          step={0.05}
          onValueChange={(value) => {
            const val = Array.isArray(value) ? value[0] : value;
            brightness.update(val);
          }}
          onValueCommitted={() => brightness.commitNow()}
        >
          <div className="mb-3 flex items-center justify-between gap-1">
            <FieldLabel className="font-medium text-[10px]">Brightness</FieldLabel>
            <SliderValue className="font-mono text-[10.5px] text-muted-foreground">
              {(values) => <span>×{formatRangeValue(Number(values[0] ?? 0), 2)}</span>}
            </SliderValue>
          </div>
        </Slider>
      </Field>
    </div>
  );
}

function FamilyOverrideSection({
  activeFamilyDisplayName,
  isOverrideDirty,
  onResetOverride,
  familyHue,
  familySaturation,
  familyBrightness,
}: {
  activeFamilyDisplayName: string;
  isOverrideDirty: boolean;
  onResetOverride: () => void;
  familyHue: DebouncedCommitApi<number>;
  familySaturation: DebouncedCommitApi<number>;
  familyBrightness: DebouncedCommitApi<number>;
}) {
  return (
    <div
      className="flex flex-col gap-2.5 rounded-lg border border-border bg-card/60 p-2.5"
      data-animate="enter"
    >
      <div className="flex items-center justify-between h-8">
        <div className="flex min-w-0 items-center gap-1">
          <IconAdjustments aria-hidden="true" className="size-3 shrink-0 text-primary" />
          <span className="truncate font-medium text-[11px] px-1">{activeFamilyDisplayName}</span>
          <Badge variant="outline" size="sm" className="border-primary/40 text-primary">
            fine-tune
          </Badge>
        </div>
        {isOverrideDirty && (
          <Button
            type="button"
            size="icon-xs"
            variant="ghost"
            onClick={onResetOverride}
            aria-label="Reset family override"
            title="Reset family override"
          >
            <IconRotate aria-hidden="true" />
          </Button>
        )}
      </div>

      <Field className="mt-2" data-animate="enter">
        <div className="mb-3 flex items-center justify-between w-full">
          <FieldLabel className="font-medium text-[10px]">Tone shift</FieldLabel>
          <NumberField
            className="w-auto flex-row items-center gap-0"
            value={familyHue.localValue}
            min={-30}
            max={30}
            onValueChange={(value) => {
              if (typeof value === 'number') {
                familyHue.update(value);
              }
            }}
            onValueCommitted={() => familyHue.commitNow()}
          >
            <NumberFieldGroup className="h-7 w-[6rem] border-border/60 bg-transparent">
              <NumberFieldDecrement className="px-1" />
              <NumberFieldInput
                aria-label="Tone shift in degrees"
                className="font-mono text-[10.5px] text-foreground h-full py-0 leading-6.5 text-center"
              />
              <NumberFieldIncrement className="px-1" />
            </NumberFieldGroup>
          </NumberField>
        </div>
        <Slider
          value={familyHue.localValue}
          min={-30}
          max={30}
          onValueChange={(value) => {
            const val = Array.isArray(value) ? value[0] : value;
            familyHue.update(val);
          }}
          onValueCommitted={() => familyHue.commitNow()}
        />
      </Field>

      <Field className="mt-2" data-animate="enter">
        <Slider
          value={familySaturation.localValue}
          min={0}
          max={2}
          step={0.1}
          onValueChange={(value) => {
            const val = Array.isArray(value) ? value[0] : value;
            familySaturation.update(val);
          }}
          onValueCommitted={() => familySaturation.commitNow()}
        >
          <div className="mb-3 flex items-center justify-between gap-1">
            <FieldLabel className="font-medium text-[10px]">Saturation</FieldLabel>
            <SliderValue className="font-mono text-[10.5px] text-muted-foreground">
              {(values) => <span>×{formatRangeValue(Number(values[0] ?? 0), 2)}</span>}
            </SliderValue>
          </div>
        </Slider>
      </Field>

      <Field className="mt-2 mb-3" data-animate="enter">
        <Slider
          value={familyBrightness.localValue}
          min={0.5}
          max={1.5}
          step={0.05}
          onValueChange={(value) => {
            const val = Array.isArray(value) ? value[0] : value;
            familyBrightness.update(val);
          }}
          onValueCommitted={() => familyBrightness.commitNow()}
        >
          <div className="mb-3 flex items-center justify-between gap-1">
            <FieldLabel className="font-medium text-[10px]">Brightness</FieldLabel>
            <SliderValue className="font-mono text-[10.5px] text-muted-foreground">
              {(values) => <span>×{formatRangeValue(Number(values[0] ?? 0), 2)}</span>}
            </SliderValue>
          </div>
        </Slider>
      </Field>
    </div>
  );
}

function ControlPanelFooter() {
  return (
    <div className="flex items-center justify-between border-t border-border/50 pt-3 text-[10px] text-muted-foreground bottom-0 absolute w-auto gap-4 p-4 bg-accent/80 end-px rounded-tl-xl">
      <span className="font-semibold">&copy; gvastethecreator</span>
      <a
        href="https://github.com/gvastethecreator/color-studio"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View source on GitHub"
        className="inline-flex items-center gap-1 rounded-sm transition-colors hover:text-foreground"
      >
        <IconBrandGithub aria-hidden="true" className="size-3.5" />
        Source
      </a>
    </div>
  );
}

export default function ControlPanel({
  embedded = false,
  settings,
  setSettings,
  onReset,
  activeFamilyId,
  activeFamilyDisplayName,
  presetOptions = PRESETS,
  customPresetCount = 0,
  onImportPreset,
  accentPalette = 'neutral',
  onCycleAccent = () => undefined,
}: ControlPanelProps) {
  const currentOverride = settings.overrides[activeFamilyId] ?? DEFAULT_OVERRIDE;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetOptionsList: PresetOption[] = Object.entries(presetOptions).map(([id, preset]) => ({
    id,
    name: preset.name,
  }));
  const currentPreset = presetOptionsList.find((option) => option.id === settings.preset);

  const handleImportChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && onImportPreset) {
      await onImportPreset(file);
    }

    event.target.value = '';
  };

  const handleGlobalChange = (
    key: keyof Omit<GeneratorSettings, 'overrides' | 'colorFormat' | 'theme'>,
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

  const hueRotation = useDebouncedCommit(
    settings.hueShift,
    (value) => handleGlobalChange('hueShift', value),
    SLIDER_DEBOUNCE_MS,
  );
  const saturation = useDebouncedCommit(
    settings.chromaScale,
    (value) => handleGlobalChange('chromaScale', value),
    SLIDER_DEBOUNCE_MS,
  );
  const brightness = useDebouncedCommit(
    settings.lightnessScale,
    (value) => handleGlobalChange('lightnessScale', value),
    SLIDER_DEBOUNCE_MS,
  );
  const familyHue = useDebouncedCommit(
    currentOverride.hueShift,
    (value) => handleOverrideChange('hueShift', value),
    SLIDER_DEBOUNCE_MS,
  );
  const familySaturation = useDebouncedCommit(
    currentOverride.chromaScale,
    (value) => handleOverrideChange('chromaScale', value),
    SLIDER_DEBOUNCE_MS,
  );
  const familyBrightness = useDebouncedCommit(
    currentOverride.lightnessScale,
    (value) => handleOverrideChange('lightnessScale', value),
    SLIDER_DEBOUNCE_MS,
  );

  const isOverrideDirty =
    currentOverride.hueShift !== 0 ||
    currentOverride.chromaScale !== 1 ||
    currentOverride.lightnessScale !== 1;

  return (
    <aside
      className={
        embedded
          ? 'scale-inspector flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-border bg-card/40 p-3 text-[11px] leading-tight'
          : 'relative flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-b border-border bg-card/40 p-3 text-[11px] leading-tight md:h-dvh md:w-72 md:border-r md:border-b-0'
      }
    >
      {!embedded && (
        <header className="flex items-center justify-between gap-2" data-animate="enter">
          <div className="flex items-center gap-1.5">
            <BrandLogo paletteId={accentPalette} onCycle={onCycleAccent} />
            <h1 className="font-heading text-sm font-semibold tracking-tight">Color Studio</h1>
          </div>
          {customPresetCount > 0 && (
            <Badge variant="secondary" size="sm">
              <IconSparkles aria-hidden="true" />
              {customPresetCount}
            </Badge>
          )}
        </header>
      )}

      <Field className="mt-2" data-animate="enter">
        <div className="flex items-center gap-1">
          <FieldLabel className="text-[10px]">Palette</FieldLabel>
          <Select<PresetOption>
            value={currentPreset ?? presetOptionsList[0]}
            onValueChange={(next) => {
              if (next) {
                handleGlobalChange('preset', next.id);
              }
            }}
            itemToStringValue={(item) => item.id}
          >
            <SelectTrigger
              aria-label="Color preset"
              data-testid="preset-select-trigger"
              size="sm"
              className="min-w-0 flex-1"
            >
              <SelectValue placeholder="Choose a preset">
                {(item: PresetOption | null) => <span>{item?.name ?? 'Choose a preset'}</span>}
              </SelectValue>
            </SelectTrigger>
            <SelectPopup alignItemWithTrigger={false}>
              {presetOptionsList.map((option) => (
                <SelectItem key={option.id} value={option}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectPopup>
          </Select>
          <input
            ref={fileInputRef}
            data-testid="preset-import-input"
            type="file"
            accept=".json,application/json"
            aria-label="Import custom preset JSON file"
            className="hidden"
            onChange={(event) => {
              void handleImportChange(event);
            }}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={!onImportPreset}
            aria-label="Import preset JSON"
            title="Import preset JSON"
          >
            <IconFileUpload aria-hidden="true" />
          </Button>
        </div>
      </Field>

      <Separator />

      <GlobalControlsSection
        hueRotation={hueRotation}
        saturation={saturation}
        brightness={brightness}
      />

      <Separator />

      <FamilyOverrideSection
        activeFamilyDisplayName={activeFamilyDisplayName}
        isOverrideDirty={isOverrideDirty}
        onResetOverride={resetOverride}
        familyHue={familyHue}
        familySaturation={familySaturation}
        familyBrightness={familyBrightness}
      />

      <Button
        type="button"
        variant="default"
        size="xs"
        onClick={onReset}
        className="self-end gap-1 px-4 mt-2"
        data-animate="enter"
      >
        <IconRotate aria-hidden="true" />
        Reset all
      </Button>

      {!embedded && <ControlPanelFooter />}
    </aside>
  );
}
