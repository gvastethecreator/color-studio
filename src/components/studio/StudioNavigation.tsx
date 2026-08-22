import {
  IconColorSwatch,
  IconContrast2,
  IconGradienter,
  IconRulerMeasure,
} from '@tabler/icons-react';
import type { StudioToolId } from '@/types/studio';

const TOOLS: Array<{
  id: StudioToolId;
  label: string;
  description: string;
  icon: typeof IconColorSwatch;
}> = [
  {
    id: 'palette',
    label: 'Palette',
    description: '5–6 color harmonies',
    icon: IconColorSwatch,
  },
  {
    id: 'gradient',
    label: 'Gradient',
    description: 'Multi-stop CSS fields',
    icon: IconGradienter,
  },
  {
    id: 'scale',
    label: 'Scale',
    description: 'OKLCH token systems',
    icon: IconRulerMeasure,
  },
  {
    id: 'contrast',
    label: 'Contrast',
    description: 'WCAG + color mix',
    icon: IconContrast2,
  },
];

interface StudioNavigationProps {
  activeTool: StudioToolId;
  onChange: (tool: StudioToolId) => void;
}

export function StudioNavigation({ activeTool, onChange }: StudioNavigationProps) {
  return (
    <nav className="studio-tool-rail" aria-label="Color tools">
      <p className="studio-rail-label">Tools</p>
      <div className="studio-tool-list">
        {TOOLS.map((tool, index) => {
          const Icon = tool.icon;
          const active = tool.id === activeTool;
          return (
            <button
              key={tool.id}
              type="button"
              className="studio-tool-button"
              data-active={active || undefined}
              aria-current={active ? 'page' : undefined}
              title={`Press ${index + 1}`}
              aria-keyshortcuts={String(index + 1)}
              onClick={() => onChange(tool.id)}
            >
              <span className="studio-tool-icon" aria-hidden="true">
                <Icon />
              </span>
              <span className="studio-tool-copy">
                <strong>{tool.label}</strong>
                <small>{tool.description}</small>
              </span>
            </button>
          );
        })}
      </div>

      <div className="studio-rail-note">
        <span className="studio-status-dot" aria-hidden="true" />
        <span>
          Saved locally
          <small>Private to this browser</small>
        </span>
      </div>
    </nav>
  );
}
