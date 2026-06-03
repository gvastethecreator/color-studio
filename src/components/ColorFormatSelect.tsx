import type { ReactElement } from 'react';
import { COLOR_FORMATS } from '@/lib/color-formats';
import type { ColorFormat } from '@/lib/color-formats';
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ColorFormatSelectProps {
  value: ColorFormat;
  onChange: (format: ColorFormat) => void;
}

interface FormatOption {
  value: ColorFormat;
  label: string;
  description: string;
}

const items: FormatOption[] = COLOR_FORMATS.map((format) => ({
  value: format.id,
  label: format.label,
  description: format.description,
}));

export function ColorFormatSelect({ value, onChange }: ColorFormatSelectProps): ReactElement {
  const current = items.find((item) => item.value === value) ?? items[0]!;

  const handleValueChange = (next: FormatOption | null) => {
    if (next) {
      onChange(next.value);
    }
  };

  return (
    <Select<FormatOption>
      items={items}
      value={current}
      onValueChange={handleValueChange}
      itemToStringValue={(item) => item.value}
    >
      <SelectTrigger size="sm" className="min-w-30" aria-label="Color format" title="Color format">
        <SelectValue placeholder="Format">
          {(item) => (
            <span className="flex items-center gap-2">
              <span className="font-medium">{item.label}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectPopup alignItemWithTrigger={false}>
        {items.map((item) => (
          <SelectItem key={item.value} value={item}>
            <span className="flex flex-col">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground text-xs">{item.description}</span>
            </span>
          </SelectItem>
        ))}
      </SelectPopup>
    </Select>
  );
}
