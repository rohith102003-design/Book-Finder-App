import React from 'react';

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-6xl px-4 mt-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700/60 animate-pulse"
        >
          {/* Shimmer Image Box */}
          <div className="w-full h-64 bg-gray-200 dark:bg-gray-700" />

          {/* Shimmer Content */}
          <div className="p-4 flex flex-col justify-between flex-grow space-y-3">
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-md w-4/5" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-3/5" />
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-md w-1/4" />
              <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
