import React from 'react';
import {
  BookOpen,
  Sun,
  Moon,
  LogIn,
  LogOut,
  Shield,
  Menu,
  Star,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { NotificationBell } from './notifications/NotificationBell';

export type AppView =
  | 'discover'
  | 'bookshelf'
  | 'feed'
  | 'recommendations'
  | 'favorites'
  | 'currently-reading'
  | 'completed'
  | 'reader';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  favoritesCount: number;
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  onOpenMobileMenu?: () => void;
  onSelectUser?: (user: { id: string; username: string }) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  darkMode,
  onToggleDarkMode,
  favoritesCount,
  activeView,
  onViewChange,
  onOpenMobileMenu,
  onSelectUser,
}) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  return (
    <header
      className={`w-full h-16 sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 shadow-sm backdrop-blur-md transition-colors border-b ${
        darkMode
          ? 'bg-[#0f172a]/95 border-gray-800 text-white'
          : 'bg-white/95 border-slate-200 text-slate-900'
      }`}
    >
      {/* Left: Hamburger (Mobile) + Brand Logo */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          aria-label="Open mobile menu"
          className={`md:hidden p-2 rounded-xl border transition-colors cursor-pointer ${
            darkMode
              ? 'border-gray-700 text-gray-300 hover:bg-gray-800'
              : 'border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Brand Logo & Name */}
        <div
          onClick={() => onViewChange('discover')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent leading-none">
              Book Finder
            </h1>
            <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
              BiblioTrack Reading Hub
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls: Favorites Shortcut, Notifications, Theme, Profile/Auth */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Clickable Saved Favorites Indicator (Strictly authenticated only) */}
        {isAuthenticated && favoritesCount > 0 && (
          <button
            type="button"
            onClick={() => onViewChange('favorites')}
            title="View My Favorites"
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              activeView === 'favorites'
                ? 'bg-yellow-400 text-gray-950 border-yellow-500 shadow-sm shadow-yellow-400/30'
                : 'bg-yellow-400/15 text-yellow-600 dark:text-yellow-400 border-yellow-400/30 hover:bg-yellow-400/25'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${activeView === 'favorites' ? 'fill-current' : ''}`} />
            <span>{favoritesCount} Saved</span>
          </button>
        )}

        {/* Notification Bell */}
        <NotificationBell darkMode={darkMode} onSelectUser={onSelectUser} />

        {/* Theme Toggle Button */}
        <button
          onClick={onToggleDarkMode}
          aria-label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl shadow-sm font-medium text-xs transition-all cursor-pointer ${
            darkMode
              ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200'
          }`}
        >
          {darkMode ? (
            <>
              <Sun className="w-4 h-4 text-yellow-400" />
              <span className="hidden lg:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-indigo-600" />
              <span className="hidden lg:inline">Dark</span>
            </>
          )}
        </button>

        {/* Authentication Controls */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-2">
            {/* User Profile Badge (Clickable to open own profile & manage followers/following) */}
            <button
              type="button"
              onClick={() => onSelectUser?.({ id: user.id, username: user.username })}
              title="View My Profile & Followers"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer hover:border-indigo-400 ${
                darkMode
                  ? 'bg-gray-800/90 hover:bg-gray-800 border-gray-700 text-gray-200'
                  : 'bg-white hover:bg-gray-50 border-slate-200 text-slate-800 shadow-sm'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <span className="max-w-[80px] sm:max-w-[120px] truncate">@{user.username}</span>
              {user.role === 'ADMIN' && (
                <span className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-[10px] font-bold">
                  <Shield className="w-3 h-3" />
                  ADMIN
                </span>
              )}
            </button>

            {/* Logout Button */}
            <button
              onClick={() => {
                logout();
                onViewChange('discover');
              }}
              aria-label="Log Out"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                darkMode
                  ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20'
                  : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
              }`}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          /* Guest Sign In Button */
          <button
            onClick={() => openAuthModal('login')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer hover:scale-105"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
