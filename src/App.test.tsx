import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';
import { STORAGE_KEYS } from '@/lib/storage';

describe('App', () => {
  it('switches between palette and preview tabs', async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(screen.getByText(/generated palettes/i)).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /preview/i }));

    expect(screen.getByText(/overview/i)).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /palette/i }));
    expect(screen.getByText(/generated palettes/i)).toBeInTheDocument();
  });

  it('persists settings across remounts', async () => {
    const user = userEvent.setup();

    const { unmount } = render(<App />);

    await user.click(screen.getByTestId('preset-select-trigger'));
    await waitFor(() => {
      expect(screen.getByRole('option', { name: /neon punk/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('option', { name: /neon punk/i }));

    await waitFor(() => {
      expect(window.localStorage.getItem(STORAGE_KEYS.settings)).toContain('"preset":"neon"');
    });

    unmount();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId('preset-select-trigger')).toHaveTextContent(/neon punk/i);
    });
  });
});
