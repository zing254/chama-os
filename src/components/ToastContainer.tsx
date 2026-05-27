import { useToast } from '../data/toast-context';
import { useI18n } from '../data/i18n-context';
import { cn } from '../utils/cn';

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();
  const { t } = useI18n();

  const typeStyles = {
    success: 'bg-green-600 border-green-700',
    error: 'bg-red-600 border-red-700',
    warning: 'bg-yellow-500 border-yellow-600',
    info: 'bg-blue-600 border-blue-700',
    sound: 'bg-purple-600 border-purple-700',
  };

  const typeIcons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    sound: '🔔',
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-start gap-3 p-4 rounded-xl shadow-lg border-r-4 animate-slide-up',
            typeStyles[toast.type],
            'text-white'
          )}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <span className="text-lg font-bold shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-white/20">
            {typeIcons[toast.type]}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm">{toast.title}</p>
            {toast.message && (
              <p className="text-xs mt-1 opacity-90">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="shrink-0 w-6 h-6 flex items-center justify-center rounded hover:bg-white/20 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}