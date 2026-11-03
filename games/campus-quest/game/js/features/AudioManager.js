// game/js/features/AudioManager.js

export default class AudioManager {
  constructor() {
    this.currentAudio = null;
  }

  play(url) {
    this.stop();

    if (!url) return;

    this.currentAudio = new Audio(url);

    return this.currentAudio.play();
  }

  stop() {
    if (!this.currentAudio) return;

    this.currentAudio.pause();
    this.currentAudio.currentTime = 0;
    this.currentAudio = null;
  }
}
