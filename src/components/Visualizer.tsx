import React, { useEffect, useRef, useState } from 'react';
import { audioEngine } from '../utils/audioEngine';
import { Waves, Sparkles, CircleDot } from 'lucide-react';

interface VisualizerProps {
  isPlaying: boolean;
}

type VisualizerMode = 'water' | 'firefly' | 'aura';

export const Visualizer: React.FC<VisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('water');
  const animFrameId = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  // Particles for firefly mode
  const particlesRef = useRef<Array<{ x: number; y: number; r: number; vy: number; vx: number; alpha: number; baseAlpha: number }>>([]);

  useEffect(() => {
    // Generate initial calm particles
    particlesRef.current = Array.from({ length: 42 }, () => ({
      x: Math.random() * 800,
      y: Math.random() * 260,
      r: 1.5 + Math.random() * 2.5,
      vy: -(0.2 + Math.random() * 0.4),
      vx: (Math.random() - 0.5) * 0.3,
      alpha: 0.2 + Math.random() * 0.5,
      baseAlpha: 0.2 + Math.random() * 0.5,
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let destroyed = false;

    const render = () => {
      if (destroyed) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const analyser = audioEngine.getAnalyser();
      const bufferLength = analyser ? analyser.frequencyBinCount : 128;
      const dataArray = new Uint8Array(bufferLength);

      if (analyser && isPlaying) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Idle gentle simulated breathing when paused
        const idleTime = Date.now() * 0.0015;
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.max(12, Math.sin(idleTime + i * 0.15) * 16 + 24);
        }
      }

      // Calculate low/mid energy
      let lowEnergy = 0;
      for (let i = 0; i < 16; i++) lowEnergy += dataArray[i];
      lowEnergy = lowEnergy / 16 / 255; // 0..1

      phaseRef.current += isPlaying ? 0.02 + lowEnergy * 0.02 : 0.01;

      if (mode === 'water') {
        // Harmonious fluid waves
        const wavesCount = 3;
        for (let w = 0; w < wavesCount; w++) {
          ctx.beginPath();
          const baseHeight = height * (0.65 + w * 0.1);
          ctx.moveTo(0, height);
          ctx.lineTo(0, baseHeight);

          const step = width / 40;
          for (let x = 0; x <= width; x += step) {
            const freqIdx = Math.floor((x / width) * 32);
            const freqVal = (dataArray[freqIdx] || 20) / 255;
            const waveY =
              Math.sin(phaseRef.current * (1 + w * 0.4) + x * 0.012 + w) * (18 + freqVal * 32) +
              Math.cos(phaseRef.current * 0.6 + x * 0.02) * (10 + freqVal * 15);
            ctx.lineTo(x, baseHeight + waveY);
          }

          ctx.lineTo(width, height);
          ctx.closePath();

          const grad = ctx.createLinearGradient(0, baseHeight - 40, 0, height);
          if (w === 0) {
            grad.addColorStop(0, 'rgba(217, 180, 130, 0.22)');
            grad.addColorStop(1, 'rgba(12, 15, 22, 0.0)');
          } else if (w === 1) {
            grad.addColorStop(0, 'rgba(120, 160, 185, 0.18)');
            grad.addColorStop(1, 'rgba(12, 15, 22, 0.0)');
          } else {
            grad.addColorStop(0, 'rgba(90, 120, 145, 0.12)');
            grad.addColorStop(1, 'rgba(12, 15, 22, 0.0)');
          }

          ctx.fillStyle = grad;
          ctx.fill();
        }
      } else if (mode === 'firefly') {
        // Ethereal floating light particles
        const particles = particlesRef.current;
        particles.forEach((p) => {
          p.y += p.vy * (1 + lowEnergy * 1.5);
          p.x += p.vx + Math.sin(phaseRef.current + p.y * 0.05) * 0.2;
          if (p.y < 0) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          const currentAlpha = Math.min(1, p.baseAlpha + lowEnergy * 0.6);
          const currentRadius = p.r * (1 + lowEnergy * 0.8);

          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentRadius * 3);
          grad.addColorStop(0, `rgba(251, 230, 180, ${currentAlpha})`);
          grad.addColorStop(0.4, `rgba(217, 180, 130, ${currentAlpha * 0.4})`);
          grad.addColorStop(1, 'rgba(217, 180, 130, 0)');

          ctx.beginPath();
          ctx.arc(p.x, p.y, currentRadius * 3, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
        });
      } else if (mode === 'aura') {
        // Breathing aura rings
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) * 0.45;
        const rings = 4;

        for (let r = 0; r < rings; r++) {
          const ringProgress = (phaseRef.current * 0.18 + r / rings) % 1;
          const currentRadius = 30 + ringProgress * maxRadius * (1 + lowEnergy * 0.35);
          const ringAlpha = (1 - ringProgress) * 0.35 * (0.4 + lowEnergy * 0.6);

          ctx.beginPath();
          ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(235, 205, 155, ${ringAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }

      ctx.restore();
      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      destroyed = true;
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isPlaying, mode]);

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-slate-900/40 border border-slate-800/60 p-3">
      {/* Visualizer Mode Controls (Interactive Tab Buttons) */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 p-1 bg-slate-950/70 backdrop-blur-md rounded-lg border border-slate-800/80 text-xs">
        <button
          onClick={() => setMode('water')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            mode === 'water' ? 'bg-slate-800 text-amber-200 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="波紋・水面"
        >
          <Waves className="w-3 h-3" />
          <span className="hidden sm:inline">水面</span>
        </button>
        <button
          onClick={() => setMode('firefly')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            mode === 'firefly' ? 'bg-slate-800 text-amber-200 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="微光・蛍"
        >
          <Sparkles className="w-3 h-3" />
          <span className="hidden sm:inline">微光</span>
        </button>
        <button
          onClick={() => setMode('aura')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            mode === 'aura' ? 'bg-slate-800 text-amber-200 shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
          title="呼吸オーラ"
        >
          <CircleDot className="w-3 h-3" />
          <span className="hidden sm:inline">呼吸</span>
        </button>
      </div>

      <div className="absolute top-3 left-4 z-10 flex items-center gap-2 text-xs text-slate-400">
        <span className="font-medium tracking-wide">リアルタイム音響ビジュアライザー</span>
        <span aria-hidden="true">·</span>
        <span>{isPlaying ? '再生中' : '待機中'}</span>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full h-44 sm:h-52 block rounded-lg cursor-default"
      />
    </div>
  );
};
