import { useEffect, useState } from 'react';
import { isValidHex, normalizeHex } from '@/lib/studio-color';

interface ColorFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}

export function ColorField({ id, label, value, onChange, hint }: ColorFieldProps) {
  const [draft, setDraft] = useState(value);
  const valid = isValidHex(draft);
  const descriptionId = !valid ? `${id}-error` : hint ? `${id}-hint` : undefined;

  useEffect(() => setDraft(value), [value]);

  const commit = () => {
    if (valid) {
      const normalized = normalizeHex(draft);
      setDraft(normalized);
      onChange(normalized);
    } else {
      setDraft(value);
    }
  };

  return (
    <div className="studio-field">
      <label htmlFor={id} className="studio-label">
        {label}
      </label>
      <div className="color-field-group">
        <input
          className="color-field-picker"
          type="color"
          value={normalizeHex(value)}
          onChange={(event) => onChange(normalizeHex(event.target.value))}
          aria-label={`${label} color picker`}
        />
        <input
          id={id}
          className="studio-input color-field-text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur();
            }
            if (event.key === 'Escape') {
              setDraft(value);
              event.currentTarget.blur();
            }
          }}
          spellCheck={false}
          autoComplete="off"
          aria-invalid={!valid}
          aria-describedby={descriptionId}
        />
      </div>
      {!valid ? (
        <span id={`${id}-error`} className="studio-field-error" role="alert">
          Use a 3 or 6 digit HEX value, for example #6D5DFC.
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="studio-field-hint">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
