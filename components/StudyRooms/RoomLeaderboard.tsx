'use client';

import { useState, useEffect } from 'react';
import { Leaderboard } from '@/types';
import { subscribeToLeaderboard } from '@/lib/firebase/studyRooms';

interface RoomLeaderboardProps {
  roomId: string;
  currentUserId: string;
  showLeaderboard: boolean; // From user privacy settings
}

export function RoomLeaderboard({
  roomId,
  currentUserId,
  showLeaderboard,
}: RoomLeaderboardProps) {
  const [period, setPeriod] = useState<'30d' | 'all-time'>('30d');
  const [leaderboard, setLeaderboard] = useState<Leaderboard | null>(null);

  useEffect(() => {
    if (!roomId || !showLeaderboard) {
      setLeaderboard(null);
      return;
    }

    const unsubscribe = subscribeToLeaderboard(roomId, period, (data) => {
      setLeaderboard(data);
    });

    return () => unsubscribe();
  }, [roomId, period, showLeaderboard]);

  if (!showLeaderboard) {
    return (
      <div className="glass-strong rounded-2xl p-6 text-center">
        <div className="text-4xl mb-3">🔒</div>
        <h3 className="text-lg font-light text-white mb-2">Leaderboard Hidden</h3>
        <p className="text-sm text-twilight-400">
          You've opted out of leaderboards in your privacy settings.
        </p>
      </div>
    );
  }

  if (!roomId) {
    return null;
  }

  const topEntries = leaderboard?.top || [];
  const currentUserRank = topEntries.findIndex((entry) => entry.userId === currentUserId);

  return (
    <div className="glass-strong rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-light text-white flex items-center gap-2">
          <span className="text-xl">🏆</span>
          Leaderboard
        </h3>

        {/* Period Toggle */}
        <div className="glass rounded-lg p-1 flex">
          <button
            onClick={() => setPeriod('30d')}
            className={`px-3 py-1 rounded text-xs transition-smooth ${
              period === '30d'
                ? 'bg-twilight-500 text-white'
                : 'text-twilight-400 hover:text-white'
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setPeriod('all-time')}
            className={`px-3 py-1 rounded text-xs transition-smooth ${
              period === 'all-time'
                ? 'bg-twilight-500 text-white'
                : 'text-twilight-400 hover:text-white'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-2">
        {topEntries.length === 0 ? (
          <div className="text-center py-8 text-twilight-500">
            <p className="text-sm">No leaderboard data yet.</p>
            <p className="text-xs mt-1">Complete sessions to appear!</p>
          </div>
        ) : (
          topEntries.slice(0, 10).map((entry, index) => {
            const isCurrentUser = entry.userId === currentUserId;
            const hours = Math.floor(entry.minutes / 60);
            const minutes = entry.minutes % 60;

            return (
              <div
                key={entry.userId}
                className={`glass rounded-lg p-3 flex items-center justify-between ${
                  isCurrentUser ? 'ring-1 ring-twilight-400 bg-twilight-600/30' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className="w-8 text-center">
                    {entry.rank <= 3 ? (
                      <span className="text-xl">
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                      </span>
                    ) : (
                      <span className="text-twilight-500 text-sm">#{entry.rank}</span>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <div className="text-sm text-white flex items-center gap-2">
                      {entry.username}
                      {isCurrentUser && (
                        <span className="text-xs text-twilight-400">(You)</span>
                      )}
                      {entry.badge && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            entry.badge === 'vip'
                              ? 'bg-gold-500/20 text-gold-400'
                              : entry.badge === 'founder'
                              ? 'bg-purple-500/20 text-purple-400'
                              : 'bg-twilight-500/20 text-twilight-400'
                          }`}
                        >
                          {entry.badge === 'vip'
                            ? '⭐ VIP'
                            : entry.badge === 'founder'
                            ? '👑 Founder'
                            : 'Top 10'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hours */}
                <div className="text-right">
                  <div className="text-sm text-white font-light">
                    {hours > 0 && `${hours}h `}
                    {minutes}m
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Current User Rank (if not in top 10) */}
      {currentUserRank >= 10 && (
        <div className="mt-4 pt-4 border-t border-twilight-700">
          <div className="glass rounded-lg p-3 flex items-center justify-between ring-1 ring-twilight-400">
            <div className="flex items-center gap-3">
              <div className="w-8 text-center">
                <span className="text-twilight-400 text-sm">#{currentUserRank + 1}</span>
              </div>
              <div className="text-sm text-white">
                Your Rank <span className="text-xs text-twilight-400">(You)</span>
              </div>
            </div>
            <div className="text-sm text-white font-light">
              {Math.floor(topEntries[currentUserRank].minutes / 60)}h{' '}
              {topEntries[currentUserRank].minutes % 60}m
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
