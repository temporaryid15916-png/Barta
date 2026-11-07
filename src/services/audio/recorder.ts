/**
 * BARTA Voice Recorder & Waveform Analyzer
 * Real-time MediaRecorder API with audio sampling for waveform visualization
 * @license Apache-2.0
 */

export interface RecordedAudioData {
  blob: Blob;
  url: string;
  duration: number;
  waveform: number[];
}

export class VoiceRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private animFrameId: number | null = null;
  private startTime: number = 0;
  private waveformSamples: number[] = [];
  private onWaveformUpdate?: (waveform: number[], currentDuration: number) => void;

  public async startRecording(
    onUpdate?: (waveform: number[], currentDuration: number) => void
  ): Promise<boolean> {
    this.onWaveformUpdate = onUpdate;
    this.audioChunks = [];
    this.waveformSamples = [];
    this.startTime = Date.now();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // Setup audio analysis for live waveform
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.stream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      // Determine best audio mime type supported
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = ''; // Let browser choose default
        }
      }

      this.mediaRecorder = mimeType
        ? new MediaRecorder(this.stream, { mimeType })
        : new MediaRecorder(this.stream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100); // 100ms chunk slice
      this.startWaveformSampling();
      return true;
    } catch (err) {
      console.error('Failed to access microphone for recording:', err);
      this.cleanup();
      throw err;
    }
  }

  private startWaveformSampling(): void {
    if (!this.analyser) return;
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);

    let lastSampleTime = Date.now();

    const sample = () => {
      if (!this.analyser || !this.mediaRecorder || this.mediaRecorder.state !== 'recording') {
        return;
      }

      this.analyser.getByteFrequencyData(dataArray);

      // Average energy
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      // Normalize 0.05 to 1.0
      const normalized = Math.max(0.08, Math.min(1.0, avg / 128));

      const now = Date.now();
      if (now - lastSampleTime >= 80) { // Every 80ms sample a wave bar
        this.waveformSamples.push(parseFloat(normalized.toFixed(2)));
        // Keep max 64 recent samples
        if (this.waveformSamples.length > 64) {
          this.waveformSamples.shift();
        }
        lastSampleTime = now;
        const currentDuration = Math.round((now - this.startTime) / 1000);
        this.onWaveformUpdate?.(this.waveformSamples, currentDuration);
      }

      this.animFrameId = requestAnimationFrame(sample);
    };

    this.animFrameId = requestAnimationFrame(sample);
  }

  public stopRecording(): Promise<RecordedAudioData> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('Recorder not active'));
        return;
      }

      const totalDuration = Math.max(1, Math.round((Date.now() - this.startTime) / 1000));

      this.mediaRecorder.onstop = () => {
        try {
          const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
          const blob = new Blob(this.audioChunks, { type: mimeType });
          const url = URL.createObjectURL(blob);
          const finalWaveform = this.waveformSamples.length > 0
            ? [...this.waveformSamples]
            : Array.from({ length: 24 }, () => 0.2 + Math.random() * 0.6);

          resolve({
            blob,
            url,
            duration: totalDuration,
            waveform: finalWaveform,
          });
        } catch (e) {
          reject(e);
        } finally {
          this.cleanup();
        }
      };

      try {
        this.mediaRecorder.stop();
      } catch (err) {
        this.cleanup();
        reject(err);
      }
    });
  }

  public cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }

  private cleanup(): void {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.analyser = null;
    this.mediaRecorder = null;
  }
}
