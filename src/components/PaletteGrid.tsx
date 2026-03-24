import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Check, Copy } from 'lucide-react';
import { getReadableTextColor } from '@/lib/accessibility';
import { copyTextToClipboard } from '@/lib/clipboard';
import type { ColorFamily } from '@/types/palette';

interface PaletteGridProps {
  palettes: ColorFamily[];
  onSelectFamily: (id: string) => void;
  selectedFamilyId: string;
  onNotify: (message: string) => void;
}

const findSwatchButton = (familyId: string, swatchIndex: number): HTMLButtonElement | null =>
  document.querySelector<HTMLButtonElement>(
    `button[data-family-id="${familyId}"][data-swatch-index="${swatchIndex}"]`,
  );

export default function PaletteGrid({
  palettes,
  onSelectFamily,
  selectedFamilyId,
  onNotify,
}: PaletteGridProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, copyId: string) => {
    const copied = await copyTextToClipboard(text);

    if (copied) {
      setCopiedId(copyId);
      onNotify('Token copied to clipboard.');
      window.setTimeout(() => setCopiedId(null), 1400);
      return;
    }

    onNotify('Clipboard API is not available in this environment.');
  };

  const handleSwatchKeyDown = (
    event: KeyboardEvent<HTMLButtonElement>,
    familyIndex: number,
    swatchIndex: number,
  ) => {
    let nextFamilyIndex = familyIndex;
    let nextSwatchIndex = swatchIndex;

    switch (event.key) {
      case 'ArrowRight':
        nextSwatchIndex = Math.min(swatchIndex + 1, palettes[familyIndex]!.steps.length - 1);
        break;
      case 'ArrowLeft':
        nextSwatchIndex = Math.max(swatchIndex - 1, 0);
        break;
      case 'ArrowDown':
        nextFamilyIndex = Math.min(familyIndex + 1, palettes.length - 1);
        break;
      case 'ArrowUp':
        nextFamilyIndex = Math.max(familyIndex - 1, 0);
        break;
      case 'Home':
        nextSwatchIndex = 0;
        break;
      case 'End':
        nextSwatchIndex = palettes[familyIndex]!.steps.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();

    const nextFamily = palettes[nextFamilyIndex];

    if (!nextFamily) {
      return;
    }

    const boundedSwatchIndex = Math.min(nextSwatchIndex, nextFamily.steps.length - 1);

    onSelectFamily(nextFamily.id);
    window.requestAnimationFrame(() => {
      findSwatchButton(nextFamily.id, boundedSwatchIndex)?.focus();
    });
  };

  return (
    <section className="p-8 pb-32" data-animate="enter">
      <h2 className="mb-6 text-2xl font-bold text-(--color-text-primary)">Generated Palettes</h2>

      <div className="grid gap-2" role="grid" aria-label="Generated color palette grid">
        {palettes.map((family, familyIndex) => {
          const isSelected = selectedFamilyId === family.id;

          return (
            <article
              key={family.id}
              role="row"
              aria-selected={isSelected}
              className={`group relative grid cursor-pointer grid-cols-[100px_repeat(9,1fr)] items-center gap-2 rounded-lg border p-2 transition-all duration-300 hover:bg-(--color-surface-1) ${
                isSelected ? 'border-indigo-500 bg-(--color-surface-1)' : 'border-transparent'
              }`}
            >
              <div role="rowheader" className="truncate pr-4 text-sm font-medium text-gray-400">
                <button
                  type="button"
                  onClick={() => onSelectFamily(family.id)}
                  className="flex w-full items-center justify-between truncate text-left transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                  aria-pressed={isSelected}
                  aria-label={`Select ${family.name} family`}
                >
                  <span className="truncate">{family.name}</span>
                  {isSelected && (
                    <span className="ml-2 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-indigo-500" />
                  )}
                </button>
              </div>

              {family.steps.map((step, swatchIndex) => {
                const textColor = getReadableTextColor(step.hex);
                const stepCopyId = `${family.id}-${step.step}`;

                return (
                  <div key={step.step} role="gridcell">
                    <button
                      type="button"
                      data-family-id={family.id}
                      data-swatch-index={swatchIndex}
                      aria-label={`Copy ${family.name} step ${step.step} token ${step.hex}`}
                      title={`${family.name} ${step.step} · ${step.hex}`}
                      className="group/swatch relative flex h-12 w-full items-center justify-center rounded-md text-xs font-bold font-mono shadow-sm transition-transform hover:z-10 hover:scale-105 focus-visible:z-10 focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                      style={{ backgroundColor: step.css, color: textColor }}
                      onFocus={() => onSelectFamily(family.id)}
                      onClick={() => {
                        void handleCopy(step.css, stepCopyId);
                      }}
                      onKeyDown={(event) => handleSwatchKeyDown(event, familyIndex, swatchIndex)}
                    >
                      <span className="opacity-60 transition-opacity group-hover/swatch:opacity-100 group-focus-visible/swatch:opacity-100">
                        {copiedId === stepCopyId ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <span className="flex items-center gap-1">
                            {step.step}
                            <Copy className="h-3 w-3 opacity-60" />
                          </span>
                        )}
                      </span>

                      <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 flex w-max origin-bottom -translate-x-1/2 scale-95 flex-col items-center rounded-lg border border-gray-700 bg-gray-900/95 px-3 py-2 text-white opacity-0 shadow-2xl transition-all duration-200 group-hover/swatch:scale-100 group-hover/swatch:opacity-100 group-focus-visible/swatch:scale-100 group-focus-visible/swatch:opacity-100">
                        <span className="mb-1 text-sm font-bold tracking-wide">{step.hex}</span>
                        <span className="whitespace-nowrap font-mono text-[10px] text-gray-400 opacity-80">
                          {step.css}
                        </span>
                        <div className="absolute top-full left-1/2 -mt-px -translate-x-1/2 border-4 border-transparent border-t-gray-900/95" />
                      </div>
                    </button>
                  </div>
                );
              })}
            </article>
          );
        })}
      </div>
    </section>
  );
}
