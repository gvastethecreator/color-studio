import type { ReactElement } from 'react';
import {
  IconCode,
  IconCopy,
  IconDownload,
  IconFileCode,
  IconJson,
  IconFileTypeCsv,
  IconShare,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { Menu, MenuItem, MenuPopup, MenuSeparator, MenuTrigger } from '@/components/ui/menu';
import { copyTextToClipboard } from '@/lib/clipboard';
import { downloadTextFile } from '@/lib/file';
import { generateCSSVariables, generateTailwind4CSS, generateTokenJson } from '@/lib/exports';
import type { ColorFormat } from '@/lib/color-formats';
import type { ColorFamily } from '@/types/palette';

interface ExportMenuProps {
  palettes: ColorFamily[];
  colorFormat: ColorFormat;
  onNotify: (message: string) => void;
}

type ExportType = 'css' | 'tailwind' | 'json';

interface ExportOption {
  label: string;
  description: string;
  icon: typeof FileType;
  copyMessage: string;
  downloadMessage: string;
  filename: string;
  mimeType: string;
  generate: (palettes: ColorFamily[]) => string;
}

const EXPORT_OPTIONS: Record<ExportType, ExportOption> = {
  css: {
    label: 'CSS variables',
    description: ':root { --flamingo-1: ... }',
    icon: IconFileTypeCsv,
    copyMessage: 'CSS variables copied to clipboard.',
    downloadMessage: 'CSS variables downloaded.',
    filename: 'prism-architect.tokens.css',
    mimeType: 'text/css;charset=utf-8',
    generate: generateCSSVariables,
  },
  tailwind: {
    label: 'Tailwind 4',
    description: '@theme { --color-flamingo-1: ... }',
    icon: IconFileCode,
    copyMessage: 'Tailwind 4 theme tokens copied to clipboard.',
    downloadMessage: 'Tailwind 4 theme tokens downloaded.',
    filename: 'prism-architect.theme.css',
    mimeType: 'text/css;charset=utf-8',
    generate: generateTailwind4CSS,
  },
  json: {
    label: 'JSON tokens',
    description: '{ "flamingo": { "1": "..." } }',
    icon: IconJson,
    copyMessage: 'JSON token export copied to clipboard.',
    downloadMessage: 'JSON token export downloaded.',
    filename: 'prism-architect.tokens.json',
    mimeType: 'application/json;charset=utf-8',
    generate: generateTokenJson,
  },
};

export default function ExportMenu({ palettes, onNotify }: ExportMenuProps): ReactElement {
  const handleCopy = async (type: ExportType) => {
    const option = EXPORT_OPTIONS[type];
    const copied = await copyTextToClipboard(option.generate(palettes));

    onNotify(copied ? option.copyMessage : 'Clipboard API is not available in this environment.');
  };

  const handleDownload = (type: ExportType) => {
    const option = EXPORT_OPTIONS[type];
    const downloaded = downloadTextFile(
      option.generate(palettes),
      option.filename,
      option.mimeType,
    );

    onNotify(
      downloaded ? option.downloadMessage : 'File download is not available in this environment.',
    );
  };

  return (
    <Menu>
      <MenuTrigger
        render={
          <Button type="button" size="sm" variant="default">
            <IconShare aria-hidden="true" />
            Export
          </Button>
        }
      />
      <MenuPopup align="end" sideOffset={6} className="min-w-64">
        <div className="px-2 py-1.5 text-muted-foreground text-xs">
          Export the current palette in a token format.
        </div>
        <MenuSeparator />
        {(Object.entries(EXPORT_OPTIONS) as [ExportType, ExportOption][]).map(([type, option]) => {
          const Icon = option.icon;
          return (
            <div key={type} className="flex items-center gap-2 rounded-md px-2 py-1.5">
              <span
                aria-hidden="true"
                className="flex size-7 items-center justify-center rounded-md border border-border bg-muted text-foreground"
              >
                <Icon className="size-3.5" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate font-medium text-sm">{option.label}</span>
                <span className="truncate font-mono text-[10px] text-muted-foreground">
                  {option.description}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <MenuItem
                  onClick={() => {
                    void handleCopy(type);
                  }}
                  aria-label={`Copy ${option.label}`}
                  className="size-7 justify-center p-0"
                >
                  <IconCopy aria-hidden="true" className="size-3.5" />
                </MenuItem>
                <MenuItem
                  onClick={() => handleDownload(type)}
                  aria-label={`Download ${option.label}`}
                  className="size-7 justify-center p-0"
                >
                  <IconDownload aria-hidden="true" className="size-3.5" />
                </MenuItem>
              </div>
            </div>
          );
        })}
        <MenuSeparator />
        <div className="flex items-center gap-1.5 px-2 py-1 text-muted-foreground text-xs">
          <IconCode aria-hidden="true" className="size-3" />
          Tokens use stable family IDs.
        </div>
      </MenuPopup>
    </Menu>
  );
}
