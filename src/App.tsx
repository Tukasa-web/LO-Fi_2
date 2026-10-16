import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { AudioPlayer } from './components/AudioPlayer';
import { AmbientMixer } from './components/AmbientMixer';
import { LinerNotes } from './components/LinerNotes';
import { UploadModal } from './components/UploadModal';
import { SleepTimerModal } from './components/SleepTimerModal';
import {
  TrackData,
  loadTrackFromDB,
  saveTrackToDB,
} from './utils/audioStorage';
import { Heart, Sparkles, Moon, Upload } from 'lucide-react';

const DEFAULT_TRACK: TrackData = {
  id: 'primary_single',
  title: '君のままでいい',
  artist: 'あなた (Composer)',
  genre: 'Acoustic Chill / Lo-Fi Ballad',
  releaseDate: '2026年',
  duration: 159,
  quote: '君一人の価値は 誰にも測れない。上手く笑えない日も、ここにいていい。',
  linerNotes: `冷めかけた紅茶を両手で包みながら、胸の内にしまっていた想いを少しずつ解いていくような、優しく温かな1曲。\n\n「人波の中で君だけ見つけた / 急がなくていいと歩幅を合わせた」\n忙しく進む世界の中で、誰かと自分を比べて疲れてしまったとき、自分の歩幅を取り戻せるように作られました。\n\n見えない傷の分、誰かに優しくなれる。上手く笑えない日も、君のままでここにいていい。\nそんな寄り添うような言葉と、穏やかなアコースティックの音色が静かな時間を包み込みます。`,
  artworkUrl: '/src/assets/images/cover_tea_cup_1792127418581.jpg',
  isCustomUploaded: false,
  lyrics: [
    { time: 12, text: '人波の中で 君だけ見つけた' },
    { time: 18, text: '急がなくていいと 歩幅を合わせた' },
    { time: 24, text: '名前を呼ぶ声 小さくても届く' },
    { time: 30, text: '今日はそれだけで 少し楽になった' },
    { time: 36, text: '君一人の価値は 誰にも測れない' },
    { time: 42, text: '上手く笑えない日も ここにいていい' },
    { time: 48, text: '比べる声の向こう 君のままでいて' },
    { time: 54, text: '一人の君を ちゃんと大切にしたい' },
    { time: 73, text: '冷めかけた紅茶 両手で包んで' },
    { time: 79, text: '言えなかったこと 少しずつ話す' },
    { time: 85, text: '答えを急がずに 隣で聞いて' },
    { time: 91, text: '沈黙さえ今日は 優しい場所だね' },
    { time: 97, text: '君一人の価値は 誰にも測れない' },
    { time: 103, text: '遠回りの日々も 君を作ってる' },
    { time: 109, text: '見えない傷の分 優しくなれたね' },
    { time: 115, text: '一人の君を ちゃんと大切にしたい' },
    { time: 127, text: '明日がまだ遠くても' },
    { time: 135, text: '今夜はここにいて' },
    { time: 141, text: '君のままでいい' },
  ],
};

