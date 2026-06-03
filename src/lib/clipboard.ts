export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback below
    }
  }

  if (typeof document === 'undefined') {
    return false;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.setAttribute('aria-hidden', 'true');
  textarea.style.position = 'fixed';
  textarea.style.top = '0';
  textarea.style.left = '0';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';

  document.body.append(textarea);

  const previousSelection = document.getSelection();
  const savedRange =
    previousSelection && previousSelection.rangeCount > 0 ? previousSelection.getRangeAt(0) : null;

  textarea.focus({ preventScroll: true });
  textarea.select();

  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
    if (savedRange && previousSelection) {
      previousSelection.removeAllRanges();
      previousSelection.addRange(savedRange);
    }
  }
};
