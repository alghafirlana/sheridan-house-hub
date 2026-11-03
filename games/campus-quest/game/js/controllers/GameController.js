import AudioManager from "../features/AudioManager.js";
import ScoreManager from "../features/ScoreManager.js";
import TimerManager from "../features/TimerManager.js";

import levels from "../../../levels/manifest.js";


/* =========================================================
   IMPLEMENTED LEVELS
========================================================= */

const implementedLevels = levels
  .filter((level) => level.implemented)
  .sort((a, b) => a.id - b.id);

/* =========================================================
   GAME CONTROLLER
========================================================= */

export default class GameController {
  constructor(model, view, { user, progressStore, onFinished = () => {} } = {}) {
    this.model = model;
    this.view = view;

    this.user = user;
    this.progressStore = progressStore;
    this.guestMode = false;
    this.onFinished = onFinished;

    if (!this.user?.id) {
      throw new Error("GameController requires a player session.");
    }

    if (!this.progressStore) {
      throw new Error("GameController requires a player progress store.");
    }

    /* =====================================================
       FEATURE MANAGERS
    ===================================================== */

    this.audioManager = new AudioManager();

    this.timerManager = new TimerManager();

    /* =====================================================
       LEVEL CONFIGURATION
    ===================================================== */

    this.scoringConfig = {
      maxScore: 100,
      wrongClickPenalty: 5,
      maxTimePenalty: 20,
      chancesPerClue: 3,

      ...(this.model.level.scoring || {}),
    };

    this.timerConfig = {
      durationSeconds: 0,
      perfectTimeSeconds: 0,

      ...(this.model.level.timer || {}),
    };

    this.scoringEnabled = Boolean(this.model.level.settings?.scoring);

    this.timerEnabled = Boolean(
      this.model.level.settings?.timer &&
      Number(this.timerConfig.durationSeconds) > 0,
    );

    this.scoreManager = new ScoreManager(this.scoringConfig);

    /* =====================================================
       GAME STATE
    ===================================================== */

    this.inputLocked = false;

    this.DEBUG_HOTSPOTS = false;

    this.autoPlayedAudioSteps = new Set();

    this.pendingAudioInteractionHandler = null;

    this.levelFinished = false;

    this.levelTimedOut = false;

    this.nextLevel = null;

    /* =====================================================
       CLUE CHANCES
    ===================================================== */

    this.maxChances = Math.max(
      1,
      Number(this.scoringConfig.chancesPerClue) || 3,
    );

    this.chancesLeft = this.maxChances;

    /*
      The stronger hint becomes active when the player reaches:
    */

    this.strongHintActive = false;

    this.objectHighlightActive = false;

    this.start();
  }

  /* =========================================================
     START LEVEL
  ========================================================= */

  start() {
    if (this.DEBUG_HOTSPOTS) {
      document.body.classList.add("debug-hotspots");
    }

    this.view.renderLevel(this.model.level);

    this.view.configurePerformance({
      scoringEnabled: this.scoringEnabled,

      timerEnabled: this.timerEnabled,

      maxScore: this.scoringConfig.maxScore,

      maxChances: this.maxChances,
    });

    /* =====================================================
       ROOM INTERACTION
    ===================================================== */

    this.view.bindRoomInteraction(
      (objectId, hotspot) => this.handleObjectClick(objectId, hotspot),

      () => this.handleEmptyRoomClick(),
    );

    /* =====================================================
       POPUP BUTTON
    ===================================================== */

    this.view.bindContinue(() => this.handleContinue());

    /* =====================================================
       AUDIO BUTTON
    ===================================================== */

    this.view.bindAudioClue(() => this.handleAudioClue());

    /* =====================================================
       HOME BUTTON
    ===================================================== */

    this.view.bindHome(() => {
      this.goHome();
    });

    this.view.bindLeaderboard(() => {
      this.goLeaderboard();
    });

    this.render();

    this.startTimer();
  }

  /* =========================================================
     RENDER CURRENT CLUE
  ========================================================= */

  render() {
    this.inputLocked = false;

    this.clearPendingAudioInteraction();

    this.audioManager.stop();

    this.view.clearHelpHighlight();

    const step = this.model.getCurrentStep();

    this.view.renderClue(
      step,

      this.model.currentStepIndex,

      this.model.getTotalSteps(),
    );

    this.view.updateProgress(this.model.currentStepIndex);

    this.view.updateChances(this.chancesLeft, this.maxChances);

    this.updateDisplayedScore();

    this.tryAutoPlayAudio(step);
  }

