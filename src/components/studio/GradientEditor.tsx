import { IconBraces, IconCopy, IconGradienter, IconPlus, IconTrash } from '@tabler/icons-react';
import { ColorField } from '@/components/studio/ColorField';
import { buildGradientCss, createStopInLargestGap, sortGradientStops } from '@/lib/gradient';
import type { GradientStudioState, GradientType } from '@/types/studio';

interface GradientEditorProps {
  state: GradientStudioState;
  onChange: (state: GradientStudioState) => void;
  onCopy: (text: string, label: string) => void;
}

const TYPE_OPTIONS: Array<{ id: GradientType; label: string }> = [
  { id: 'linear', label: 'Linear' },
  { id: 'radial', label: 'Radial' },
  { id: 'conic', label: 'Conic' },
];

let stopSequence = 0;

function createStopId() {
  stopSequence += 1;
  return `stop-${Date.now()}-${stopSequence}`;
}

export function GradientEditor({ state, onChange, onCopy }: GradientEditorProps) {
  const stops = sortGradientStops(state.stops);
  const selectedStop = stops.find((stop) => stop.id === state.selectedStopId) ?? stops[0];
  const compatibleCss = buildGradientCss(state);
  const enhancedCss = buildGradientCss(state, true);
  const canAdd = stops.length < 8;
  const canRemove = stops.length > 2;

  const updateStop = (patch: Partial<(typeof stops)[number]>) => {
    if (!selectedStop) return;
    onChange({
      ...state,
      stops: state.stops.map((stop) =>
        stop.id === selectedStop.id ? { ...stop, ...patch } : stop,
      ),
    });
  };

  const addStop = () => {
    if (!canAdd) return;
    const id = createStopId();
    const stop = createStopInLargestGap(stops, id);
    onChange({
      ...state,
      stops: [...state.stops, stop],
      selectedStopId: id,
    });
  };

  const removeStop = () => {
    if (!canRemove || !selectedStop) return;
    const remaining = stops.filter((stop) => stop.id !== selectedStop.id);
    const nextSelected = remaining.reduce((closest, stop) =>
      Math.abs(stop.position - selectedStop.position) <
      Math.abs(closest.position - selectedStop.position)
        ? stop
        : closest,
    );
    onChange({
      ...state,
      stops: remaining,
      selectedStopId: nextSelected.id,
    });
  };

  return (
    <section className="studio-tool-workspace" aria-labelledby="gradient-title">
      <div className="studio-artifact-panel gradient-artifact-panel">
        <header className="studio-tool-header">
          <div>
            <p className="studio-eyebrow">Multi-stop field</p>
            <h2 id="gradient-title">Gradient Lab</h2>
            <p>Compose real CSS geometry with ordered, editable color stops.</p>
          </div>
          <div className="studio-header-actions">
            <span className="studio-pill">{stops.length} stops</span>
            <button
              className="studio-button studio-button-primary"
              type="button"
              onClick={addStop}
              disabled={!canAdd}
            >
              <IconPlus aria-hidden="true" />
              Add stop
            </button>
          </div>
        </header>

        <div className="gradient-stage">
          <div
            className="gradient-preview"
            style={{ backgroundImage: compatibleCss }}
            role="img"
            aria-label={`${state.type} gradient preview with ${stops.length} color stops`}
          >
            <div className="gradient-preview-grid" aria-hidden="true" />
            <span className="gradient-preview-type">
              <IconGradienter aria-hidden="true" />
              {state.type} · {state.interpolation}
            </span>
          </div>

          <div className="gradient-stop-track" aria-label="Gradient stop positions">
            <div className="gradient-stop-line" style={{ backgroundImage: compatibleCss }} />
            {stops.map((stop, index) => (
              <button
                key={stop.id}
                type="button"
                className="gradient-stop-handle"
                data-active={stop.id === selectedStop?.id || undefined}
                style={
                  { left: `${stop.position}%`, '--stop-color': stop.color } as React.CSSProperties
                }
                aria-label={`Select stop ${index + 1}, ${stop.color} at ${stop.position}%`}
                aria-pressed={stop.id === selectedStop?.id}
                onClick={() => onChange({ ...state, selectedStopId: stop.id })}
              >
                <span>{stop.position}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="gradient-stop-list" aria-label="Gradient stops">
          {stops.map((stop, index) => (
            <button
              key={stop.id}
              type="button"
              className="gradient-stop-row"
              data-active={stop.id === selectedStop?.id || undefined}
              onClick={() => onChange({ ...state, selectedStopId: stop.id })}
            >
              <span
                className="gradient-stop-chip"
                style={{ backgroundColor: stop.color }}
                aria-hidden="true"
              />
              <span>Stop {index + 1}</span>
              <code>{stop.color}</code>
              <strong>{stop.position}%</strong>
            </button>
          ))}
        </div>

        <div className="gradient-code-grid">
          <article className="studio-code-card">
            <div>
              <p className="studio-eyebrow">Compatible CSS</p>
              <span>HEX stops, broad fallback</span>
            </div>
            <code>{compatibleCss}</code>
            <button
              type="button"
              className="studio-button"
              onClick={() => onCopy(compatibleCss, 'Compatible gradient CSS')}
            >
              <IconCopy aria-hidden="true" />
              Copy
            </button>
          </article>

          <article className="studio-code-card">
            <div>
              <p className="studio-eyebrow">Perceptual CSS</p>
              <span>Explicit {state.interpolation} interpolation</span>
            </div>
            <code>{enhancedCss}</code>
            <button
              type="button"
              className="studio-button"
              onClick={() => onCopy(enhancedCss, 'Perceptual gradient CSS')}
            >
              <IconBraces aria-hidden="true" />
              Copy
            </button>
          </article>
        </div>
      </div>

      <aside className="studio-inspector" aria-label="Gradient controls">
        <div className="studio-inspector-heading">
          <div>
            <p className="studio-eyebrow">Geometry</p>
            <h3>Build the field</h3>
          </div>
          <IconGradienter aria-hidden="true" />
        </div>

        <fieldset className="studio-field">
          <legend className="studio-label">Gradient type</legend>
          <div className="studio-segmented studio-segmented-three">
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                data-active={state.type === option.id || undefined}
                aria-pressed={state.type === option.id}
                onClick={() => onChange({ ...state, type: option.id })}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        {state.type !== 'radial' && (
          <label className="studio-range-field" htmlFor="gradient-angle">
            <span>
              <span>{state.type === 'conic' ? 'Start angle' : 'Angle'}</span>
              <output>{Math.round(state.angle)}°</output>
            </span>
            <input
              id="gradient-angle"
              type="range"
              min="0"
              max="360"
              step="1"
              value={state.angle}
              onChange={(event) => onChange({ ...state, angle: Number(event.target.value) })}
            />
          </label>
        )}

        <div className="studio-field">
          <label htmlFor="gradient-interpolation" className="studio-label">
            Interpolation
          </label>
          <select
            id="gradient-interpolation"
            className="studio-select"
            value={state.interpolation}
            onChange={(event) =>
              onChange({
                ...state,
                interpolation: event.target.value as GradientStudioState['interpolation'],
              })
            }
          >
            <option value="srgb">sRGB · compatible</option>
            <option value="oklab">Oklab · even</option>
            <option value="oklch">OKLCH · vivid hue</option>
          </select>
          <span className="studio-field-hint">
            Preview uses compatible HEX CSS. Perceptual output is provided separately.
          </span>
        </div>

        <div className="studio-inspector-divider" />

        {selectedStop && (
          <>
            <div className="studio-selection-title">
              <span>Selected stop</span>
              <strong>{stops.findIndex((stop) => stop.id === selectedStop.id) + 1}</strong>
            </div>
            <ColorField
              id="gradient-stop-color"
              label="Color"
              value={selectedStop.color}
              onChange={(color) => updateStop({ color })}
            />
            <label className="studio-range-field" htmlFor="gradient-stop-position">
              <span>
                <span>Position</span>
                <output>{selectedStop.position}%</output>
              </span>
              <input
                id="gradient-stop-position"
                type="range"
                min="0"
                max="100"
                step="1"
                value={selectedStop.position}
                onChange={(event) => updateStop({ position: Number(event.target.value) })}
              />
            </label>
            <div className="gradient-stop-actions">
              <button className="studio-button" type="button" onClick={addStop} disabled={!canAdd}>
                <IconPlus aria-hidden="true" />
                Add
              </button>
              <button
                className="studio-button studio-button-danger"
                type="button"
                onClick={removeStop}
                disabled={!canRemove}
              >
                <IconTrash aria-hidden="true" />
                Remove
              </button>
            </div>
          </>
        )}

        <div className="studio-boundary-note">
          <strong>Stop limits: 2–8</strong>
          <p>Equal positions are preserved, so hard transitions remain valid CSS.</p>
        </div>
      </aside>
    </section>
  );
}
