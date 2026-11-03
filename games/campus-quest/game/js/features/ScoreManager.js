export default class ScoreManager {
  constructor({
    maxScore = 100,
    wrongClickPenalty = 5,
    maxTimePenalty = 20,
  } = {}) {
    this.maxScore = Math.max(0, Number(maxScore) || 100);

    this.wrongClickPenalty = Math.max(0, Number(wrongClickPenalty) || 0);

    this.maxTimePenalty = Math.max(0, Number(maxTimePenalty) || 0);

    /*
      Wrong-object penalties are applied immediately.

      The timer penalty is calculated separately from the
      player's elapsed puzzle-solving time.
    */
    this.scoreBeforeTime = this.maxScore;
  }

  reset() {
    this.scoreBeforeTime = this.maxScore;

    return this.scoreBeforeTime;
  }

  add(points) {
    const amount = Math.max(0, Number(points) || 0);

    this.scoreBeforeTime = Math.min(
      this.maxScore,
      this.scoreBeforeTime + amount,
    );

    return this.scoreBeforeTime;
  }

  subtract(points) {
    const amount = Math.max(0, Number(points) || 0);

    this.scoreBeforeTime = Math.max(0, this.scoreBeforeTime - amount);

    return this.scoreBeforeTime;
  }

  registerWrongClick() {
    return this.subtract(this.wrongClickPenalty);
  }

  /*
    Calculates the whole-number timer penalty.

    Before perfectTimeSeconds:
      no timer penalty

    After perfectTimeSeconds:
      penalty gradually increases

    At durationSeconds:
      maximum timer penalty
  */
  getTimePenalty(
    elapsedSeconds,
    { durationSeconds = 0, perfectTimeSeconds = 0 } = {},
  ) {
    const duration = Math.max(0, Number(durationSeconds) || 0);

    const perfectTime = Math.max(0, Number(perfectTimeSeconds) || 0);

    const elapsed = Math.max(0, Number(elapsedSeconds) || 0);

    if (this.maxTimePenalty <= 0 || duration <= 0) {
      return 0;
    }

    /*
      A player who finishes within the perfect-time target
      keeps the full timer portion of their score.
    */
    if (elapsed <= perfectTime) {
      return 0;
    }

    /*
      Protect against an invalid level configuration where
      perfectTimeSeconds is equal to or greater than the
      total duration.
    */
    if (duration <= perfectTime) {
      return this.maxTimePenalty;
    }

    const progress = (elapsed - perfectTime) / (duration - perfectTime);

    const penalty = Math.round(this.maxTimePenalty * progress);

    return Math.min(this.maxTimePenalty, Math.max(0, penalty));
  }

  /*
    Returns the player's current or final whole-number score.

    Final score =
      maximum score
      - wrong click penalties
      - timer penalty
  */
  getScore(elapsedSeconds = 0, timerConfig = {}) {
    const timePenalty = this.getTimePenalty(elapsedSeconds, timerConfig);

    return Math.max(0, Math.round(this.scoreBeforeTime - timePenalty));
  }

  getScoreBeforeTime() {
    return Math.max(0, Math.round(this.scoreBeforeTime));
  }
}
