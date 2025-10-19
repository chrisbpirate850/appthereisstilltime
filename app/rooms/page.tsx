'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserStats, getUserSubscription } from '@/lib/firebase/firestore';
import { hasStudyRoomsAccess } from '@/lib/subscription/tiers';
import { useRoomPresence } from '@/lib/hooks/useRoomPresence';
import { RoomSelector } from '@/components/StudyRooms/RoomSelector';
import { ActiveUsers } from '@/components/StudyRooms/ActiveUsers';
import { RoomLeaderboard } from '@/components/StudyRooms/RoomLeaderboard';
import { UserStats, UserSubscription } from '@/types';
import { STUDY_ROOMS } from '@/lib/firebase/studyRooms';

export default function StudyRoomsPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(false);

  // Room presence hook
  const {
    currentRoom,
    isInRoom,
    joinStudyRoom,
    leaveStudyRoom,
  } = useRoomPresence({
    userId: currentUser?.uid || '',
    username: currentUser?.displayName || undefined,
    totalHours: stats?.totalHours || 0,
    enabled: hasAccess,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        router.push('/');
        return;
      }

      if (user.isAnonymous) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        const [userSub, userStats] = await Promise.all([
          getUserSubscription(user.uid),
          getUserStats(user.uid),
        ]);

        setSubscription(userSub);
        setStats(userStats);

        const access = hasStudyRoomsAccess(userSub);
        setHasAccess(access);
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleJoinRoom = async (roomId: string) => {
    if (!roomId) {
      // Leave room
      await leaveStudyRoom();
      return;
    }

    try {
      await joinStudyRoom(roomId);
    } catch (error) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-twilight-900 via-twilight-800 to-twilight-900 flex items-center justify-center">
        <div className="glass-strong rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-twilight-400 mx-auto mb-4"></div>
          <p className="text-white">Loading study rooms...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-twilight-900 via-twilight-800 to-twilight-900">
        <div className="container mx-auto px-4 py-8">
          <button
            onClick={() => router.push('/')}
            className="text-twilight-300 hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Timer
          </button>
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass-strong rounded-2xl p-12">
              <div className="text-6xl mb-6">📚</div>
              <h1 className="text-3xl font-light text-white mb-4">Study Rooms</h1>
              <p className="text-lg text-twilight-300 mb-8">
                Join virtual study rooms with other students preparing for the same exams.
              </p>

              <div className="glass rounded-xl p-6 mb-8">
                <div className="text-twilight-400 mb-4">
                  This feature requires a Student subscription or higher.
                </div>
                <ul className="text-left text-sm text-twilight-300 space-y-2 max-w-md mx-auto">
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-twilight-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Join dedicated rooms (MCAT, LSAT, Bar, etc.)
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-twilight-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    See who's studying in real-time
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-twilight-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Compete on optional leaderboards
                  </li>
                  <li className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-twilight-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Stay motivated with peer accountability
                  </li>
                </ul>
              </div>

              <button
                onClick={() => router.push('/pricing')}
                className="bg-twilight-500 text-white px-8 py-3 rounded-lg hover:bg-twilight-400 transition-smooth font-medium"
              >
                Upgrade to Student
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentRoomInfo = currentRoom
    ? STUDY_ROOMS.find((r) => r.id === currentRoom.roomId)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-twilight-900 via-twilight-800 to-twilight-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/')}
          className="text-twilight-300 hover:text-white transition-colors flex items-center gap-2 mb-8"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to Timer
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-light text-white mb-2">Study Rooms</h1>
            <p className="text-twilight-300">
              {isInRoom
                ? `Studying in ${currentRoomInfo?.name} ${currentRoomInfo?.emoji}`
                : 'Join a room to study with others'}
            </p>
          </div>

          <button
            onClick={() => setShowRoomSelector(true)}
            className="bg-twilight-500 text-white px-6 py-3 rounded-lg hover:bg-twilight-400 transition-smooth font-medium"
          >
            {isInRoom ? 'Switch Room' : 'Join Room'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-12">
        {isInRoom && currentRoom ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Active Users */}
            <ActiveUsers roomId={currentRoom.roomId} currentUserId={currentUser.uid} />

            {/* Leaderboard */}
            <RoomLeaderboard
              roomId={currentRoom.roomId}
              currentUserId={currentUser.uid}
              showLeaderboard={subscription?.showOnLeaderboard !== false}
            />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass-strong rounded-2xl p-12">
              <div className="text-6xl mb-6">🚪</div>
              <h2 className="text-2xl font-light text-white mb-4">
                Choose a Study Room
              </h2>
              <p className="text-twilight-300 mb-8">
                Join one of our dedicated study rooms to connect with other students preparing
                for the same exams.
              </p>
              <button
                onClick={() => setShowRoomSelector(true)}
                className="bg-twilight-500 text-white px-8 py-3 rounded-lg hover:bg-twilight-400 transition-smooth font-medium"
              >
                Browse Rooms
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Room Selector Modal */}
      {showRoomSelector && (
        <RoomSelector
          currentRoomId={currentRoom?.roomId}
          onSelectRoom={handleJoinRoom}
          onClose={() => setShowRoomSelector(false)}
        />
      )}
    </div>
  );
}