  /* =========================================================
     RESET CURRENT CLUE HELP / CHANCES

     Called whenever the player moves to a new clue.
  ========================================================= */

  resetClueState() {
    this.chancesLeft = this.maxChances;

    this.strongHintActive = false;

    this.objectHighlightActive = false;

    this.view.clearHelpHighlight();
  }

  /* =========================================================
     TIMER
  ========================================================= */

  startTimer() {
    if (!this.timerEnabled) {
      return;
    }

    const duration = Math.max(
      1,
      Math.floor(Number(this.timerConfig.durationSeconds) || 0),
    );

    this.timerManager.start(
      duration,

      (remainingSeconds) => {
        this.view.updateTimer(remainingSeconds);

        this.updateDisplayedScore();
      },

      () => this.handleTimeExpired(),
    );
  }

  pauseTimer() {
    if (this.timerEnabled) {
      this.timerManager.pause();
    }
  }

  resumeTimer() {
    if (this.timerEnabled && !this.levelFinished && !this.levelTimedOut) {
      this.timerManager.resume();
    }
  }

  handleTimeExpired() {
    if (this.levelFinished || this.levelTimedOut) {
      return;
    }

    this.levelTimedOut = true;

    this.inputLocked = true;

    this.clearPendingAudioInteraction();

    this.audioManager.stop();

    this.view.clearHelpHighlight();

    this.view.updateTimer(0);

    this.updateDisplayedScore();

    this.view.showTimeUp();
  }

  getElapsedSeconds() {
    if (!this.timerEnabled) {
      return null;
    }

    return this.timerManager.getElapsedSeconds();
  }

  /* =========================================================
     SCORE
  ========================================================= */

  getCurrentScore() {
    if (!this.scoringEnabled) {
      return 0;
    }

    const elapsedSeconds = this.getElapsedSeconds() || 0;

    return this.scoreManager.getScore(elapsedSeconds, this.timerConfig);
  }

  updateDisplayedScore() {
    if (!this.scoringEnabled) {
      return;
    }

    this.view.updateScore(
      this.getCurrentScore(),

      this.scoringConfig.maxScore,
    );
  }

  /* =========================================================
     REGISTER WRONG ATTEMPT
  ========================================================= */

  registerWrongAttempt() {
    if (this.chancesLeft <= 0) {
      return false;
    }

    this.chancesLeft -= 1;

    if (this.scoringEnabled) {
      this.scoreManager.registerWrongClick();

      this.updateDisplayedScore();
    }

    this.view.updateChances(this.chancesLeft, this.maxChances);

    return true;
  }

  /* =========================================================
     STRONGER HINT
  ========================================================= */

  activateStrongHint(step) {
    if (this.strongHintActive) {
      return;
    }

    this.strongHintActive = true;

    this.view.showHelpHint(step, false);
  }

  /* =========================================================
     HIGHLIGHT CORRECT OBJECT
  ========================================================= */

  activateObjectHighlight(step) {
    this.strongHintActive = true;

    this.objectHighlightActive = true;

    this.view.showHelpHint(step, true);

    this.view.highlightObject(step.id);
  }

  /* =========================================================
     HANDLE ANY WRONG CLICK
  ========================================================= */

  handleWrongAttempt(message, hotspot = null) {
    if (this.inputLocked) {
      return;
    }

    const step = this.model.getCurrentStep();

    /*
      If the object is already highlighted, additional wrong
      clicks do not remove points.
    */

    if (this.chancesLeft <= 0) {
      this.view.showHelpHint(step, true);

      return;
    }

    const counted = this.registerWrongAttempt();

    if (!counted) {
      return;
    }

    /*
      A clickable hotspot can flash when it was selected.

      Empty background clicks have no SVG element to flash.
    */

    if (hotspot) {
      this.view.flashWrong(hotspot);
    }

    /* -------------------------------------------------------
       LAST CHANCE
    ------------------------------------------------------- */

    if (this.chancesLeft === 1) {
      this.activateStrongHint(step);

      return;
    }

    /* -------------------------------------------------------
       NO CHANCES LEFT

    ------------------------------------------------------- */

    if (this.chancesLeft === 0) {
      this.activateObjectHighlight(step);

      return;
    }

    /*
      Normal feedback after the first wrong click.
    */

    this.view.showWrongFeedback(message);
  }

