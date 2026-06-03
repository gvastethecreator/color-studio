import type { KeyboardEvent } from 'react';
import { useCallback } from 'react';
import { IconChevronRight, IconLayersSelected } from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SwatchButton } from '@/components/SwatchButton';
import type { ColorFamily, ColorStep } from '@/types/palette';
import type { ColorFormat } from '@/lib/color-formats';
import type { PaletteViewMode } from '@/components/ViewModeSelector';

interface PaletteGridProps {
  palettes: ColorFamily[];
  colorFormat: ColorFormat;
  onSelectFamily: (id: string) => void;
  selectedFamilyId: string;
  onNotify: (message: string) => void;
  copiedSwatchId: string | null;
  onCopySwatch: (copyId: string) => void;
  viewMode: PaletteViewMode;
}

const findSwatchButton = (familyId: string, stepIndex: number): HTMLButtonElement | null =>
  document.querySelector<HTMLButtonElement>(
    `button[data-family-id="${familyId}"][data-swatch-index="${stepIndex}"]`,
  );

const formatStepLabel = (step: ColorStep | undefined, index: number): string => {
  if (!step) return String(index + 1);
  const num = step.step;
  if (num >= 100) {
    return num.toString();
  }
  if (num >= 10) {
    return num.toString();
  }
  return num.toString();
};

const stepTextClass = (stepCount: number): string => {
  if (stepCount >= 20) return 'text-[6.5px]';
  if (stepCount >= 12) return 'text-[7.5px]';
  if (stepCount >= 9) return 'text-[8.5px]';
  return 'text-[10px]';
};

export default function PaletteGrid({
  palettes,
  colorFormat,
  onSelectFamily,
  selectedFamilyId,
  onNotify,
  copiedSwatchId,
  onCopySwatch,
  viewMode,
}: PaletteGridProps) {
  const handleCopy = useCallback(
    (text: string, copyId: string) => {
      onCopySwatch(copyId);
      onNotify(`${text} copied to clipboard.`);
    },
    [onCopySwatch, onNotify],
  );

  const handleSwatchKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>, familyIndex: number, stepIndex: number) => {
      const stepsCount = palettes[familyIndex]?.steps.length ?? 0;
      if (stepsCount === 0) {
        return;
      }

      let nextFamilyIndex = familyIndex;
      let nextStepIndex = stepIndex;

      switch (event.key) {
        case 'ArrowRight':
          nextStepIndex = Math.min(stepIndex + 1, stepsCount - 1);
          break;
        case 'ArrowLeft':
          nextStepIndex = Math.max(stepIndex - 1, 0);
          break;
        case 'ArrowDown':
          if (viewMode === 'rows') {
            nextFamilyIndex = Math.min(familyIndex + 1, palettes.length - 1);
          } else {
            nextStepIndex = Math.min(stepIndex + 1, stepsCount - 1);
          }
          break;
        case 'ArrowUp':
          if (viewMode === 'rows') {
            nextFamilyIndex = Math.max(familyIndex - 1, 0);
          } else {
            nextStepIndex = Math.max(stepIndex - 1, 0);
          }
          break;
        case 'Home':
          nextStepIndex = 0;
          break;
        case 'End':
          nextStepIndex = stepsCount - 1;
          break;
        default:
          return;
      }

      event.preventDefault();

      const nextFamily = palettes[nextFamilyIndex];
      if (!nextFamily) {
        return;
      }

      const boundedStepIndex = Math.min(nextStepIndex, nextFamily.steps.length - 1);

      onSelectFamily(nextFamily.id);
      window.requestAnimationFrame(() => {
        findSwatchButton(nextFamily.id, boundedStepIndex)?.focus();
      });
    },
    [onSelectFamily, palettes, viewMode],
  );

  if (palettes.length === 0) {
    return (
      <section className="flex flex-col gap-3 p-3 pb-20 sm:p-4" data-animate="enter">
        <header>
          <h2 className="font-heading text-[14px] font-semibold tracking-tight">
            Generated palettes
          </h2>
          <p className="text-[11px] text-muted-foreground">
            No families available for this preset.
          </p>
        </header>
      </section>
    );
  }

  const stepCount = palettes[0]?.steps.length ?? 0;

  if (viewMode === 'columns') {
    return (
      <div key="columns" data-animate="view-enter">
        <ColumnView
          palettes={palettes}
          colorFormat={colorFormat}
          selectedFamilyId={selectedFamilyId}
          onSelectFamily={onSelectFamily}
          copiedSwatchId={copiedSwatchId}
          onCopy={handleCopy}
          onKeyDown={handleSwatchKeyDown}
          stepCount={stepCount}
        />
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div key="grid" data-animate="view-enter">
        <CompactGridView
          palettes={palettes}
          colorFormat={colorFormat}
          copiedSwatchId={copiedSwatchId}
          onCopy={handleCopy}
          onSelectFamily={onSelectFamily}
          onKeyDown={handleSwatchKeyDown}
          stepCount={stepCount}
        />
      </div>
    );
  }

  return (
    <div key="rows" data-animate="view-enter">
      <RowView
        palettes={palettes}
        colorFormat={colorFormat}
        selectedFamilyId={selectedFamilyId}
        onSelectFamily={onSelectFamily}
        copiedSwatchId={copiedSwatchId}
        onCopy={handleCopy}
        onKeyDown={handleSwatchKeyDown}
        stepCount={stepCount}
      />
    </div>
  );
}

