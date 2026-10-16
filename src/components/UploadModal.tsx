import React, { useState, useRef } from 'react';
import { X, Upload, Music, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { TrackData } from '../utils/audioStorage';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack: TrackData;
  onSaveTrack: (track: TrackData) => Promise<void>;
}

const PRESET_ARTWORKS = [
  {
    id: 'tea_cup',
    name: '冷めかけた紅茶と朝の光 (Teacup Polaroid)',
    url: '/src/assets/images/cover_tea_cup_1792127418581.jpg',
  },
  {
    id: 'dusk',
    name: '夕凪と薄暮の湖 (Twilight Dusk)',
    url: '/src/assets/images/ambient_cover_dusk_1792126950257.jpg',
  },
  {
    id: 'mist',
    name: '雨露と静寂の庭 (Misty Garden)',
    url: '/src/assets/images/ambient_cover_mist_1792126966985.jpg',
  },
];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  currentTrack,
  onSaveTrack,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(currentTrack.title);
  const [artist, setArtist] = useState(currentTrack.artist);
  const [genre, setGenre] = useState(currentTrack.genre || 'Ambient / Relaxing');
  const [linerNotes, setLinerNotes] = useState(currentTrack.linerNotes);
  const [quote, setQuote] = useState(currentTrack.quote || '');
  const [selectedArtwork, setSelectedArtwork] = useState(currentTrack.artworkUrl);
  const [customArtworkDataUrl, setCustomArtworkDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleAudioFile = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('audio/') && !/\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(selectedFile.name)) {
      setErrorMsg('音声ファイル（MP3, WAV, M4A, FLAC, OGGなど）を選択してください。');
      return;
    }
    setErrorMsg(null);
    setFile(selectedFile);

    // Auto-populate title if empty or default
    if (!title || title === '夕凪のしずく (Twilight Reflections)' || title === '夕凪のしずく') {
      const cleanName = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(cleanName);
    }
  };

  const handleCustomImageFile = (imgFile: File) => {
    if (!imgFile.type.startsWith('image/')) {
      setErrorMsg('画像ファイル（JPG, PNG, WebPなど）を選択してください。');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setCustomArtworkDataUrl(e.target.result);
        setSelectedArtwork(e.target.result);
      }
    };
    reader.readAsDataURL(imgFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const updatedTrack: TrackData = {
        ...currentTrack,
        id: 'primary_single',
        title: title.trim() || '無題の落ち着く曲',
        artist: artist.trim() || '作曲者',
        genre: genre.trim() || 'Ambient / Relaxing',
        linerNotes: linerNotes.trim() || 'この曲は心を落ち着かせるために作られました。',
        quote: quote.trim() || '',
        artworkUrl: selectedArtwork,
        releaseDate: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }),
      };

      if (file) {
        updatedTrack.audioBlob = file;
        updatedTrack.fileName = file.name;
        updatedTrack.fileSize = file.size;
        updatedTrack.isCustomUploaded = true;
      }

      await onSaveTrack(updatedTrack);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('保存中にエラーが発生しました。再度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-100 tracking-tight">
              作った曲のアップロード＆情報設定
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              あなたの落ち着く1曲をサイトへ配置し、ジャケットや物語をカスタマイズします
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Audio Dropzone */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              楽曲ファイル（MP3 / WAV / M4A / FLAC / OGG）
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleAudioFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-300 bg-amber-500/10'
                  : 'border-slate-700 hover:border-slate-500 bg-slate-950/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.aac,.flac,.ogg"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleAudioFile(e.target.files[0]);
                  }
                }}
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 rounded-full bg-slate-800/90 text-amber-200">
                  <Upload className="w-5 h-5" />
                </div>
                {file ? (
                  <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span>選択中: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  </div>
                ) : currentTrack.isCustomUploaded ? (
                  <div className="text-sm text-slate-300">
                    <p className="font-medium text-amber-200/90">現在アップロード済みの曲: {currentTrack.fileName || currentTrack.title}</p>
                    <p className="text-xs text-slate-400 mt-1">クリックまたはドラッグして別の音源に差し替え</p>
                  </div>
                ) : (
                  <div className="text-sm text-slate-300">
                    <p className="font-medium text-slate-200">ドラッグ＆ドロップ または クリックして楽曲を選択</p>
                    <p className="text-xs text-slate-400 mt-1">対応: MP3, WAV, AAC, M4A, FLAC, OGG（ブラウザに安全に保存されます）</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Track Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                楽曲タイトル <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="例: 夕凪のしずく"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                アーティスト / 作曲者名
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="例: あなたのお名前 / サークル名"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-300"
              />
            </div>
          </div>

          {/* Quote & Genre */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                ジャンル / スタイル
              </label>
              <input
                type="text"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                placeholder="例: Ambient / Piano Solo / Lo-Fi Chill"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-300"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                添えたい一言・キャッチコピー
              </label>
              <input
                type="text"
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="例: 静かな夜、心をときほぐす1曲。"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-300"
              />
            </div>
          </div>

          {/* Cover Art selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-medium text-slate-300">
                ジャケットアートワークの選択
              </label>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="text-xs text-amber-200/90 hover:text-amber-100 flex items-center gap-1 cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>自分の画像を使用</span>
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleCustomImageFile(e.target.files[0]);
                  }
                }}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {PRESET_ARTWORKS.map((art) => (
                <button
                  key={art.id}
                  type="button"
                  onClick={() => setSelectedArtwork(art.url)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedArtwork === art.url ? 'border-amber-300 ring-2 ring-amber-300/30' : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <img
                    src={art.url}
                    alt={art.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/70 text-[10px] text-slate-200 truncate">
                    {art.name.split(' (')[0]}
                  </div>
                </button>
              ))}

              {customArtworkDataUrl && (
                <button
                  type="button"
                  onClick={() => setSelectedArtwork(customArtworkDataUrl)}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    selectedArtwork === customArtworkDataUrl ? 'border-amber-300 ring-2 ring-amber-300/30' : 'border-slate-800'
                  }`}
                >
                  <img
                    src={customArtworkDataUrl}
                    alt="Custom artwork"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/70 text-[10px] text-amber-200 truncate">
                    独自アート
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Liner notes text */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              楽曲の背景・想い（ライナーノーツ）
            </label>
            <textarea
              rows={4}
              value={linerNotes}
              onChange={(e) => setLinerNotes(e.target.value)}
              placeholder="この曲を作った背景や、どんな時に聴いてほしいかなどを自由に記述できます..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-amber-300 resize-y leading-relaxed"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              閉じる
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-semibold text-slate-950 bg-amber-200 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-all shadow-md cursor-pointer"
            >
              {isSubmitting ? '保存中...' : 'アップロードを完了して保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
