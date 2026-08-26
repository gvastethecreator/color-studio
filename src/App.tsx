import { lazy, Suspense } from 'react';
import { IconSparkles } from '@tabler/icons-react';
import { BrandLogo } from '@/components/BrandLogo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { PaletteComposer } from '@/components/studio/PaletteComposer';
import { StudioNavigation } from '@/components/studio/StudioNavigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useStudioSession } from '@/hooks/use-studio-session';
import type { StudioToolId } from '@/types/studio';

const GradientEditor = lazy(() =>
  import('@/components/studio/GradientEditor').then(({ GradientEditor }) => ({
    default: GradientEditor,
  })),
);
const ScaleWorkspace = lazy(() =>
  import('@/components/studio/ScaleWorkspace').then(({ ScaleWorkspace }) => ({
    default: ScaleWorkspace,
  })),
);
const ContrastTool = lazy(() =>
  import('@/components/studio/ContrastTool').then(({ ContrastTool }) => ({
    default: ContrastTool,
  })),
);

const TOOL_TITLES: Record<StudioToolId, string> = {
  palette: 'Palette Composer',
  gradient: 'Gradient Lab',
  scale: 'Scale Lab',
  contrast: 'Contrast + Mix',
};

export default function App() {
  const {
    studio,
    setStudio,
    settings,
    setSettings,
    customPresets,
    presetRegistry,
    notify,
    setActiveTool,
    handleThemeToggle,
    handleCycleAccent,
    handleCopy,
    handleTestInContrast,
    handleAddToGradient,
    handleImportPreset,
    handleRemovePreset,
  } = useStudioSession();

  return (
    <TooltipProvider delay={120}>
      <div className="studio-shell">
        <a className="studio-skip-link" href="#studio-workspace">
          Skip to workspace
        </a>

        <header className="studio-global-header">
          <div className="studio-brand-block">
            <BrandLogo paletteId={settings.accentPalette} onCycle={handleCycleAccent} />
            <div>
              <h1>Color Studio</h1>
              <span>Local color workbench</span>
            </div>
          </div>

          <div className="studio-global-actions">
            <span className="studio-current-tool">
              <IconSparkles aria-hidden="true" />
              {TOOL_TITLES[studio.activeTool]}
            </span>
            <ThemeToggle theme={settings.theme} onToggle={handleThemeToggle} />
          </div>
        </header>

        <div className="studio-body">
          <StudioNavigation activeTool={studio.activeTool} onChange={setActiveTool} />

          <main id="studio-workspace" className="studio-workspace" tabIndex={-1}>
            <Suspense
              fallback={
                <div className="studio-tool-loading" role="status">
                  Loading {TOOL_TITLES[studio.activeTool]}…
                </div>
              }
            >
              {studio.activeTool === 'palette' && (
                <PaletteComposer
                  state={studio.palette}
                  onChange={(palette) => setStudio((previous) => ({ ...previous, palette }))}
                  onCopy={(text, label) => void handleCopy(text, label)}
                  onTestInContrast={handleTestInContrast}
                  onAddToGradient={handleAddToGradient}
                  onNotify={notify}
                />
              )}
              {studio.activeTool === 'gradient' && (
                <GradientEditor
                  state={studio.gradient}
                  onChange={(gradient) => setStudio((previous) => ({ ...previous, gradient }))}
                  onCopy={(text, label) => void handleCopy(text, label)}
                  onNotify={notify}
                />
              )}
              {studio.activeTool === 'scale' && (
                <ScaleWorkspace
                  settings={settings}
                  setSettings={setSettings}
                  presetRegistry={presetRegistry}
                  customPresetIds={Object.keys(customPresets)}
                  onImportPreset={handleImportPreset}
                  onRemovePreset={handleRemovePreset}
                  onNotify={notify}
                  onTestInContrast={handleTestInContrast}
                />
              )}
              {studio.activeTool === 'contrast' && (
                <ContrastTool
                  contrast={studio.contrast}
                  mixer={studio.mixer}
                  onContrastChange={(contrast) =>
                    setStudio((previous) => ({ ...previous, contrast }))
                  }
                  onMixerChange={(mixer) => setStudio((previous) => ({ ...previous, mixer }))}
                  onCopy={(text, label) => void handleCopy(text, label)}
                />
              )}
            </Suspense>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
