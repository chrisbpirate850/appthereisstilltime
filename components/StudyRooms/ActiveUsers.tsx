'use client';

import { useState, useEffect } from 'react';
import { RoomPresence } from '@/types';
import { subscribeToRoomPresence } from '@/lib/firebase/studyRooms';

interface ActiveUsersProps {
  roomId: string;
  currentUserId: string;
}

export function ActiveUsers({ roomId, currentUserId }: ActiveUsersProps) {
  const [users, setUsers] = useState<RoomPresence[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!roomId) {
      setUsers([]);
      return;
    }

    const unsubscribe = subscribeToRoomPresence(roomId, (activeUsers) => {
      setUsers(activeUsers);
    });

    return () => unsubscribe();
  }, [roomId]);

  if (!roomId || users.length === 0) {
    return null;
  }

  const displayedUsers = isExpanded ? users : users.slice(0, 5);
  const hasMore = users.length > 5;

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-light text-white flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          Active Studiers ({users.length})
        </h3>

        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-twilight-400 hover:text-white transition-smooth"
          >
            {isExpanded ? 'Show Less' : 'Show All'}
          </button>
        )}
      </div>

      <div className="space-y-2">
        {displayedUsers.map((user) => {
          const isCurrentUser = user.userId === currentUserId;
          const minutesAgo = Math.floor(
            (Date.now() - user.lastActiveAt.toMillis()) / (1000 * 60)
          );
          const isActive = minutesAgo < 2; // Active if heartbeat within last 2 minutes

          return (
            <div
              key={user.userId}
              className={`glass rounded-lg p-3 flex items-center justify-between ${
                isCurrentUser ? 'ring-1 ring-twilight-400' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Status Indicator */}
                <div
                  className={`w-2 h-2 rounded-full ${
                    isActive ? 'bg-green-500 animate-pulse' : 'bg-twilight-600'
                  }`}
                ></div>

                {/* Username */}
                <div>
                  <div className="text-sm text-white">
                    {user.username}
                    {isCurrentUser && (
                      <span className="text-xs text-twilight-400 ml-2">(You)</span>
                    )}
                  </div>
                  <div className="text-xs text-twilight-500">
                    {user.totalHoursAtJoin}h total
                  </div>
                </div>
              </div>

              {/* Session Indicator */}
              {user.sessionId && (
                <div className="text-xs text-green-400 flex items-center gap-1">
                  <svg
                    className="w-3 h-3 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  In session
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {users.length === 0 && (
        <div className="text-center py-8 text-twilight-500">
          <p className="text-sm">No one else is studying right now.</p>
          <p className="text-xs mt-1">Be the first!</p>
        </div>
      )}
    </div>
  );
}
