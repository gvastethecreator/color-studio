import type { ReactElement } from 'react';
import { IconColumns3, IconGrid3x3, IconLayoutRows } from '@tabler/icons-react';
import { Tooltip, TooltipPopup, TooltipTrigger } from '@/components/ui/tooltip';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type PaletteViewMode = 'rows' | 'columns' | 'grid';

interface ViewModeSelectorProps {
  value: PaletteViewMode;
  onChange: (mode: PaletteViewMode) => void;
}

const VIEW_MODES: Array<{
  id: PaletteViewMode;
  label: string;
  description: string;
  icon: typeof IconLayoutRows;
}> = [
  {
    id: 'rows',
    label: 'Rows',
    description: 'One row per family, steps as columns.',
    icon: IconLayoutRows,
  },
  {
    id: 'columns',
    label: 'Columns',
    description: 'One column per family, steps as rows.',
    icon: IconColumns3,
  },
  {
    id: 'grid',
    label: 'Compact',
    description: 'Dense grid that fits all families in one view.',
    icon: IconGrid3x3,
  },
];

export function ViewModeSelector({ value, onChange }: ViewModeSelectorProps): ReactElement {
  return (
    <ToggleGroup
      value={value}
      onValueChange={(next: string) => {
        if (next) {
          onChange(next as PaletteViewMode);
        }
      }}
      aria-label="Palette view mode"
      size="sm"
    >
      {VIEW_MODES.map((mode) => {
        const Icon = mode.icon;
        return (
          <Tooltip key={mode.id}>
            <TooltipTrigger
              render={
                <ToggleGroupItem value={mode.id} aria-label={mode.label}>
                  <Icon aria-hidden="true" />
                </ToggleGroupItem>
              }
            />
            <TooltipPopup side="bottom" sideOffset={6}>
              {mode.description}
            </TooltipPopup>
          </Tooltip>
        );
      })}
    </ToggleGroup>
  );
}
