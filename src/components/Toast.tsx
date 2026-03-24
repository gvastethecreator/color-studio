import { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export default function Toast({ message, onClose }: ToastProps) {
  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timer = window.setTimeout(onClose, 2200);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  if (!message) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed right-4 bottom-4 z-50 max-w-sm"
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto flex items-start gap-3 rounded-xl border border-emerald-400/30 bg-[#101814] px-4 py-3 text-sm text-emerald-50 shadow-2xl shadow-black/40 backdrop-blur-md">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        <p className="flex-1 leading-relaxed">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-emerald-200/70 transition-colors hover:text-white"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
