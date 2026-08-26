import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import * as clipboard from '@/lib/clipboard';
import { STORAGE_KEYS } from '@/lib/storage';
import { STUDIO_STORAGE_KEY } from '@/lib/studio-storage';
import { ToastProvider } from '@/components/ui/toast';

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('opens on a functional five-color palette composer', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /palette composer/i })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /select palette color/i })).toHaveLength(5);
    expect(screen.getByRole('button', { name: /5 colors/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('switches tools and exercises gradient stop limits', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^gradient/i }));
    expect(
      await screen.findByRole('heading', { name: /gradient lab/i }, { timeout: 5_000 }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /select stop/i })).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: /^add stop$/i }));
    expect(screen.getAllByRole('button', { name: /select stop/i })).toHaveLength(4);
  });

  it('persists the palette recipe across remounts', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.selectOptions(screen.getByLabelText(/harmony/i), 'triadic');
    await user.click(screen.getByRole('button', { name: /6 colors/i }));

    await waitFor(() => {
      expect(window.localStorage.getItem(STUDIO_STORAGE_KEY)).toContain('"harmony":"triadic"');
      expect(window.localStorage.getItem(STUDIO_STORAGE_KEY)).toContain('"count":6');
    });

    unmount();
    render(<App />);

    expect(screen.getByLabelText(/harmony/i)).toHaveValue('triadic');
    expect(screen.getAllByRole('button', { name: /select palette color/i })).toHaveLength(6);
  });

  it('explains invalid HEX input and restores the last valid color', async () => {
    const user = userEvent.setup();
    render(<App />);
    const seed = screen.getByLabelText(/^seed color$/i);
    const original = seed.getAttribute('value');

    await user.clear(seed);
    await user.type(seed, '#NOPE');

    expect(seed).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(/3 or 6 digit hex/i);

    await user.tab();
    expect(seed).toHaveValue(original);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // These tests mount the lazily loaded Scale Lab and drive the Base UI select,
  // which can exceed the default 5s budget on a loaded machine.
  it('preserves existing scale settings and preset workflow', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole('button', { name: /^scale/i }));
    await user.click(await screen.findByTestId('preset-select-trigger', {}, { timeout: 10_000 }));
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /neon punk/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: /neon punk/i }));

    await waitFor(() => {
      expect(window.localStorage.getItem(STORAGE_KEYS.settings)).toContain('"preset":"neon"');
    });

    unmount();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /^scale/i }));
    expect(
      await screen.findByTestId('preset-select-trigger', {}, { timeout: 10_000 }),
    ).toHaveTextContent(/neon punk/i);
  }, 15_000);

  it('swaps a contrast pair without losing the exact colors', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^contrast/i }));
    const foreground = await screen.findByLabelText(/^foreground$/i);
    const background = screen.getByLabelText(/^background$/i);
    const foregroundBefore = foreground.getAttribute('value');
    const backgroundBefore = background.getAttribute('value');

    await user.click(screen.getByRole('button', { name: /swap pair/i }));

    expect(foreground).toHaveValue(backgroundBefore);
    expect(background).toHaveValue(foregroundBefore);
  });

  it('copies the selected color as OKLCH', async () => {
    const user = userEvent.setup();
    const copySpy = vi.spyOn(clipboard, 'copyTextToClipboard').mockResolvedValue(true);
    render(<App />);

    await user.click(screen.getByRole('button', { name: /copy oklch/i }));

    await waitFor(() => {
      expect(copySpy).toHaveBeenCalledWith(expect.stringMatching(/^oklch\(/));
    });
  });

  it('sends the selected palette color to the Contrast tool', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /select palette color 1/i }));
    await user.click(screen.getByRole('button', { name: /test in contrast/i }));

    const foreground = await screen.findByLabelText(/^foreground$/i);
    expect(foreground).toHaveValue('#6D5DFC');
  });

  it('restores the previous scale settings through the reset undo action', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <App />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: /^scale/i }));
    const trigger = await screen.findByTestId('preset-select-trigger', {}, { timeout: 10_000 });
    await user.click(trigger);
    await user.click(await screen.findByRole('option', { name: /neon punk/i }));
    await waitFor(() => {
      expect(trigger).toHaveTextContent(/neon punk/i);
    });

    await user.click(screen.getByRole('button', { name: /reset scale settings/i }));
    await waitFor(() => {
      expect(trigger).toHaveTextContent(/prism spectrum/i);
    });

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    await waitFor(() => {
      expect(trigger).toHaveTextContent(/neon punk/i);
    });
  }, 15_000);

  it('restores a removed gradient stop through the undo action', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <App />
      </ToastProvider>,
    );

    await user.click(screen.getByRole('button', { name: /^gradient/i }));
    expect(
      await screen.findByRole('heading', { name: /gradient lab/i }, { timeout: 5_000 }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /select stop/i })).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: /^remove$/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /select stop/i })).toHaveLength(2);
    });

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /select stop/i })).toHaveLength(3);
    });
  });

  it('accepts a typed gradient angle and updates the output CSS', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^gradient/i }));
    expect(
      await screen.findByRole('heading', { name: /gradient lab/i }, { timeout: 5_000 }),
    ).toBeInTheDocument();

    const angleInput = screen.getByLabelText('Angle in degrees');
    await user.clear(angleInput);
    await user.type(angleInput, '45');
    await user.keyboard('{Enter}');

    const angleSlider = screen.getByRole('slider', { name: 'Angle' }) as HTMLInputElement;
    expect(angleSlider.value).toBe('45');
    expect(screen.getAllByText(/linear-gradient/i)[0]?.textContent).toContain('45deg');
  });

  it('accepts a typed mix amount and updates the mixed color', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^contrast/i }));
    const amountInput = await screen.findByLabelText('Mix amount in percent');
    await user.clear(amountInput);
    await user.type(amountInput, '75');
    await user.keyboard('{Enter}');

    const amountSlider = screen.getByRole('slider', { name: 'Mix amount' }) as HTMLInputElement;
    expect(amountSlider.value).toBe('75');
    expect(screen.queryAllByText('#B66CAB')).toHaveLength(0);
  });

  it('switches tools with number shortcuts outside text fields', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard('{3}');
    expect(await screen.findByRole('heading', { name: /scale lab/i })).toBeInTheDocument();

    await user.keyboard('{1}');
    expect(await screen.findByRole('heading', { name: /palette composer/i })).toBeInTheDocument();
  });

  it('ignores number keys typed inside a text field', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText(/^seed color$/i), '12');

    expect(screen.getByRole('heading', { name: /palette composer/i })).toBeInTheDocument();
  });

  it('marks large-text-only contrast ratios as partial instead of failing', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: /^contrast/i }));
    const foreground = await screen.findByLabelText(/^foreground$/i);
    const background = screen.getByLabelText(/^background$/i);

    await user.clear(foreground);
    await user.type(foreground, '#808080');
    await user.clear(background);
    await user.type(background, '#FFFFFF');
    await user.keyboard('{Enter}');

    const pill = screen.getAllByText(/:1$/)[0]!;
    expect(pill).toHaveAttribute('data-partial');
    expect(pill).not.toHaveAttribute('data-pass');
  });

  it('persists the chosen theme across remounts', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole('button', { name: /switch to light theme/i }));
    await waitFor(() => expect(document.documentElement).not.toHaveClass('dark'));

    unmount();
    render(<App />);

    expect(document.documentElement).not.toHaveClass('dark');
    expect(screen.getByRole('button', { name: /switch to dark theme/i })).toBeInTheDocument();
  });

  it('does not show Untitled color study chrome', () => {
    render(<App />);
    expect(screen.queryByText(/untitled color study/i)).not.toBeInTheDocument();
  });

  it('restores the previous palette through Generate undo', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <App />
      </ToastProvider>,
    );

    const selected = screen.getByLabelText(/^color 1$/i);
    await user.clear(selected);
    await user.type(selected, '#FF0000');
    await user.keyboard('{Enter}');
    expect(
      screen.getByRole('button', { name: /select palette color 1: #FF0000/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^generate$/i }));
    expect(
      screen.getByRole('button', { name: /select palette color 1: #6D5DFC/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Undo' }));
    expect(
      screen.getByRole('button', { name: /select palette color 1: #FF0000/i }),
    ).toBeInTheDocument();
  });

  it('keeps the chroma number field in sync with the slider', () => {
    render(<App />);

    const slider = screen.getByRole('slider', { name: 'Chroma' });
    fireEvent.change(slider, { target: { value: '0.2' } });

    expect(slider).toHaveValue('0.2');
    expect(
      screen.getByRole('textbox', { name: 'Chroma' }).getAttribute('value')?.replace(',', '.'),
    ).toBe('0.2');
  });

  it('moves palette selection with arrow keys', async () => {
    const user = userEvent.setup();
    render(<App />);

    screen.getByRole('button', { name: /select palette color 1/i }).focus();
    await user.keyboard('{ArrowRight}');
    expect(screen.getByRole('button', { name: /select palette color 2/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
