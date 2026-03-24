import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as clipboard from '@/lib/clipboard';
import { generatePalettes } from '@/lib/color';
import PaletteGrid from '@/components/PaletteGrid';
import { createDefaultSettings } from '@/types/palette';

describe('PaletteGrid', () => {
  it('notifica y copia color al hacer click en un swatch', async () => {
    const palettes = generatePalettes(createDefaultSettings()).slice(0, 2);
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

    fireEvent.click(screen.getByRole('button', { name: /select flamingo family/i }));
    expect(onSelectFamily).toHaveBeenCalledWith(palettes[0]!.id);

    fireEvent.click(screen.getByRole('button', { name: /copy flamingo step 1 token/i }));

    await waitFor(() => {
      expect(clipboard.copyTextToClipboard).toHaveBeenCalled();
      expect(onNotify).toHaveBeenCalledWith('Token copied to clipboard.');
    });
  });

  it('permite navegación por teclado entre swatches y familias', async () => {
    const palettes = generatePalettes(createDefaultSettings()).slice(0, 2);
    const onSelectFamily = vi.fn();
    const onNotify = vi.fn();

    render(
      <PaletteGrid
        palettes={palettes}
        onSelectFamily={onSelectFamily}
        selectedFamilyId={palettes[0]!.id}
        onNotify={onNotify}
      />,
    );

    const firstSwatch = screen.getByRole('button', {
      name: /copy flamingo step 1 token/i,
    });

    firstSwatch.focus();
    fireEvent.keyDown(firstSwatch, { key: 'ArrowRight' });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copy flamingo step 2 token/i })).toHaveFocus();
    });

    fireEvent.keyDown(screen.getByRole('button', { name: /copy flamingo step 2 token/i }), {
      key: 'ArrowDown',
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copy pink step 2 token/i })).toHaveFocus();
    });
  });
});
