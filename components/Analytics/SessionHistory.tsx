'use client';

import { useState } from 'react';
import { Session } from '@/types';
import { Timestamp } from 'firebase/firestore';
import { exportSessionsToCSV, downloadCSV } from '@/lib/analytics/aggregations';

interface SessionHistoryProps {
  sessions: Session[];
}

export function SessionHistory({ sessions }: SessionHistoryProps) {
  const [filterDays, setFilterDays] = useState<number>(30);

  // Filter sessions by date range
  const filteredSessions = sessions.filter((session) => {
    const completedAt = (session.completedAt as Timestamp).toDate();
    const daysAgo = Math.floor((Date.now() - completedAt.getTime()) / (1000 * 60 * 60 * 24));
    return daysAgo <= filterDays;
  });

  const handleExportCSV = () => {
    const csv = exportSessionsToCSV(filteredSessions);
    downloadCSV(csv, `focus-sessions-${filterDays}days.csv`);
  };

  return (
    <div className="glass-strong rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-light text-white flex items-center gap-2">
          <span className="text-2xl">📜</span>
          Session History
        </h3>

        <div className="flex items-center gap-2">
          {/* Filter Buttons */}
          <div className="glass rounded-lg p-1 flex">
            <button
              onClick={() => setFilterDays(7)}
              className={`px-3 py-1 rounded text-xs transition-smooth ${
                filterDays === 7
                  ? 'bg-twilight-500 text-white'
                  : 'text-twilight-400 hover:text-white'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setFilterDays(30)}
              className={`px-3 py-1 rounded text-xs transition-smooth ${
                filterDays === 30
                  ? 'bg-twilight-500 text-white'
                  : 'text-twilight-400 hover:text-white'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setFilterDays(90)}
              className={`px-3 py-1 rounded text-xs transition-smooth ${
                filterDays === 90
                  ? 'bg-twilight-500 text-white'
                  : 'text-twilight-400 hover:text-white'
              }`}
            >
              90 Days
            </button>
            <button
              onClick={() => setFilterDays(365)}
              className={`px-3 py-1 rounded text-xs transition-smooth ${
                filterDays === 365
                  ? 'bg-twilight-500 text-white'
                  : 'text-twilight-400 hover:text-white'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="glass rounded-lg px-3 py-1 text-xs text-twilight-300 hover:text-white hover:bg-twilight-600 transition-smooth flex items-center gap-1"
          >
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Session Count */}
      <div className="mb-4 text-sm text-twilight-400">
        Showing {filteredSessions.length} of {sessions.length} total sessions
      </div>

      {/* Sessions List */}
      <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 text-twilight-500">
            No sessions found for this period.
          </div>
        ) : (
          filteredSessions.map((session) => {
            const completedAt = (session.completedAt as Timestamp).toDate();
            const date = completedAt.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            const time = completedAt.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            });

            return (
              <div
                key={session.id}
                className="glass rounded-lg p-4 hover:bg-twilight-700/30 transition-smooth"
              >
                <div className="flex items-center justify-between">
                  {/* Date and Time */}
                  <div className="flex-1">
                    <div className="text-white font-light">{date}</div>
                    <div className="text-xs text-twilight-400">{time}</div>
                  </div>

                  {/* Duration */}
                  <div className="text-center px-4">
                    <div className="text-twilight-300 font-light text-lg">
                      {session.duration}
                    </div>
                    <div className="text-xs text-twilight-500">minutes</div>
                  </div>

                  {/* Theme */}
                  {session.hourglassTheme && (
                    <div className="text-xs text-twilight-400 px-4">
                      {session.hourglassTheme}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
