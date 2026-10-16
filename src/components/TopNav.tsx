import React from 'react';
import { Upload } from 'lucide-react';

interface TopNavProps {
  onOpenUpload: () => void;
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenUpload, onNavigate, activeSection }) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0c0f16]/85 border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 lg:px-12 py-4">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#player"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('player');
          }}
          className="font-display-calm text-xl tracking-wider text-slate-100 hover:text-amber-200/90 transition-colors whitespace-nowrap shrink-0"
        >
          SERENADE
        </a>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
          <button
            onClick={() => onNavigate('player')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-200 cursor-pointer ${
              activeSection === 'player' ? 'text-amber-200/90 underline underline-offset-8 decoration-amber-300/40' : ''
            }`}
          >
            プレイヤー
          </button>
          <button
            onClick={() => onNavigate('story')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-200 cursor-pointer ${
              activeSection === 'story' ? 'text-amber-200/90 underline underline-offset-8 decoration-amber-300/40' : ''
            }`}
          >
            楽曲の背景・想い
          </button>
          <button
            onClick={() => onNavigate('soundscape')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-200 cursor-pointer ${
              activeSection === 'soundscape' ? 'text-amber-200/90 underline underline-offset-8 decoration-amber-300/40' : ''
            }`}
          >
            環境音ミキサー
          </button>
          <button
            onClick={() => onNavigate('specs')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-slate-200 cursor-pointer ${
              activeSection === 'specs' ? 'text-amber-200/90 underline underline-offset-8 decoration-amber-300/40' : ''
            }`}
          >
            作品詳細
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-900 bg-amber-100 hover:bg-amber-200 active:scale-[0.98] rounded-md transition-all whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>曲をアップロード</span>
          </button>
        </div>
      </div>
    </header>
  );
};