interface ViewSharedProps {
  palettes: ColorFamily[];
  colorFormat: ColorFormat;
  copiedSwatchId: string | null;
  onCopy: (text: string, copyId: string) => void;
  onSelectFamily: (id: string) => void;
  onKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    familyIndex: number,
    stepIndex: number,
  ) => void;
  stepCount: number;
}

interface ViewProps extends ViewSharedProps {
  selectedFamilyId: string;
}

function ViewHeader({
  palettes,
  colorFormat,
}: {
  palettes: ColorFamily[];
  colorFormat: ColorFormat;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-2">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-heading text-[14px] font-semibold tracking-tight">
          Generated palettes
        </h2>
        <p className="text-[11px] text-muted-foreground">
          {palettes.length} families · click any swatch to copy in {colorFormat.toUpperCase()}.
        </p>
      </div>
      <Badge variant="outline" size="sm">
        <IconLayersSelected aria-hidden="true" />
        {colorFormat}
      </Badge>
    </header>
  );
}

function ViewFooter() {
  return (
    <footer className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
      <span>Arrow keys to navigate. Press</span>
      <kbd className="rounded border border-border bg-muted px-1 py-px font-mono text-[10px]">
        Enter
      </kbd>
      <span>to copy.</span>
      <IconChevronRight aria-hidden="true" className="size-2.5" />
      <span>Sidebar row to fine-tune a family.</span>
    </footer>
  );
}

