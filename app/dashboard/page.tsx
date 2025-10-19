'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { getUserStats, getUserSessions, getUserSubscription } from '@/lib/firebase/firestore';
import { hasAnalyticsAccess } from '@/lib/subscription/tiers';
import {
  aggregateByDay,
  aggregateByWeek,
  aggregateByMonth,
  calculateStreak,
} from '@/lib/analytics/aggregations';
import { StreakTracker } from '@/components/Analytics/StreakTracker';
import { ActivityCharts } from '@/components/Analytics/ActivityCharts';
import { CalendarHeatmap } from '@/components/Analytics/CalendarHeatmap';
import { SessionHistory } from '@/components/Analytics/SessionHistory';
import { UserStats, Session, UserSubscription } from '@/types';

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (!user) {
        // Not signed in, redirect to home
        router.push('/');
        return;
      }

      if (user.isAnonymous) {
        // Anonymous users don't have access to dashboard
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        // Load subscription
        const userSub = await getUserSubscription(user.uid);
        setSubscription(userSub);

        // Check if user has access to analytics
        const access = hasAnalyticsAccess(userSub);
        setHasAccess(access);

        if (access) {
          // Load stats and sessions
          const [userStats, userSessions] = await Promise.all([
            getUserStats(user.uid),
            getUserSessions(user.uid, 1000), // Load up to 1000 sessions
          ]);

          setStats(userStats);
          setSessions(userSessions);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Aggregate data for components
  const dailyStats = sessions.length > 0 ? aggregateByDay(sessions, 90) : [];
  const weeklyStats = sessions.length > 0 ? aggregateByWeek(sessions, 12) : [];
  const monthlyStats = sessions.length > 0 ? aggregateByMonth(sessions, 6) : [];
  const streakInfo = dailyStats.length > 0 ? calculateStreak(dailyStats) : { currentStreak: 0, longestStreak: 0, lastSessionDate: null };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-twilight-900 via-twilight-800 to-twilight-900 flex items-center justify-center">
        <div className="glass-strong rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-twilight-400 mx-auto mb-4"></div>
          <p className="text-white">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-twilight-900 via-twilight-800 to-twilight-900">
        {/* Header */}
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

        {/* Upgrade Required */}
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="glass-strong rounded-2xl p-12">
              <div className="text-6xl mb-6">📊</div>
              <h1 className="text-3xl font-light text-white mb-4">
                Analytics Dashboard
              </h1>
              <p className="text-lg text-twilight-300 mb-8">
                Track your progress, view detailed stats, and export your data.
              </p>

              <div className="glass rounded-xl p-6 mb-8">
                <div className="text-twilight-400 mb-4">
                  This feature requires a Focus+ subscription or higher.
                </div>
                <ul className="text-left text-sm text-twilight-300 space-y-2 max-w-md mx-auto">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-twilight-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Full analytics dashboard
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-twilight-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Daily streak & weekly charts
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-twilight-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    90-day calendar view
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-twilight-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    CSV export
                  </li>
                </ul>
              </div>

              <button
                onClick={() => router.push('/pricing')}
                className="bg-twilight-500 text-white px-8 py-3 rounded-lg hover:bg-twilight-400 transition-smooth font-medium"
              >
                Upgrade to Focus+
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="mb-8">
          <h1 className="text-4xl font-light text-white mb-2">Analytics Dashboard</h1>
          <p className="text-twilight-300">
            Track your focus journey and celebrate your progress.
          </p>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 pb-12">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-strong rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">⏱️</div>
            <div className="text-3xl font-light text-white mb-1">
              {stats?.totalSessions || 0}
            </div>
            <div className="text-sm text-twilight-400">Total Sessions</div>
          </div>

          <div className="glass-strong rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">🕐</div>
            <div className="text-3xl font-light text-white mb-1">
              {stats?.totalHours || 0}
            </div>
            <div className="text-sm text-twilight-400">Hours Focused</div>
          </div>

          <div className="glass-strong rounded-2xl p-6 text-center">
            <div className="text-4xl mb-2">📈</div>
            <div className="text-3xl font-light text-white mb-1">
              {sessions.length > 0
                ? Math.round((stats?.totalMinutes || 0) / sessions.length)
                : 0}
            </div>
            <div className="text-sm text-twilight-400">Avg Minutes/Session</div>
          </div>
        </div>

        {/* Streak Tracker */}
        <div className="mb-8">
          <StreakTracker streakInfo={streakInfo} />
        </div>

        {/* Activity Charts */}
        <div className="mb-8">
          <ActivityCharts
            dailyStats={dailyStats}
            weeklyStats={weeklyStats}
            monthlyStats={monthlyStats}
          />
        </div>

        {/* Calendar Heatmap */}
        <div className="mb-8">
          <CalendarHeatmap dailyStats={dailyStats} />
        </div>

        {/* Session History */}
        <div>
          <SessionHistory sessions={sessions} />
        </div>
      </div>
    </div>
  );
}
