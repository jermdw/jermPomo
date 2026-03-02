import React from 'react';
import { Settings as SettingsType, AVAILABLE_SOUNDS } from '../types';
import { Volume2 } from 'lucide-react';

interface SettingsProps {
  settings: SettingsType;
  onSave: (settings: SettingsType) => void;
  onClose: () => void;
}

export function Settings({ settings, onSave, onClose }: SettingsProps) {
  const [localSettings, setLocalSettings] = React.useState(settings);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const isNumber = ['focusDuration', 'shortBreakDuration', 'longBreakDuration', 'sessionsUntilLongBreak', 'dailyGoal'].includes(name);
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setLocalSettings(prev => ({ ...prev, [name]: checked }));
    } else {
      setLocalSettings(prev => ({ ...prev, [name]: isNumber ? (parseInt(value, 10) || 0) : value }));
    }
  };

  const playPreview = (soundId: string) => {
    const sound = AVAILABLE_SOUNDS.find(s => s.id === soundId);
    if (sound && sound.url) {
      const audio = new Audio(sound.url);
      audio.play().catch(err => console.error('Error playing sound:', err));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 w-full max-w-md shadow-xl border border-gray-100 dark:border-zinc-800 my-8 transition-colors">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100 mb-6">Settings</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Focus (min)</label>
              <input
                type="number"
                name="focusDuration"
                value={localSettings.focusDuration}
                onChange={handleChange}
                min="1"
                max="120"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Short Break</label>
              <input
                type="number"
                name="shortBreakDuration"
                value={localSettings.shortBreakDuration}
                onChange={handleChange}
                min="1"
                max="30"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Long Break</label>
              <input
                type="number"
                name="longBreakDuration"
                value={localSettings.longBreakDuration}
                onChange={handleChange}
                min="1"
                max="60"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Interval</label>
              <input
                type="number"
                name="sessionsUntilLongBreak"
                value={localSettings.sessionsUntilLongBreak}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Daily Focus Goal (hours)</label>
            <input
              type="number"
              name="dailyGoal"
              value={localSettings.dailyGoal}
              onChange={handleChange}
              min="1"
              max="24"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="border-t border-gray-100 dark:border-zinc-800 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-zinc-100">Auto-start Focus</label>
                <p className="text-xs text-gray-500 dark:text-zinc-500">Start focus session automatically after break</p>
              </div>
              <input
                type="checkbox"
                name="autoStartFocus"
                checked={localSettings.autoStartFocus}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 dark:border-zinc-800 text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-zinc-100">Auto-start Break</label>
                <p className="text-xs text-gray-500 dark:text-zinc-500">Start break automatically after focus session</p>
              </div>
              <input
                type="checkbox"
                name="autoStartBreak"
                checked={localSettings.autoStartBreak}
                onChange={handleChange}
                className="w-5 h-5 rounded border-gray-300 dark:border-zinc-800 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="border-t border-gray-100 dark:border-zinc-800 pt-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Focus Sound</label>
              <div className="flex gap-2">
                <select
                  name="focusSound"
                  value={localSettings.focusSound}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
                >
                  {AVAILABLE_SOUNDS.map(sound => (
                    <option key={sound.id} value={sound.id}>{sound.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => playPreview(localSettings.focusSound)}
                  className="p-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  title="Preview sound"
                >
                  <Volume2 size={20} />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Break Sound</label>
              <div className="flex gap-2">
                <select
                  name="breakSound"
                  value={localSettings.breakSound}
                  onChange={handleChange}
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all appearance-none"
                >
                  {AVAILABLE_SOUNDS.map(sound => (
                    <option key={sound.id} value={sound.id}>{sound.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => playPreview(localSettings.breakSound)}
                  className="p-3 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                  title="Preview sound"
                >
                  <Volume2 size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl text-gray-700 dark:text-zinc-400 font-medium hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium hover:bg-gray-800 dark:hover:bg-white transition-colors shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
