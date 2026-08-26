import { toastManager } from '@/components/ui/toast';
import type { StudioNotifyOptions } from '@/types/studio';

export const UNDO_TOAST_TIMEOUT_MS = 8000;

export const notify = (message: string, options: StudioNotifyOptions = {}) => {
  const { type = 'success', undo } = options;
  toastManager.add({
    description: message,
    type,
    ...(undo
      ? {
          timeout: UNDO_TOAST_TIMEOUT_MS,
          actionProps: { children: 'Undo', onClick: undo },
        }
      : {}),
  });
};

/** Defer one tick so ToastProvider can subscribe before a mount-time emit. */
export const notifyAfterToastReady = (message: string, options: StudioNotifyOptions = {}) => {
  window.setTimeout(() => notify(message, options), 0);
};
