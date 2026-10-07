const MUSIC_TRACKS = {
  1: "assets/audio/music/nivel-1.mp3",
  2: "assets/audio/music/nivel-2.mp3",
  3: "assets/audio/music/nivel-3.mp3",
  final: "assets/audio/music/final.mp3",
};

const EFFECT_FILES = {
  jump: "assets/audio/sfx/jump.wav",
  star: "assets/audio/sfx/star.wav",
  damage: "assets/audio/sfx/damage.wav",
  attack: "assets/audio/sfx/attack.wav",
  interaction: "assets/audio/sfx/interaction.wav",
  victory: "assets/audio/sfx/victory.wav",
};

const EFFECT_TONES = {
  jump: { frequency: 430, endFrequency: 700, duration: 0.12, type: "square", volume: 0.045 },
  star: { frequency: 880, endFrequency: 1320, duration: 0.2, type: "sine", volume: 0.055 },
  damage: { frequency: 170, endFrequency: 85, duration: 0.18, type: "sawtooth", volume: 0.05 },
  attack: { frequency: 260, endFrequency: 120, duration: 0.09, type: "square", volume: 0.045 },
  interaction: { frequency: 620, endFrequency: 820, duration: 0.22, type: "sine", volume: 0.05 },
  victory: { frequency: 660, endFrequency: 990, duration: 0.35, type: "sine", volume: 0.06 },
};

export class AudioManager {
  constructor() {
    this.music = new Audio();
    this.music.loop = true;
    this.music.volume = 0.7;
    this.music.preload = "none";
    this.currentTrack = null;
    this.isUnlocked = false;
    this.audioContext = null;
    this.fileAvailability = new Map();
  }

  async unlock() {
    this.isUnlocked = true;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!this.audioContext) this.audioContext = new AudioContextClass();
    if (this.audioContext.state === "suspended") await this.audioContext.resume();
    this.prepareEffectFiles();
  }

  async playMusic(track) {
    const source = MUSIC_TRACKS[track];
    if (!source || !this.isUnlocked || this.currentTrack === source) return;
    if (!(await this.isFileAvailable(source))) return;
    this.music.pause();
    this.music.currentTime = 0;
    this.music.src = source;
    this.currentTrack = source;
    try {
      await this.music.play();
    } catch {
      // El navegador puede bloquear la reproducción o el desarrollador aún no
      // haber aportado la pista. El juego continúa sin bloquearse.
    }
  }

  stopMusic() {
    this.music.pause();
    this.music.currentTime = 0;
    this.currentTrack = null;
  }

  pauseMusic() {
    this.music.pause();
  }

  resumeMusic() {
    if (!this.isUnlocked || !this.currentTrack) return;
    this.music.play().catch(() => {});
  }

  playEffect(name) {
    if (!this.isUnlocked || !EFFECT_TONES[name]) return;
    // Mientras se comprueba la existencia del archivo se usa el tono breve.
    // Así evitamos solicitar un .wav inexistente justo después del primer toque.
    if (this.fileAvailability.get(EFFECT_FILES[name]) !== true) {
      this.playSynthEffect(name);
      return;
    }
    const sound = new Audio(EFFECT_FILES[name]);
    sound.volume = 0.52;
    sound.play().catch(() => this.playSynthEffect(name));
  }

  playSynthEffect(name) {
    if (!this.audioContext) return;
    const tone = EFFECT_TONES[name];
    const now = this.audioContext.currentTime;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    oscillator.type = tone.type;
    oscillator.frequency.setValueAtTime(tone.frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(tone.endFrequency, now + tone.duration);
    gain.gain.setValueAtTime(tone.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + tone.duration);
    oscillator.connect(gain).connect(this.audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + tone.duration);
  }

  async prepareEffectFiles() {
    await Promise.all(Object.values(EFFECT_FILES).map((source) => this.isFileAvailable(source)));
  }

  async isFileAvailable(source) {
    if (this.fileAvailability.has(source)) return this.fileAvailability.get(source);
    try {
      const response = await fetch(source, { method: "HEAD", cache: "no-store" });
      const available = response.ok;
      this.fileAvailability.set(source, available);
      return available;
    } catch {
      this.fileAvailability.set(source, false);
      return false;
    }
  }

}

export { EFFECT_FILES, MUSIC_TRACKS };
