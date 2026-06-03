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
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
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
  settings: GeneratorSettings;
  setSettings: Dispatch<SetStateAction<GeneratorSettings>>;
  onReset: () => void;
  activeFamilyId: string;
  activeFamilyDisplayName: string;
  presetOptions?: PresetRegistry;
  customPresetCount?: number;
  onImportPreset?: (file: File) => Promise<void> | void;
  accentPalette: AccentPaletteId;
  onCycleAccent: () => void;
}

type OverrideKey = keyof Pick<FamilyOverride, 'hueShift' | 'chromaScale' | 'lightnessScale'>;

interface PresetOption {
  id: string;
  name: string;
}

const formatRangeValue = (value: number, decimals: number): string => {
  const rounded = Math.round(value * 10 ** decimals) / 10 ** decimals;
  return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(decimals);
};

const SLIDER_DEBOUNCE_MS = 800;

export default function ControlPanel({
  settings,
  setSettings,
  onReset,
  activeFamilyId,
  activeFamilyDisplayName,
  presetOptions = PRESETS,
  customPresetCount = 0,
  onImportPreset,
  accentPalette,
  onCycleAccent,
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
    <aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-b border-border bg-card/40 p-3 text-[11px] leading-tight md:h-dvh md:w-72 md:border-b-0 md:border-r">
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

      <Field data-animate="enter">
        <FieldLabel className="text-[10px]">Preset</FieldLabel>
        <div className="flex items-center gap-1">
          <Select<PresetOption>
            items={presetOptionsList}
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
        {currentPreset && presetOptions[currentPreset.id] && (
          <FieldDescription className="text-[10.5px]">
            {presetOptions[currentPreset.id]?.description}
          </FieldDescription>
        )}
      </Field>

      <Separator />

      <div className="flex flex-col gap-2.5" data-animate="enter">
        <div className="flex items-center gap-1 text-muted-foreground text-[10px] uppercase tracking-wider">
          <IconAdjustmentsHorizontal aria-hidden="true" className="size-3" />
          Global
        </div>

        <Field>
          <Slider
            value={hueRotation.localValue}
            min={0}
            max={360}
            onValueChange={(value) => hueRotation.update(value as number)}
            onValueCommitted={() => hueRotation.commitNow()}
          >
            <div className="mb-3 flex items-center justify-between gap-1">
              <FieldLabel className="font-medium text-[10px]">Hue rotation</FieldLabel>
              <SliderValue className="font-mono text-[10.5px] text-muted-foreground">
                {(values) => <span>{Math.round(values[0] ?? 0)}°</span>}
              </SliderValue>
            </div>
          </Slider>
          <div className="mt-2 h-1 rounded-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 opacity-25" />
        </Field>

        <Field>
          <Slider
            value={saturation.localValue}
            min={0}
            max={2}
            step={0.05}
            onValueChange={(value) => saturation.update(value as number)}
            onValueCommitted={() => saturation.commitNow()}
          >
            <div className="mb-3 flex items-center justify-between gap-1">
              <FieldLabel className="font-medium text-[10px]">Saturation</FieldLabel>
              <SliderValue className="font-mono text-[10.5px] text-muted-foreground">
                {(values) => <span>×{formatRangeValue(values[0] ?? 0, 2)}</span>}
              </SliderValue>
            </div>
          </Slider>
        </Field>

        <Field>
          <Slider
            value={brightness.localValue}
            min={0.5}
            max={1.5}
            step={0.05}
            onValueChange={(value) => brightness.update(value as number)}
            onValueCommitted={() => brightness.commitNow()}
          >
            <div className="mb-3 flex items-center justify-between gap-1">
              <FieldLabel className="font-medium text-[10px]">Brightness</FieldLabel>
              <SliderValue className="font-mono text-[10.5px] text-muted-foreground">
                {(values) => <span>×{formatRangeValue(values[0] ?? 0, 2)}</span>}
              </SliderValue>
            </div>
          </Slider>
        </Field>
      </div>

      <Separator />

      <div
        className="flex flex-col gap-2.5 rounded-lg border border-border bg-card/60 p-2.5"
        data-animate="enter"
      >
        <div className="flex items-center justify-between h-8">
          <div className="flex min-w-0 items-center gap-1">
            <IconAdjustments aria-hidden="true" className="size-3 shrink-0 text-primary" />
            <span className="truncate font-medium text-[10px]">{activeFamilyDisplayName}</span>
            <Badge variant="outline" size="sm" className="border-primary/40 text-primary">
              fine-tune
            </Badge>
          </div>
          {isOverrideDirty && (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={resetOverride}
              aria-label="Reset family override"
              title="Reset family override"
            >
              <IconRotate aria-hidden="true" />
            </Button>
          )}
        </div>

        <Field>
          <div className="mb-1 flex items-center justify-between w-full">
            <FieldLabel className="font-medium text-[10px]">Tone shift</FieldLabel>
            <NumberField
              className="w-auto"
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
              <NumberFieldGroup className="h-5 w-[6rem] border-border/60 bg-transparent">
                <NumberFieldDecrement className="px-1" />
                <NumberFieldInput
                  aria-label="Tone shift in degrees"
                  className="font-mono text-[9px] text-foreground"
                />
                <NumberFieldIncrement className="px-1" />
              </NumberFieldGroup>
            </NumberField>
          </div>
          <Slider
            value={familyHue.localValue}
            min={-30}
            max={30}
            onValueChange={(value) => familyHue.update(value as number)}
            onValueCommitted={() => familyHue.commitNow()}
          />
        </Field>

        <Field>
          <Slider
            value={familySaturation.localValue}
            min={0}
            max={2}
            step={0.1}
            onValueChange={(value) => familySaturation.update(value as number)}
            onValueCommitted={() => familySaturation.commitNow()}
          >
            <div className="mb-1 flex items-center justify-between gap-1">
              <FieldLabel className="font-medium text-[10px]">Saturation</FieldLabel>
              <SliderValue className="font-mono text-[10.5px] text-muted-foreground">
                {(values) => <span>×{formatRangeValue(values[0] ?? 0, 2)}</span>}
              </SliderValue>
            </div>
          </Slider>
        </Field>

        <Field>
          <Slider
            value={familyBrightness.localValue}
            min={0.5}
            max={1.5}
            step={0.05}
            onValueChange={(value) => familyBrightness.update(value as number)}
            onValueCommitted={() => familyBrightness.commitNow()}
          >
            <div className="mb-1 flex items-center justify-between gap-1">
              <FieldLabel className="font-medium text-[10px]">Brightness</FieldLabel>
              <SliderValue className="font-mono text-[10.5px] text-muted-foreground">
                {(values) => <span>×{formatRangeValue(values[0] ?? 0, 2)}</span>}
              </SliderValue>
            </div>
          </Slider>
        </Field>
      </div>

      <Button
        type="button"
        variant="default"
        size="xs"
        onClick={onReset}
        className="mt-auto self-start"
        data-animate="enter"
      >
        <IconRotate aria-hidden="true" />
        Reset all
      </Button>

      <div className="flex items-center justify-between border-t border-border/50 pt-3 text-[10px] text-muted-foreground">
        <span>&copy; gvastethecreator</span>
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
    </aside>
  );
}
