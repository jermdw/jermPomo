import React, { useState, useEffect, useCallback } from 'react';
import { Timer } from './components/Timer';
import { Analytics } from './components/Analytics';
import { Settings as SettingsModal } from './components/Settings';
import { useTimer } from './hooks/useTimer';
import { FocusSession, Settings, AVAILABLE_SOUNDS } from './types';
import { Settings as SettingsIcon, BarChart2, Timer as TimerIcon, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_SETTINGS: Settings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  focusSound: 'bell',
  breakSound: 'digital',
  dailyGoal: 4,
  autoStartFocus: false,
  autoStartBreak: false,
};

export default function App() {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('focus-settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Migration for old settings
      return {
        ...DEFAULT_SETTINGS,
        ...parsed
      };
    }
    return DEFAULT_SETTINGS;
  });

  const [sessions, setSessions] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem('focus-sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'timer' | 'analytics'>('timer');
  const [showSettings, setShowSettings] = useState(false);
  const [shortcutFeedback, setShortcutFeedback] = useState<{ key: string; label: string } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('focus-theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    localStorage.setItem('focus-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('focus-sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('focus-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const playSound = useCallback((soundId: string) => {
    const sound = AVAILABLE_SOUNDS.find(s => s.id === soundId);
    if (sound && sound.url) {
      const audio = new Audio(sound.url);
      audio.play().catch(err => console.error('Error playing sound:', err));
    }
  }, []);

  const handleSessionComplete = (session: FocusSession) => {
    setSessions(prev => [...prev, session]);
    
    // Play sound
    if (session.type === 'focus') {
      playSound(settings.focusSound);
    } else {
      playSound(settings.breakSound);
    }

    // Request notification permission if not granted
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Show notification
    if (Notification.permission === 'granted') {
      new Notification('Session Complete', {
        body: session.type === 'focus' ? 'Great job! Time for a break.' : 'Break is over. Ready to focus?',
        icon: '/vite.svg'
      });
    }
  };

  const timer = useTimer(settings, handleSessionComplete);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        showSettings
      ) {
        return;
      }

      const showFeedback = (key: string, label: string) => {
        setShortcutFeedback({ key, label });
        setTimeout(() => setShortcutFeedback(null), 1000);
      };

      if (e.code === 'Space') {
        e.preventDefault();
        if (timer.state === 'running') {
          timer.pause();
          showFeedback('Space', 'Paused');
        } else {
          timer.start();
          showFeedback('Space', 'Started');
        }
      } else if (e.code === 'KeyS' && e.shiftKey) {
        if (timer.type !== 'focus' && timer.state === 'running') {
          timer.skip();
          showFeedback('Shift + S', 'Skipped Break');
        }
      } else if (e.code === 'KeyS') {
        if (timer.state !== 'idle') {
          timer.stop();
          showFeedback('S', 'Stopped');
        }
      } else if (e.code === 'Enter') {
        if (timer.state === 'idle') {
          timer.start();
          showFeedback('Enter', 'Started');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timer, showSettings]);

  const totalDuration = timer.type === 'focus' ? settings.focusDuration * 60 :
                        timer.type === 'shortBreak' ? settings.shortBreakDuration * 60 :
                        settings.longBreakDuration * 60;

  const currentInterval = timer.type === 'focus' 
    ? (timer.sessionsCompleted % settings.sessionsUntilLongBreak) + 1
    : (((timer.sessionsCompleted - 1) % settings.sessionsUntilLongBreak) + settings.sessionsUntilLongBreak) % settings.sessionsUntilLongBreak + 1;

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="w-full max-w-4xl mx-auto p-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-900 dark:text-zinc-100 font-semibold text-xl tracking-tight">
          <div className="w-8 h-8 bg-gray-900 dark:bg-zinc-100 rounded-lg flex items-center justify-center transition-colors">
            <TimerIcon className="text-white dark:text-zinc-900 w-5 h-5" />
          </div>
          Focus Session
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-white dark:bg-zinc-900 rounded-full p-1 shadow-sm border border-gray-100 dark:border-zinc-800 flex items-center transition-colors">
            <button
              onClick={() => setActiveTab('timer')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'timer' ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100' : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
              }`}
            >
              Timer
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'analytics' ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-zinc-100' : 'text-gray-500 hover:text-gray-900 dark:hover:text-zinc-300'
              }`}
            >
              Analytics
            </button>
          </div>
          
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-full bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors ml-2"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button
            onClick={() => setShowSettings(true)}
            className="p-2.5 rounded-full bg-white dark:bg-zinc-900 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 shadow-sm border border-gray-100 dark:border-zinc-800 transition-colors ml-2"
          >
            <SettingsIcon size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'timer' ? (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <Timer
                state={timer.state}
                type={timer.type}
                timeLeft={timer.timeLeft}
                intent={timer.intent}
                setIntent={timer.setIntent}
                start={timer.start}
                pause={timer.pause}
                stop={timer.stop}
                skip={timer.skip}
                totalDuration={totalDuration}
                currentInterval={currentInterval}
                totalIntervals={settings.sessionsUntilLongBreak}
                recentSessions={sessions.slice(-5).reverse()}
              />
            </motion.div>
          ) : (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <Analytics sessions={sessions} settings={settings} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Shortcut Feedback */}
      <AnimatePresence>
        {shortcutFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-gray-900/90 dark:bg-zinc-100/90 text-white dark:text-zinc-900 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3 border border-white/10 dark:border-black/10">
              <kbd className="bg-white/20 dark:bg-black/10 px-2 py-1 rounded text-xs font-mono min-w-[24px] text-center">
                {shortcutFeedback.key}
              </kbd>
              <span className="font-medium">{shortcutFeedback.label}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
