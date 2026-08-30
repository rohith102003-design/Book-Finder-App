import React from 'react';
import { ArrowDownAZ, ArrowUpAZ, Calendar, RefreshCw, Filter } from 'lucide-react';
import { SortOrder } from '../types/book';

interface FilterPanelProps {
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  totalDisplayed: number;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const FILTER_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'fiction', label: 'Fiction' },
  { id: 'fantasy', label: 'Fantasy' },
  { id: 'scifi', label: 'Sci-Fi' },
  { id: 'mystery', label: 'Mystery' },
  { id: 'romance', label: 'Romance' },
  { id: 'technology', label: 'Technology' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  sortOrder,
  onSortChange,
  totalDisplayed,
  selectedCategory = 'all',
  onSelectCategory,
}) => {
  const cycleSortOrder = () => {
    if (sortOrder === 'none') onSortChange('az');
    else if (sortOrder === 'az') onSortChange('za');
    else if (sortOrder === 'za') onSortChange('year');
    else onSortChange('none');
  };

  const getSortLabel = () => {
    switch (sortOrder) {
      case 'az':
        return { label: 'Title (A → Z)', icon: <ArrowDownAZ className="w-4 h-4 text-indigo-400" /> };
      case 'za':
        return { label: 'Title (Z → A)', icon: <ArrowUpAZ className="w-4 h-4 text-indigo-400" /> };
      case 'year':
        return { label: 'Newest Year', icon: <Calendar className="w-4 h-4 text-indigo-400" /> };
      default:
        return { label: 'Relevance', icon: <RefreshCw className="w-4 h-4 text-gray-400" /> };
    }
  };

  const sortInfo = getSortLabel();
  const activeCategoryLabel = FILTER_CHIPS.find((c) => c.id === selectedCategory)?.label || 'All';

  return (
    <div className="w-full max-w-7xl px-2 space-y-3.5 my-2">
      {/* Top Row: Count & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
          <span>
            Showing <span className="font-bold text-gray-800 dark:text-gray-200">{totalDisplayed}</span>{' '}
            {selectedCategory !== 'all' ? `${activeCategoryLabel} books` : 'books'}
          </span>
          {selectedCategory !== 'all' && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20">
              Filtered: {activeCategoryLabel}
            </span>
          )}
        </div>

        {/* Sort Selector Button */}
        <button
          type="button"
          onClick={cycleSortOrder}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm border cursor-pointer ${
            sortOrder !== 'none'
              ? 'bg-indigo-600/15 text-indigo-400 border-indigo-500/40 shadow-indigo-500/10'
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
        >
          {sortInfo.icon}
          <span>Sort: {sortInfo.label}</span>
        </button>
      </div>

      {/* Category Filter Chips Bar */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 mr-1.5 select-none">
          <Filter className="w-3.5 h-3.5 text-indigo-400" />
          <span>Filter:</span>
        </div>
        {FILTER_CHIPS.map((chip) => {
          const isSelected = selectedCategory === chip.id;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onSelectCategory(chip.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                  : 'bg-white/5 dark:bg-gray-800/80 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
