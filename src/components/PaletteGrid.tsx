import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyTextToClipboard } from '@/lib/clipboard';
import type { ColorFamily } from '@/types/palette';

interface PaletteGridProps {
  palettes: ColorFamily[];
  onSelectFamily: (id: string) => void;
  selectedFamilyId: string;
  onNotify: (message: string) => void;
}

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

  return (
    <section className="p-8 pb-32" data-animate="enter">
      <h2 className="mb-6 text-2xl font-bold text-(--color-text-primary)">Generated Palettes</h2>

      <div className="grid gap-2">
        {palettes.map((family) => {
          const isSelected = selectedFamilyId === family.id;

          return (
            <div
              key={family.id}
              className={`group relative grid cursor-pointer grid-cols-[100px_repeat(9,1fr)] items-center gap-2 rounded-lg border p-2 transition-all duration-300 hover:bg-(--color-surface-1) ${
                isSelected ? 'border-indigo-500 bg-(--color-surface-1)' : 'border-transparent'
              }`}
              onClick={() => onSelectFamily(family.id)}
            >
              <div className="flex items-center justify-between truncate pr-4 text-sm font-medium text-gray-400">
                {family.name}
                {isSelected && (
                  <span className="ml-2 h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-indigo-500" />
                )}
              </div>

              {family.steps.map((step) => {
                const isLight = step.l > 0.6;
                const textColor = isLight ? '#000000' : '#FFFFFF';
                const stepCopyId = `${family.id}-${step.step}`;

                return (
                  <div
                    key={step.step}
                    className="group/swatch relative flex h-12 items-center justify-center rounded-md text-xs font-bold font-mono shadow-sm transition-transform hover:z-10 hover:scale-105"
                    style={{ backgroundColor: step.css, color: textColor }}
                    onClick={(event) => {
                      event.stopPropagation();
                      void handleCopy(step.css, stepCopyId);
                    }}
                  >
                    <span className="opacity-60 transition-opacity group-hover/swatch:opacity-100">
                      {copiedId === stepCopyId ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="flex items-center gap-1">
                          {step.step}
                          <Copy className="h-3 w-3 opacity-60" />
                        </span>
                      )}
                    </span>

                    <div className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-50 flex w-max origin-bottom -translate-x-1/2 scale-95 flex-col items-center rounded-lg border border-gray-700 bg-gray-900/95 px-3 py-2 text-white opacity-0 shadow-2xl transition-all duration-200 group-hover/swatch:scale-100 group-hover/swatch:opacity-100">
                      <span className="mb-1 text-sm font-bold tracking-wide">{step.hex}</span>
                      <span className="whitespace-nowrap font-mono text-[10px] text-gray-400 opacity-80">
                        {step.css}
                      </span>
                      <div className="absolute top-full left-1/2 -mt-px -translate-x-1/2 border-4 border-transparent border-t-gray-900/95" />
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
