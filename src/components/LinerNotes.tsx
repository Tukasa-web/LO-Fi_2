import React, { useState } from 'react';
import { TrackData } from '../utils/audioStorage';
import { BookOpen, Edit3, Music2, Check, Clock, Radio, Info } from 'lucide-react';

interface LinerNotesProps {
  track: TrackData;
  onUpdateTrack: (updated: Partial<TrackData>) => void;
}

export const LinerNotes: React.FC<LinerNotesProps> = ({ track, onUpdateTrack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(track.linerNotes);
  const [quote, setQuote] = useState(track.quote || '');
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);

  const handleSave = () => {
    onUpdateTrack({
      title,
      artist,
      linerNotes: notes,
      quote,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-12">
      {/* Story & Liner Notes */}
      <section id="story" className="w-full scroll-mt-24">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 lg:p-10 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80 mb-8">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-amber-200/80 font-medium">
                <BookOpen className="w-3.5 h-3.5" />
                <span>ライナーノーツ & 制作背景</span>
              </div>
              <h2 className="text-xl lg:text-2xl font-semibold text-slate-100 tracking-tight font-serif-calm">
                一音一音に込めた、静けさの記憶
              </h2>
            </div>

            <button
              onClick={() => {
                if (isEditing) {
                  handleSave();
                } else {
                  setIsEditing(true);
                }
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-all self-start sm:self-auto cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-200"
            >
              {isEditing ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>保存する</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                  <span>物語を編集</span>
                </>
              )}
            </button>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  楽曲タイトル
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  アーティスト / 作曲者名
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  印象的なフレーズ・メッセージ
                </label>
                <input
                  type="text"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="例: 深呼吸して、今日をそっと閉じるための音楽。"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-300"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  制作ノート・背景エピソード
                </label>
                <textarea
                  rows={6}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="この曲を作ったときの気持ちや情景、聴いてくれる人への言葉..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3.5 text-sm text-slate-100 focus:outline-none focus:border-amber-300 leading-relaxed resize-y"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 text-xs font-medium text-slate-950 bg-amber-200 hover:bg-amber-300 rounded-md transition-colors cursor-pointer"
                >
                  完了して保存
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-6">
                {track.quote && (
                  <blockquote className="text-base sm:text-lg text-amber-100/90 font-serif-calm italic leading-relaxed py-2 pl-4 border-l border-amber-300/30">
                    “{track.quote}”
                  </blockquote>
                )}

                <div className="text-sm sm:text-base text-slate-300/90 leading-relaxed whitespace-pre-line font-serif-calm">
                  {track.linerNotes}
                </div>
              </div>

              <div className="lg:col-span-4 space-y-4 pt-1">
                <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-3">
                  <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5 pb-2 border-b border-slate-800/60">
                    <Music2 className="w-3.5 h-3.5 text-amber-300/80" />
                    <span>楽曲のエッセンス</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-400">
                      <span>ジャンル</span>
                      <span className="text-slate-200 font-medium">{track.genre || 'Ambient / Neo-Classical'}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>想定シーン</span>
                      <span className="text-slate-200 font-medium">夜の読書 · 瞑想 · 就寝前の休息</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-400">
                      <span>ムード</span>
                      <span className="text-slate-200 font-medium">静寂 · 穏やか · 温もり</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Track Technical Specs */}
      <section id="specs" className="w-full scroll-mt-24">
        <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-6 lg:p-8 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-xs text-amber-200/80 font-medium mb-1">
            <Info className="w-3.5 h-3.5" />
            <span>作品技術データ & ファイル情報</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-100 mb-6">
            オーディオ・マスター詳細
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="text-xs text-slate-400 block mb-1">形式</span>
              <span className="text-sm font-medium text-slate-200">
                {track.isCustomUploaded ? (track.fileName?.split('.').pop()?.toUpperCase() || 'AUDIO') : 'WebAudio Hi-Res'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="text-xs text-slate-400 block mb-1">音質仕様</span>
              <span className="text-sm font-medium text-slate-200">
                {track.isCustomUploaded ? 'Master Studio 48kHz' : '24bit 48kHz Synthesized'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="text-xs text-slate-400 block mb-1">ファイル名</span>
              <span className="text-sm font-medium text-slate-200 truncate block" title={track.fileName || 'gentle_ambient_master.wav'}>
                {track.fileName || 'gentle_ambient_master.wav'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60">
              <span className="text-xs text-slate-400 block mb-1">状態</span>
              <span className="text-sm font-medium text-emerald-400">
                {track.isCustomUploaded ? 'アップロード完了 (ブラウザ保存済)' : 'オリジナル音源を準備中'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
