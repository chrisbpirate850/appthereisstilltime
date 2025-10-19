'use client';

import { useState, useEffect } from 'react';
import { Room } from '@/types';
import { getRooms, subscribeToRoom } from '@/lib/firebase/studyRooms';

interface RoomSelectorProps {
  currentRoomId?: string;
  onSelectRoom: (roomId: string) => void;
  onClose: () => void;
}

export function RoomSelector({ currentRoomId, onSelectRoom, onClose }: RoomSelectorProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRooms() {
      try {
        const allRooms = await getRooms();
        setRooms(allRooms);
      } catch (error) {
        console.error('Error loading rooms:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRooms();
  }, []);

  const handleSelectRoom = (roomId: string) => {
    onSelectRoom(roomId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="glass-strong rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-light text-white">Choose Study Room</h2>
          <button
            onClick={onClose}
            className="text-twilight-400 hover:text-white transition-smooth"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-twilight-400 mx-auto mb-4"></div>
            <p className="text-twilight-300">Loading rooms...</p>
          </div>
        ) : (
          <>
            {/* Room Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {rooms.map((room) => {
                const isCurrent = currentRoomId === room.id;

                return (
                  <button
                    key={room.id}
                    onClick={() => handleSelectRoom(room.id)}
                    className={`
                      glass rounded-xl p-6 text-left transition-smooth
                      ${
                        isCurrent
                          ? 'ring-2 ring-twilight-400 bg-twilight-600/30'
                          : 'hover:bg-twilight-700/30 hover:scale-105'
                      }
                    `}
                  >
                    {/* Room Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">{room.emoji}</span>
                        <div>
                          <h3 className="text-lg font-medium text-white">{room.name}</h3>
                          {isCurrent && (
                            <span className="text-xs text-green-400">Currently in this room</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {room.description && (
                      <p className="text-sm text-twilight-400 mb-3">{room.description}</p>
                    )}

                    {/* Active Users */}
                    <div className="flex items-center gap-2 text-xs text-twilight-300">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      <span>
                        {room.activeCount} {room.activeCount === 1 ? 'person' : 'people'} studying
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Study Alone Option */}
            <button
              onClick={() => {
                onSelectRoom('');
                onClose();
              }}
              className="w-full glass rounded-xl p-4 text-center text-twilight-300 hover:text-white hover:bg-twilight-700/30 transition-smooth"
            >
              <span className="mr-2">🚪</span>
              Study Alone (Leave Room)
            </button>
          </>
        )}
      </div>
    </div>
  );
}
