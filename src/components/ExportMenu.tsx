import { useEffect, useRef, useState } from 'react';
import { ChevronDown, FileCode, FileJson2, FileType } from 'lucide-react';
import { copyTextToClipboard } from '@/lib/clipboard';
import { generateCSSVariables, generateTailwind4CSS, generateTokenJson } from '@/lib/exports';
import type { ColorFamily } from '@/types/palette';

interface ExportMenuProps {
  palettes: ColorFamily[];
  onNotify: (message: string) => void;
}

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

  const handleCopy = async (type: 'css' | 'tailwind' | 'json') => {
    const contentByType = {
      css: generateCSSVariables(palettes),
      tailwind: generateTailwind4CSS(palettes),
      json: generateTokenJson(palettes),
    };

    const copied = await copyTextToClipboard(contentByType[type]);
    if (copied) {
      const successMessage =
        type === 'css'
          ? 'CSS variables copied to clipboard.'
          : type === 'tailwind'
            ? 'Tailwind 4 theme tokens copied to clipboard.'
            : 'JSON token export copied to clipboard.';
      onNotify(successMessage);
    } else {
      onNotify('Clipboard API is not available in this environment.');
    }

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
            <button
              type="button"
              onClick={() => void handleCopy('css')}
              className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-300 transition-colors hover:bg-[#333] hover:text-white"
            >
              <span className="rounded-md bg-blue-500/10 p-2 text-blue-400 transition-colors group-hover:bg-blue-500 group-hover:text-white">
                <FileType className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="font-medium">CSS Variables</span>
                <span className="text-[10px] text-(--color-text-muted)">
                  :root &#123; --flamingo-1: ... &#125;
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => void handleCopy('tailwind')}
              className="group mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-300 transition-colors hover:bg-[#333] hover:text-white"
            >
              <span className="rounded-md bg-teal-500/10 p-2 text-teal-400 transition-colors group-hover:bg-teal-500 group-hover:text-white">
                <FileCode className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="font-medium">Tailwind 4</span>
                <span className="text-[10px] text-(--color-text-muted)">
                  @theme &#123; --color-flamingo-1: ... &#125;
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => void handleCopy('json')}
              className="group mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-gray-300 transition-colors hover:bg-[#333] hover:text-white"
            >
              <span className="rounded-md bg-violet-500/10 p-2 text-violet-400 transition-colors group-hover:bg-violet-500 group-hover:text-white">
                <FileJson2 className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="font-medium">JSON Tokens</span>
                <span className="text-[10px] text-(--color-text-muted)">
                  &#123; "flamingo": &#123; "1": "..." &#125; &#125;
                </span>
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
