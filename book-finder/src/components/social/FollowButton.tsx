import React, { useEffect, useState } from 'react';
import { UserPlus, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { socialService } from '../../services/socialService';

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
  size?: 'sm' | 'md';
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  targetUserId,
  initialIsFollowing = false,
  onFollowChange,
  size = 'sm',
}) => {
  const { user, isAuthenticated, openAuthModal } = useAuth();
  const [isFollowing, setIsFollowing] = useState<boolean>(initialIsFollowing);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const isSelf = user ? user.id === targetUserId : false;

  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated && !isSelf) {
      socialService
        .getFollowStatus(targetUserId)
        .then((status) => {
          if (isMounted) {
            setIsFollowing(status);
          }
        })
        .catch(() => {});
    }
    return () => {
      isMounted = false;
    };
  }, [targetUserId, isAuthenticated, isSelf]);

  if (isSelf) {
    return null;
  }

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);
      if (isFollowing) {
        await socialService.unfollowUser(targetUserId);
        setIsFollowing(false);
        onFollowChange?.(false);
      } else {
        await socialService.followUser(targetUserId);
        setIsFollowing(true);
        onFollowChange?.(true);
      }
    } catch {
      // Revert or show error
    } finally {
      setIsLoading(false);
    }
  };

  const isSmall = size === 'sm';

  return (
    <button
      type="button"
      onClick={handleToggleFollow}
      disabled={isLoading}
      aria-label={isFollowing ? 'Unfollow' : 'Follow'}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-xl transition-all cursor-pointer ${
        isSmall ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-sm'
      } ${
        isFollowing
          ? 'bg-gray-200 hover:bg-red-50 hover:text-red-600 dark:bg-gray-700 dark:hover:bg-red-900/40 dark:hover:text-red-300 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {isFollowing ? (
        <>
          <UserCheck className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className={isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
          <span>Follow</span>
        </>
      )}
    </button>
  );
};
