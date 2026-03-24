import { copyTextToClipboard } from '@/lib/clipboard';
import { describe, expect, it, vi } from 'vitest';

describe('copyTextToClipboard', () => {
  const originalClipboard = navigator.clipboard;
  const originalExecCommand = document.execCommand;

  afterEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: originalExecCommand,
    });
  });

  it('uses the native clipboard API when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await expect(copyTextToClipboard('oklch')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('oklch');
  });

  it('falls back to execCommand when the native API rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    const execCommand = vi.fn().mockReturnValue(true);

    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommand,
    });

    await expect(copyTextToClipboard('fallback')).resolves.toBe(true);
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).not.toBeInTheDocument();
  });

  it('returns false when fallback copy also fails', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn().mockImplementation(() => {
        throw new Error('copy failed');
      }),
    });

    await expect(copyTextToClipboard('nope')).resolves.toBe(false);
  });
});
