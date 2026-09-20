import React from 'react';
import { AlertCircle, X, RefreshCw } from 'lucide-react';

interface DismissibleBannerProps {
  id?: string;
  message: string | null;
  onDismiss: () => void;
  onRetry?: () => void;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

export const DismissibleBanner: React.FC<DismissibleBannerProps> = ({
  id = 'dismissible-banner',
  message,
  onDismiss,
  onRetry,
  variant = 'error',
  className = '',
}) => {
  if (!message) return null;

  const variantStyles = {
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    warning: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    info: 'bg-slate-100 border-slate-200 text-slate-900',
  };

  const iconColors = {
    error: 'text-rose-600',
    warning: 'text-indigo-600',
    info: 'text-slate-600',
  };

  return (
    <div
      id={id}
      className={`flex items-start gap-3 p-4 rounded-xl border ${variantStyles[variant]} shadow-xs transition-all animate-fadeIn ${className}`}
      role="alert"
    >
      <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${iconColors[variant]}`} />
      <div className="flex-1 text-sm font-medium leading-relaxed">
        <p>{message}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <button
            id={`${id}-retry-btn`}
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/80 hover:bg-white text-slate-800 border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
        <button
          id={`${id}-close-btn`}
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="p-1 rounded-lg hover:bg-black/5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