  /* =========================================================
     AUDIO AUTOPLAY
  ========================================================= */

  async tryAutoPlayAudio(step) {
    if (
      step.clueType !== "audio" ||
      !step.audioFile ||
      this.autoPlayedAudioSteps.has(step.id)
    ) {
      return;
    }

    this.autoPlayedAudioSteps.add(step.id);

    try {
      await this.audioManager.play(step.audioFile);
    } catch (error) {
      /*
        Some browsers block sound until the user interacts
        with the page.
      */

      console.info(
        "Autoplay blocked. Audio will play after the first user interaction.",
      );

      this.playAudioOnFirstInteraction(step);
    }
  }

  /* =========================================================
     PLAY AUDIO AFTER FIRST INTERACTION
  ========================================================= */

  playAudioOnFirstInteraction(step) {
    this.clearPendingAudioInteraction();

    const handler = (event) => {
      const currentStep = this.model.getCurrentStep();

      if (currentStep.id !== step.id) {
        this.clearPendingAudioInteraction();

        return;
      }

      /*
        The speaker button has its own playback handler.
      */

      if (event.target.closest?.("#audioClueButton")) {
        this.clearPendingAudioInteraction();

        return;
      }

      this.clearPendingAudioInteraction();

      this.audioManager.play(step.audioFile)?.catch((error) => {
        console.error("Unable to play clue audio:", error);
      });
    };

    this.pendingAudioInteractionHandler = handler;

    document.addEventListener("pointerdown", handler, true);

    document.addEventListener("keydown", handler, true);
  }

  /* =========================================================
     CLEAR PENDING AUDIO EVENT
  ========================================================= */

  clearPendingAudioInteraction() {
    if (!this.pendingAudioInteractionHandler) {
      return;
    }

    document.removeEventListener(
      "pointerdown",

      this.pendingAudioInteractionHandler,

      true,
    );

    document.removeEventListener(
      "keydown",

      this.pendingAudioInteractionHandler,

      true,
    );

    this.pendingAudioInteractionHandler = null;
  }

  /* =========================================================
     MANUAL AUDIO REPLAY
  ========================================================= */

  handleAudioClue() {
    const step = this.model.getCurrentStep();

    if (step.clueType !== "audio" || !step.audioFile) {
      return;
    }

    this.clearPendingAudioInteraction();

    this.audioManager.play(step.audioFile)?.catch((error) => {
      console.error("Unable to play clue audio:", error);
    });
  }

  /* =========================================================
     OBJECT CLICK
  ========================================================= */

  handleObjectClick(objectId, hotspot) {
    if (this.inputLocked) {
      return;
    }

    /* =====================================================
       WRONG OBJECT

       Even if this object becomes correct later in the level,
       it is wrong for the CURRENT clue and costs one chance.
    ===================================================== */

    if (!this.model.isCorrectObject(objectId)) {
      const message = this.model.getWrongMessage(objectId);

      this.handleWrongAttempt(message, hotspot);

      return;
    }

    /* =====================================================
       CORRECT OBJECT
    ===================================================== */

    this.inputLocked = true;

    /*
      Pause the timer while the player reads the story popup.

      Reading time should not hurt the level score.
    */

    this.pauseTimer();

    this.clearPendingAudioInteraction();

    this.audioManager.stop();

    this.view.clearHelpHighlight();

    this.view.showCorrectFeedback();

    this.view.flashCorrect(hotspot);

    const step = this.model.getCurrentStep();

    const isLastStep = this.model.isLastStep();

    window.setTimeout(
      () => {
        this.view.showStoryPopup(step, isLastStep);
      },

      400,
    );
  }

  /* =========================================================
     EMPTY ROOM CLICK

     Empty background clicks now count exactly like any
     other wrong attempt.
  ========================================================= */

  handleEmptyRoomClick() {
    if (this.inputLocked) {
      return;
    }

    this.handleWrongAttempt("That does not match the clue. Try again.");
  }

  /* =========================================================
     CONTINUE BUTTON
  ========================================================= */

