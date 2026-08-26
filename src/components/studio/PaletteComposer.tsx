import { useEffect, useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  IconBraces,
  IconContrast2,
  IconCopy,
  IconGradienter,
  IconRefresh,
  IconSparkles,
  IconTargetArrow,
} from '@tabler/icons-react';
import { NumberField, NumberFieldGroup, NumberFieldInput } from '@/components/ui/number-field';
import { getReadableTextColor } from '@/lib/accessibility';
import {
  formatHexAsOklch,
  generateHarmonyPalette,
  generatePaletteCss,
  generatePaletteJson,
  HARMONY_OPTIONS,
  normalizeHex,
} from '@/lib/studio-color';
import { ColorField } from '@/components/studio/ColorField';
import type { PaletteComposerState, StudioNotify } from '@/types/studio';

interface PaletteComposerProps {
  state: PaletteComposerState;
  onChange: (state: PaletteComposerState) => void;
  onCopy: (text: string, label: string) => void;
  onTestInContrast?: (color: string) => void;
  onAddToGradient?: (color: string) => void;
  onNotify?: StudioNotify;
}

export function PaletteComposer({
  state,
  onChange,
  onCopy,
  onTestInContrast,
  onAddToGradient,
  onNotify,
}: PaletteComposerProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedColor = state.colors[selectedIndex] ?? state.colors[0] ?? state.seed;
  const harmony = useMemo(
    () => HARMONY_OPTIONS.find((option) => option.id === state.harmony) ?? HARMONY_OPTIONS[0]!,
    [state.harmony],
  );

  useEffect(() => {
    if (selectedIndex >= state.colors.length) setSelectedIndex(0);
  }, [selectedIndex, state.colors.length]);

  const regenerate = (patch: Partial<PaletteComposerState> = {}) => {
    const next = { ...state, ...patch };
    onChange({
      ...next,
      colors: generateHarmonyPalette(next),
    });
  };

  const generate = () => {
    const previous = state;
    onChange({
      ...state,
      colors: generateHarmonyPalette(state),
    });
    onNotify?.('Palette generated.', { undo: () => onChange(previous) });
  };

  const updateSelectedColor = (color: string) => {
    const colors = [...state.colors];
    colors[selectedIndex] = normalizeHex(color);
    onChange({ ...state, colors });
  };

  const moveSelection = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    switch (event.key) {
      case 'ArrowRight':
        nextIndex = Math.min(index + 1, state.colors.length - 1);
        break;
      case 'ArrowLeft':
        nextIndex = Math.max(index - 1, 0);
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = state.colors.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    setSelectedIndex(nextIndex);
    const buttons =
      event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('.chromatic-swatch');
    buttons?.[nextIndex]?.focus();
  };

  return (
    <section className="studio-tool-workspace" aria-labelledby="palette-title">
      <div className="studio-artifact-panel palette-artifact-panel">
        <header className="studio-tool-header">
          <div>
            <p className="studio-eyebrow">Harmony engine</p>
            <h2 id="palette-title">Palette Composer</h2>
            <p>
              Build a small color system from one seed. Every result stays editable and copyable.
            </p>
          </div>
          <div className="studio-header-actions">
            <span className="studio-pill">{state.count} colors</span>
            <button
              className="studio-button studio-button-primary"
              type="button"
              onClick={generate}
            >
              <IconRefresh aria-hidden="true" />
              Generate
            </button>
          </div>
        </header>

        <div className="palette-stage" aria-label="Generated palette">
          <div className="palette-stage-orbit" aria-hidden="true" />
          <div
            className="chromatic-spine"
            style={{ '--swatch-count': state.count } as React.CSSProperties}
          >
            {state.colors.map((color, index) => {
              const active = index === selectedIndex;
              return (
                <button
                  key={`${index}-${color}`}
                  className="chromatic-swatch"
                  type="button"
                  data-active={active || undefined}
                  style={{
                    backgroundColor: color,
                    color: getReadableTextColor(color),
                  }}
                  aria-pressed={active}
                  aria-label={`Select palette color ${index + 1}: ${color}`}
                  onClick={() => setSelectedIndex(index)}
                  onKeyDown={(event) => moveSelection(event, index)}
                >
                  <span className="chromatic-swatch-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="chromatic-swatch-value">{color}</span>
                </button>
              );
            })}
          </div>

          <div className="palette-stage-caption">
            <span>
              <IconSparkles aria-hidden="true" />
              {harmony.label}
            </span>
            <p>{harmony.shortDescription}</p>
          </div>
        </div>

        <div className="palette-detail-grid">
          <article className="studio-proof-card palette-role-preview">
            <p className="studio-eyebrow">Role preview</p>
            <div
              className="role-preview-surface"
              style={{
                backgroundColor: state.colors[0],
                color: getReadableTextColor(state.colors[0] ?? '#000000'),
              }}
            >
              <span>Canvas</span>
              <strong style={{ color: state.colors[2] }}>Color decisions, visible.</strong>
              <span
                className="role-preview-action"
                aria-hidden="true"
                style={{
                  backgroundColor: state.colors[state.colors.length - 1],
                  color: getReadableTextColor(state.colors[state.colors.length - 1] ?? '#000000'),
                }}
              >
                Primary action
              </span>
            </div>
            <p className="studio-caption">
              Preview maps colors to roles; verify final pairs in Contrast.
            </p>
          </article>

          <article className="studio-proof-card palette-output-card">
            <div>
              <p className="studio-eyebrow">Selected color</p>
              <strong>{selectedColor}</strong>
              <code>{formatHexAsOklch(selectedColor)}</code>
            </div>
            <div className="studio-inline-actions">
              <button
                type="button"
                className="studio-button"
                onClick={() => onCopy(selectedColor, 'HEX color')}
              >
                <IconCopy aria-hidden="true" />
                Copy HEX
              </button>
              <button
                type="button"
                className="studio-button"
                onClick={() => onCopy(formatHexAsOklch(selectedColor), 'OKLCH color')}
              >
                <IconCopy aria-hidden="true" />
                Copy OKLCH
              </button>
              <button
                type="button"
                className="studio-button"
                onClick={() => onCopy(generatePaletteCss(state.colors), 'CSS palette')}
              >
                <IconBraces aria-hidden="true" />
                Copy CSS
              </button>
              <button
                type="button"
                className="studio-button"
                onClick={() => onCopy(generatePaletteJson(state.colors), 'JSON palette')}
              >
                <IconBraces aria-hidden="true" />
                JSON
              </button>
              {onTestInContrast && (
                <button
                  type="button"
                  className="studio-button"
                  onClick={() => onTestInContrast(selectedColor)}
                >
                  <IconContrast2 aria-hidden="true" />
                  Test in Contrast
                </button>
              )}
              {onAddToGradient && (
                <button
                  type="button"
                  className="studio-button"
                  onClick={() => onAddToGradient(selectedColor)}
                >
                  <IconGradienter aria-hidden="true" />
                  Add to gradient
                </button>
              )}
            </div>
          </article>
        </div>
      </div>

      <aside className="studio-inspector" aria-label="Palette controls">
        <div className="studio-inspector-heading">
          <div>
            <p className="studio-eyebrow">Recipe</p>
            <h3>Shape the harmony</h3>
          </div>
          <IconTargetArrow aria-hidden="true" />
        </div>

        <ColorField
          id="palette-seed"
          label="Seed color"
          value={state.seed}
          onChange={(seed) => regenerate({ seed })}
          hint="The first matching hue slot keeps this HEX. Other colors follow chroma and lightness."
        />

        <div className="studio-field">
          <label htmlFor="palette-harmony" className="studio-label">
            Harmony
          </label>
          <select
            id="palette-harmony"
            className="studio-select"
            value={state.harmony}
            onChange={(event) =>
              regenerate({ harmony: event.target.value as PaletteComposerState['harmony'] })
            }
          >
            {HARMONY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="studio-field-hint">{harmony.shortDescription}</span>
        </div>

        <fieldset className="studio-field">
          <legend className="studio-label">Palette size</legend>
          <div className="studio-segmented">
            {[5, 6].map((count) => (
              <button
                key={count}
                type="button"
                data-active={state.count === count || undefined}
                aria-pressed={state.count === count}
                onClick={() => regenerate({ count: count as 5 | 6 })}
              >
                {count} colors
              </button>
            ))}
          </div>
        </fieldset>

        <div className="studio-range-field">
          <span>
            <span>Chroma</span>
            <NumberField
              className="w-auto flex-row items-center gap-0"
              value={Number(state.chroma.toFixed(2))}
              min={0.04}
              max={0.29}
              step={0.01}
              onValueChange={(value) => {
                if (typeof value === 'number') {
                  regenerate({ chroma: value });
                }
              }}
            >
              <NumberFieldGroup className="h-6 w-[4.25rem] border-border/60 bg-transparent">
                <NumberFieldInput
                  aria-label="Chroma"
                  className="font-mono text-[10.5px] text-foreground h-full py-0 leading-6.5 text-center"
                />
              </NumberFieldGroup>
            </NumberField>
          </span>
          <input
            id="palette-chroma"
            type="range"
            aria-label="Chroma"
            min="0.04"
            max="0.29"
            step="0.01"
            value={state.chroma}
            onChange={(event) => regenerate({ chroma: Number(event.target.value) })}
          />
        </div>

        <div className="studio-range-field">
          <span>
            <span>Lightness</span>
            <NumberField
              className="w-auto flex-row items-center gap-0"
              value={Math.round(state.lightness * 100)}
              min={35}
              max={85}
              onValueChange={(value) => {
                if (typeof value === 'number') {
                  regenerate({ lightness: value / 100 });
                }
              }}
            >
              <NumberFieldGroup className="h-6 w-[4.25rem] border-border/60 bg-transparent">
                <NumberFieldInput
                  aria-label="Lightness in percent"
                  className="font-mono text-[10.5px] text-foreground h-full py-0 leading-6.5 text-center"
                />
              </NumberFieldGroup>
            </NumberField>
          </span>
          <input
            id="palette-lightness"
            type="range"
            aria-label="Lightness"
            min="0.35"
            max="0.85"
            step="0.01"
            value={state.lightness}
            onChange={(event) => regenerate({ lightness: Number(event.target.value) })}
          />
        </div>

        <div className="studio-inspector-divider" />

        <ColorField
          id="palette-selected"
          label={`Color ${selectedIndex + 1}`}
          value={selectedColor}
          onChange={updateSelectedColor}
          hint="Direct edits do not change the harmony recipe until you use this color as the seed."
        />

        <button
          className="studio-button studio-button-wide"
          type="button"
          onClick={() => regenerate({ seed: selectedColor })}
        >
          <IconTargetArrow aria-hidden="true" />
          Use selected as seed
        </button>

        <div className="studio-boundary-note">
          <strong>Harmony ≠ contrast</strong>
          <p>
            These colors share a hue relationship. Check text and UI pairs in Contrast before
            shipping.
          </p>
        </div>
      </aside>
    </section>
  );
}
