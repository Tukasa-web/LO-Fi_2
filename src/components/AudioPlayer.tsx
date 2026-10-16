import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Repeat,
  Moon,
  Upload,
  Download,
  Share2,
  Clock,
  Sparkles,
  Gauge,
  Check,
} from 'lucide-react';
import { TrackData } from '../utils/audioStorage';
import { audioEngine } from '../utils/audioEngine';
import { Visualizer } from './Visualizer';
import { LyricsDisplay } from './LyricsDisplay';

interface AudioPlayerProps {
  track: TrackData;
  onOpenUpload: () => void;
  onOpenSleepTimer: () => void;
  sleepMinutes: number | null;
  sleepSecondsRemaining: number | null;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  track,
  onOpenUpload,
  onOpenSleepTimer,
  sleepMinutes,
  sleepSecondsRemaining,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(track.duration || 159);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);
  const [bottomView, setBottomView] = useState<'lyrics' | 'visualizer' | 'both'>('both');

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const simTimerRef = useRef<number | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Setup audio element connection
  useEffect(() => {
    if (audioRef.current && track.isCustomUploaded && track.audioUrl) {
      audioEngine.attachAudioElement(audioRef.current);
    }
  }, [track.isCustomUploaded, track.audioUrl]);

  useEffect(() => {
    if (track.duration) {
      setDuration(track.duration);
    }
  }, [track.duration]);

  // Volume & rate synchronization
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.loop = isLooping;
    }
  }, [volume, isMuted, playbackRate, isLooping]);

  // Format MM:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      // Pause
      if (track.isCustomUploaded && audioRef.current) {
        audioRef.current.pause();
      } else {
        audioEngine.stopGenerativeTrack();
        if (simTimerRef.current) {
          clearInterval(simTimerRef.current);
          simTimerRef.current = null;
        }
      }
      setIsPlaying(false);
    } else {
      // Play
      const ctx = audioEngine.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume();
      }

      if (track.isCustomUploaded && audioRef.current) {
        audioRef.current
          .play()
          .then(() => setIsPlaying(true))
          .catch((err) => console.error('Audio play error:', err));
      } else {
        // Generative demo track
        audioEngine.startGenerativeTrack();
        setIsPlaying(true);
        if (simTimerRef.current) clearInterval(simTimerRef.current);
        simTimerRef.current = window.setInterval(() => {
          setCurrentTime((prev) => {
            const next = prev + 1;
            if (next >= duration) {
              if (isLooping) return 0;
              setIsPlaying(false);
              audioEngine.stopGenerativeTrack();
              return 0;
            }
            return next;
          });
        }, 1000);
      }
    }
  }, [isPlaying, track.isCustomUploaded, duration, isLooping]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
      audioEngine.stopGenerativeTrack();
    };
  }, []);

  // Keyboard shortcut: Spacebar to toggle play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay]);

  // Handle seeker click / drag
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const targetTime = pos * duration;
    setCurrentTime(targetTime);
    if (audioRef.current && track.isCustomUploaded) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    setCurrentTime(newTime);
    if (audioRef.current && track.isCustomUploaded) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2200);
    }
  };

  const handleDownload = () => {
    if (track.audioBlob) {
      const url = URL.createObjectURL(track.audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = track.fileName || `${track.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      onOpenUpload();
    }
  };

  const toggleRate = () => {
    const rates = [0.8, 1.0, 1.2];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    setPlaybackRate(rates[nextIdx]);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <section id="player" className="w-full scroll-mt-24">
      {/* Hidden audio element for uploaded file */}
      {track.isCustomUploaded && track.audioUrl && (
        <audio
          ref={audioRef}
          src={track.audioUrl}
          loop={isLooping}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
          onLoadedMetadata={() => {
            if (audioRef.current && audioRef.current.duration) {
              setDuration(audioRef.current.duration);
            }
          }}
          onEnded={() => {
            if (!isLooping) {
              setIsPlaying(false);
            }
          }}
        />
      )}

      {/* Main Single Showcase Card */}
      <div className="relative rounded-2xl bg-gradient-to-b from-slate-900/70 via-slate-900/40 to-slate-950/80 border border-slate-800/80 p-6 sm:p-10 backdrop-blur-md shadow-2xl">
        {/* Ambient Top Bar Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/60 mb-8">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="text-amber-200/90 font-medium">Single Release</span>
            <span aria-hidden="true">·</span>
            <span>{track.genre || 'Calming Ambient'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Sleep Timer Indicator Button */}
            <button
              onClick={onOpenSleepTimer}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                sleepSecondsRemaining !== null && sleepSecondsRemaining > 0
                  ? 'bg-amber-400/20 text-amber-200 border border-amber-300/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title="おやすみタイマー"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>
                {sleepSecondsRemaining !== null && sleepSecondsRemaining > 0
                  ? `${Math.ceil(sleepSecondsRemaining / 60)}分後停止`
                  : 'おやすみタイマー'}
              </span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="共有リンクをコピー"
            >
              {copyFeedback ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copyFeedback ? 'コピー完了' : '共有'}</span>
            </button>

            {/* Download */}
            {track.isCustomUploaded && (
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title="音源をダウンロード"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ダウンロード</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Split: Left = Vinyl/Cover, Right = Typography & Playback */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Album Art with Vinyl Jacket aesthetic */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group max-w-xs sm:max-w-sm w-full">
              {/* Subtle vinyl peeking out behind when playing */}
              <div
                className={`absolute -right-6 top-4 bottom-4 w-4/5 rounded-full bg-[#111317] border border-slate-700 shadow-2xl flex items-center justify-center transition-all duration-700 -z-10 ${
                  isPlaying ? 'translate-x-10 sm:translate-x-12 animate-slow-spin' : 'translate-x-0'
                }`}
              >
                {/* Vinyl grooved circles */}
                <div className="w-4/5 h-4/5 rounded-full border border-slate-800/80 flex items-center justify-center">
                  <div className="w-2/3 h-2/3 rounded-full border border-slate-800/90 flex items-center justify-center">
                    <div className="w-1/3 h-1/3 rounded-full bg-amber-950/80 border border-amber-600/30 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Album Cover Art */}
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-950">
                <img
                  src={track.artworkUrl}
                  alt={track.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                />
                {/* Soft natural vignette scrim */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

                {/* Status indicator on artwork */}
                <div className="absolute bottom-3 left-3 text-[11px] text-slate-300 font-mono backdrop-blur-md bg-black/40 px-2.5 py-1 rounded-md border border-white/10">
                  {isPlaying ? 'PLAYING' : 'READY'}
                </div>

                {/* Quick edit artwork button */}
                <button
                  onClick={onOpenUpload}
                  className="absolute top-3 right-3 p-2 rounded-lg bg-black/50 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md transition-colors cursor-pointer"
                  title="ジャケット画像や曲情報を変更"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Track Identity & Controls */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-300/80 font-medium tracking-wider mb-2">
                <span>{track.isCustomUploaded ? '自作シングル音源' : 'デモ・プレビュー音源'}</span>
                {!track.isCustomUploaded && (
                  <button
                    onClick={onOpenUpload}
                    className="text-amber-200 underline hover:text-amber-100 cursor-pointer"
                  >
                    (あなたの曲をアップロード)
                  </button>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-100 tracking-tight font-serif-calm leading-tight">
                {track.title}
              </h1>
              <p className="text-base sm:text-lg text-slate-300 font-light mt-1.5">
                {track.artist}
              </p>
            </div>

            {/* Quote / Short Reflection */}
            {track.quote && (
              <p className="text-sm text-slate-400 font-serif-calm italic leading-relaxed border-l-2 border-slate-700 pl-3">
                “{track.quote}”
              </p>
            )}

            {/* Progress Seeker Bar */}
            <div className="space-y-1.5 pt-2">
              <div
                ref={progressBarRef}
                onClick={handleSeek}
                className="group relative h-2 w-full bg-slate-800 rounded-full cursor-pointer overflow-hidden transition-all hover:h-2.5"
              >
                <div
                  className="h-full bg-gradient-to-r from-amber-200 to-amber-400 rounded-full transition-all duration-100"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs font-mono tabular-nums text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main Playback Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* 15s back */}
                <button
                  onClick={() => handleSkip(-15)}
                  className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
                  title="15秒戻る"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                {/* Big Primary Play/Pause Button */}
                <button
                  onClick={handleTogglePlay}
                  className="relative flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 hover:bg-amber-200 text-slate-950 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title={isPlaying ? '一時停止 (Space)' : '再生 (Space)'}
                >
                  {isPlaying ? (
                    <Pause className="w-6 h-6 fill-slate-950" />
                  ) : (
                    <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                  )}
                </button>

                {/* Loop Button */}
                <button
                  onClick={() => setIsLooping(!isLooping)}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    isLooping
                      ? 'text-amber-200 bg-amber-400/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                  }`}
                  title={isLooping ? 'リピート再生中' : 'リピートオフ'}
                >
                  <Repeat className="w-4 h-4" />
                </button>

                {/* Speed Button */}
                <button
                  onClick={toggleRate}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
                  title="再生速度を変更"
                >
                  <Gauge className="w-3 h-3" />
                  <span>{playbackRate.toFixed(1)}x</span>
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  title={isMuted ? 'ミュート解除' : 'ミュート'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-20 sm:w-24 accent-amber-200 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  title="音量"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Visualizer and Synchronized Lyrics section */}
        <div className="mt-8 pt-6 border-t border-slate-800/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 p-1 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs">
              <button
                onClick={() => setBottomView('lyrics')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  bottomView === 'lyrics' ? 'bg-slate-800 text-amber-200 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                同期歌詞
              </button>
              <button
                onClick={() => setBottomView('visualizer')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  bottomView === 'visualizer' ? 'bg-slate-800 text-amber-200 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                音響ビジュアライザー
              </button>
              <button
                onClick={() => setBottomView('both')}
                className={`hidden sm:inline-block px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  bottomView === 'both' ? 'bg-slate-800 text-amber-200 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                両方を表示
              </button>
            </div>

            <span className="text-xs text-slate-400 hidden sm:inline">
              {bottomView === 'lyrics' ? 'フレーズをクリックして移動できます' : '穏やかな周波数波形を描画中'}
            </span>
          </div>

          {bottomView === 'both' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
              <Visualizer isPlaying={isPlaying} />
              {track.lyrics && (
                <LyricsDisplay
                  lyrics={track.lyrics}
                  currentTime={currentTime}
                  onSeekTo={(seekTime) => {
                    setCurrentTime(seekTime);
                    if (audioRef.current && track.isCustomUploaded) {
                      audioRef.current.currentTime = seekTime;
                    }
                  }}
                />
              )}
            </div>
          ) : bottomView === 'lyrics' && track.lyrics ? (
            <LyricsDisplay
              lyrics={track.lyrics}
              currentTime={currentTime}
              onSeekTo={(seekTime) => {
                setCurrentTime(seekTime);
                if (audioRef.current && track.isCustomUploaded) {
                  audioRef.current.currentTime = seekTime;
                }
              }}
            />
          ) : (
            <Visualizer isPlaying={isPlaying} />
          )}
        </div>
      </div>
    </section>
  );
};
