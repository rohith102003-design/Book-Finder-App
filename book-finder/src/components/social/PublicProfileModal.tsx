import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  UserCheck,
  UserPlus,
  Award,
  CheckCircle2,
  Users,
  User,
  ArrowLeft,
  Lock,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { socialService } from '../../services/socialService';
import { useAuth } from '../../context/AuthContext';
import { UserFollow } from '../../types/social';

interface PublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  avatarUrl?: string | null;
  onSelectUser?: (user: { id: string; username: string }) => void;
  onSelectBook?: (workId: string) => void;
  darkMode?: boolean;
}

const FOLLOWED_STORAGE_KEY = 'biblio_followed_readers';

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  isOpen,
  onClose,
  userId,
  username,
  avatarUrl = null,
  onSelectUser,
  darkMode = false,
}) => {
  const { user: currentUser, isAuthenticated, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'followers' | 'following'>('overview');
  const [isFollowing, setIsFollowing] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(FOLLOWED_STORAGE_KEY);
      if (saved) {
        const map = JSON.parse(saved);
        return !!map[userId];
      }
    } catch {}
    return false;
  });

  const [followersCount, setFollowersCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [followersList, setFollowersList] = useState<UserFollow[]>([]);
  const [followingList, setFollowingList] = useState<UserFollow[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [isLoadingList, setIsLoadingList] = useState<boolean>(false);
  const [isTogglingFollow, setIsTogglingFollow] = useState<boolean>(false);

  const isOwnProfile = currentUser?.id === userId || currentUser?.username === username;

  const fetchProfileStats = useCallback(async () => {
    if (!userId) return;
    try {
      setIsLoadingStats(true);
      const stats = await socialService.getFollowStats(userId);
      if (stats) {
        setFollowersCount(stats.followers_count ?? 0);
        setFollowingCount(stats.following_count ?? 0);
        if (stats.is_following !== undefined) {
          setIsFollowing(stats.is_following);
        }
      }
    } catch {
      // Keep count at 0 on error
    } finally {
      setIsLoadingStats(false);
    }
  }, [userId]);

  const fetchFollowers = useCallback(async () => {
    if (!userId || !isOwnProfile) return;
    try {
      setIsLoadingList(true);
      const list = await socialService.getFollowers(userId);
      setFollowersList(list);
    } catch {
      setFollowersList([]);
    } finally {
      setIsLoadingList(false);
    }
  }, [userId, isOwnProfile]);

  const fetchFollowing = useCallback(async () => {
    if (!userId || !isOwnProfile) return;
    try {
      setIsLoadingList(true);
      const list = await socialService.getFollowing(userId);
      setFollowingList(list);
    } catch {
      setFollowingList([]);
    } finally {
      setIsLoadingList(false);
    }
  }, [userId, isOwnProfile]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
      fetchProfileStats();
    }
  }, [isOpen, userId, fetchProfileStats]);

  useEffect(() => {
    if (activeTab === 'followers') {
      fetchFollowers();
    } else if (activeTab === 'following') {
      fetchFollowing();
    }
  }, [activeTab, fetchFollowers, fetchFollowing]);

  if (!isOpen) return null;

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      openAuthModal('login');
      return;
    }
    if (isOwnProfile || isTogglingFollow) return;

    try {
      setIsTogglingFollow(true);
      const nextState = !isFollowing;
      setIsFollowing(nextState);
      setFollowersCount((prev) => (nextState ? prev + 1 : Math.max(0, prev - 1)));

      // Sync to localStorage
      try {
        const saved = localStorage.getItem(FOLLOWED_STORAGE_KEY);
        const map = saved ? JSON.parse(saved) : {};
        map[userId] = nextState;
        localStorage.setItem(FOLLOWED_STORAGE_KEY, JSON.stringify(map));
      } catch {}

      if (isFollowing) {
        await socialService.unfollowUser(userId).catch(() => {});
      } else {
        await socialService.followUser(userId).catch(() => {});
      }
    } finally {
      setIsTogglingFollow(false);
    }
  };

  const handleUserClick = (targetUserId: string, targetUsername: string) => {
    if (onSelectUser) {
      onSelectUser({ id: targetUserId, username: targetUsername });
    }
  };

  const displayInitials = username ? username.slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
          darkMode
            ? 'bg-gray-900 border-gray-800 text-gray-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* 1. Header Section (Banner + Navigation Controls) */}
        <div className="relative flex-shrink-0">
          {/* Hero Banner Background */}
          <div className="h-28 sm:h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative p-4 flex justify-between items-start">
            {activeTab !== 'overview' ? (
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/60 text-white text-xs font-semibold transition-colors cursor-pointer z-20 backdrop-blur-sm"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Profile</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close profile"
              className="p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer z-20 backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar and Action Controls Row (Placed outside overflow-hidden scrollable area) */}
          <div className="px-6 relative flex items-end justify-between min-h-[48px]">
            {/* Fully Framed Profile Avatar (Letters or Photo) */}
            <div className="absolute -top-12 left-6 z-10">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 ring-4 ring-white dark:ring-gray-900 shadow-2xl flex items-center justify-center text-white text-3xl font-black overflow-hidden select-none">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={username}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <span className="tracking-tight">{displayInitials}</span>
                )}
              </div>
            </div>

            {/* Right-aligned action buttons (Follow / Unfollow / You indicator) */}
            <div className="ml-auto pt-3 pb-1">
              {!isOwnProfile ? (
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  disabled={isTogglingFollow || isLoadingStats}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md ${
                    isFollowing
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/25'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Follow Reader</span>
                    </>
                  )}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <User className="w-3.5 h-3.5" />
                  <span>Your Profile</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 2. Modal Scrollable Content Body */}
        <div className="px-6 pb-6 pt-3 relative flex-1 overflow-y-auto space-y-4">
          {activeTab === 'overview' ? (
            <>
              {/* User Info & Verified Badge */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold tracking-tight">@{username}</h3>
                  {isOwnProfile ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <User className="w-3 h-3" />
                      <span>You</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified Reader</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Community reader sharing book reviews, lesson completions, and ratings.
                </p>
              </div>

              {/* Follower & Following Metric Cards */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-center">
                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('followers')}
                    className="p-2.5 rounded-xl transition-all hover:bg-indigo-500/10 text-center cursor-pointer group"
                  >
                    <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                      {followersCount}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                      <span>Followers</span>
                      <ExternalLink className="w-3 h-3 text-indigo-500 opacity-60 group-hover:opacity-100" />
                    </span>
                  </button>
                ) : (
                  <div className="p-2.5">
                    <span className="block text-xl font-black text-indigo-600 dark:text-indigo-400">
                      {followersCount}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">
                      Followers
                    </span>
                  </div>
                )}

                {isOwnProfile ? (
                  <button
                    type="button"
                    onClick={() => setActiveTab('following')}
                    className="p-2.5 rounded-xl transition-all hover:bg-purple-500/10 text-center cursor-pointer group"
                  >
                    <span className="block text-xl font-black text-purple-600 dark:text-purple-400 group-hover:scale-105 transition-transform">
                      {followingCount}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center justify-center gap-1 mt-0.5">
                      <span>Following</span>
                      <ExternalLink className="w-3 h-3 text-purple-500 opacity-60 group-hover:opacity-100" />
                    </span>
                  </button>
                ) : (
                  <div className="p-2.5">
                    <span className="block text-xl font-black text-purple-600 dark:text-purple-400">
                      {followingCount}
                    </span>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mt-0.5">
                      Following
                    </span>
                  </div>
                )}
              </div>

              {/* Privacy Guarantee Note */}
              <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs flex items-start gap-2.5">
                <Award className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px]">
                  <span className="font-bold block">Privacy Guaranteed</span>
                  <p className="text-gray-500 dark:text-gray-400">
                    {isOwnProfile
                      ? 'You can view and manage your followers and following list above. Other users cannot view your follower network.'
                      : 'Follower and following lists are private to each user. Only public reviews and completed readings are shared.'}
                  </p>
                </div>
              </div>
            </>
          ) : activeTab === 'followers' ? (
            /* Followers Tab (Private to Account Owner) */
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <h4 className="text-sm font-bold">Your Followers ({followersList.length})</h4>
                </div>
                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-500" /> Only visible to you
                </span>
              </div>

              {isLoadingList ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  <span>Loading followers...</span>
                </div>
              ) : followersList.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <Users className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600" />
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    You don't have any followers yet.
                  </p>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                    Share your book reviews in the social feed to connect with other community readers.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {followersList.map((f) => {
                    const followerId = f.follower_id;
                    const followerUsername = f.follower?.username || 'Reader';

                    return (
                      <div
                        key={f.id}
                        onClick={() => handleUserClick(followerId, followerUsername)}
                        className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-indigo-400 dark:hover:border-indigo-500 bg-gray-50/50 dark:bg-gray-800/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                            {followerUsername.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-xs block group-hover:text-indigo-500 transition-colors">
                              @{followerUsername}
                            </span>
                            <span className="text-[10px] text-gray-400">Community Reader</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors"
                        >
                          View Profile
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Following Tab (Private to Account Owner) */
            <div className="space-y-4 pt-1">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-purple-500" />
                  <h4 className="text-sm font-bold">Readers You Follow ({followingList.length})</h4>
                </div>
                <span className="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-500" /> Only visible to you
                </span>
              </div>

              {isLoadingList ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                  <span>Loading following list...</span>
                </div>
              ) : followingList.length === 0 ? (
                <div className="py-10 text-center space-y-2">
                  <UserPlus className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600" />
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    You are not following anyone yet.
                  </p>
                  <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                    Check out the Social Feed and follow community readers to stay updated with their reviews!
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {followingList.map((f) => {
                    const followingId = f.following_id;
                    const followingUsername = f.following?.username || 'Reader';

                    return (
                      <div
                        key={f.id}
                        onClick={() => handleUserClick(followingId, followingUsername)}
                        className="flex items-center justify-between p-3 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-purple-400 dark:hover:border-purple-500 bg-gray-50/50 dark:bg-gray-800/40 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                            {followingUsername.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-xs block group-hover:text-purple-500 transition-colors">
                              @{followingUsername}
                            </span>
                            <span className="text-[10px] text-gray-400">Community Reader</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 hover:bg-purple-100 transition-colors"
                        >
                          View Profile
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer Close Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
