'use client';

import { DailyStats } from '@/lib/analytics/aggregations';

interface CalendarHeatmapProps {
  dailyStats: DailyStats[];
}

export function CalendarHeatmap({ dailyStats }: CalendarHeatmapProps) {
  // Get last 90 days
  const today = new Date();
  const days: { date: string; sessions: number; hours: number }[] = [];

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const stats = dailyStats.find((d) => d.date === dateStr);
    days.push({
      date: dateStr,
      sessions: stats?.sessions || 0,
      hours: stats?.hours || 0,
    });
  }

  // Get intensity level (0-4 based on hours)
  const getIntensity = (hours: number): number => {
    if (hours === 0) return 0;
    if (hours < 1) return 1;
    if (hours < 2) return 2;
    if (hours < 3) return 3;
    return 4;
  };

  // Get background color based on intensity
  const getColor = (intensity: number): string => {
    const colors = [
      'bg-twilight-800/30', // 0 sessions
      'bg-twilight-600/50', // < 1 hour
      'bg-twilight-500/70', // 1-2 hours
      'bg-twilight-400/85', // 2-3 hours
      'bg-twilight-300', // 3+ hours
    ];
    return colors[intensity];
  };

  // Group days by week (rows of 7)
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Get month labels
  const getMonthLabel = (weekIndex: number): string | null => {
    const firstDay = weeks[weekIndex][0];
    if (!firstDay) return null;

    const date = new Date(firstDay.date);
    const dayOfMonth = date.getDate();

    // Show month label at start of each month or first week
    if (weekIndex === 0 || dayOfMonth <= 7) {
      return date.toLocaleDateString('en-US', { month: 'short' });
    }

    return null;
  };

  return (
    <div className="glass-strong rounded-2xl p-6">
      <h3 className="text-xl font-light text-white mb-6 flex items-center gap-2">
        <span className="text-2xl">📅</span>
        90-Day Activity
      </h3>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div className="flex gap-1 mb-2">
            {weeks.map((week, weekIndex) => {
              const label = getMonthLabel(weekIndex);
              return (
                <div key={weekIndex} className="flex-1 min-w-[12px]">
                  {label && (
                    <div className="text-xs text-twilight-400 font-light">{label}</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Heatmap rows */}
          <div className="flex gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const intensity = getIntensity(day.hours);
                  const color = getColor(intensity);
                  const date = new Date(day.date);
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                  return (
                    <div
                      key={day.date}
                      className={`w-3 h-3 rounded-sm ${color} transition-smooth hover:scale-125 hover:ring-1 hover:ring-twilight-400 cursor-pointer group relative`}
                      title={`${day.date}: ${day.sessions} sessions, ${day.hours.toFixed(1)} hours`}
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="glass-strong rounded-lg p-2 whitespace-nowrap text-xs border border-twilight-600">
                          <div className="text-white font-medium">
                            {date.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div className="text-twilight-300">
                            {day.sessions} {day.sessions === 1 ? 'session' : 'sessions'}
                          </div>
                          <div className="text-twilight-400">
                            {day.hours.toFixed(1)} {day.hours === 1 ? 'hour' : 'hours'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Day labels */}
          <div className="flex gap-1 mt-2">
            <div className="flex flex-col gap-1 text-xs text-twilight-500">
              <div className="h-3 flex items-center">Mon</div>
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Wed</div>
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Fri</div>
              <div className="h-3"></div>
              <div className="h-3 flex items-center">Sun</div>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-twilight-700">
        <span className="text-xs text-twilight-500">Less</span>
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3, 4].map((intensity) => (
            <div
              key={intensity}
              className={`w-4 h-4 rounded-sm ${getColor(intensity)}`}
            ></div>
          ))}
        </div>
        <span className="text-xs text-twilight-500">More</span>
      </div>
    </div>
  );
}
