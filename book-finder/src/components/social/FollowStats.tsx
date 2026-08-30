import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import { FollowStats as IFollowStats } from '../../types/social';
import { socialService } from '../../services/socialService';
import { FollowButton } from './FollowButton';

interface FollowStatsProps {
  userId: string;
  username?: string;
  showButton?: boolean;
  darkMode?: boolean;
}

export const FollowStats: React.FC<FollowStatsProps> = ({
  userId,
  username,
  showButton = true,
  darkMode = false,
}) => {
  const [stats, setStats] = useState<IFollowStats>({
    followers_count: 0,
    following_count: 0,
    is_following: false,
  });
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await socialService.getFollowStats(userId);
      setStats(data);
    } catch {
      // Gracefully handle stats failure
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  return (
    <div
      className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
        darkMode
          ? 'bg-gray-800 border-gray-700 text-gray-100'
          : 'bg-white border-gray-200 text-gray-900 shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
          <Users className="w-5 h-5" />
        </div>
        <div>
          {username && <h4 className="font-bold text-sm leading-tight">@{username}</h4>}
          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            <span>
              <strong className="text-gray-900 dark:text-gray-100 font-bold">
                {stats.followers_count}
              </strong>{' '}
              Followers
            </span>
            <span>
              <strong className="text-gray-900 dark:text-gray-100 font-bold">
                {stats.following_count}
              </strong>{' '}
              Following
            </span>
          </div>
        </div>
      </div>

      {showButton && (
        <FollowButton
          targetUserId={userId}
          initialIsFollowing={stats.is_following}
          onFollowChange={(isFollowing) => {
            setStats((prev) => ({
              ...prev,
              is_following: isFollowing,
              followers_count: isFollowing
                ? prev.followers_count + 1
                : Math.max(0, prev.followers_count - 1),
            }));
          }}
        />
      )}
    </div>
  );
};
