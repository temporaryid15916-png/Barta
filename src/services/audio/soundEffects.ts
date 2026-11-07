/**
 * BARTA Synthesized Sound & Ringtone Engine
 * Uses Web Audio API for zero-dependency, zero-missing-asset sound generation.
 * Works seamlessly offline and across all GitHub Pages base subdirectories.
 * @license Apache-2.0
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private ringtoneInterval: number | null = null;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Message sent sound - sleek rising cyber-blip
   */
  public playMessageSent(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(540, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  /**
   * Message received sound - harmonic crystal double-bell
   */
  public playMessageReceived(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const playTone = (freq: number, startOffset: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + startOffset);

        gain.gain.setValueAtTime(0.1, now + startOffset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + startOffset + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + startOffset);
        osc.stop(now + startOffset + duration);
      };

      playTone(784, 0, 0.18);      // G5
      playTone(1046.5, 0.07, 0.25); // C6
    } catch (e) {
      console.warn('Audio play failed:', e);
    }
  }

  /**
   * Outgoing call ringing tone (soft double pulse periodically)
   */
  public startOutgoingRingtone(): void {
    this.stopRingtone();
    const playRingCycle = () => {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(480, now + 0.2);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.setValueAtTime(0.001, now + 0.4);
      gain.gain.setValueAtTime(0.12, now + 0.55);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.0);
    };

    playRingCycle();
    this.ringtoneInterval = window.setInterval(playRingCycle, 2800);
  }

  /**
   * Incoming call ringtone (lush harmonic sequence)
   */
  public startIncomingRingtone(): void {
    this.stopRingtone();
    const playMelody = () => {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [
        { f: 587.33, t: 0, d: 0.18 },      // D5
        { f: 783.99, t: 0.16, d: 0.2 },    // G5
        { f: 880.00, t: 0.32, d: 0.22 },   // A5
        { f: 1174.66, t: 0.52, d: 0.35 }   // D6
      ];

      const now = ctx.currentTime;
      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, now + note.t);

        gain.gain.setValueAtTime(0.15, now + note.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + note.t + note.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.t);
        osc.stop(now + note.t + note.d);
      });
    };

    playMelody();
    this.ringtoneInterval = window.setInterval(playMelody, 2400);
  }

  /**
   * Stop any active ringtone
   */
  public stopRingtone(): void {
    if (this.ringtoneInterval !== null) {
      clearInterval(this.ringtoneInterval);
      this.ringtoneInterval = null;
    }
  }

  /**
   * Call connected chime
   */
  public playCallConnected(): void {
    this.stopRingtone();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.18);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Call ended cue
   */
  public playCallEnded(): void {
    this.stopRingtone();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.25);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }
}

export const sounds = new SoundEffectsEngine();
