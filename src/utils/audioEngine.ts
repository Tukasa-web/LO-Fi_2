/**
 * Web Audio Engine for Real-time Visualizer Analysis,
 * Ambient Environment Layers (Rain, Vinyl, Wind),
 * and Calming Generative Ambient Synthesis for the default single track.
 */

class AudioEngineManager {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private currentElement: HTMLAudioElement | null = null;

  // Ambient soundscape nodes
  private rainGain: GainNode | null = null;
  private rainNode: AudioNode | null = null;
  private vinylGain: GainNode | null = null;
  private vinylInterval: number | null = null;
  private windGain: GainNode | null = null;
  private windNode: AudioNode | null = null;

  // Generative Synth
  private isGenPlaying = false;
  private genTimer: number | null = null;
  private genGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    if (!this.analyser && this.ctx) {
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.88;
    }
  }

  public getContext(): AudioContext | null {
    this.initContext();
    return this.ctx;
  }

  public getAnalyser(): AnalyserNode | null {
    this.initContext();
    return this.analyser;
  }

  public attachAudioElement(audioElement: HTMLAudioElement) {
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    if (this.currentElement === audioElement && this.mediaSource) {
      return;
    }

    try {
      if (this.mediaSource) {
        this.mediaSource.disconnect();
      }
      this.mediaSource = this.ctx.createMediaElementSource(audioElement);
      this.mediaSource.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
      this.currentElement = audioElement;
    } catch {
      // Audio element may already be connected or cross-origin
    }
  }

  // --- AMBIENT SOUNDSCAPE: RAIN ---
  public setRainVolume(volume: number) {
    this.initContext();
    if (!this.ctx) return;

    if (!this.rainGain) {
      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.rainGain.connect(this.ctx.destination);
      if (this.analyser) {
        this.rainGain.connect(this.analyser);
      }
      this.startRainNoise();
    }

    this.rainGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume * 0.4)), this.ctx.currentTime, 0.1);
  }

  private startRainNoise() {
    if (!this.ctx || !this.rainGain) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pink noise filtering
      lastOut = (lastOut * 0.95) + (white * 0.05);
      data[i] = lastOut * 3;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to make gentle rainfall sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1100, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(280, this.ctx.currentTime);

    noise.connect(highpass);
    highpass.connect(filter);
    filter.connect(this.rainGain);
    noise.start(0);
    this.rainNode = noise;
  }

  // --- AMBIENT SOUNDSCAPE: VINYL CRACKLE ---
  public setVinylVolume(volume: number) {
    this.initContext();
    if (!this.ctx) return;

    if (!this.vinylGain) {
      this.vinylGain = this.ctx.createGain();
      this.vinylGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.vinylGain.connect(this.ctx.destination);
      this.startVinylNoise();
    }

    this.vinylGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume * 0.35)), this.ctx.currentTime, 0.1);
  }

  private startVinylNoise() {
    if (!this.ctx || !this.vinylGain) return;
    // Periodic gentle clicks & pops
    const triggerPop = () => {
      if (!this.ctx || !this.vinylGain) return;
      const popTime = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 1200, popTime);
      popGain.gain.setValueAtTime(0.08 * (0.3 + Math.random() * 0.7), popTime);
      popGain.gain.exponentialRampToValueAtTime(0.0001, popTime + 0.015);

      osc.connect(popGain);
      popGain.connect(this.vinylGain);
      osc.start(popTime);
      osc.stop(popTime + 0.02);
    };

    if (this.vinylInterval) clearInterval(this.vinylInterval);
    this.vinylInterval = window.setInterval(() => {
      if (Math.random() > 0.4) {
        triggerPop();
      }
    }, 180);
  }

  // --- AMBIENT SOUNDSCAPE: NIGHT WIND ---
  public setWindVolume(volume: number) {
    this.initContext();
    if (!this.ctx) return;

    if (!this.windGain) {
      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.windGain.connect(this.ctx.destination);
      this.startWindNoise();
    }

    this.windGain.gain.setTargetAtTime(Math.max(0, Math.min(1, volume * 0.45)), this.ctx.currentTime, 0.15);
  }

  private startWindNoise() {
    if (!this.ctx || !this.windGain) return;
    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.7;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);
    filter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    // LFO to modulate wind frequency slowly like breathing
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(0);

    noise.connect(filter);
    filter.connect(this.windGain);
    noise.start(0);
    this.windNode = noise;
  }

  // --- GENERATIVE SOOTHING AMBIENT PIANO / CHORDS (Matches the ballad progression) ---
  public startGenerativeTrack(onEnded?: () => void) {
    this.initContext();
    if (!this.ctx || !this.analyser) return;

    this.isGenPlaying = true;
    if (!this.genGain) {
      this.genGain = this.ctx.createGain();
      this.genGain.gain.setValueAtTime(0.42, this.ctx.currentTime);
      this.genGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    // Ballad Progression: Em9 -> Cmaj9 -> Bm7 -> Am9 -> D9 -> Gmaj7
    const chords = [
      [82.41, 164.81, 196.00, 246.94, 293.66], // Em9
      [65.41, 130.81, 196.00, 246.94, 329.63], // Cmaj9
      [110.00, 164.81, 220.00, 261.63, 329.63], // Am9
      [73.42, 146.83, 220.00, 261.63, 369.99], // D9
      [98.00, 146.83, 196.00, 246.94, 369.99], // Gmaj7
      [65.41, 130.81, 196.00, 246.94, 392.00], // Cmaj7
      [73.42, 146.83, 220.00, 261.63, 329.63], // D7sus4
      [98.00, 196.00, 246.94, 293.66, 392.00], // G
    ];

    let chordIdx = 0;

    const playChord = () => {
      if (!this.isGenPlaying || !this.ctx || !this.genGain) return;
      const notes = chords[chordIdx % chords.length];
      chordIdx++;

      notes.forEach((freq, i) => {
        const noteTime = this.ctx!.currentTime + i * 0.16;
        const osc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(850, noteTime);
        filter.frequency.exponentialRampToValueAtTime(320, noteTime + 4.0);

        noteGain.gain.setValueAtTime(0.001, noteTime);
        noteGain.gain.linearRampToValueAtTime(0.09 / (i === 0 ? 1 : 1.5), noteTime + 0.28);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 4.2);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.genGain!);

        osc.start(noteTime);
        osc.stop(noteTime + 4.5);
      });

      this.genTimer = window.setTimeout(playChord, 3800);
    };

    playChord();
  }

  public stopGenerativeTrack() {
    this.isGenPlaying = false;
    if (this.genTimer) {
      clearTimeout(this.genTimer);
      this.genTimer = null;
    }
  }

  public isGenerativePlaying(): boolean {
    return this.isGenPlaying;
  }
}

export const audioEngine = new AudioEngineManager();
