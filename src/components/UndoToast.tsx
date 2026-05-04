import { useEffect, useState } from 'react';
import { Undo2 } from 'lucide-react';

export interface UndoToastItem {
  id: string;
  message: string;
  onUndo: () => void;
}

interface UndoToastProps {
  toasts: UndoToastItem[];
  onDismiss: (id: string) => void;
}

function Toast({ toast, onDismiss }: { toast: UndoToastItem; onDismiss: () => void }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const step = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev - step;
        if (next <= 0) {
          clearInterval(timer);
          onDismiss();
          return 0;
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [onDismiss]);

  return (
    <div className="bg-neutral-800 text-white rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 min-w-[300px] max-w-md animate-slide-up">
      <span className="text-sm flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => {
          toast.onUndo();
          onDismiss();
        }}
        className="flex items-center gap-1.5 text-sm font-medium text-primary-light hover:text-white transition-colors cursor-pointer flex-shrink-0">
        <Undo2 className="w-3.5 h-3.5" />
        Undo
      </button>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-600 rounded-b-lg overflow-hidden">
        <div
          className="h-full bg-primary transition-all ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function UndoToast({ toasts, onDismiss }: UndoToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col-reverse gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </div>
  );
}
