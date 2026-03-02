export type TimerState = 'idle' | 'running' | 'paused';
export type SessionType = 'focus' | 'shortBreak' | 'longBreak';

export interface FocusSession {
  id: string;
  intent: string;
  duration: number; // in seconds
  completedAt: string; // ISO string
  type: SessionType;
}

export interface Settings {
  focusDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  focusSound: string;
  breakSound: string;
  dailyGoal: number; // in hours
  autoStartFocus: boolean;
  autoStartBreak: boolean;
}

export const AVAILABLE_SOUNDS = [
  { id: 'none', name: 'None', url: '' },
  { id: 'bell', name: 'Bell', url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3' },
  { id: 'digital', name: 'Digital', url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3' },
  { id: 'chime', name: 'Chime', url: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3' },
];