function RowView({
  palettes,
  colorFormat,
  selectedFamilyId,
  onSelectFamily,
  copiedSwatchId,
  onCopy,
  onKeyDown,
  stepCount,
}: ViewProps & { stepCount: number }) {
  const rowTemplate = `minmax(0,5rem) repeat(${stepCount}, minmax(0, 1fr))`;
  const stepLabel = stepTextClass(stepCount);

  return (
    <section
      className="flex flex-col gap-3 p-3 pb-20 text-[12px] leading-tight sm:p-4"
      data-animate="enter"
    >
      <ViewHeader palettes={palettes} colorFormat={colorFormat} />
      <div
        className="flex flex-col gap-0.5 transition-all duration-300"
        role="grid"
        aria-label="Generated color palette grid"
        style={{ '--row-cols-template': rowTemplate } as React.CSSProperties}
      >
        {palettes.map((family, familyIndex) => {
          const isSelected = selectedFamilyId === family.id;
          return (
            <article
              key={family.id}
              role="row"
              aria-selected={isSelected}
              className={`group grid items-center gap-0.5 rounded-sm p-0.5 transition-colors duration-200 border-2 ${
                isSelected ? 'border-primary bg-accent/40' : 'border-transparent hover:bg-accent/30'
              }`}
              style={{ gridTemplateColumns: rowTemplate }}
            >
              <div role="rowheader" className="px-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => onSelectFamily(family.id)}
                  aria-pressed={isSelected}
                  aria-label={`Select ${family.name} family`}
                  className={`h-5 w-full justify-start px-1 text-[10.5px] ${
                    isSelected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span className="truncate font-medium">{family.name}</span>
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      className="ml-auto size-1 shrink-0 rounded-full bg-primary"
                    />
                  )}
                </Button>
              </div>
              {family.steps.map((step, stepIndex) => (
                <div key={step.step} role="gridcell" className="relative">
                  <SwatchButton
                    family={family}
                    step={step}
                    familyIndex={familyIndex}
                    stepIndex={stepIndex}
                    colorFormat={colorFormat}
                    copiedSwatchId={copiedSwatchId}
                    onCopy={onCopy}
                    onSelect={onSelectFamily}
                    onKeyDown={onKeyDown}
                    stepTextClass={stepLabel}
                    staggerIndex={familyIndex * stepCount + stepIndex}
                  />
                </div>
              ))}
            </article>
          );
        })}
      </div>
      <ViewFooter />
    </section>
  );
}

function ColumnView({
  palettes,
  colorFormat,
  selectedFamilyId,
  onSelectFamily,
  copiedSwatchId,
  onCopy,
  onKeyDown,
  stepCount,
}: ViewProps & { stepCount: number }) {
  const minColWidth = palettes.length > 18 ? 1.25 : 1.75;
  const gridStyle = {
    gridTemplateColumns: `minmax(0, 1.5rem) repeat(${palettes.length}, minmax(${minColWidth}rem, 1fr))`,
  };
  const stepLabel = stepTextClass(stepCount);

  return (
    <section
      className="flex flex-col gap-3 p-3 pb-20 text-[12px] leading-tight sm:p-4"
      data-animate="enter"
    >
      <ViewHeader palettes={palettes} colorFormat={colorFormat} />
      <div
        className="flex flex-col gap-0.5 overflow-x-auto pb-1 transition-all duration-300"
        role="grid"
        aria-label="Generated color palette grid (columns)"
      >
        <div className="grid gap-0.5" style={gridStyle} role="row">
          <div role="columnheader" className="text-[9px] text-muted-foreground">
            Step
          </div>
          {palettes.map((family) => {
            const isSelected = selectedFamilyId === family.id;
            return (
              <div
                key={family.id}
                role="columnheader"
                className={`flex flex-col items-center gap-0.5 truncate rounded-sm p-0.5 text-center text-[9.5px] transition-colors border-2 ${
                  isSelected
                    ? 'border-primary bg-accent/40 text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectFamily(family.id)}
                  aria-pressed={isSelected}
                  aria-label={`Select ${family.name} family`}
                  className="w-full truncate font-medium"
                >
                  {family.name}
                </button>
                {isSelected && (
                  <span aria-hidden="true" className="size-1 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            );
          })}
        </div>

        {Array.from({ length: stepCount }, (_, stepIndex) => stepIndex).map((stepIndex) => {
          const step = palettes[0]?.steps[stepIndex];
          return (
            <div key={stepIndex} className="grid gap-0.5" style={gridStyle} role="row">
              <div
                role="rowheader"
                className="flex items-center justify-end text-[9px] text-muted-foreground"
              >
                {formatStepLabel(step, stepIndex)}
              </div>
              {palettes.map((family, familyIndex) => {
                const familyStep = family.steps[stepIndex];
                if (!familyStep) {
                  return <div key={family.id} role="gridcell" />;
                }
                return (
                  <div key={`${family.id}-${familyStep.step}`} role="gridcell" className="relative">
                    <SwatchButton
                      family={family}
                      step={familyStep}
                      familyIndex={familyIndex}
                      stepIndex={stepIndex}
                      colorFormat={colorFormat}
                      copiedSwatchId={copiedSwatchId}
                      onCopy={onCopy}
                      onSelect={onSelectFamily}
                      onKeyDown={onKeyDown}
                      size="compact"
                      stepTextClass={stepLabel}
                      staggerIndex={stepIndex * palettes.length + familyIndex}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <ViewFooter />
    </section>
  );
}

function CompactGridView({
  palettes,
  colorFormat,
  copiedSwatchId,
  onCopy,
  onSelectFamily,
  onKeyDown,
  stepCount,
}: ViewSharedProps & { stepCount: number }) {
  const minColWidth = palettes.length > 18 ? 0.9 : 1.1;
  const gridStyle = {
    gridTemplateColumns: `minmax(0, 1.1rem) repeat(${palettes.length}, minmax(${minColWidth}rem, 1fr))`,
  };
  const stepLabel = stepTextClass(stepCount);

  return (
    <section
      className="flex flex-col gap-3 p-3 pb-20 text-[12px] leading-tight sm:p-4"
      data-animate="enter"
    >
      <ViewHeader palettes={palettes} colorFormat={colorFormat} />
      <div
        className="overflow-x-auto rounded-sm border border-border bg-card/40 p-1 transition-all duration-300"
        role="grid"
        aria-label="Compact palette grid"
      >
        <div className="grid gap-0.5" style={gridStyle}>
          <div />
          {palettes.map((family) => (
            <div
              key={family.id}
              className="truncate text-center text-[8.5px] text-muted-foreground"
              title={family.name}
            >
              {family.name.slice(0, 6)}
            </div>
          ))}

          {Array.from({ length: stepCount }, (_, stepIndex) => stepIndex).map((stepIndex) => {
            const step = palettes[0]?.steps[stepIndex];
            return (
              <div key={stepIndex} className="contents" role="row">
                <div className="flex items-center justify-end text-[8.5px] text-muted-foreground">
                  {formatStepLabel(step, stepIndex)}
                </div>
                {palettes.map((family, familyIndex) => {
                  const familyStep = family.steps[stepIndex];
                  if (!familyStep) {
                    return <div key={family.id} />;
                  }
                  return (
                    <div key={`${family.id}-${familyStep.step}`} className="relative">
                      <SwatchButton
                        family={family}
                        step={familyStep}
                        familyIndex={familyIndex}
                        stepIndex={stepIndex}
                        colorFormat={colorFormat}
                        copiedSwatchId={copiedSwatchId}
                        onCopy={onCopy}
                        onSelect={onSelectFamily}
                        onKeyDown={onKeyDown}
                        size="tiny"
                        stepTextClass={stepLabel}
                        staggerIndex={stepIndex * palettes.length + familyIndex}
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      <ViewFooter />
    </section>
  );
}
