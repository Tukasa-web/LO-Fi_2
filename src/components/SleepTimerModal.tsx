import React from 'react';
import { X, Moon, Clock, Check } from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMinutes: number | null;
  remainingSeconds: number | null;
  onSetTimer: (minutes: number | null) => void;
}

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  activeMinutes,
  remainingSeconds,
  onSetTimer,
}) => {
  if (!isOpen) return null;

  const timerOptions = [10, 15, 30, 45, 60];

  const formatRemaining = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-slate-100 font-semibold text-base">
            <Moon className="w-4 h-4 text-amber-200" />
            <span>おやすみタイマー</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-3 mb-5 leading-relaxed">
          就寝前のリラクゼーションに。指定時間が近づくと音量が緩やかにフェードアウトし、自然な入眠をサポートします。
        </p>

        {remainingSeconds !== null && remainingSeconds > 0 && (
          <div className="mb-5 p-3 rounded-xl bg-amber-500/10 border border-amber-400/20 text-center">
            <span className="text-xs text-amber-200/80 block mb-0.5">自動停止まで</span>
            <span className="text-2xl font-mono tabular-nums font-semibold text-amber-200">
              {formatRemaining(remainingSeconds)}
            </span>
          </div>
        )}

        <div className="space-y-2">
          {timerOptions.map((min) => (
            <button
              key={min}
              onClick={() => {
                onSetTimer(min);
                onClose();
              }}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                activeMinutes === min
                  ? 'border-amber-300 bg-amber-500/10 text-amber-200'
                  : 'border-slate-800 bg-slate-950/40 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{min} 分後に停止</span>
              </div>
              {activeMinutes === min && <Check className="w-4 h-4 text-amber-300" />}
            </button>
          ))}

          {activeMinutes !== null && (
            <button
              onClick={() => {
                onSetTimer(null);
                onClose();
              }}
              className="w-full mt-2 py-2 text-xs text-rose-300 hover:text-rose-200 bg-rose-950/20 hover:bg-rose-950/40 rounded-lg border border-rose-900/30 transition-colors cursor-pointer"
            >
              タイマーを解除
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
