import { useEffect, useMemo, useRef, useState } from 'react';
import { Layout, Grid as GridIcon } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ControlPanel from '@/components/ControlPanel';
import ExportMenu from '@/components/ExportMenu';
import PaletteGrid from '@/components/PaletteGrid';
import PreviewPanel from '@/components/PreviewPanel';
import Toast from '@/components/Toast';
import { generatePalettes, getSafeActiveFamily } from '@/lib/color';
import { createDefaultSettings } from '@/types/palette';

gsap.registerPlugin(useGSAP);

export default function App() {
  const [settings, setSettings] = useState(createDefaultSettings);
  const [activeTab, setActiveTab] = useState<'palette' | 'preview'>('palette');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const palettes = useMemo(() => generatePalettes(settings), [settings]);

  useEffect(() => {
    if (palettes.length === 0) {
      setSelectedFamilyId(null);
      return;
    }

    if (!selectedFamilyId || !palettes.some((palette) => palette.id === selectedFamilyId)) {
      setSelectedFamilyId(palettes[0].id);
    }
  }, [palettes, selectedFamilyId]);

  const activeFamily = useMemo(
    () => getSafeActiveFamily(palettes, selectedFamilyId),
    [palettes, selectedFamilyId],
  );

  useGSAP(
    () => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return undefined;
      }

      const media = gsap.matchMedia();

      media.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('[data-animate="enter"]', {
          opacity: 0,
          y: 10,
          duration: 0.35,
          ease: 'power2.out',
          stagger: 0.06,
        });
      });

      return () => media.revert();
    },
    {
      scope: rootRef,
      dependencies: [activeTab, palettes.length, selectedFamilyId],
      revertOnUpdate: true,
    },
  );

  if (!activeFamily) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-(--color-bg-canvas) text-(--color-text-primary)">
        No families are available for the selected preset.
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="flex min-h-screen flex-col overflow-hidden bg-(--color-bg-canvas) text-(--color-text-primary) md:flex-row"
    >
      <ControlPanel
        settings={settings}
        setSettings={setSettings}
        onReset={() => setSettings(createDefaultSettings())}
        activeFamilyId={activeFamily.id}
        activeFamilyDisplayName={activeFamily.name}
      />

      <main className="flex h-screen flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-(--color-border-default) bg-[oklch(0.12_0_0/0.8)] px-6 backdrop-blur-md">
          <div
            className="flex gap-1 rounded-lg border border-(--color-border-default) bg-(--color-surface-1) p-1"
            data-animate="enter"
          >
            <button
              type="button"
              onClick={() => setActiveTab('palette')}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === 'palette'
                  ? 'bg-(--color-border-default) text-white shadow-sm'
                  : 'text-(--color-text-muted) hover:text-gray-300'
              }`}
            >
              <GridIcon className="h-4 w-4" /> Palette Grid
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-all ${
                activeTab === 'preview'
                  ? 'bg-(--color-border-default) text-white shadow-sm'
                  : 'text-(--color-text-muted) hover:text-gray-300'
              }`}
            >
              <Layout className="h-4 w-4" /> UI Preview
            </button>
          </div>

          <ExportMenu palettes={palettes} onNotify={setToastMessage} />
        </header>

        <div className="relative flex-1 overflow-y-auto">
          {activeTab === 'palette' ? (
            <PaletteGrid
              palettes={palettes}
              onSelectFamily={setSelectedFamilyId}
              selectedFamilyId={activeFamily.id}
              onNotify={setToastMessage}
            />
          ) : (
            <div className="flex h-full flex-col items-center p-4 md:p-8" data-animate="enter">
              <div className="h-full max-h-[800px] w-full max-w-5xl overflow-hidden rounded-2xl border border-(--color-border-default) shadow-2xl">
                <PreviewPanel activeFamily={activeFamily} />
              </div>
              <p className="mt-4 text-sm text-(--color-text-muted)">
                Previewing{' '}
                <span className="font-bold text-(--color-text-primary)">{activeFamily.name}</span>{' '}
                family. Go back to Grid view to select a different base.
              </p>
            </div>
          )}
        </div>
      </main>

      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
