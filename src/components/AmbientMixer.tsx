import React, { useState } from 'react';
import { CloudRain, Disc, Wind, RotateCcw, Volume2, Sparkles } from 'lucide-react';
import { audioEngine } from '../utils/audioEngine';

export const AmbientMixer: React.FC = () => {
  const [rain, setRain] = useState<number>(0);
  const [vinyl, setVinyl] = useState<number>(0);
  const [wind, setWind] = useState<number>(0);

  const handleRainChange = (val: number) => {
    setRain(val);
    audioEngine.setRainVolume(val);
  };

  const handleVinylChange = (val: number) => {
    setVinyl(val);
    audioEngine.setVinylVolume(val);
  };

  const handleWindChange = (val: number) => {
    setWind(val);
    audioEngine.setWindVolume(val);
  };

  const handleReset = () => {
    handleRainChange(0);
    handleVinylChange(0);
    handleWindChange(0);
  };

  const applyPreset = (r: number, v: number, w: number) => {
    handleRainChange(r);
    handleVinylChange(v);
    handleWindChange(w);
  };

  return (
    <section id="soundscape" className="w-full scroll-mt-24">
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 lg:p-8 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-200/80 font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>環境音レイヤーミキサー</span>
            </div>
            <h2 className="text-xl font-semibold text-slate-100 tracking-tight">
              楽曲に重ねる、穏やかな環境音
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              あなたの曲を引き立てる自然の響きやアナログな温もり。お好みの配合でブレンドして、より深い没入感と安らぎを味わえます。
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>リセット</span>
            </button>
          </div>
        </div>

        {/* Preset quick buttons */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <span className="text-xs text-slate-400 mr-1">おすすめ配合:</span>
          <button
            onClick={() => applyPreset(0.35, 0.25, 0.15)}
            className="px-3 py-1 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-md transition-colors cursor-pointer"
          >
            雨上がりの夕暮れ
          </button>
          <button
            onClick={() => applyPreset(0.55, 0.1, 0.0)}
            className="px-3 py-1 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-md transition-colors cursor-pointer"
          >
            静かな雨音とピアノ
          </button>
          <button
            onClick={() => applyPreset(0.0, 0.45, 0.0)}
            className="px-3 py-1 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-md transition-colors cursor-pointer"
          >
            温かな深夜のレコード
          </button>
          <button
            onClick={() => applyPreset(0.1, 0.0, 0.4)}
            className="px-3 py-1 text-xs text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-md transition-colors cursor-pointer"
          >
            夜風の通り道
          </button>
        </div>

        {/* 3 Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rain */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-300">
                  <CloudRain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-200">穏やかな雨音</h3>
                  <span className="text-xs text-slate-400">Gentle Rain</span>
                </div>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                {Math.round(rain * 100)}%
              </span>
            </div>
            <div className="space-y-2 mt-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={rain}
                onChange={(e) => handleRainChange(parseFloat(e.target.value))}
                className="w-full accent-amber-300 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>無音</span>
                <span>しっとり</span>
                <span>しっかり</span>
              </div>
            </div>
          </div>

          {/* Vinyl */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-300">
                  <Disc className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-200">レコードの温もり</h3>
                  <span className="text-xs text-slate-400">Vinyl Crackle</span>
                </div>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                {Math.round(vinyl * 100)}%
              </span>
            </div>
            <div className="space-y-2 mt-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={vinyl}
                onChange={(e) => handleVinylChange(parseFloat(e.target.value))}
                className="w-full accent-amber-300 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>無音</span>
                <span>かすかな針音</span>
                <span>豊かな質感</span>
              </div>
            </div>
          </div>

          {/* Wind */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/60 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-300">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-200">夜風のささやき</h3>
                  <span className="text-xs text-slate-400">Night Breeze</span>
                </div>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-400">
                {Math.round(wind * 100)}%
              </span>
            </div>
            <div className="space-y-2 mt-4">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={wind}
                onChange={(e) => handleWindChange(parseFloat(e.target.value))}
                className="w-full accent-amber-300 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>無音</span>
                <span>微風</span>
                <span>深い呼吸</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Volume2 className="w-3.5 h-3.5 text-slate-400" />
            <span>環境音は楽曲の再生停止に関わらず、BGMや就寝用サウンドとしてもそのままご利用いただけます</span>
          </div>
        </div>
      </div>
    </section>
  );
};
