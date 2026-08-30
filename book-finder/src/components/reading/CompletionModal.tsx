import React, { useState } from 'react';
import { Star, Trophy, Sparkles, CheckCircle2, RotateCcw, X, ArrowLeft } from 'lucide-react';
import { Book } from '../../types/book';

interface CompletionModalProps {
  book: Book;
  onClose: () => void;
  onSubmitReview: (review: { rating: number; reviewText: string }) => void;
  onReadAgain: () => void;
  darkMode?: boolean;
}

export const CompletionModal: React.FC<CompletionModalProps> = ({
  book,
  onClose,
  onSubmitReview,
  onReadAgain,
  darkMode = false,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      onSubmitReview({ rating, reviewText });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div
        className={`relative w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all ${
          darkMode
            ? 'bg-[#0f172a] border-gray-700 text-gray-100'
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close celebration modal"
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Celebration Header */}
        <div className="text-center space-y-3 mb-6">
          <div className="inline-flex p-4 rounded-3xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white shadow-xl shadow-yellow-500/30 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>100% Reading Complete</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              🎉 Congratulations!
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              You completed the full Reading Guide for{' '}
              <span className="font-bold text-gray-800 dark:text-gray-200">
                "{book.title}"
              </span>
            </p>
          </div>
        </div>

        {/* Review Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Rating */}
          <div className="space-y-2 text-center">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
              Rate Your Reading Experience
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1.5 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-7 h-7 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Review Text Area */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Share Your Thoughts (Optional)
            </label>
            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="What were your biggest takeaways from this book?"
              className="w-full px-4 py-3 rounded-2xl text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : 'Save to Completed'}</span>
            </button>

            <button
              type="button"
              onClick={onReadAgain}
              className="w-full sm:w-auto py-3 px-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Read Again</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-3 px-3 rounded-2xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xs font-medium transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