  async handleContinue() {
    this.clearPendingAudioInteraction();

    this.audioManager.stop();

    /* =====================================================
       TIME EXPIRED
    ===================================================== */

    if (this.levelTimedOut) {
      this.restartLevel();

      return;
    }

    /* =====================================================
       LEVEL IS ALREADY FINISHED
    ===================================================== */

    if (this.levelFinished) {
      if (this.nextLevel) {
        const url = new URL(window.location.href);

        url.searchParams.set(
          "level",

          String(this.nextLevel.id),
        );

        window.location.href = url.href;

        return;
      }

      this.goHome();

      return;
    }

    /* =====================================================
       HIDE STORY POPUP
    ===================================================== */

    this.view.hideStoryPopup();

    /* =====================================================
       FINAL CLUE
    ===================================================== */

    if (this.model.isLastStep()) {
      await this.finishLevel();

      return;
    }

    /* =====================================================
       MOVE TO NEXT CLUE
    ===================================================== */

    this.model.nextStep();

    this.resetClueState();

    this.render();

    this.resumeTimer();
  }

  /* =========================================================
     FINISH LEVEL
  ========================================================= */

  async finishLevel() {
    this.clearPendingAudioInteraction();

    this.audioManager.stop();

    this.timerManager.stop();

    this.inputLocked = true;

    const elapsedSeconds = this.getElapsedSeconds();

    const finalScore = this.scoringEnabled ? this.getCurrentScore() : 0;

    // The shared Game Hub store saves the BEST score for this specific level.
    // Quest levels are normalized into ONE game worth up to 100 Hub points.
    let leaderboardRank = null;
    try {
      await this.progressStore.completeLevel(this.model.level.id, {
        score: finalScore,
        timeSeconds: elapsedSeconds,
      });
    } catch (error) {
      console.error("Unable to save Campus Quest result:", error);
      this.inputLocked = false;
      this.view.loadError.querySelector('h2').textContent = 'Could not save your score';
      this.view.loadError.querySelector('p').textContent = 'Your result has not been recorded. Check your connection or Firebase rules, then return to the challenge.';
      this.view.showLoadError();
      return;
    }

    this.levelFinished = true;
    this.onFinished();

    /* =====================================================
       FIND NEXT IMPLEMENTED LEVEL
    ===================================================== */

    const currentIndex = implementedLevels.findIndex(
      (level) => level.id === this.model.level.id,
    );

    if (currentIndex >= 0 && currentIndex < implementedLevels.length - 1) {
      this.nextLevel = implementedLevels[currentIndex + 1];
    } else {
      this.nextLevel = null;
    }

    /* =====================================================
       COMPLETE SIDEBAR
    ===================================================== */

    this.view.updateProgress(
      this.model.currentStepIndex,

      true,
    );

    /* =====================================================
       COMPLETE CLUE AREA
    ===================================================== */

    this.view.showFinished(this.model.level.completion || {});

    /* =====================================================
       COMPLETION POPUP
    ===================================================== */

    this.view.showLevelComplete(
      this.model.level.completion || {},

      this.nextLevel,

      {
        score: finalScore,

        maxScore: this.scoringConfig.maxScore,

        elapsedSeconds,

        showScore: this.scoringEnabled,

        showTime: this.timerEnabled,

        rank: leaderboardRank,

        guestMode: this.guestMode,
      },
    );
  }

  /* =========================================================
     RESTART LEVEL
  ========================================================= */

  restartLevel() {
    this.timerManager.stop();

    this.clearPendingAudioInteraction();

    this.audioManager.stop();

    window.location.reload();
  }

  /* =========================================================
     GO HOME
  ========================================================= */

  goHome() {
    this.timerManager.stop();

    this.clearPendingAudioInteraction();

    this.audioManager.stop();

    window.location.href = new URL(
      "../home.html",

      window.location.href,
    ).href;
  }
  /* =========================================================
     GO TO LEADERBOARD
  ========================================================= */

  goLeaderboard() {
    this.timerManager.stop();

    this.clearPendingAudioInteraction();

    this.audioManager.stop();

    const url = new URL("../../../leaderboard.html", window.location.href);

    url.searchParams.set("level", String(this.model.level.id));

    window.location.href = url.href;
  }
}
