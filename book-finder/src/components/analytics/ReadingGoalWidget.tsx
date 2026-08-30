import React, { useState, useEffect, useCallback } from 'react';
import { Target, Trophy, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ReadingGoal } from '../../types/analytics';
import { analyticsService } from '../../services/analyticsService';

interface ReadingGoalWidgetProps {
  currentYear?: number;
  darkMode?: boolean;
  refreshTrigger?: number;
  onGoalUpdated?: () => void;
}

export const ReadingGoalWidget: React.FC<ReadingGoalWidgetProps> = ({
  currentYear = new Date().getFullYear(),
  darkMode = false,
  refreshTrigger = 0,
  onGoalUpdated,
}) => {
  const [goal, setGoal] = useState<ReadingGoal | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [targetInput, setTargetInput] = useState<number>(20);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchGoal = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getReadingGoal(currentYear);
      setGoal(data);
      if (data) {
        setTargetInput(data.target_books);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load reading goal.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentYear]);

  useEffect(() => {
    fetchGoal();
  }, [fetchGoal, refreshTrigger]);

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetInput < 1) {
      setError('Target books must be at least 1.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      if (goal) {
        const updated = await analyticsService.updateReadingGoal(currentYear, {
          target_books: targetInput,
        });
        setGoal(updated);
      } else {
        const created = await analyticsService.setReadingGoal({
          year: currentYear,
          target_books: targetInput,
        });
        setGoal(created);
      }
      setIsEditing(false);
      if (onGoalUpdated) {
        onGoalUpdated();
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save reading goal.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`p-5 rounded-2xl border transition-all ${
        darkMode
          ? 'bg-gray-800/80 border-gray-700/80 text-gray-100'
          : 'bg-white border-gray-200 text-gray-900 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm sm:text-base tracking-tight leading-tight">
              {currentYear} Reading Challenge
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Set and track your annual reading milestone.
            </p>
          </div>
        </div>

        {goal && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            aria-label="Edit annual goal"
            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-3 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="h-16 rounded-xl bg-gray-100 dark:bg-gray-700 animate-pulse" />
      ) : isEditing || !goal ? (
        /* Edit / Create Goal Inline Form */
        <form onSubmit={handleSaveGoal} className="space-y-3 pt-1">
          <div>
            <label
              htmlFor="target-books-input"
              className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1"
            >
              Target Books for {currentYear}
            </label>
            <input
              id="target-books-input"
              type="number"
              min={1}
              max={1000}
              value={targetInput}
              onChange={(e) => setTargetInput(parseInt(e.target.value, 10) || 1)}
              className="w-full px-3.5 py-2 rounded-xl border text-sm font-semibold bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300 dark:border-gray-700"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSaving ? 'Saving...' : goal ? 'Update Goal' : 'Set Challenge'}
            </button>
            {goal && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setTargetInput(goal.target_books);
                }}
                className="py-2 px-3 rounded-xl text-xs font-semibold border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        /* Goal Progress Presentation */
        <div className="space-y-2.5 pt-1">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
            <span className="flex items-center gap-1.5">
              {goal.is_completed ? (
                <Trophy className="w-4 h-4 text-amber-500 fill-amber-500" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              )}
              <span>
                {goal.completed_books} of {goal.target_books} books completed
              </span>
            </span>
            <span
              className={`font-black ${
                goal.is_completed
                  ? 'text-amber-500 dark:text-amber-400'
                  : 'text-indigo-600 dark:text-indigo-400'
              }`}
            >
              {goal.progress_percentage}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                goal.is_completed
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 shadow-sm shadow-amber-500/50'
                  : 'bg-indigo-600'
              }`}
              style={{ width: `${goal.progress_percentage}%` }}
            />
          </div>

          {goal.is_completed && (
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 text-center pt-0.5">
              🎉 Congratulations! You reached your {currentYear} reading goal!
            </p>
          )}
        </div>
      )}
    </div>
  );
};
