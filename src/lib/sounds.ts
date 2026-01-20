// Sound utility for subtle audio feedback
// Using Web Audio API for lightweight, professional sounds

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gainNode.gain.value = volume;

      // Fade out for smooth sound
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }

  // Success sound - pleasant ascending chime
  playSuccess() {
    this.playTone(523.25, 0.1, 'sine', 0.08); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.08), 50); // E5
    setTimeout(() => this.playTone(783.99, 0.15, 'sine', 0.06), 100); // G5
  }

  // Error sound - subtle low tone
  playError() {
    this.playTone(220, 0.15, 'triangle', 0.08); // A3
    setTimeout(() => this.playTone(196, 0.2, 'triangle', 0.06), 100); // G3
  }

  // Warning sound - attention-getting but not alarming
  playWarning() {
    this.playTone(440, 0.1, 'sine', 0.06); // A4
    setTimeout(() => this.playTone(440, 0.1, 'sine', 0.06), 150); // A4 repeat
  }

  // Click/tap feedback
  playClick() {
    this.playTone(1000, 0.03, 'sine', 0.04);
  }

  // Delete/remove action
  playDelete() {
    this.playTone(392, 0.1, 'sine', 0.06); // G4
    setTimeout(() => this.playTone(349.23, 0.15, 'sine', 0.05), 80); // F4
  }

  // Notification
  playNotification() {
    this.playTone(587.33, 0.08, 'sine', 0.06); // D5
    setTimeout(() => this.playTone(783.99, 0.12, 'sine', 0.05), 100); // G5
  }
}

export const soundManager = new SoundManager();
export default soundManager;
