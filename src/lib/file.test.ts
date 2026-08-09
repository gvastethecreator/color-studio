import { downloadTextFile } from '@/lib/file';
import { vi } from 'vite-plus/test';

describe('downloadTextFile', () => {
  it('creates a downloadable object url when browser APIs exist', () => {
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    expect(downloadTextFile('hello', 'tokens.txt')).toBe(true);
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

    clickSpy.mockRestore();
  });
});
