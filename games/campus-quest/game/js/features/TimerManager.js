export default class TimerManager {
  constructor() {
    this.timerId = null;

    this.totalSeconds = 0;
    this.remainingSeconds = 0;

    this.onTick = null;
    this.onFinish = null;

    this.deadline = null;

    this.running = false;
    this.finished = false;
  }

  /*
    Start a new countdown.

    onTick:
      runs whenever the displayed second changes

    onFinish:
      runs when the timer reaches zero
  */
  start(seconds, onTick, onFinish) {
    this.stop();

    this.totalSeconds = Math.max(0, Math.floor(Number(seconds) || 0));

    this.remainingSeconds = this.totalSeconds;

    this.onTick = onTick || null;

    this.onFinish = onFinish || null;

    this.finished = false;

    if (this.onTick) {
      this.onTick(this.remainingSeconds);
    }

    if (this.totalSeconds <= 0) {
      this.finished = true;

      if (this.onFinish) {
        this.onFinish();
      }

      return;
    }

    this.resume();
  }

  /*
    Continue a paused timer.
  */
  resume() {
    if (this.running || this.finished || this.remainingSeconds <= 0) {
      return;
    }

    this.running = true;

    this.deadline = Date.now() + this.remainingSeconds * 1000;

    /*
      Update several times each second.

      This prevents browser timing delays from causing the
      displayed countdown to drift too much.
    */
    this.timerId = window.setInterval(() => this.update(), 250);
  }

  /*
    Pause the timer while keeping the remaining time.

    We use this while the player reads a clue-discovered
    story popup.
  */
  pause() {
    if (!this.running) {
      return;
    }

    this.update(false);

    this.clearInterval();

    this.running = false;
  }

  update(allowFinish = true) {
    if (!this.running || !this.deadline) {
      return;
    }

    const millisecondsLeft = this.deadline - Date.now();

    const nextRemaining = Math.max(0, Math.ceil(millisecondsLeft / 1000));

    if (nextRemaining !== this.remainingSeconds) {
      this.remainingSeconds = nextRemaining;

      if (this.onTick) {
        this.onTick(this.remainingSeconds);
      }
    }

    if (allowFinish && this.remainingSeconds <= 0 && !this.finished) {
      this.finished = true;
      this.running = false;

      this.clearInterval();

      if (this.onFinish) {
        this.onFinish();
      }
    }
  }

  /*
    Active puzzle-solving time.

    Because the countdown is paused during story popups,
    popup-reading time is not included here.
  */
  getElapsedSeconds() {
    return Math.max(0, this.totalSeconds - this.remainingSeconds);
  }

  getRemainingSeconds() {
    return Math.max(0, this.remainingSeconds);
  }

  isRunning() {
    return this.running;
  }

  clearInterval() {
    if (!this.timerId) {
      return;
    }

    window.clearInterval(this.timerId);

    this.timerId = null;
  }

  stop() {
    this.clearInterval();

    this.running = false;
    this.deadline = null;
  }
}
