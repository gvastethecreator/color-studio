import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown, Download, FileCode, FileJson2, FileType } from 'lucide-react';
import { copyTextToClipboard } from '@/lib/clipboard';
import { downloadTextFile } from '@/lib/file';
import { generateCSSVariables, generateTailwind4CSS, generateTokenJson } from '@/lib/exports';
import type { ColorFamily } from '@/types/palette';

interface ExportMenuProps {
  palettes: ColorFamily[];
  onNotify: (message: string) => void;
}

type ExportType = 'css' | 'tailwind' | 'json';

interface ExportOption {
  label: string;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
  copyMessage: string;
  downloadMessage: string;
  filename: string;
  mimeType: string;
  generate: (palettes: ColorFamily[]) => string;
}

const EXPORT_OPTIONS: Record<ExportType, ExportOption> = {
  css: {
    label: 'CSS Variables',
    description: ':root { --flamingo-1: ... }',
    icon: FileType,
    iconClassName:
      'rounded-md bg-blue-500/10 p-2 text-blue-400 transition-colors group-hover:bg-blue-500 group-hover:text-white',
    copyMessage: 'CSS variables copied to clipboard.',
    downloadMessage: 'CSS variables downloaded as prism-architect.tokens.css.',
    filename: 'prism-architect.tokens.css',
    mimeType: 'text/css;charset=utf-8',
    generate: generateCSSVariables,
  },
  tailwind: {
    label: 'Tailwind 4',
    description: '@theme { --color-flamingo-1: ... }',
    icon: FileCode,
    iconClassName:
      'rounded-md bg-teal-500/10 p-2 text-teal-400 transition-colors group-hover:bg-teal-500 group-hover:text-white',
    copyMessage: 'Tailwind 4 theme tokens copied to clipboard.',
    downloadMessage: 'Tailwind 4 theme tokens downloaded as prism-architect.theme.css.',
    filename: 'prism-architect.theme.css',
    mimeType: 'text/css;charset=utf-8',
    generate: generateTailwind4CSS,
  },
  json: {
    label: 'JSON Tokens',
    description: '{ "flamingo": { "1": "..." } }',
    icon: FileJson2,
    iconClassName:
      'rounded-md bg-violet-500/10 p-2 text-violet-400 transition-colors group-hover:bg-violet-500 group-hover:text-white',
    copyMessage: 'JSON token export copied to clipboard.',
    downloadMessage: 'JSON token export downloaded as prism-architect.tokens.json.',
    filename: 'prism-architect.tokens.json',
    mimeType: 'application/json;charset=utf-8',
    generate: generateTokenJson,
  },
};

export default function ExportMenu({ palettes, onNotify }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = async (type: ExportType) => {
    const option = EXPORT_OPTIONS[type];
    const copied = await copyTextToClipboard(option.generate(palettes));

    if (copied) {
      onNotify(option.copyMessage);
    } else {
      onNotify('Clipboard API is not available in this environment.');
    }

    setIsOpen(false);
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
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-colors hover:bg-indigo-700"
        data-animate="enter"
      >
        <FileCode className="h-4 w-4" />
        Export
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="animate-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-(--color-border-default) bg-(--color-surface-2) shadow-2xl duration-200 fade-in">
          <div className="p-2">
            {(Object.entries(EXPORT_OPTIONS) as [ExportType, ExportOption][]).map(
              ([type, option], index) => {
                const Icon = option.icon;

                return (
                  <div
                    key={type}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-300 transition-colors hover:bg-[#333] hover:text-white ${
                      index > 0 ? 'mt-1' : ''
                    }`}
                  >
                    <span className={option.iconClassName}>
                      <Icon className="h-4 w-4" />
                    </span>

                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="truncate text-[10px] text-(--color-text-muted)">
                        {option.description}
                      </span>
                    </span>

                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          void handleCopy(type);
                        }}
                        aria-label={`Copy ${option.label}`}
                        className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
                      >
                        Copy
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownload(type)}
                        aria-label={`Download ${option.label}`}
                        className="rounded-md border border-white/10 p-1.5 text-white transition-colors hover:bg-white/10"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      )}
    </div>
  );
}
