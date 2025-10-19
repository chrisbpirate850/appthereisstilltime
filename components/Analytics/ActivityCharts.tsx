'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { DailyStats, WeeklyStats, MonthlyStats } from '@/lib/analytics/aggregations';

interface ActivityChartsProps {
  dailyStats: DailyStats[];
  weeklyStats: WeeklyStats[];
  monthlyStats: MonthlyStats[];
}

type TimeRange = 'week' | 'month' | 'quarter';
type ChartType = 'bar' | 'line';

export function ActivityCharts({ dailyStats, weeklyStats, monthlyStats }: ActivityChartsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Prepare data based on time range
  const getChartData = () => {
    switch (timeRange) {
      case 'week':
        return dailyStats
          .slice(0, 7)
          .reverse()
          .map((d) => ({
            label: new Date(d.date).toLocaleDateString('en-US', {
              weekday: 'short',
            }),
            sessions: d.sessions,
            hours: d.hours,
          }));
      case 'month':
        return dailyStats
          .slice(0, 30)
          .reverse()
          .map((d) => ({
            label: new Date(d.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            sessions: d.sessions,
            hours: d.hours,
          }));
      case 'quarter':
        return dailyStats
          .slice(0, 90)
          .reverse()
          .map((d) => ({
            label: new Date(d.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            sessions: d.sessions,
            hours: d.hours,
          }));
      default:
        return [];
    }
  };

  const chartData = getChartData();

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-strong rounded-lg p-3 border border-twilight-600">
          <p className="text-white font-medium mb-1">{payload[0].payload.label}</p>
          <p className="text-twilight-300 text-sm">
            {payload[0].value} {payload[0].value === 1 ? 'session' : 'sessions'}
          </p>
          <p className="text-twilight-400 text-xs">
            {payload[1].value.toFixed(1)} {payload[1].value === 1 ? 'hour' : 'hours'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-strong rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-light text-white flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Activity Overview
        </h3>

        <div className="flex items-center gap-2">
          {/* Chart Type Toggle */}
          <div className="glass rounded-lg p-1 flex">
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded text-xs transition-smooth ${
                chartType === 'bar'
                  ? 'bg-twilight-500 text-white'
                  : 'text-twilight-400 hover:text-white'
              }`}
            >
              Bar
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-xs transition-smooth ${
                chartType === 'line'
                  ? 'bg-twilight-500 text-white'
                  : 'text-twilight-400 hover:text-white'
              }`}
            >
              Line
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="glass rounded-lg p-1 flex">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 rounded text-xs transition-smooth ${
                timeRange === 'week'
                  ? 'bg-twilight-500 text-white'
                  : 'text-twilight-400 hover:text-white'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 rounded text-xs transition-smooth ${
                timeRange === 'month'
                  ? 'bg-twilight-500 text-white'
                  : 'text-twilight-400 hover:text-white'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setTimeRange('quarter')}
              className={`px-3 py-1 rounded text-xs transition-smooth ${
                timeRange === 'quarter'
                  ? 'bg-twilight-500 text-white'
                  : 'text-twilight-400 hover:text-white'
              }`}
            >
              90D
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4A4458" opacity={0.3} />
              <XAxis
                dataKey="label"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sessions" fill="#8B7FD8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="hours" fill="#C7A6E8" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4A4458" opacity={0.3} />
              <XAxis
                dataKey="label"
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                stroke="#9CA3AF"
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="sessions"
                stroke="#8B7FD8"
                strokeWidth={2}
                dot={{ fill: '#8B7FD8', r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="hours"
                stroke="#C7A6E8"
                strokeWidth={2}
                dot={{ fill: '#C7A6E8', r: 3 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-twilight-500"></div>
          <span className="text-xs text-twilight-400">Sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-twilight-300"></div>
          <span className="text-xs text-twilight-400">Hours</span>
        </div>
      </div>
    </div>
  );
}
