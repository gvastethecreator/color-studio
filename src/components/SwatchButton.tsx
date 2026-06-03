import type { KeyboardEvent, MouseEvent, ReactElement } from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/ui/tooltip';
import { getReadableTextColor } from '@/lib/accessibility';
import { copyTextToClipboard } from '@/lib/clipboard';
import { formatColor } from '@/lib/color-formats';
import type { ColorFormat } from '@/lib/color-formats';
import type { ColorFamily, ColorStep } from '@/types/palette';

interface SwatchButtonProps {
  family: ColorFamily;
  step: ColorStep;
  familyIndex: number;
  stepIndex: number;
  colorFormat: ColorFormat;
  copiedSwatchId: string | null;
  onCopy: (text: string, copyId: string, familyId: string) => void;
  onSelect: (familyId: string) => void;
  onKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    familyIndex: number,
    stepIndex: number,
  ) => void;
  size?: 'default' | 'compact' | 'tiny';
  stepTextClass?: string;
  staggerIndex?: number;
}

const SIZE_CLASSES: Record<NonNullable<SwatchButtonProps['size']>, string> = {
  default: 'h-7 text-[10.5px] gap-0.5',
  compact: 'h-5 text-[8.5px] gap-0',
  tiny: 'h-4 text-[7.5px] gap-0',
};

const SWATCH_BASE_CLASSES =
  'group/swatch relative flex w-full items-center justify-center rounded-sm font-mono font-bold transition-[background-color,color,transform,box-shadow] duration-1000 ease-out hover:z-10 hover:scale-[1.08] hover:shadow-md/30 focus-visible:z-10 focus-visible:scale-[1.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

export function SwatchButton({
  family,
  step,
  familyIndex,
  stepIndex,
  colorFormat,
  copiedSwatchId,
  onCopy,
  onSelect,
  onKeyDown,
  size = 'default',
  stepTextClass = 'text-[10.5px]',
  staggerIndex,
}: SwatchButtonProps): ReactElement {
  const textColor = getReadableTextColor(step.hex);
  const stepCopyId = `${family.id}-${step.step}`;
  const copyValue = formatColor(colorFormat, step.l, step.c, step.h);
  const isCopied = copiedSwatchId === stepCopyId;

  const handleCopy = async () => {
    const copied = await copyTextToClipboard(copyValue);
    if (copied) {
      onCopy(copyValue, stepCopyId, family.id);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            data-family-id={family.id}
            data-swatch-index={stepIndex}
            data-animate="swatch-stagger"
            aria-label={`Copy ${family.name} step ${step.step} value ${copyValue}`}
            className={`${SWATCH_BASE_CLASSES} ${SIZE_CLASSES[size]}`}
            style={{
              backgroundColor: step.css,
              color: textColor,
              animationDelay: staggerIndex !== undefined ? `${staggerIndex * 18}ms` : undefined,
            }}
            onFocus={() => onSelect(family.id)}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              event.stopPropagation();
              void handleCopy();
            }}
            onKeyDown={(event) => onKeyDown(event, familyIndex, stepIndex)}
          >
            <span
              className={`flex items-center gap-0.5 opacity-70 transition-opacity group-hover/swatch:opacity-100 group-focus-visible/swatch:opacity-100 ${stepTextClass}`}
            >
              {isCopied ? (
                <IconCheck aria-hidden="true" className="size-2.5" />
              ) : (
                <>
                  <span>{step.step}</span>
                  <IconCopy aria-hidden="true" className="size-2" />
                </>
              )}
            </span>
          </button>
        }
      />
      <TooltipPopup side="top" sideOffset={6}>
        <div className="flex flex-col gap-0.5 px-1 py-0.5 text-[11px]">
          <span className="font-bold text-foreground">
            {family.name} · {step.step}
          </span>
          <span className="font-mono text-[10px]">{step.hex}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{copyValue}</span>
        </div>
      </TooltipPopup>
    </Tooltip>
  );
}
