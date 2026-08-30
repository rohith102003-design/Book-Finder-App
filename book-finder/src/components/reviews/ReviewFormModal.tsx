import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle } from 'lucide-react';
import { Review, CreateReviewPayload, UpdateReviewPayload } from '../../types/review';
import { StarRating } from './StarRating';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateReviewPayload | UpdateReviewPayload) => Promise<void>;
  workId: string;
  initialReview?: Review | null;
  darkMode?: boolean;
}

export const ReviewFormModal: React.FC<ReviewFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  workId,
  initialReview,
  darkMode = false,
}) => {
  const isEditing = Boolean(initialReview);

  const [rating, setRating] = useState<number>(5);
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [containsSpoilers, setContainsSpoilers] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Hydrate fields on open/edit change
  useEffect(() => {
    if (initialReview) {
      setRating(initialReview.rating);
      setTitle(initialReview.title || '');
      setContent(initialReview.content);
      setContainsSpoilers(initialReview.contains_spoilers);
    } else {
      setRating(5);
      setTitle('');
      setContent('');
      setContainsSpoilers(false);
    }
    setValidationError(null);
  }, [initialReview, isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Frontend Validations
    if (!rating || rating < 1 || rating > 5) {
      setValidationError('Please select a star rating between 1 and 5.');
      return;
    }
    if (content.trim().length < 5) {
      setValidationError('Review content must be at least 5 characters long.');
      return;
    }
    if (content.trim().length > 5000) {
      setValidationError('Review content cannot exceed 5000 characters.');
      return;
    }
    if (title.trim().length > 200) {
      setValidationError('Title cannot exceed 200 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing) {
        await onSubmit({
          rating,
          title: title.trim() || null,
          content: content.trim(),
          contains_spoilers: containsSpoilers,
        } as UpdateReviewPayload);
      } else {
        await onSubmit({
          openlibrary_work_id: workId.replace('/works/', ''),
          rating,
          title: title.trim() || null,
          content: content.trim(),
          contains_spoilers: containsSpoilers,
        } as CreateReviewPayload);
      }
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setValidationError(err.message);
      } else {
        setValidationError('An unexpected error occurred while saving your review.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={`relative w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 z-10 ${
            darkMode
              ? 'bg-gray-900 text-white border border-gray-800'
              : 'bg-white text-gray-900 border border-gray-200'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-5 right-5 p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <h3 className="text-2xl font-extrabold tracking-tight mb-1">
            {isEditing ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
            Share your thoughts and rating with the reader community.
          </p>

          {/* Validation Alert */}
          {validationError && (
            <div className="mb-4 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Overall Rating <span className="text-red-500">*</span>
              </label>
              <StarRating
                rating={rating}
                interactive={true}
                onChange={(val) => setRating(val)}
                size="lg"
              />
            </div>

            {/* Optional Title */}
            <div>
              <label
                htmlFor="review-title"
                className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5"
              >
                Headline / Title (Optional)
              </label>
              <input
                id="review-title"
                type="text"
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Masterpiece of modern sci-fi!"
                className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 dark:border-gray-700"
              />
            </div>

            {/* Content Body */}
            <div>
              <label
                htmlFor="review-content"
                className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5"
              >
                Review Content <span className="text-red-500">*</span>
              </label>
              <textarea
                id="review-content"
                required
                minLength={5}
                maxLength={5000}
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What did you love or dislike about this book? Characters, pacing, themes..."
                className="w-full px-4 py-2.5 rounded-xl border text-sm font-medium bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 dark:border-gray-700 resize-none"
              />
              <p className="text-[11px] text-gray-400 text-right mt-1">
                {content.length}/5000 characters
              </p>
            </div>

            {/* Spoilers Toggle */}
            <div className="flex items-center gap-2.5 pt-1">
              <input
                id="contains-spoilers"
                type="checkbox"
                checked={containsSpoilers}
                onChange={(e) => setContainsSpoilers(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <label
                htmlFor="contains-spoilers"
                className="text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
              >
                This review contains plot spoilers
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Review' : 'Post Review'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
