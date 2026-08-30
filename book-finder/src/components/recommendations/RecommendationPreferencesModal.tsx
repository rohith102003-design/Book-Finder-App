import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  X,
  Trash2,
  Check,
  Plus,
  Compass,
  Users,
  Star,
} from 'lucide-react';
import { RecommendationProfile } from '../../types/recommendation';
import { recommendationService } from '../../services/recommendationService';

interface RecommendationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  darkMode?: boolean;
}

const POPULAR_GENRES = [
  'Science Fiction',
  'Fantasy',
  'Dystopian',
  'Self-Help',
  'Productivity',
  'Programming',
  'Classics',
  'Cyberpunk',
  'Adventure',
  'Philosophy',
  'Technology',
  'Romance',
  'History',
  'Psychology',
];

const POPULAR_AUTHORS = [
  'J.K. Rowling',
  'Frank Herbert',
  'George Orwell',
  'J.R.R. Tolkien',
  'James Clear',
  'Robert C. Martin',
  'Jane Austen',
  'William Gibson',
  'Isaac Asimov',
  'Aldous Huxley',
];

export const RecommendationPreferencesModal: React.FC<
  RecommendationPreferencesModalProps
> = ({ isOpen, onClose, onSaved, darkMode = false }) => {
  const [profile, setProfile] = useState<RecommendationProfile | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [customGenreInput, setCustomGenreInput] = useState<string>('');
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
  const [customAuthorInput, setCustomAuthorInput] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(1);
  const [maxRating, setMaxRating] = useState<number>(5);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setError(null);
      recommendationService
        .getProfile()
        .then((data) => {
          setProfile(data);
          if (data) {
            setSelectedGenres(data.preferred_genres || []);
            setSelectedAuthors(data.preferred_authors || []);
            setMinRating(data.min_rating ?? 1);
            setMaxRating(data.max_rating ?? 5);
          } else {
            setSelectedGenres(['Science Fiction', 'Fantasy']);
            setSelectedAuthors([]);
            setMinRating(1);
            setMaxRating(5);
          }
        })
        .catch(() => {
          setSelectedGenres(['Science Fiction', 'Fantasy']);
        })
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleAddCustomGenre = () => {
    const trimmed = customGenreInput.trim();
    if (trimmed && !selectedGenres.includes(trimmed)) {
      setSelectedGenres((prev) => [...prev, trimmed]);
      setCustomGenreInput('');
    }
  };

  const toggleAuthor = (author: string) => {
    setSelectedAuthors((prev) =>
      prev.includes(author) ? prev.filter((a) => a !== author) : [...prev, author]
    );
  };

  const handleAddCustomAuthor = () => {
    const trimmed = customAuthorInput.trim();
    if (trimmed && !selectedAuthors.includes(trimmed)) {
      setSelectedAuthors((prev) => [...prev, trimmed]);
      setCustomAuthorInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (minRating > maxRating) {
      setError('Minimum rating cannot exceed maximum rating.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        preferred_genres: selectedGenres,
        preferred_authors: selectedAuthors,
        min_rating: minRating,
        max_rating: maxRating,
      };

      if (profile) {
        await recommendationService.updateProfile(payload);
      } else {
        await recommendationService.createProfile(payload);
      }

      onSaved();
      onClose();
    } catch (err: any) {
      // If create failed with duplicate error, retry with update
      try {
        const payload = {
          preferred_genres: selectedGenres,
          preferred_authors: selectedAuthors,
          min_rating: minRating,
          max_rating: maxRating,
        };
        await recommendationService.updateProfile(payload);
        onSaved();
        onClose();
      } catch (retryErr: any) {
        setError(
          retryErr?.response?.data?.error?.message ||
            err?.response?.data?.error?.message ||
            'Failed to save recommendation preferences.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await recommendationService.deleteProfile();
      setProfile(null);
      setSelectedGenres([]);
      setSelectedAuthors([]);
      onSaved();
      onClose();
    } catch {
      setError('Failed to reset recommendation preferences.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl ${
          darkMode
            ? 'bg-gray-900 border-gray-800 text-gray-100'
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-inherit z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl">
                Recommendation Preferences
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Choose favorite topics, authors, and rating criteria for personalized picks
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-400">
            Loading your preference profile...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            {/* 1. Favorite Genres / Topics Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo-500" />
                  <span>Favorite Topics & Genres</span>
                </label>
                <span className="text-[11px] text-indigo-500 font-semibold">
                  {selectedGenres.length} selected
                </span>
              </div>

              {/* Quick Select Chips */}
              <div className="flex flex-wrap gap-2">
                {POPULAR_GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre);
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/20 scale-105'
                          : darkMode
                          ? 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-gray-600'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {isSelected ? `✓ ${genre}` : `+ ${genre}`}
                    </button>
                  );
                })}
              </div>

              {/* Custom Genre Adder */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customGenreInput}
                  onChange={(e) => setCustomGenreInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomGenre();
                    }
                  }}
                  placeholder="Type custom topic (e.g. Space Opera, Stoicism)..."
                  className={`flex-1 px-4 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddCustomGenre}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-gray-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* 2. Favorite Authors Selection */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>Favorite Authors</span>
                </label>
                <span className="text-[11px] text-purple-500 font-semibold">
                  {selectedAuthors.length} selected
                </span>
              </div>

              {/* Quick Select Author Chips */}
              <div className="flex flex-wrap gap-2">
                {POPULAR_AUTHORS.map((author) => {
                  const isSelected = selectedAuthors.includes(author);
                  return (
                    <button
                      key={author}
                      type="button"
                      onClick={() => toggleAuthor(author)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-600/20 scale-105'
                          : darkMode
                          ? 'bg-gray-800/80 text-gray-300 border-gray-700 hover:border-gray-600'
                          : 'bg-gray-100 text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {isSelected ? `✓ ${author}` : `+ ${author}`}
                    </button>
                  );
                })}
              </div>

              {/* Custom Author Adder */}
              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customAuthorInput}
                  onChange={(e) => setCustomAuthorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomAuthor();
                    }
                  }}
                  placeholder="Type author name..."
                  className={`flex-1 px-4 py-2 rounded-xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    darkMode
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={handleAddCustomAuthor}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-purple-600 dark:text-purple-400 border border-gray-200 dark:border-gray-700 flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* 3. Rating Threshold Filters */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-4">
              <div className="flex items-center gap-2 text-amber-500 text-xs font-bold uppercase tracking-wider">
                <Star className="w-4 h-4 fill-current" />
                <span>Rating Filter Boundaries</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Minimum Rating</span>
                    <span className="text-amber-500">{minRating} ★</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full cursor-pointer accent-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Maximum Rating</span>
                    <span className="text-amber-500">{maxRating} ★</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={maxRating}
                    onChange={(e) => setMaxRating(Number(e.target.value))}
                    className="w-full cursor-pointer accent-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3">
              {profile ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Reset Profile</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{profile ? 'Save Preferences' : 'Set Preferences'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
