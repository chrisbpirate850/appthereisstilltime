'use client';

import { Session, UserStats } from '@/types';
import { Timestamp } from 'firebase/firestore';

export interface DailyStats {
  date: string; // YYYY-MM-DD
  sessions: number;
  minutes: number;
  hours: number;
}

export interface WeeklyStats {
  week: string; // YYYY-WW
  sessions: number;
  minutes: number;
  hours: number;
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  sessions: number;
  minutes: number;
  hours: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
}

/**
 * Aggregate sessions by day for the last N days
 */
export function aggregateByDay(sessions: Session[], days: number = 90): DailyStats[] {
  const today = new Date();
  const dailyMap = new Map<string, DailyStats>();

  // Initialize map with last N days
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    dailyMap.set(dateStr, {
      date: dateStr,
      sessions: 0,
      minutes: 0,
      hours: 0,
    });
  }

  // Aggregate sessions
  sessions.forEach((session) => {
    const completedAt = session.completedAt as Timestamp;
    const date = completedAt.toDate().toISOString().split('T')[0];

    const existing = dailyMap.get(date);
    if (existing) {
      existing.sessions += 1;
      existing.minutes += session.duration;
      existing.hours = Math.round((existing.minutes / 60) * 10) / 10;
    }
  });

  // Convert to array and sort by date descending
  return Array.from(dailyMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

/**
 * Aggregate sessions by week
 */
export function aggregateByWeek(sessions: Session[], weeks: number = 12): WeeklyStats[] {
  const weeklyMap = new Map<string, WeeklyStats>();

  sessions.forEach((session) => {
    const completedAt = session.completedAt as Timestamp;
    const date = completedAt.toDate();

    // Get ISO week number
    const weekStr = getISOWeek(date);

    const existing = weeklyMap.get(weekStr);
    if (existing) {
      existing.sessions += 1;
      existing.minutes += session.duration;
      existing.hours = Math.round((existing.minutes / 60) * 10) / 10;
    } else {
      weeklyMap.set(weekStr, {
        week: weekStr,
        sessions: 1,
        minutes: session.duration,
        hours: Math.round((session.duration / 60) * 10) / 10,
      });
    }
  });

  // Convert to array and sort by week descending
  return Array.from(weeklyMap.values())
    .sort((a, b) => b.week.localeCompare(a.week))
    .slice(0, weeks);
}

/**
 * Aggregate sessions by month
 */
export function aggregateByMonth(sessions: Session[], months: number = 6): MonthlyStats[] {
  const monthlyMap = new Map<string, MonthlyStats>();

  sessions.forEach((session) => {
    const completedAt = session.completedAt as Timestamp;
    const date = completedAt.toDate();
    const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    const existing = monthlyMap.get(monthStr);
    if (existing) {
      existing.sessions += 1;
      existing.minutes += session.duration;
      existing.hours = Math.round((existing.minutes / 60) * 10) / 10;
    } else {
      monthlyMap.set(monthStr, {
        month: monthStr,
        sessions: 1,
        minutes: session.duration,
        hours: Math.round((session.duration / 60) * 10) / 10,
      });
    }
  });

  // Convert to array and sort by month descending
  return Array.from(monthlyMap.values())
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, months);
}

/**
 * Calculate streak information from daily stats
 */
export function calculateStreak(dailyStats: DailyStats[]): StreakInfo {
  if (dailyStats.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,
    };
  }

  // Sort by date ascending
  const sorted = [...dailyStats].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastSessionDate: string | null = null;

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Find last session date
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].sessions > 0) {
      lastSessionDate = sorted[i].date;
      break;
    }
  }

  // Calculate streaks
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].sessions > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);

      // Check if this contributes to current streak
      // Current streak includes today and yesterday
      if (sorted[i].date === today || sorted[i].date === yesterdayStr) {
        currentStreak = tempStreak;
      }
    } else {
      // Break in streak
      if (sorted[i].date === today || sorted[i].date === yesterdayStr) {
        currentStreak = 0;
      }
      tempStreak = 0;
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastSessionDate,
  };
}

/**
 * Get ISO week number (YYYY-WW format)
 */
function getISOWeek(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));

  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

/**
 * Export sessions to CSV
 */
export function exportSessionsToCSV(sessions: Session[]): string {
  const headers = ['Date', 'Time', 'Duration (min)', 'Duration (hours)', 'Theme'];
  const rows = sessions.map((session) => {
    const completedAt = (session.completedAt as Timestamp).toDate();
    const date = completedAt.toLocaleDateString();
    const time = completedAt.toLocaleTimeString();
    const durationMin = session.duration;
    const durationHours = (session.duration / 60).toFixed(2);
    const theme = session.hourglassTheme || 'default';

    return [date, time, durationMin, durationHours, theme];
  });

  // Convert to CSV format
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string = 'focus-sessions.csv'): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
