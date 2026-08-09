import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { STORAGE_KEYS } from '@/lib/storage';
import { STUDIO_STORAGE_KEY } from '@/lib/studio-storage';

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
    expect(await screen.findByRole('heading', { name: /gradient lab/i })).toBeInTheDocument();
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

  it('preserves existing scale settings and preset workflow', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole('button', { name: /^scale/i }));
    await user.click(await screen.findByTestId('preset-select-trigger', {}, { timeout: 5_000 }));
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
      await screen.findByTestId('preset-select-trigger', {}, { timeout: 5_000 }),
    ).toHaveTextContent(/neon punk/i);
  });

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
});
