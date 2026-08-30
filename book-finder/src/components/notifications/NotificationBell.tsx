import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { NotificationPanel } from './NotificationPanel';

interface NotificationBellProps {
  darkMode?: boolean;
  onSelectUser?: (user: { id: string; username: string }) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  darkMode = false,
  onSelectUser,
}) => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { unreadCount } = useNotifications();
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(false);

  const handleClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    setIsPanelOpen((prev) => !prev);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Notifications"
        className={`relative p-2.5 rounded-xl border font-medium text-sm transition-all cursor-pointer ${
          darkMode
            ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border-gray-700'
            : 'bg-white hover:bg-gray-100 text-gray-800 border-gray-300 shadow-sm'
        }`}
      >
        <Bell className="w-4 h-4 text-indigo-500" />
        {isAuthenticated && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 px-1.5 py-0.2 min-w-[18px] text-center rounded-full text-[10px] bg-rose-600 text-white font-extrabold shadow-sm animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSelectUser={onSelectUser}
        darkMode={darkMode}
      />
    </>
  );
};
