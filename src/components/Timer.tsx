import React, { useEffect } from 'react';
import { Play, Pause, Square, SkipForward } from 'lucide-react';
import { FocusSession, TimerState, SessionType } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TimerProps {
  state: TimerState;
  type: SessionType;
  timeLeft: number;
  intent: string;
  setIntent: (intent: string) => void;
  start: () => void;
  pause: () => void;
  stop: () => void;
  skip: () => void;
  totalDuration: number; // in seconds
  currentInterval: number;
  totalIntervals: number;
  recentSessions: FocusSession[];
}

export function Timer({
  state,
  type,
  timeLeft,
  intent,
  setIntent,
  start,
  pause,
  stop,
  skip,
  totalDuration,
  currentInterval,
  totalIntervals,
  recentSessions
}: TimerProps) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (state === 'running') {
      document.title = `${formatTime(timeLeft)} - ${type === 'focus' ? 'Focus' : 'Break'}`;
    } else {
      document.title = 'Focus Session';
    }
    return () => {
      document.title = 'Focus Session';
    };
  }, [timeLeft, state, type]);

  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  const isFocus = type === 'focus';
  const label = isFocus ? 'Focus Session' : type === 'shortBreak' ? 'Short Break' : 'Long Break';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-8 bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors">
      <div className="mb-6 text-sm font-medium tracking-widest text-gray-400 dark:text-zinc-500 uppercase flex items-center gap-2">
        {label}
        <span className="text-xs opacity-60 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full transition-colors">
          {currentInterval}/{totalIntervals}
        </span>
      </div>

      {isFocus && state === 'idle' ? (
        <input
          type="text"
          placeholder="What are you focusing on?"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          className="w-full text-center text-xl font-medium text-gray-800 dark:text-zinc-100 bg-transparent border-b-2 border-gray-200 dark:border-zinc-800 focus:border-gray-800 dark:focus:border-zinc-100 outline-none pb-2 mb-8 transition-colors placeholder:text-gray-300 dark:placeholder:text-zinc-700"
        />
      ) : (
        <div className="w-full text-center text-xl font-medium text-gray-800 dark:text-zinc-100 pb-2 mb-8 min-h-[40px]">
          {isFocus ? intent || 'Deep Work' : 'Take a breather'}
        </div>
      )}

      <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
        {/* Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke="currentColor"
            className="text-gray-100 dark:text-zinc-800"
            strokeWidth="4"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke={isFocus ? (state === 'running' ? (document.documentElement.classList.contains('dark') ? '#f4f4f5' : '#111827') : '#111827') : '#10b981'}
            className={isFocus ? 'text-gray-900 dark:text-zinc-100' : 'text-emerald-500'}
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ strokeDasharray: '301.59', strokeDashoffset: '301.59' }}
            animate={{ strokeDashoffset: 301.59 - (progress / 100) * 301.59 }}
            transition={{ duration: 0.5, ease: "linear" }}
          />
        </svg>

        <motion.div 
          className="timer-display text-6xl font-light text-gray-900 dark:text-zinc-100 z-10"
          animate={state === 'running' && timeLeft <= 120 && timeLeft > 0 ? {
            scale: [1, 1.05, 1],
            opacity: [1, 0.8, 1]
          } : { scale: 1, opacity: 1 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {formatTime(timeLeft)}
        </motion.div>
      </div>

      {/* Screen Flash Effect */}
      <AnimatePresence>
        {state === 'running' && timeLeft === totalDuration && (
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 bg-white dark:bg-zinc-100 pointer-events-none z-[100]"
          />
        )}
      </AnimatePresence>

      <div className="flex items-center gap-6">
        {state === 'running' ? (
          <button
            onClick={pause}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            <Pause size={24} fill="currentColor" />
          </button>
        ) : (
          <button
            onClick={start}
            className={`w-16 h-16 flex items-center justify-center rounded-full text-white transition-colors shadow-md ${
              isFocus ? 'bg-gray-900 dark:bg-zinc-100 dark:text-zinc-900 hover:bg-gray-800 dark:hover:bg-white' : 'bg-emerald-500 hover:bg-emerald-600'
            }`}
          >
            <Play size={24} fill="currentColor" className="ml-1" />
          </button>
        )}

        {(state === 'running' || state === 'paused') && (
          <button
            onClick={stop}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors"
          >
            <Square size={18} fill="currentColor" />
          </button>
        )}

        {state === 'running' && !isFocus && (
          <button
            onClick={skip}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 hover:text-gray-900 dark:hover:text-zinc-100 transition-colors"
          >
            <SkipForward size={18} />
          </button>
        )}
      </div>

      {/* Recent Sessions List */}
      <div className="w-full mt-10 pt-8 border-t border-gray-100 dark:border-zinc-800">
        <h4 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-4">Recent Sessions</h4>
        <div className="space-y-3">
          {recentSessions.length === 0 ? (
            <div className="text-sm text-gray-300 dark:text-zinc-700 italic">No sessions yet</div>
          ) : (
            recentSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${session.type === 'focus' ? 'bg-indigo-500' : 'bg-emerald-500'}`} />
                  <span className="text-gray-600 dark:text-zinc-400 truncate max-w-[150px]">
                    {session.intent || (session.type === 'focus' ? 'Deep Work' : 'Break')}
                  </span>
                </div>
                <span className="text-gray-400 dark:text-zinc-600 font-mono text-xs">
                  {Math.round(session.duration / 60)}m
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
