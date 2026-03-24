export const downloadTextFile = (
  content: string,
  filename: string,
  mimeType = 'text/plain;charset=utf-8',
): boolean => {
  if (
    typeof document === 'undefined' ||
    typeof URL === 'undefined' ||
    typeof URL.createObjectURL !== 'function' ||
    typeof URL.revokeObjectURL !== 'function'
  ) {
    return false;
  }

  const anchor = document.createElement('a');

  try {
    const blob = new Blob([content], { type: mimeType });
    const objectUrl = URL.createObjectURL(blob);

    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.style.display = 'none';

    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);

    return true;
  } catch {
    anchor.remove();
    return false;
  }
};
