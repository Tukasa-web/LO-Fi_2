import React, { useEffect, useRef } from 'react';
import { LyricLine } from '../utils/audioStorage';
import { Quote, Play } from 'lucide-react';

interface LyricsDisplayProps {
  lyrics: LyricLine[];
  currentTime: number;
  onSeekTo: (seconds: number) => void;
}

export const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  lyrics,
  currentTime,
  onSeekTo,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeLineRef = useRef<HTMLButtonElement | null>(null);

  // Find currently active lyric index
  let activeIndex = -1;
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
      break;
    }
  }

  // Smooth auto-scroll to current line
  useEffect(() => {
    if (activeLineRef.current && containerRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="relative w-full rounded-2xl bg-slate-950/60 border border-slate-800/80 p-5 sm:p-6 backdrop-blur-md">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 text-amber-200/90 font-medium">
          <Quote className="w-3.5 h-3.5" />
          <span>楽曲の歌詞（クリックでそのフレーズへジャンプ）</span>
        </div>
        <span className="text-slate-400 font-mono">
          {activeIndex >= 0 ? `${activeIndex + 1} / ${lyrics.length} 行` : 'イントロ'}
        </span>
      </div>

      <div
        ref={containerRef}
        className="max-h-64 sm:max-h-72 overflow-y-auto space-y-3.5 pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
      >
        {lyrics.map((line, idx) => {
          const isActive = idx === activeIndex;
          const isPast = idx < activeIndex;

          return (
            <button
              key={idx}
              ref={isActive ? activeLineRef : null}
              onClick={() => onSeekTo(line.time)}
              className={`w-full text-left p-2.5 rounded-xl transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                isActive
                  ? 'bg-amber-500/15 border border-amber-400/30 text-amber-100 shadow-md transform scale-[1.01]'
                  : isPast
                  ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-mono tabular-nums px-1.5 py-0.5 rounded transition-colors ${
                    isActive ? 'bg-amber-400/20 text-amber-200' : 'text-slate-400 group-hover:text-slate-400'
                  }`}
                >
                  {formatTime(line.time)}
                </span>
                <span
                  className={`font-serif-calm text-sm sm:text-base tracking-wide transition-all ${
                    isActive ? 'font-semibold text-amber-100 text-[1.05rem]' : ''
                  }`}
                >
                  {line.text}
                </span>
              </div>

              <div
                className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-amber-200 ${
                  isActive ? 'opacity-100 text-amber-300' : ''
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
