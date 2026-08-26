import {
  IconArrowsExchange,
  IconCheck,
  IconCopy,
  IconDropletHalf2,
  IconX,
} from '@tabler/icons-react';
import { ColorField } from '@/components/studio/ColorField';
import { NumberField, NumberFieldGroup, NumberFieldInput } from '@/components/ui/number-field';
import { getContrastRatio } from '@/lib/accessibility';
import { mixHexColors } from '@/lib/studio-color';
import type { ContrastStudioState, MixerStudioState } from '@/types/studio';

interface ContrastToolProps {
  contrast: ContrastStudioState;
  mixer: MixerStudioState;
  onContrastChange: (state: ContrastStudioState) => void;
  onMixerChange: (state: MixerStudioState) => void;
  onCopy: (text: string, label: string) => void;
}

function ResultBadge({ label, pass }: { label: string; pass: boolean }) {
  return (
    <span className="contrast-result" data-pass={pass || undefined}>
      {pass ? <IconCheck aria-hidden="true" /> : <IconX aria-hidden="true" />}
      {label}
    </span>
  );
}

export function ContrastTool({
  contrast,
  mixer,
  onContrastChange,
  onMixerChange,
  onCopy,
}: ContrastToolProps) {
  const ratio = getContrastRatio(contrast.foreground, contrast.background);
  const ratioLabel = `${ratio.toFixed(2)}:1`;
  const mixed = mixHexColors(mixer.start, mixer.end, mixer.amount);
  const oklabMix = `color-mix(in oklab, ${mixer.start} ${100 - mixer.amount}%, ${mixer.end} ${mixer.amount}%)`;

  return (
    <section className="studio-tool-workspace" aria-labelledby="contrast-title">
      <div className="studio-artifact-panel contrast-artifact-panel">
        <header className="studio-tool-header">
          <div>
            <p className="studio-eyebrow">Accessibility evidence</p>
            <h2 id="contrast-title">Contrast + Mix</h2>
            <p>Test a real foreground pair, then build a deliberate bridge between two colors.</p>
          </div>
          <span
            className="contrast-ratio-pill"
            data-pass={ratio >= 4.5 || undefined}
            data-partial={ratio >= 3 && ratio < 4.5 ? '' : undefined}
            title={
              ratio >= 7
                ? 'Passes AAA for normal text.'
                : ratio >= 4.5
                  ? 'Passes AA for normal text.'
                  : ratio >= 3
                    ? 'Passes AA for large text only.'
                    : 'Below WCAG text thresholds.'
            }
          >
            {ratioLabel}
          </span>
        </header>

        <div className="contrast-preview-grid">
          <article
            className="contrast-preview-card"
            style={{ backgroundColor: contrast.background, color: contrast.foreground }}
          >
            <p className="studio-eyebrow">Live preview</p>
            <strong>Color should clarify, never hide.</strong>
            <p>
              This paragraph uses the exact foreground and background pair selected in the
              inspector.
            </p>
            <span
              className="contrast-preview-control"
              aria-hidden="true"
              style={{ borderColor: contrast.foreground, color: contrast.foreground }}
            >
              Interface control
            </span>
          </article>

          <article className="contrast-score-card">
            <div className="contrast-score-main">
              <span>Contrast ratio</span>
              <strong>{ratioLabel}</strong>
            </div>
            <div className="contrast-results-grid">
              <ResultBadge label="Normal AA" pass={ratio >= 4.5} />
              <ResultBadge label="Normal AAA" pass={ratio >= 7} />
              <ResultBadge label="Large AA" pass={ratio >= 3} />
              <ResultBadge label="Large AAA" pass={ratio >= 4.5} />
            </div>
            <p className="studio-caption">
              WCAG 2.2 text thresholds. UI component boundaries require separate 3:1 evaluation.
            </p>
          </article>
        </div>

        <article className="mixer-card" aria-labelledby="mixer-title">
          <div className="mixer-heading">
            <div>
              <p className="studio-eyebrow">Color mixer</p>
              <h3 id="mixer-title">A measured middle</h3>
            </div>
            <span className="studio-pill">sRGB result</span>
          </div>

          <div
            className="mixer-field"
            style={{ '--mix-start': mixer.start, '--mix-end': mixer.end } as React.CSSProperties}
          >
            <div className="mixer-color mixer-color-start" style={{ backgroundColor: mixer.start }}>
              <span>{mixer.start}</span>
            </div>
            <div className="mixer-color mixer-color-result" style={{ backgroundColor: mixed }}>
              <span>{mixed}</span>
            </div>
            <div className="mixer-color mixer-color-end" style={{ backgroundColor: mixer.end }}>
              <span>{mixer.end}</span>
            </div>
          </div>

          <div className="studio-range-field mixer-range">
            <span>
              <span>Mix amount</span>
              <NumberField
                className="w-auto flex-row items-center gap-0"
                value={mixer.amount}
                min={0}
                max={100}
                onValueChange={(value) => {
                  if (typeof value === 'number') {
                    onMixerChange({ ...mixer, amount: value });
                  }
                }}
              >
                <NumberFieldGroup className="h-6 w-[4.25rem] border-border/60 bg-transparent">
                  <NumberFieldInput
                    aria-label="Mix amount in percent"
                    className="font-mono text-[10.5px] text-foreground h-full py-0 leading-6.5 text-center"
                  />
                </NumberFieldGroup>
              </NumberField>
            </span>
            <input
              id="mix-amount"
              type="range"
              aria-label="Mix amount"
              min="0"
              max="100"
              step="1"
              value={mixer.amount}
              onChange={(event) => onMixerChange({ ...mixer, amount: Number(event.target.value) })}
            />
          </div>

          <div className="studio-inline-actions">
            <button
              type="button"
              className="studio-button"
              onClick={() => onCopy(mixed, 'Mixed HEX color')}
            >
              <IconCopy aria-hidden="true" />
              Copy {mixed}
            </button>
            <button
              type="button"
              className="studio-button"
              onClick={() => onCopy(oklabMix, 'Oklab color-mix CSS')}
            >
              <IconDropletHalf2 aria-hidden="true" />
              Copy Oklab mix
            </button>
            <button
              type="button"
              className="studio-button"
              onClick={() => onContrastChange({ ...contrast, foreground: mixed })}
            >
              Use as foreground
            </button>
            <button
              type="button"
              className="studio-button"
              onClick={() => onContrastChange({ ...contrast, background: mixed })}
            >
              Use as background
            </button>
          </div>
        </article>
      </div>

      <aside className="studio-inspector" aria-label="Contrast and mix controls">
        <div className="studio-inspector-heading">
          <div>
            <p className="studio-eyebrow">Pair</p>
            <h3>Foreground test</h3>
          </div>
          <span className="contrast-mini-score">{ratioLabel}</span>
        </div>

        <ColorField
          id="contrast-foreground"
          label="Foreground"
          value={contrast.foreground}
          onChange={(foreground) => onContrastChange({ ...contrast, foreground })}
        />
        <ColorField
          id="contrast-background"
          label="Background"
          value={contrast.background}
          onChange={(background) => onContrastChange({ ...contrast, background })}
        />
        <button
          type="button"
          className="studio-button studio-button-wide"
          onClick={() =>
            onContrastChange({
              foreground: contrast.background,
              background: contrast.foreground,
            })
          }
        >
          <IconArrowsExchange aria-hidden="true" />
          Swap pair
        </button>

        <div className="studio-inspector-divider" />

        <div className="studio-selection-title">
          <span>Mix endpoints</span>
          <strong>{mixed}</strong>
        </div>
        <ColorField
          id="mixer-start"
          label="Start"
          value={mixer.start}
          onChange={(start) => onMixerChange({ ...mixer, start })}
        />
        <ColorField
          id="mixer-end"
          label="End"
          value={mixer.end}
          onChange={(end) => onMixerChange({ ...mixer, end })}
        />

        <div className="studio-boundary-note">
          <strong>Truthful interpolation</strong>
          <p>
            Displayed HEX is a numerical sRGB mix. The copied enhanced expression asks CSS for Oklab
            interpolation.
          </p>
        </div>
      </aside>
    </section>
  );
}
