/**
 * AudioManager – procedural audio via Web Audio API.
 * Zero external files. All sounds generated at runtime.
 *
 * Usage:
 *   import { audioManager } from '../audio/AudioManager';
 *   audioManager.playSuccess();
 *   audioManager.playWrong();
 *   const nowMuted = audioManager.toggleMute();
 */

interface ToneOpts {
  freq:      number;
  startTime: number;
  attack:    number;
  hold:      number;
  release:   number;
  peak:      number;
  type:      OscillatorType;
}

class AudioManager {
  private ctx:    AudioContext | null = null;
  private master: GainNode    | null = null;
  private _muted                     = false;

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Unlock AudioContext – call once on first user gesture.
   * Subsequent calls are no-ops.
   */
  unlock(): void {
    this.ensure();
  }

  /** Rising C-major arpeggio: cheerful, gentle, 4 tones. */
  playSuccess(): void {
    if (this._muted) return;
    const env = this.ensure();
    if (!env) return;
    const { ctx, master } = env;

    // C5 → E5 → G5 → C6
    const freqs = [523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((freq, i) => {
      this.tone(ctx, master, {
        freq,
        startTime: ctx.currentTime + i * 0.090,
        attack:    0.012,
        hold:      0.055,
        release:   0.160,
        peak:      0.26,
        type:      'sine',
      });
    });
  }

  /** Soft descending two-note: informative, not punishing. */
  playWrong(): void {
    if (this._muted) return;
    const env = this.ensure();
    if (!env) return;
    const { ctx, master } = env;

    // B3 → G3
    this.tone(ctx, master, {
      freq:      246.94,
      startTime: ctx.currentTime,
      attack:    0.012,
      hold:      0.080,
      release:   0.200,
      peak:      0.16,
      type:      'sine',
    });
    this.tone(ctx, master, {
      freq:      196.00,
      startTime: ctx.currentTime + 0.160,
      attack:    0.012,
      hold:      0.080,
      release:   0.200,
      peak:      0.12,
      type:      'sine',
    });
  }

  /** Toggle global mute. Returns the new muted state. */
  toggleMute(): boolean {
    this._muted = !this._muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(
        this._muted ? 0 : 0.70,
        this.ctx.currentTime,
        0.04,
      );
    }
    return this._muted;
  }

  get isMuted(): boolean { return this._muted; }

  // ── Private ────────────────────────────────────────────────────────────

  private ensure(): { ctx: AudioContext; master: GainNode } | null {
    try {
      if (!this.ctx) {
        this.ctx   = new AudioContext();
        this.master = this.ctx.createGain();
        this.master.gain.setValueAtTime(this._muted ? 0 : 0.70, this.ctx.currentTime);
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
      return { ctx: this.ctx, master: this.master! };
    } catch {
      return null;
    }
  }

  private tone(ctx: AudioContext, dest: AudioNode, o: ToneOpts): void {
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = o.type;
    osc.frequency.setValueAtTime(o.freq, o.startTime);

    gain.gain.setValueAtTime(0, o.startTime);
    gain.gain.linearRampToValueAtTime(o.peak, o.startTime + o.attack);
    gain.gain.setValueAtTime(o.peak, o.startTime + o.attack + o.hold);
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      o.startTime + o.attack + o.hold + o.release,
    );

    osc.connect(gain);
    gain.connect(dest);

    osc.start(o.startTime);
    osc.stop(o.startTime + o.attack + o.hold + o.release + 0.05);
  }
}

/** Singleton – import and use directly in any scene. */
export const audioManager = new AudioManager();
