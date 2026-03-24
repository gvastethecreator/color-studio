import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as clipboard from '@/lib/clipboard';
import { generatePalettes } from '@/lib/color';
import PaletteGrid from '@/components/PaletteGrid';
import { createDefaultSettings } from '@/types/palette';

describe('PaletteGrid', () => {
  it('notifica y copia color al hacer click en un swatch', async () => {
    const palettes = generatePalettes(createDefaultSettings()).slice(0, 1);
    const onSelectFamily = vi.fn();
    const onNotify = vi.fn();

    vi.spyOn(clipboard, 'copyTextToClipboard').mockResolvedValue(true);

    render(
      <PaletteGrid
        palettes={palettes}
        onSelectFamily={onSelectFamily}
        selectedFamilyId={palettes[0]!.id}
        onNotify={onNotify}
      />,
    );

    fireEvent.click(screen.getByText('Flamingo'));
    expect(onSelectFamily).toHaveBeenCalledWith(palettes[0]!.id);

    fireEvent.click(screen.getByText('1'));

    await waitFor(() => {
      expect(clipboard.copyTextToClipboard).toHaveBeenCalled();
      expect(onNotify).toHaveBeenCalledWith('Token copied to clipboard.');
    });
  });
});
