import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({ message, onRetry }) => {
  return (
    <div className="w-full max-w-2xl px-4 mt-6">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-500" />
          <div className="text-sm font-medium">{message}</div>
        </div>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );
};
