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
  onTestInContrast?: (color: string) => void;
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
  onTestInContrast,
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
      <div key="columns" data-animate="view-enter" className="flex-1 min-h-0 flex flex-col">
        <ColumnView
          palettes={palettes}
          colorFormat={colorFormat}
          selectedFamilyId={selectedFamilyId}
          onSelectFamily={onSelectFamily}
          copiedSwatchId={copiedSwatchId}
          onCopy={handleCopy}
          onTestInContrast={onTestInContrast}
          onKeyDown={handleSwatchKeyDown}
          stepCount={stepCount}
        />
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div key="grid" data-animate="view-enter" className="flex-1 min-h-0 flex flex-col">
        <CompactGridView
          palettes={palettes}
          colorFormat={colorFormat}
          copiedSwatchId={copiedSwatchId}
          onCopy={handleCopy}
          onTestInContrast={onTestInContrast}
          onSelectFamily={onSelectFamily}
          onKeyDown={handleSwatchKeyDown}
          stepCount={stepCount}
        />
      </div>
    );
  }

  return (
    <div key="rows" data-animate="view-enter" className="flex-1 min-h-0 flex flex-col">
      <RowView
        palettes={palettes}
        colorFormat={colorFormat}
        selectedFamilyId={selectedFamilyId}
        onSelectFamily={onSelectFamily}
        copiedSwatchId={copiedSwatchId}
        onCopy={handleCopy}
        onTestInContrast={onTestInContrast}
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
  onTestInContrast?: (color: string) => void;
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
  onTestInContrast,
  onKeyDown,
  stepCount,
}: ViewProps & { stepCount: number }) {
  const rowTemplate = `minmax(0,5rem) repeat(${stepCount}, minmax(0, 1fr))`;
  const stepLabel = stepTextClass(stepCount);

  return (
    <section
      className="flex flex-col gap-3 p-3 pb-20 text-[12px] leading-tight sm:p-4 overflow-y-auto flex-1"
      data-animate="enter"
    >
      <table
        className="flex flex-col gap-0.5 border-collapse"
        aria-label="Generated color palette grid"
        style={{ '--row-cols-template': rowTemplate } as React.CSSProperties}
      >
        <tbody className="contents">
          {palettes.map((family, familyIndex) => {
            const isSelected = selectedFamilyId === family.id;
            return (
              <tr
                key={family.id}
                aria-selected={isSelected}
                className={`group grid items-center gap-0.5 rounded-sm p-0.5 transition-colors duration-200 border-2 row-animate-enter
                  ${isSelected ? 'border-primary bg-accent/40' : 'border-transparent hover:bg-accent/30'}
                `}
                style={{
                  gridTemplateColumns: rowTemplate,
                  animationDelay: `${familyIndex * 25}ms`,
                }}
              >
                <th scope="row" className="px-1 font-normal text-left">
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
                </th>
                {family.steps.map((step, stepIndex) => (
                  <td key={step.step} className="relative transition-all duration-200">
                    <SwatchButton
                      family={family}
                      step={step}
                      familyIndex={familyIndex}
                      stepIndex={stepIndex}
                      colorFormat={colorFormat}
                      copiedSwatchId={copiedSwatchId}
                      onCopy={onCopy}
                      onTestInContrast={onTestInContrast}
                      onSelect={onSelectFamily}
                      onKeyDown={onKeyDown}
                      stepTextClass={stepLabel}
                      staggerIndex={familyIndex * stepCount + stepIndex}
                    />
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
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
  onTestInContrast,
  onKeyDown,
  stepCount,
}: ViewProps & { stepCount: number }) {
  const minColWidth = palettes.length > 18 ? 2 : 2.75;
  const stepLabel = stepTextClass(stepCount);

  return (
    <section
      className="flex flex-col gap-3 p-3 pb-4 text-[12px] leading-tight sm:p-4 h-full overflow-hidden"
      data-animate="enter"
    >
      <ViewHeader palettes={palettes} colorFormat={colorFormat} />
      <div className="overflow-x-auto pb-2 transition-all duration-300 w-full flex-1 min-h-0">
        <table
          className="border-collapse w-full"
          aria-label="Generated color palette grid (columns)"
          style={
            {
              '--col-min-width': `${minColWidth}rem`,
            } as React.CSSProperties
          }
        >
          <thead className="contents">
            <tr className="contents">
              <th
                scope="col"
                className="h-9 flex items-center justify-end text-[9px] text-muted-foreground pr-1 font-medium shrink-0 w-8"
              >
                Step
              </th>
              {palettes.map((family, familyIndex) => {
                const isSelected = selectedFamilyId === family.id;
                return (
                  <th
                    key={family.id}
                    scope="col"
                    aria-selected={isSelected}
                    className="col-animate-enter"
                    style={{ animationDelay: `${familyIndex * 25}ms` }}
                  >
                    <div
                      className={`h-9 flex flex-col justify-center items-center gap-0.5 truncate rounded-sm p-0.5 text-center text-[9.5px] transition-colors border-2 shrink-0 min-w-(--col-min-width) ${
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
                      {isSelected ? (
                        <span
                          aria-hidden="true"
                          className="size-1 shrink-0 rounded-full bg-primary"
                        />
                      ) : (
                        <span className="size-1 shrink-0 opacity-0" />
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="contents">
            {Array.from({ length: stepCount }, (_, stepIndex) => {
              const step = palettes[0]?.steps[stepIndex];
              return (
                <tr key={stepIndex} className="contents">
                  <th
                    scope="row"
                    className="flex-1 min-h-0 flex items-center justify-end text-[9px] text-muted-foreground pr-1 font-normal w-8"
                  >
                    {formatStepLabel(step, stepIndex)}
                  </th>
                  {palettes.map((family, familyIndex) => {
                    const familyStep = family.steps[stepIndex];
                    return (
                      <td key={`${family.id}-${stepIndex}`} className="relative flex-1 min-h-0">
                        <SwatchButton
                          family={family}
                          step={familyStep}
                          familyIndex={familyIndex}
                          stepIndex={stepIndex}
                          colorFormat={colorFormat}
                          copiedSwatchId={copiedSwatchId}
                          onCopy={onCopy}
                          onTestInContrast={onTestInContrast}
                          onSelect={onSelectFamily}
                          onKeyDown={onKeyDown}
                          size="compact"
                          stepTextClass={stepLabel}
                          staggerIndex={stepIndex * palettes.length + familyIndex}
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
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
  onTestInContrast,
  onSelectFamily,
  onKeyDown,
  stepCount,
}: ViewSharedProps & { stepCount: number }) {
  const minColWidth = palettes.length > 18 ? 1.2 : 1.5;
  const stepLabel = stepTextClass(stepCount);

  return (
    <section
      className="flex flex-col gap-3 p-3 pb-4 text-[12px] leading-tight sm:p-4 h-full overflow-hidden"
      data-animate="enter"
    >
      <ViewHeader palettes={palettes} colorFormat={colorFormat} />
      <div
        className="flex gap-0.5 overflow-x-auto rounded-sm border border-border bg-card/40 p-1 transition-all duration-300 w-full flex-1 min-h-0"
        role="grid"
        aria-label="Compact palette grid"
      >
        {/* Step labels column */}
        <div className="flex flex-col gap-0.5 shrink-0 w-6 h-full">
          <div className="h-6 shrink-0" />
          {Array.from({ length: stepCount }, (_, stepIndex) => {
            const step = palettes[0]?.steps[stepIndex];
            return (
              <div
                key={stepIndex}
                className="flex-1 min-h-0 flex items-center justify-end text-[8.5px] text-muted-foreground pr-1"
              >
                {formatStepLabel(step, stepIndex)}
              </div>
            );
          })}
        </div>

        {/* Family columns */}
        {palettes.map((family, familyIndex) => {
          return (
            <div
              key={family.id}
              className="flex flex-col gap-0.5 flex-1 col-animate-enter h-full"
              style={{
                minWidth: `${minColWidth}rem`,
                animationDelay: `${familyIndex * 25}ms`,
              }}
            >
              <div
                className="h-6 flex items-center justify-center truncate text-center text-[8.5px] text-muted-foreground shrink-0"
                title={family.name}
              >
                {family.name.slice(0, 6)}
              </div>

              {family.steps.map((familyStep, stepIndex) => {
                return (
                  <div key={familyStep.step} className="relative flex-1 min-h-0">
                    <SwatchButton
                      family={family}
                      step={familyStep}
                      familyIndex={familyIndex}
                      stepIndex={stepIndex}
                      colorFormat={colorFormat}
                      copiedSwatchId={copiedSwatchId}
                      onCopy={onCopy}
                      onTestInContrast={onTestInContrast}
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
      <ViewFooter />
    </section>
  );
}
