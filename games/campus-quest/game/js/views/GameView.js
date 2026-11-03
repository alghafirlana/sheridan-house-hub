export default class GameView {
  constructor() {
    // =========================================================
    // HEADER / LEVEL INFORMATION
    // =========================================================

    this.levelBadge = document.getElementById("levelBadge");

    this.roomName = document.getElementById("roomName");

    this.gameTitle = document.getElementById("gameTitle");

    this.missionText = document.getElementById("missionText");

    // =========================================================
    // SCORE / TIMER / CHANCES
    // =========================================================

    this.performancePanel = document.getElementById("performancePanel");

    this.scoreStat = document.getElementById("scoreStat");

    this.scoreValue = document.getElementById("scoreValue");

    this.scoreMax = document.getElementById("scoreMax");

    this.timerStat = document.getElementById("timerStat");

    this.timerValue = document.getElementById("timerValue");

    this.chancesStat = document.getElementById("chancesStat");

    this.chancesValue = document.getElementById("chancesValue");

    // =========================================================
    // CLUE AREA
    // =========================================================

    this.clueProgress = document.getElementById("clueProgress");

    this.cluePrompt = document.getElementById("cluePrompt");

    this.clueHint = document.getElementById("clueHint");

    this.feedback = document.getElementById("feedback");

    // =========================================================
    // AUDIO CLUE UI
    // =========================================================

    this.audioClueLine = document.createElement("div");

    this.audioClueLine.className = "audio-clue-row";

    /*
      Place the existing English clue inside a row so the
      audio replay icon can sit beside it.
    */
    this.clueHint.parentNode.insertBefore(
      this.audioClueLine,
      this.clueHint,
    );

    this.audioClueLine.appendChild(this.clueHint);

    this.audioClueButton = document.createElement("button");

    this.audioClueButton.type = "button";

    this.audioClueButton.id = "audioClueButton";

    this.audioClueButton.className = "audio-clue-icon hidden";

    this.audioClueButton.setAttribute(
      "aria-label",
      "Replay audio clue",
    );

    this.audioClueButton.title = "Replay audio clue";

    this.audioClueButton.innerHTML = `
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M4 9v6h4l5 4V5L8 9H4z"
            fill="currentColor"
          />

          <path
            d="M16 8.5a5 5 0 0 1 0 7"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />

          <path
            d="M18.5 6a8.5 8.5 0 0 1 0 12"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          />
        </svg>
      `;

    this.audioClueLine.appendChild(this.audioClueButton);

    // =========================================================
    // ROOM
    // =========================================================

    this.roomStage = document.getElementById("roomStage");

    this.roomPanel = document.getElementById("roomPanel");

    this.roomMap = document.getElementById("roomMap");

    this.roomBackground = document.getElementById("roomBackground");

    this.hotspotLayer = document.getElementById("hotspotLayer");

    // =========================================================
    // PROGRESS
    // =========================================================

    this.progressList = document.getElementById("progressList");

    this.progressCounter = document.getElementById("progressCounter");

    this.tipText = document.getElementById("tipText");

    // =========================================================
    // STORY POPUP
    // =========================================================

    this.popup = document.getElementById("storyPopup");

    this.popupTitle = document.getElementById("popupTitle");

    this.popupMessage = document.getElementById("popupMessage");

    this.continueButton = document.getElementById("continueButton");

    this.popupSymbol = document.getElementById("popupSymbol");

    this.popupEyebrow = document.getElementById("popupEyebrow");

    this.popupStats = document.getElementById("popupStats");

    this.popupScoreStat = document.getElementById("popupScoreStat");

    this.popupScoreValue = document.getElementById("popupScoreValue");

    this.popupTimeStat = document.getElementById("popupTimeStat");

    this.popupTimeValue = document.getElementById("popupTimeValue");

    this.popupRankStat = document.getElementById("popupRankStat");

    this.popupRankValue = document.getElementById("popupRankValue");
    this.questResultSummary = document.getElementById("questResultSummary");
    this.questSaveStatus = document.getElementById("questSaveStatus");
    this.questPointsAdded = document.getElementById("questPointsAdded");
    this.questTotal = document.getElementById("questTotal");
    this.questReplayMessage = document.getElementById("questReplayMessage");

    // =========================================================
    // SECONDARY POPUP BUTTONS
    // =========================================================

    this.leaderboardButton = document.createElement("button");

    this.leaderboardButton.type = "button";

    this.leaderboardButton.id = "leaderboardButton";

    this.leaderboardButton.className =
      "completion-leaderboard-button hidden";

    this.leaderboardButton.textContent = "View Leaderboard";

    this.continueButton.insertAdjacentElement(
      "afterend",
      this.leaderboardButton,
    );

    this.replayButton = document.createElement("button");
    this.replayButton.type = "button";
    this.replayButton.id = "replayButton";
    this.replayButton.className = "completion-replay-button hidden";
    this.replayButton.textContent = "Replay this level";
    this.leaderboardButton.insertAdjacentElement("afterend", this.replayButton);

    this.homeButton = document.createElement("button");

    this.homeButton.type = "button";

    this.homeButton.id = "homeButton";

    this.homeButton.className = "completion-home-button hidden";

    this.homeButton.textContent = "Back to Home";

    this.replayButton.insertAdjacentElement("afterend", this.homeButton);

    // =========================================================
    // ERROR SCREEN
    // =========================================================

    this.loadError = document.getElementById("loadError");

    // =========================================================
    // ROOM DIMENSIONS
    // =========================================================

    this.roomWidth = 1672;

    this.roomHeight = 941;

    this.resizeObserver = null;

    this.windowResizeHandler = () => this.fitRoom();
  }

  // =========================================================
  // RENDER LEVEL
  // =========================================================

  renderLevel(level) {
    this.levelBadge.textContent = `LEVEL ${level.id}`;

    this.roomName.textContent = level.roomName || `LEVEL ${level.id}`;

    this.gameTitle.textContent = level.gameTitle || "Sheridan Campus Quest";

    this.missionText.textContent = level.mission || "Complete the challenge.";

    this.tipText.textContent = level.tip || "Look carefully around the scene.";

    this.roomWidth = level.room.width;

    this.roomHeight = level.room.height;

    this.roomMap.setAttribute(
      "viewBox",
      `0 0 ${this.roomWidth} ${this.roomHeight}`,
    );

    this.roomBackground.setAttribute("href", level.room.backgroundUrl);

    this.roomBackground.setAttribute("width", this.roomWidth);

    this.roomBackground.setAttribute("height", this.roomHeight);

    this.roomPanel.style.aspectRatio = `${this.roomWidth} / ${this.roomHeight}`;

    this.renderHotspots(level.hotspots || []);

    this.renderProgress(level.steps || []);

    this.startResponsiveRoom();
  }

  // =========================================================
  // SCORE / TIMER / CHANCES
  // =========================================================

  configurePerformance({
    scoringEnabled = false,
    timerEnabled = false,
    maxScore = 100,
    maxChances = 3,
  } = {}) {
    const showPanel = scoringEnabled || timerEnabled;

    this.performancePanel.classList.toggle("hidden", !showPanel);

    this.scoreStat.classList.toggle("hidden", !scoringEnabled);

    this.chancesStat.classList.toggle("hidden", !scoringEnabled);

    this.timerStat.classList.toggle("hidden", !timerEnabled);

    if (scoringEnabled) {
      this.scoreValue.textContent = String(maxScore);

      this.scoreMax.textContent = `/ ${maxScore}`;

      this.updateChances(maxChances, maxChances);
    }
  }

  updateScore(score, maxScore = 100) {
    this.scoreValue.textContent = String(Math.max(0, Math.round(score)));

    this.scoreMax.textContent = `/ ${Math.max(0, Math.round(maxScore))}`;
  }

  updateTimer(remainingSeconds) {
    const remaining = Math.max(0, Number(remainingSeconds) || 0);

    this.timerValue.textContent = this.formatTime(remaining);

    this.timerStat.classList.toggle(
      "warning",

      remaining > 0 && remaining <= 30,
    );

    this.timerStat.classList.toggle(
      "expired",

      remaining === 0,
    );
  }

  updateChances(chancesLeft, maxChances) {
    const remaining = Math.max(
      0,

      Number(chancesLeft) || 0,
    );

    const maximum = Math.max(
      1,

      Number(maxChances) || 1,
    );

    this.chancesValue.textContent = `${remaining} / ${maximum}`;

    this.chancesStat.classList.toggle(
      "low",

      remaining === 1,
    );

    this.chancesStat.classList.toggle(
      "empty",

      remaining === 0,
    );
  }

  formatTime(totalSeconds) {
    const seconds = Math.max(
      0,

      Math.floor(Number(totalSeconds) || 0),
    );

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }

  // =========================================================
  // HOTSPOTS
  // =========================================================

  renderHotspots(hotspots) {
    this.hotspotLayer.innerHTML = "";

    hotspots.forEach((hotspotData) => {
      let element;

      if (hotspotData.type === "polygon") {
        element = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "polygon",
        );

        element.setAttribute("points", hotspotData.points);
      } else if (hotspotData.type === "circle") {
        element = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle",
        );

        element.setAttribute("cx", hotspotData.cx);

        element.setAttribute("cy", hotspotData.cy);

        element.setAttribute("r", hotspotData.r);
      } else if (hotspotData.type === "rect") {
        element = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect",
        );

        element.setAttribute("x", hotspotData.x);

        element.setAttribute("y", hotspotData.y);

        element.setAttribute("width", hotspotData.width);

        element.setAttribute("height", hotspotData.height);
      } else {
        console.warn("Unknown hotspot type:", hotspotData.type);

        return;
      }

      element.classList.add("hotspot");

      element.dataset.object = hotspotData.object;

      element.setAttribute("tabindex", "0");

      element.setAttribute("role", "button");

      element.setAttribute("aria-label", "Interactive room object");

      this.hotspotLayer.appendChild(element);
    });
  }

  // =========================================================
  // PROGRESS SIDEBAR
  // =========================================================

  renderProgress(steps) {
    this.progressList.innerHTML = "";

    this.progressList.style.setProperty(
      "--progress-count",

      steps.length || 1,
    );

    steps.forEach((step, index) => {
      const item = document.createElement("div");

      item.className = index === 0 ? "step active" : "step locked";

      item.dataset.step = step.id;

      item.dataset.foundLabel = step.foundLabel;

      item.innerHTML = `
          <span class="step-number">
            ${index + 1}
          </span>

          <div class="step-copy">
            <strong class="step-title">
              Challenge ${index + 1}
            </strong>

            <small class="step-status">
              ${index === 0 ? "In progress" : "Locked"}
            </small>
          </div>
        `;

      this.progressList.appendChild(item);
    });
  }

  // =========================================================
  // CURRENT CLUE
  // =========================================================

  renderClue(step, currentIndex, totalSteps) {
    this.clueProgress.textContent = `CHALLENGE ${currentIndex + 1} OF ${totalSteps}`;

    const hasAudio = step.clueType === "audio" && Boolean(step.audioFile);

    /* -------------------------------------------------------
       AUDIO CLUE
    ------------------------------------------------------- */

    if (hasAudio) {
      this.cluePrompt.textContent = step.prompt || "LISTEN & FIND";

      this.cluePrompt.classList.add("audio-word-hidden");

      this.audioClueButton.classList.remove("hidden");

      this.audioClueButton.disabled = false;
    } else {
      /* -------------------------------------------------------
       TEXT CLUE
    ------------------------------------------------------- */
      this.cluePrompt.textContent = step.prompt || "FIND THE OBJECT";

      this.cluePrompt.classList.remove("audio-word-hidden");

      this.audioClueButton.classList.add("hidden");

      this.audioClueButton.disabled = true;
    }

    this.clueHint.textContent = step.hint || "";

    this.feedback.textContent = "";
  }

  // =========================================================
  // UPDATE PROGRESS
  // =========================================================

  updateProgress(currentIndex, finished = false) {
    const progressSteps = this.progressList.querySelectorAll(".step");

    const total = progressSteps.length;

    progressSteps.forEach((step, index) => {
      step.classList.remove("active", "locked", "complete");

      const title = step.querySelector(".step-title");

      const status = step.querySelector(".step-status");

      const foundLabel = step.dataset.foundLabel;

      if (finished) {
        step.classList.add("complete");

        title.textContent = foundLabel;

        status.textContent = "Found";

        return;
      }

      if (index < currentIndex) {
        step.classList.add("complete");

        title.textContent = foundLabel;

        status.textContent = "Found";
      } else if (index === currentIndex) {
        step.classList.add("active");

        title.textContent = `Challenge ${index + 1}`;

        status.textContent = "In progress";
      } else {
        step.classList.add("locked");

        title.textContent = `Challenge ${index + 1}`;

        status.textContent = "Locked";
      }
    });

    this.progressCounter.textContent = finished
      ? `${total} / ${total}`
      : `${currentIndex + 1} / ${total}`;
  }

  // =========================================================
  // RESPONSIVE ROOM SIZE
  // =========================================================

  fitRoom() {
    const desktop = window.matchMedia("(min-width: 1025px)").matches;

    if (!desktop) {
      this.roomPanel.style.width = "100%";

      this.roomPanel.style.height = "auto";

      return;
    }

    const availableWidth = this.roomStage.clientWidth;

    const availableHeight = this.roomStage.clientHeight;

    if (availableWidth <= 0 || availableHeight <= 0) {
      return;
    }

    const ratio = this.roomWidth / this.roomHeight;

    let width = availableWidth;

    let height = width / ratio;

    if (height > availableHeight) {
      height = availableHeight;

      width = height * ratio;
    }

    this.roomPanel.style.width = `${Math.floor(width)}px`;

    this.roomPanel.style.height = `${Math.floor(height)}px`;
  }

  startResponsiveRoom() {
    this.fitRoom();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => this.fitRoom());

      this.resizeObserver.observe(this.roomStage);
    }

    window.removeEventListener("resize", this.windowResizeHandler);

    window.addEventListener("resize", this.windowResizeHandler);
  }

  // =========================================================
  // FEEDBACK
  // =========================================================

  showWrongFeedback(message) {
    this.feedback.textContent = "↻ " + message;
  }

  showCorrectFeedback() {
    this.feedback.textContent = "✓ You found it!";
  }

  showHelpHint(step, objectHighlighted = false) {
    const fallbackHint = `Look more carefully for the ${String(
      step.foundLabel || "correct object",
    ).toLowerCase()}.`;

    this.clueHint.textContent = step.helpHint || fallbackHint;

    /*
    At 1 / 3:
      show the stronger hint but do NOT highlight yet.

    At 0 / 3:
      keep the stronger hint and tell the player that
      the correct object is now highlighted.
  */

    if (objectHighlighted) {
      this.feedback.textContent =
        "The correct object is highlighted. Click it to continue.";
    } else {
      this.feedback.textContent =
        "Stronger hint unlocked — one chance remaining.";
    }
  }

  flashCorrect(element) {
    element.classList.add("correct");

    window.setTimeout(
      () => element.classList.remove("correct"),

      450,
    );
  }

  flashWrong(element) {
    element.classList.add("wrong");

    window.setTimeout(
      () => element.classList.remove("wrong"),

      250,
    );
  }

  /*
    Highlight every hotspot that represents the correct
    object.

    This also supports objects such as the bench or train
    that use several separate hotspot shapes.
  */
  highlightObject(objectId) {
    this.clearHelpHighlight();

    const hotspots = this.hotspotLayer.querySelectorAll(".hotspot");

    hotspots.forEach((hotspot) => {
      if (hotspot.dataset.object === String(objectId)) {
        hotspot.classList.add("help-highlight");
      }
    });
  }

  clearHelpHighlight() {
    this.hotspotLayer.querySelectorAll(".help-highlight").forEach((hotspot) => {
      hotspot.classList.remove("help-highlight");
    });
  }

  // =========================================================
  // ROOM INTERACTIONS
  // =========================================================

  bindRoomInteraction(objectHandler, emptyHandler) {
    this.roomMap.addEventListener(
      "click",

      (event) => {
        const hotspot = event.target.closest(".hotspot");

        if (hotspot) {
          objectHandler(
            hotspot.dataset.object,

            hotspot,
          );

          return;
        }

        emptyHandler();
      },
    );

    /*
      Keyboard accessibility.
    */
    this.roomMap.addEventListener(
      "keydown",

      (event) => {
        const hotspot = event.target.closest(".hotspot");

        if (!hotspot) {
          return;
        }

        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();

          objectHandler(
            hotspot.dataset.object,

            hotspot,
          );
        }
      },
    );
  }

  // =========================================================
  // AUDIO INTERACTION
  // =========================================================

  bindAudioClue(handler) {
    this.audioClueButton.addEventListener(
      "click",

      (event) => {
        event.preventDefault();

        event.stopPropagation();

        handler();
      },
    );
  }

  // =========================================================
  // STORY POPUP
  // =========================================================

  showStoryPopup(step, isLastStep) {
    this.popupSymbol.textContent = "🔎";

    this.popupEyebrow.textContent = "CHALLENGE CLEARED";

    this.popupTitle.textContent = step.title;

    this.popupMessage.textContent = step.story;

    this.hidePopupStats();

    this.continueButton.textContent = isLastStep
      ? "Complete Level"
      : "Continue";

    this.leaderboardButton.classList.add("hidden");

    this.homeButton.classList.add("hidden");

    this.popup.classList.remove("hidden");

    this.continueButton.focus();
  }

  hideStoryPopup() {
    this.popup.classList.add("hidden");
  }

  bindContinue(handler) {
    this.continueButton.addEventListener("click", handler);
  }

  // =========================================================
  // LEVEL COMPLETE
  // =========================================================

  showFinished(completion) {
    this.clueProgress.textContent = "LEVEL COMPLETE";

    this.cluePrompt.classList.remove("audio-word-hidden");

    this.cluePrompt.textContent = completion.prompt || "QUEST COMPLETE";

    this.clueHint.textContent =
      completion.message || "You completed the challenge!";

    this.audioClueButton.classList.add("hidden");

    this.audioClueButton.disabled = true;

    this.feedback.textContent = "";
  }

  // =========================================================
  // POPUP STATS
  // =========================================================

  hidePopupStats() {
    this.popupStats.classList.add("hidden");

    this.popupScoreStat.classList.add("hidden");

    this.popupTimeStat.classList.add("hidden");

    this.popupRankStat.classList.add("hidden");
  }

  // =========================================================
  // LEVEL COMPLETE POPUP
  // =========================================================

  showLevelComplete(
    completion,
    nextLevel,
    {
      score = 0,
      maxScore = 100,
      elapsedSeconds = null,
      showScore = true,
      showTime = true,
      rank = null,
      guestMode = false,
      savedResult = null,
    } = {},
  ) {
    this.popupSymbol.textContent = "🎉";

    this.popupEyebrow.textContent = "LEVEL COMPLETE";

    this.popupTitle.textContent = completion.title || "Level Complete! 🎉";

    const baseMessage =
      completion.message || "Great work! You completed this level.";

    this.popupMessage.textContent = guestMode
      ? `${baseMessage} Guest mode: this level is unlocked for your current browser-tab session, but your score is not added to the leaderboard or saved to Firebase.`
      : baseMessage;

    this.hidePopupStats();
    this.questResultSummary.classList.add("hidden");

    if (showScore) {
      this.popupScoreValue.textContent = `${Math.max(
        0,
        Math.round(score),
      )} / ${Math.max(0, Math.round(maxScore))}`;

      this.popupScoreStat.classList.remove("hidden");
    }

    if (showTime && elapsedSeconds !== null) {
      this.popupTimeValue.textContent = this.formatTime(elapsedSeconds);

      this.popupTimeStat.classList.remove("hidden");
    }

    if (rank !== null && Number(rank) > 0) {
      this.popupRankValue.textContent = `#${Number(rank)}`;

      this.popupRankStat.classList.remove("hidden");
    }

    if (
      showScore ||
      (showTime && elapsedSeconds !== null) ||
      (rank !== null && Number(rank) > 0)
    ) {
      this.popupStats.classList.remove("hidden");
    }

    if (savedResult) {
      this.questSaveStatus.textContent = savedResult.savedToLeaderboard
        ? "✓ Score saved to the live leaderboard!"
        : "✓ Score saved in demo mode (this browser only)";
      this.questPointsAdded.textContent = `+${savedResult.pointsAdded}`;
      this.questTotal.textContent = `${savedResult.questPoints} / 100`;
      this.questReplayMessage.textContent = savedResult.personalBest
        ? `New level best: ${savedResult.bestScore}/100! ${savedResult.pointsAdded > 0 ? 'Your leaderboard points increased.' : 'Your level score improved; your rounded Quest total stayed the same.'} Replay to improve even more.`
        : `Your best level score is still ${savedResult.bestScore}/100. No points lost! Replay this level or explore another one.`;
      this.questResultSummary.classList.remove("hidden");
    }

    if (nextLevel) {
      this.continueButton.textContent = `Next Level — ${nextLevel.title}`;
    } else {
      this.continueButton.textContent = "Explore Quest levels";
    }

    this.replayButton.classList.remove("hidden");
    this.leaderboardButton.classList.remove("hidden");

    this.homeButton.classList.remove("hidden");

    this.popup.classList.remove("hidden");

    this.continueButton.focus();
  }

  // =========================================================
  // TIME UP POPUP
  // =========================================================

  showTimeUp() {
    this.popupSymbol.textContent = "⏱️";

    this.popupEyebrow.textContent = "TIME'S UP";

    this.popupTitle.textContent = "Time's Up!";

    this.popupMessage.textContent =
      "You ran out of time before completing the level. Try again and see if you can escape faster.";

    this.hidePopupStats();
    this.questResultSummary.classList.add("hidden");
    this.replayButton.classList.add("hidden");

    this.continueButton.textContent = "Try Again";

    this.leaderboardButton.classList.add("hidden");

    this.homeButton.classList.remove("hidden");

    this.popup.classList.remove("hidden");

    this.continueButton.focus();
  }

  bindReplay(handler) {
    this.replayButton.addEventListener("click", handler);
  }

  bindHome(handler) {
    this.homeButton.addEventListener("click", handler);
  }

  bindLeaderboard(handler) {
    this.leaderboardButton.addEventListener("click", handler);
  }

  // =========================================================
  // LOAD ERROR
  // =========================================================

  showLoadError() {
    this.loadError.classList.remove("hidden");
  }
}
