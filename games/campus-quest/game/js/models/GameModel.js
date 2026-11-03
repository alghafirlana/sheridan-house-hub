export default class GameModel {
  constructor(levelData) {
    /*
      Keep the complete clue pool separately.

      Level 3 can contain 12 possible clues while only
      exposing 6 selected clues to the actual playthrough.
    */
    this.allSteps = Array.isArray(levelData.steps) ? [...levelData.steps] : [];

    /* -------------------------------------------------------
       RANDOM CLUE SELECTION
    ------------------------------------------------------- */

    if (levelData.settings?.randomizeObjects) {
      const requestedCount = Math.max(
        1,
        Math.floor(
          Number(levelData.settings.randomClueCount) || this.allSteps.length,
        ),
      );

      this.steps = this.getRandomSteps(
        this.allSteps,
        Math.min(requestedCount, this.allSteps.length),
      );
    } else {
      /*
        Normal levels keep their normal fixed order.
      */
      this.steps = [...this.allSteps];
    }

    /*
      IMPORTANT:

      The VIEW receives model.level.

      Therefore model.level.steps must contain the selected
      playthrough clues, not the complete 12-clue pool.

      Level 3:
        source pool = 12
        displayed/played = 6

      Levels 1 and 2:
        unchanged
    */
    this.level = {
      ...levelData,

      steps: this.steps,
    };

    this.currentStepIndex = 0;
  }

  /* ---------------------------------------------------------
     RANDOM UNIQUE CLUES

     Fisher-Yates shuffle gives us a random order.

     We then take only the requested number of clues.

     No clue can repeat during the same playthrough.
  --------------------------------------------------------- */

  getRandomSteps(steps, count) {
    const shuffled = [...steps];

    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(Math.random() * (index + 1));

      [shuffled[index], shuffled[randomIndex]] = [
        shuffled[randomIndex],
        shuffled[index],
      ];
    }

    return shuffled.slice(0, count);
  }

  getCurrentStep() {
    return this.steps[this.currentStepIndex];
  }

  getTotalSteps() {
    return this.steps.length;
  }

  isCorrectObject(objectId) {
    return objectId === this.getCurrentStep().id;
  }

  getWrongMessage(objectId) {
    const step = this.getCurrentStep();

    if (step.wrongAnswers && step.wrongAnswers[objectId]) {
      return step.wrongAnswers[objectId];
    }

    return (
      step.defaultWrongMessage || "That doesn't match the clue. Try again."
    );
  }

  isLastStep() {
    return this.currentStepIndex === this.steps.length - 1;
  }

  nextStep() {
    if (this.isLastStep()) {
      return false;
    }

    this.currentStepIndex += 1;

    return true;
  }

  reset() {
    this.currentStepIndex = 0;
  }
}
