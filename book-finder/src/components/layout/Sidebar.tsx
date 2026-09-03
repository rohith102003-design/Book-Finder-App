import React from 'react';
import {
  Search,
  Sparkles,
  Activity,
  Bookmark,
  Star,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBookshelf } from '../../context/BookshelfContext';
import { useReadingProgress } from '../../context/ReadingProgressContext';
import { AppView } from '../Navbar';

interface SidebarProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  favoritesCount?: number;
  darkMode?: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onViewChange,
  favoritesCount = 0,
  darkMode = false,
  isMobileOpen = false,
  onMobileClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { stats } = useBookshelf();
  const { activeSessions, completedBooks } = useReadingProgress();

  // Badges strictly scoped to authenticated state
  const activeReadingCount = isAuthenticated ? Object.keys(activeSessions).length : 0;
  const completedCount = isAuthenticated ? completedBooks.length : 0;
  const favCount = isAuthenticated ? favoritesCount : 0;
  const shelfCount = isAuthenticated && stats.total > 0 ? stats.total : 0;

  const handleNavClick = (view: AppView) => {
    if (view !== 'discover' && !isAuthenticated) {
      openAuthModal('login');
      return;
    }

    onViewChange(view);
    // Auto-collapse sidebar on selection on mobile
    if (onMobileClose) {
      onMobileClose();
    }
  };

  const navSections = [
    {
      title: 'DISCOVER',
      items: [
        {
          id: 'discover' as AppView,
          label: 'Discover',
          subtitle: 'Explore catalog & genres',
          icon: Search,
          badge: null,
        },
        {
          id: 'recommendations' as AppView,
          label: 'Recommendations',
          subtitle: 'Personalized for you',
          icon: Sparkles,
          badge: null,
        },
        {
          id: 'feed' as AppView,
          label: 'Social Feed',
          subtitle: 'Community activity',
          icon: Activity,
          badge: null,
        },
      ],
    },
    {
      title: 'LIBRARY',
      items: [
        {
          id: 'favorites' as AppView,
          label: 'Favorites',
          subtitle: 'Your saved books',
          icon: Star,
          badge: favCount > 0 ? favCount : null,
          badgeColor: 'bg-yellow-400 text-gray-950',
        },
        {
          id: 'bookshelf' as AppView,
          label: 'My Bookshelf',
          subtitle: 'Your personal library',
          icon: Bookmark,
          badge: shelfCount > 0 ? shelfCount : null,
          badgeColor: 'bg-indigo-600 text-white',
        },
      ],
    },
    {
      title: 'READING',
      items: [
        {
          id: 'currently-reading' as AppView,
          label: 'Currently Reading',
          subtitle: 'In-progress lessons',
          icon: BookOpen,
          badge: activeReadingCount > 0 ? activeReadingCount : null,
          badgeColor: 'bg-blue-600 text-white',
        },
        {
          id: 'completed' as AppView,
          label: 'Completed',
          subtitle: 'Reading achievements',
          icon: CheckCircle2,
          badge: completedCount > 0 ? completedCount : null,
          badgeColor: 'bg-emerald-600 text-white',
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay (z-40) */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity cursor-pointer"
        />
      )}

      {/* Sidebar Container (z-50 on mobile, z-30 on desktop) */}
      <aside
        className={`fixed top-0 md:top-16 left-0 z-50 md:z-30 h-full md:h-[calc(100vh-4rem)] flex flex-col justify-between transition-all duration-300 ease-in-out border-r ${
          darkMode
            ? 'bg-[#0f172a] border-gray-800 text-gray-100'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl md:shadow-none'
        } ${
          isMobileOpen
            ? 'translate-x-0 w-72 max-w-[85vw]'
            : 'max-md:-translate-x-full ' + (isCollapsed ? 'w-20' : 'w-64')
        }`}
      >
        {/* Mobile Header with Explicit Close Button */}
        <div className="flex md:hidden items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 font-black text-sm bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            <BookOpen className="w-5 h-5 text-indigo-500" />
            <span>BiblioTrack Menu</span>
          </div>
          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close mobile menu"
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex flex-col flex-grow overflow-y-auto overflow-x-hidden p-3 space-y-6">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              {/* Group Header */}
              {!isCollapsed ? (
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                  {section.title}
                </div>
              ) : (
                <div className="text-center text-[10px] font-bold text-gray-400 dark:text-gray-500">
                  • • •
                </div>
              )}

              {/* Navigation Items in Group */}
              <nav className="space-y-1.5" aria-label={section.title}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  return (
                    <div key={item.id} className="relative group">
                      <button
                        type="button"
                        onClick={() => handleNavClick(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/25'
                            : darkMode
                            ? 'text-gray-400 hover:text-white hover:bg-gray-800/80'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        } ${isCollapsed ? 'justify-center px-0 py-3' : ''}`}
                      >
                        {/* Icon */}
                        <Icon
                          className={`w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                            isActive
                              ? 'text-white'
                              : item.id === 'favorites' && favCount > 0
                              ? 'text-yellow-500'
                              : item.id === 'currently-reading' && activeReadingCount > 0
                              ? 'text-blue-500'
                              : item.id === 'completed' && completedCount > 0
                              ? 'text-emerald-500'
                              : 'text-gray-400 dark:text-gray-500'
                          }`}
                        />

                        {/* Text Details (When Expanded) */}
                        {!isCollapsed && (
                          <div className="flex flex-col items-start text-left flex-grow overflow-hidden">
                            <span className="leading-none text-sm">{item.label}</span>
                            <span
                              className={`text-[10px] font-normal mt-1 truncate ${
                                isActive
                                  ? 'text-white/80'
                                  : 'text-gray-400 dark:text-gray-500'
                              }`}
                            >
                              {item.subtitle}
                            </span>
                          </div>
                        )}

                        {/* Badge Indicator */}
                        {item.badge !== null && (
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors ${
                              isActive
                                ? 'bg-white text-indigo-600'
                                : item.badgeColor || 'bg-indigo-500/10 text-indigo-500'
                            } ${isCollapsed ? 'absolute top-1 right-2 px-1.5 py-0.2 text-[9px]' : ''}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>

                      {/* Floating Tooltip / Popover when Collapsed */}
                      {isCollapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white dark:bg-gray-800 border border-gray-700 rounded-xl shadow-xl whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 z-50 transform translate-x-1 group-hover:translate-x-0">
                          <div className="font-bold text-xs">{item.label}</div>
                          <div className="text-[10px] text-gray-300 dark:text-gray-400">{item.subtitle}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Section: Status & Manual Collapse/Expand Toggle Button */}
        <div className="p-3 border-t border-slate-100 dark:border-gray-800/80 space-y-2">
          {/* Status Indicator */}
          {!isCollapsed && (
            <div className="px-3 py-1 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-[11px]">OpenLibrary Live</span>
              </div>
              <span className="text-[10px] font-mono">v0.1.0</span>
            </div>
          )}

          {/* Manual Toggle Button (< / >) */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar (>)' : 'Collapse Sidebar (<)'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`w-full flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer ${
              !isCollapsed ? 'justify-between px-3' : ''
            }`}
          >
            {!isCollapsed && (
              <span className="text-xs font-semibold">Collapse</span>
            )}
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-indigo-500" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
