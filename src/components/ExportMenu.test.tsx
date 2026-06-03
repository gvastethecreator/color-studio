import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import * as clipboard from '@/lib/clipboard';
import * as file from '@/lib/file';
import ExportMenu from '@/components/ExportMenu';
import { generatePalettes } from '@/lib/color';
import { createDefaultSettings } from '@/types/palette';

describe('ExportMenu', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('copies CSS variables and emits feedback', async () => {
    const palettes = generatePalettes(createDefaultSettings()).slice(0, 1);
    const onNotify = vi.fn();

    vi.spyOn(clipboard, 'copyTextToClipboard').mockResolvedValue(true);

    render(<ExportMenu palettes={palettes} colorFormat="oklch" onNotify={onNotify} />);

    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /copy css variables/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('menuitem', { name: /copy css variables/i }));

    await waitFor(() => {
      expect(clipboard.copyTextToClipboard).toHaveBeenCalled();
      expect(onNotify).toHaveBeenCalledWith('CSS variables copied to clipboard.');
    });
  });

  it('copies Tailwind tokens when selecting that option', async () => {
    const palettes = generatePalettes(createDefaultSettings()).slice(0, 1);
    const onNotify = vi.fn();

    vi.spyOn(clipboard, 'copyTextToClipboard').mockResolvedValue(true);

    render(<ExportMenu palettes={palettes} colorFormat="oklch" onNotify={onNotify} />);

    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /copy tailwind 4/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('menuitem', { name: /copy tailwind 4/i }));

    await waitFor(() => {
      expect(onNotify).toHaveBeenCalledWith('Tailwind 4 theme tokens copied to clipboard.');
    });
  });

  it('emits an error message when clipboard copy fails', async () => {
    const palettes = generatePalettes(createDefaultSettings()).slice(0, 1);
    const onNotify = vi.fn();

    vi.spyOn(clipboard, 'copyTextToClipboard').mockResolvedValue(false);

    render(<ExportMenu palettes={palettes} colorFormat="oklch" onNotify={onNotify} />);

    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /copy json tokens/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('menuitem', { name: /copy json tokens/i }));

    await waitFor(() => {
      expect(onNotify).toHaveBeenCalledWith('Clipboard API is not available in this environment.');
    });
  });

  it('downloads token files directly', async () => {
    const palettes = generatePalettes(createDefaultSettings()).slice(0, 1);
    const onNotify = vi.fn();

    vi.spyOn(file, 'downloadTextFile').mockReturnValue(true);

    render(<ExportMenu palettes={palettes} colorFormat="oklch" onNotify={onNotify} />);

    fireEvent.click(screen.getByRole('button', { name: /export/i }));
    await waitFor(() => {
      expect(screen.getByRole('menuitem', { name: /download json tokens/i })).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole('menuitem', { name: /download json tokens/i }));

    await waitFor(() => {
      expect(file.downloadTextFile).toHaveBeenCalled();
      expect(onNotify).toHaveBeenCalledWith('JSON token export downloaded.');
    });
  });
});