export default function App() {
  const [track, setTrack] = useState<TrackData>(DEFAULT_TRACK);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const [sleepSecondsRemaining, setSleepSecondsRemaining] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState('player');

  // Load persisted track from IndexedDB on startup
  useEffect(() => {
    loadTrackFromDB()
      .then((savedTrack) => {
        if (savedTrack && savedTrack.isCustomUploaded) {
          setTrack((prev) => ({
            ...prev,
            ...savedTrack,
            lyrics: savedTrack.lyrics || DEFAULT_TRACK.lyrics,
          }));
        } else if (savedTrack) {
          // If previous session had placeholder defaults, upgrade to the user's song
          setTrack((prev) => ({
            ...prev,
            ...savedTrack,
            title: savedTrack.title === '夕凪のしずく (Twilight Reflections)' ? DEFAULT_TRACK.title : savedTrack.title,
            genre: savedTrack.title === '夕凪のしずく (Twilight Reflections)' ? DEFAULT_TRACK.genre : savedTrack.genre,
            artworkUrl: savedTrack.artworkUrl.includes('cover_dusk') ? DEFAULT_TRACK.artworkUrl : savedTrack.artworkUrl,
            lyrics: DEFAULT_TRACK.lyrics,
            duration: savedTrack.duration || DEFAULT_TRACK.duration,
            linerNotes: savedTrack.title === '夕凪のしずく (Twilight Reflections)' ? DEFAULT_TRACK.linerNotes : savedTrack.linerNotes,
            quote: savedTrack.title === '夕凪のしずく (Twilight Reflections)' ? DEFAULT_TRACK.quote : savedTrack.quote,
          }));
        }
      })
      .catch((err) => {
        console.error('Failed to load track from DB:', err);
      });
  }, []);

  // Sleep timer interval
  useEffect(() => {
    if (sleepMinutes === null) {
      setSleepSecondsRemaining(null);
      return;
    }

    setSleepSecondsRemaining(sleepMinutes * 60);

    const interval = setInterval(() => {
      setSleepSecondsRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setSleepMinutes(null);
          // Auto-trigger pause
          const audioEl = document.querySelector('audio');
          if (audioEl) audioEl.pause();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepMinutes]);

  const handleSaveTrack = async (updatedTrack: TrackData) => {
    await saveTrackToDB(updatedTrack);
    // Refresh audioUrl
    if (updatedTrack.audioBlob) {
      updatedTrack.audioUrl = URL.createObjectURL(updatedTrack.audioBlob);
    }
    setTrack(updatedTrack);
  };

  const handleUpdateTrackMeta = async (updated: Partial<TrackData>) => {
    const newTrack = { ...track, ...updated };
    setTrack(newTrack);
    await saveTrackToDB(newTrack);
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0c0f16] text-slate-200 flex flex-col selection:bg-amber-400/20 selection:text-amber-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] animate-gentle-pulse" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Strict Top Bar Contract Header */}
      <TopNav
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onNavigate={handleNavigate}
        activeSection={activeSection}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 lg:px-12 py-8 sm:py-12 space-y-16">
        {/* Banner prompt if user has not yet uploaded their file */}
        {!track.isCustomUploaded && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-400/20 px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
              <p className="text-xs sm:text-sm text-amber-100">
                <span className="font-semibold text-amber-200">あなたの作った1曲を公開しましょう: </span>
                音声ファイル（MP3 / WAVなど）をアップロードすると、ジャケットや物語とともにサイト上に永続配置されます。
              </p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-950 bg-amber-200 hover:bg-amber-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>今すぐ曲をアップロード</span>
            </button>
          </div>
        )}

        {/* 1. Main Single Audio Player & Visualizer */}
        <AudioPlayer
          track={track}
          onOpenUpload={() => setIsUploadModalOpen(true)}
          onOpenSleepTimer={() => setIsSleepModalOpen(true)}
          sleepMinutes={sleepMinutes}
          sleepSecondsRemaining={sleepSecondsRemaining}
        />

        {/* 2. Ambient Soundscape Mixer */}
        <AmbientMixer />

        {/* 3. Liner Notes & Concept Story */}
        <LinerNotes track={track} onUpdateTrack={handleUpdateTrackMeta} />
      </main>

      {/* Quiet Footer */}
      <footer className="mt-20 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur-sm py-8 px-6 lg:px-12 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display-calm tracking-wider text-slate-300">SERENADE</span>
            <span aria-hidden="true">·</span>
            <span>A Sanctuary for a Single Calming Composition</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              曲の変更・アップロード
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => handleNavigate('player')}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              トップへ戻る
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        currentTrack={track}
        onSaveTrack={handleSaveTrack}
      />

      <SleepTimerModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
        activeMinutes={sleepMinutes}
        remainingSeconds={sleepSecondsRemaining}
        onSetTimer={(min) => setSleepMinutes(min)}
      />
    </div>
  );
}
