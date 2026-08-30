import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { BookshelfItem } from '../../types/bookshelf';
import { useBookshelf } from '../../context/BookshelfContext';

interface ProgressModalProps {
  item: BookshelfItem | null;
  isOpen: boolean;
  onClose: () => void;
  darkMode?: boolean;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({
  item,
  isOpen,
  onClose,
  darkMode = false,
}) => {
  const { updateProgress } = useBookshelf();
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync inputs with item props
  useEffect(() => {
    if (item) {
      setCurrentPage(item.current_page || 0);
      setTotalPages(item.total_pages || 0);
      setErrorMessage(null);
    }
  }, [item, isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  // Live percentage calculation
  const calculatedPercentage =
    totalPages > 0
      ? Math.min(100, Math.max(0, Math.round((currentPage / totalPages) * 100)))
      : 0;

  const isInvalidPageRange = totalPages > 0 && currentPage > totalPages;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (currentPage < 0) {
      setErrorMessage('Current page cannot be negative.');
      return;
    }

    if (totalPages < 0) {
      setErrorMessage('Total pages cannot be negative.');
      return;
    }

    if (isInvalidPageRange) {
      setErrorMessage('Current page cannot exceed total pages.');
      return;
    }

    setIsSubmitting(true);

    try {
      await updateProgress(item.id, currentPage, totalPages);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to update reading progress.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="progress-modal-title"
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border ${
            darkMode
              ? 'bg-gray-900 border-gray-800 text-gray-100'
              : 'bg-white border-gray-200 text-gray-900'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200/50 dark:border-gray-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 id="progress-modal-title" className="text-lg font-bold">
                  Update Reading Progress
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 max-w-[260px]">
                  {item.book.title}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {errorMessage && (
              <div
                role="alert"
                className="flex items-center gap-2 p-3 rounded-xl text-xs bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Visual Progress Preview */}
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/70 dark:border-gray-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-gray-600 dark:text-gray-300">Completion</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                  {calculatedPercentage}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${calculatedPercentage}%` }}
                />
              </div>
              {calculatedPercentage === 100 && totalPages > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Will mark book as Completed</span>
                </div>
              )}
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="current-page-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                >
                  Current Page
                </label>
                <input
                  id="current-page-input"
                  type="number"
                  min="0"
                  value={currentPage}
                  onChange={(e) => {
                    setCurrentPage(parseInt(e.target.value, 10) || 0);
                    setErrorMessage(null);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                    isInvalidPageRange
                      ? 'border-red-500 focus:ring-red-500/30'
                      : darkMode
                      ? 'bg-gray-800 border-gray-700 text-white focus:ring-indigo-500/50 focus:border-indigo-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500/30 focus:border-indigo-600'
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="total-pages-input"
                  className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                >
                  Total Pages
                </label>
                <input
                  id="total-pages-input"
                  type="number"
                  min="0"
                  value={totalPages}
                  onChange={(e) => {
                    setTotalPages(parseInt(e.target.value, 10) || 0);
                    setErrorMessage(null);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 transition-all ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white focus:ring-indigo-500/50 focus:border-indigo-500'
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-indigo-500/30 focus:border-indigo-600'
                  }`}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-colors ${
                  darkMode
                    ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  'Save Progress'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
