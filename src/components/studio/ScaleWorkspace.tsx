import { useEffect, useMemo, useState } from 'react';
import { IconDeviceDesktop, IconLayoutGrid, IconRotate } from '@tabler/icons-react';
import ControlPanel from '@/components/ControlPanel';
import ExportMenu from '@/components/ExportMenu';
import PaletteGrid from '@/components/PaletteGrid';
import PreviewPanel from '@/components/PreviewPanel';
import { ColorFormatSelect } from '@/components/ColorFormatSelect';
import { ViewModeSelector } from '@/components/ViewModeSelector';
import type { PaletteViewMode } from '@/components/ViewModeSelector';
import { Button } from '@/components/ui/button';
import { generatePalettes, getSafeActiveFamily } from '@/lib/color';
import { createDefaultSettings } from '@/types/palette';
import type { AccentPaletteId, GeneratorSettings, PresetRegistry } from '@/types/palette';

interface ScaleWorkspaceProps {
  settings: GeneratorSettings;
  setSettings: React.Dispatch<React.SetStateAction<GeneratorSettings>>;
  presetRegistry: PresetRegistry;
  customPresetCount: number;
  onImportPreset: (file: File) => Promise<void> | void;
  accentPalette: AccentPaletteId;
  onCycleAccent: () => void;
  onNotify: (message: string, type?: 'success' | 'error') => void;
}

export function ScaleWorkspace({
  settings,
  setSettings,
  presetRegistry,
  customPresetCount,
  onImportPreset,
  accentPalette,
  onCycleAccent,
  onNotify,
}: ScaleWorkspaceProps) {
  const [activeView, setActiveView] = useState<'palette' | 'preview'>('palette');
  const [paletteView, setPaletteView] = useState<PaletteViewMode>('rows');
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [copiedSwatchId, setCopiedSwatchId] = useState<string | null>(null);
  const palettes = useMemo(
    () => generatePalettes(settings, presetRegistry),
    [presetRegistry, settings],
  );
  const activeFamily = useMemo(
    () => getSafeActiveFamily(palettes, selectedFamilyId),
    [palettes, selectedFamilyId],
  );

  useEffect(() => {
    if (!activeFamily) {
      setSelectedFamilyId(null);
    } else if (activeFamily.id !== selectedFamilyId) {
      setSelectedFamilyId(activeFamily.id);
    }
  }, [activeFamily, selectedFamilyId]);

  useEffect(() => {
    if (!copiedSwatchId) return undefined;
    const timer = window.setTimeout(() => setCopiedSwatchId(null), 1400);
    return () => window.clearTimeout(timer);
  }, [copiedSwatchId]);

  if (!activeFamily) {
    return (
      <div className="studio-empty-state">No scale families are available for this preset.</div>
    );
  }

  return (
    <section className="scale-studio" aria-labelledby="scale-title">
      <ControlPanel
        embedded
        settings={settings}
        setSettings={setSettings}
        onReset={() => {
          setSettings(createDefaultSettings());
          onNotify('Scale settings reset.');
        }}
        activeFamilyId={activeFamily.id}
        activeFamilyDisplayName={activeFamily.name}
        presetOptions={presetRegistry}
        customPresetCount={customPresetCount}
        onImportPreset={onImportPreset}
        accentPalette={accentPalette}
        onCycleAccent={onCycleAccent}
      />

      <div className="scale-canvas">
        <header className="scale-toolbar">
          <div>
            <p className="studio-eyebrow">Token system</p>
            <h2 id="scale-title">Scale Lab</h2>
          </div>
          <div className="scale-toolbar-actions">
            <div className="studio-segmented scale-view-switcher" aria-label="Scale content view">
              <button
                type="button"
                data-active={activeView === 'palette' || undefined}
                aria-pressed={activeView === 'palette'}
                onClick={() => setActiveView('palette')}
              >
                <IconLayoutGrid aria-hidden="true" />
                Grid
              </button>
              <button
                type="button"
                data-active={activeView === 'preview' || undefined}
                aria-pressed={activeView === 'preview'}
                onClick={() => setActiveView('preview')}
              >
                <IconDeviceDesktop aria-hidden="true" />
                Preview
              </button>
            </div>
            {activeView === 'palette' && (
              <ViewModeSelector value={paletteView} onChange={setPaletteView} />
            )}
            <ColorFormatSelect
              value={settings.colorFormat}
              onChange={(colorFormat) => setSettings((previous) => ({ ...previous, colorFormat }))}
            />
            <ExportMenu
              palettes={palettes}
              colorFormat={settings.colorFormat}
              onNotify={onNotify}
            />
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label="Reset scale settings"
              onClick={() => {
                setSettings(createDefaultSettings());
                onNotify('Scale settings reset.');
              }}
            >
              <IconRotate aria-hidden="true" />
            </Button>
          </div>
        </header>

        {activeView === 'palette' ? (
          <PaletteGrid
            palettes={palettes}
            colorFormat={settings.colorFormat}
            onSelectFamily={setSelectedFamilyId}
            selectedFamilyId={activeFamily.id}
            onNotify={onNotify}
            copiedSwatchId={copiedSwatchId}
            onCopySwatch={setCopiedSwatchId}
            viewMode={paletteView}
          />
        ) : (
          <div className="scale-preview-wrap">
            <PreviewPanel activeFamily={activeFamily} />
            <p className="studio-caption">
              Previewing <strong>{activeFamily.name}</strong>. Return to Grid to select another
              family.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
