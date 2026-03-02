import React from 'react';
import { FocusSession, Settings } from '../types';
import { Clock, CheckCircle2, Flame, Target, BarChart3, Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, ReferenceLine } from 'recharts';

interface AnalyticsProps {
  sessions: FocusSession[];
  settings: Settings;
}

export function Analytics({ sessions, settings }: AnalyticsProps) {
  const focusSessions = sessions.filter(s => s.type === 'focus');
  const totalFocusTime = focusSessions.reduce((acc, s) => acc + s.duration, 0);
  
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const today = new Date().toDateString();
  const todaySessions = focusSessions.filter(s => new Date(s.completedAt).toDateString() === today);
  const todayFocusTime = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  
  const goalInSeconds = settings.dailyGoal * 3600;
  const progressPercent = Math.min(100, (todayFocusTime / goalInSeconds) * 100);

  // Streak calculation
  const sessionsByDay = focusSessions.reduce((acc, session) => {
    const day = new Date(session.completedAt).toDateString();
    acc[day] = (acc[day] || 0) + session.duration;
    return acc;
  }, {} as Record<string, number>);

  const goalMetDates = Object.keys(sessionsByDay)
    .filter(day => sessionsByDay[day] >= goalInSeconds)
    .map(day => new Date(day).getTime())
    .sort((a, b) => a - b);

  const calculateStreaks = () => {
    if (goalMetDates.length === 0) return { current: 0, longest: 0 };

    let longest = 0;
    let temp = 1;

    for (let i = 1; i < goalMetDates.length; i++) {
      const diff = (goalMetDates[i] - goalMetDates[i-1]) / (1000 * 60 * 60 * 24);
      if (Math.round(diff) === 1) {
        temp++;
      } else {
        longest = Math.max(longest, temp);
        temp = 1;
      }
    }
    longest = Math.max(longest, temp);

    // Current streak
    const todayTime = new Date(new Date().toDateString()).getTime();
    const yesterdayTime = todayTime - (1000 * 60 * 60 * 24);
    
    let current = 0;
    const lastMetDate = goalMetDates[goalMetDates.length - 1];
    if (lastMetDate === todayTime || lastMetDate === yesterdayTime) {
      let count = 0;
      let checkTime = lastMetDate;
      let idx = goalMetDates.length - 1;
      while (idx >= 0 && goalMetDates[idx] === checkTime) {
        count++;
        checkTime -= (1000 * 60 * 60 * 24);
        idx--;
      }
      current = count;
    }

    return { current, longest };
  };

  const { current: currentStreak, longest: longestStreak } = calculateStreaks();

  // Prepare data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toDateString();
  });

  const chartData = last7Days.map(dateStr => {
    const date = new Date(dateStr);
    const daySessions = focusSessions.filter(s => new Date(s.completedAt).toDateString() === dateStr);
    const count = daySessions.length;
    const durationHours = daySessions.reduce((acc, s) => acc + s.duration, 0) / 3600;
    return {
      name: date.toLocaleDateString(undefined, { weekday: 'short' }),
      count,
      duration: parseFloat(durationHours.toFixed(2)),
      goal: settings.dailyGoal,
      fullDate: dateStr
    };
  });

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">Analytics</h2>
      </div>

      {/* Daily Goal Progress */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Daily Goal</h3>
              <p className="text-sm text-gray-500 dark:text-zinc-500">You've focused for {formatDuration(todayFocusTime)} today</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{Math.round(progressPercent)}%</div>
            <div className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">of {settings.dailyGoal}h goal</div>
          </div>
        </div>
        
        <div className="w-full h-3 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Weekly Activity</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-500">Sessions completed per day</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                contentStyle={{ 
                  backgroundColor: '#111827', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.fullDate === today ? '#6366f1' : '#e5e7eb'} 
                    className={`${entry.fullDate === today ? 'fill-indigo-500' : 'fill-gray-200 dark:fill-zinc-800'} hover:opacity-80 transition-opacity cursor-pointer`}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goal Progress Chart */}
      <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-zinc-100">Goal Progress</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-500">Focus hours vs daily goal</p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                unit="h"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#111827', 
                  border: 'none', 
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px'
                }}
                itemStyle={{ color: '#fff' }}
              />
              <Line 
                type="stepAfter" 
                dataKey="goal" 
                stroke="#9ca3af" 
                strokeDasharray="5 5" 
                strokeWidth={1} 
                dot={false}
                name="Daily Goal"
              />
              <Line 
                type="monotone" 
                dataKey="duration" 
                stroke="#6366f1" 
                strokeWidth={3} 
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
                name="Focus Hours"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center transition-colors">
          <Clock className="w-8 h-8 text-indigo-500 mb-3" />
          <div className="text-3xl font-light text-gray-900 dark:text-zinc-100">{formatDuration(totalFocusTime)}</div>
          <div className="text-sm font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mt-1">Total Focus</div>
        </div>
        
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center transition-colors">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-3" />
          <div className="text-3xl font-light text-gray-900 dark:text-zinc-100">{focusSessions.length}</div>
          <div className="text-sm font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mt-1">Sessions</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center transition-colors">
          <Flame className="w-8 h-8 text-orange-500 mb-3" />
          <div className="text-3xl font-light text-gray-900 dark:text-zinc-100">{currentStreak}</div>
          <div className="text-sm font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mt-1">Streak</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 flex flex-col items-center justify-center transition-colors">
          <Trophy className="w-8 h-8 text-yellow-500 mb-3" />
          <div className="text-3xl font-light text-gray-900 dark:text-zinc-100">{longestStreak}</div>
          <div className="text-sm font-medium text-gray-500 dark:text-zinc-500 uppercase tracking-wider mt-1">Best</div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800 overflow-hidden transition-colors">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-zinc-800">
          <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-100">Recent Sessions</h3>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-zinc-800">
          {focusSessions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-zinc-500">
              No sessions completed yet. Start focusing!
            </div>
          ) : (
            focusSessions.slice().reverse().map((session) => (
              <div key={session.id} className="p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                <div>
                  <div className="font-medium text-gray-900 dark:text-zinc-100">{session.intent || 'Deep Work'}</div>
                  <div className="text-sm text-gray-500 dark:text-zinc-500 mt-1">
                    {new Date(session.completedAt).toLocaleDateString(undefined, { 
                      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                    })}
                  </div>
                </div>
                <div className="text-gray-900 dark:text-zinc-100 font-mono bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-full text-sm">
                  {Math.round(session.duration / 60)}m
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
