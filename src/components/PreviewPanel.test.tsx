import { render, screen } from '@testing-library/react';
import PreviewPanel from '@/components/PreviewPanel';
import { generatePalettes } from '@/lib/color';
import { createDefaultSettings } from '@/types/palette';

describe('PreviewPanel', () => {
  it('renders semantic preview content for the active family', () => {
    const family = generatePalettes(createDefaultSettings())[0];

    render(<PreviewPanel activeFamily={family!} />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Traffic Analysis')).toBeInTheDocument();
    expect(screen.getByText('Upgrade Plan')).toBeInTheDocument();
  });
});
