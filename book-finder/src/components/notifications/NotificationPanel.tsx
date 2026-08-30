import React from 'react';
import {
  Bell,
  CheckCheck,
  X,
  UserPlus,
  ThumbsUp,
  Info,
  ExternalLink,
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { Notification } from '../../types/notification';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser?: (user: { id: string; username: string }) => void;
  darkMode?: boolean;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  onSelectUser,
  darkMode = false,
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'FOLLOW':
        return <UserPlus className="w-4 h-4 text-indigo-500" />;
      case 'REVIEW_LIKE':
        return <ThumbsUp className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleNotificationClick = (n: Notification) => {
    if (!n.is_read) {
      markAsRead(n.id);
    }

    if (n.related_user_id && onSelectUser) {
      let username = n.related_username;
      if (!username && n.message) {
        const match = n.message.match(/@(\w+)/);
        if (match) username = match[1];
      }
      onSelectUser({
        id: n.related_user_id,
        username: username || 'Reader',
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 sm:p-6 bg-black/40 backdrop-blur-sm">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-top-4 duration-200 ${
          darkMode
            ? 'bg-gray-900 border-gray-800 text-gray-100'
            : 'bg-white border-gray-200 text-gray-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Notifications</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                aria-label="Mark all as read"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Read all</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto p-4 space-y-2 flex-1">
          {isLoading && notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center space-y-2">
              <Bell className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No notifications yet.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const dateStr = new Date(n.created_at).toLocaleDateString(
                undefined,
                {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }
              );

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 group hover:border-indigo-400 dark:hover:border-indigo-500 ${
                    !n.is_read
                      ? darkMode
                        ? 'bg-indigo-950/20 border-indigo-500/30'
                        : 'bg-indigo-50/60 border-indigo-200/80'
                      : darkMode
                      ? 'bg-gray-800/40 border-gray-800/60 opacity-85'
                      : 'bg-white border-gray-100 shadow-sm opacity-85'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 flex-shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
                    {getIcon(n.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <h4 className="font-bold text-xs truncate flex items-center gap-1">
                        <span>{n.title}</span>
                        {n.related_user_id && (
                          <span className="text-[10px] text-indigo-500 font-semibold inline-flex items-center gap-0.5 opacity-80 group-hover:opacity-100">
                            • View Profile <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {dateStr}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-snug">
                      {n.message}
                    </p>
                  </div>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
