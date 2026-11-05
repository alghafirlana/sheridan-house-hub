import { CONFIG, GAMES, firebaseIsConfigured, getGame } from "./config.js";
import {
  cleanName,
  formatPin,
  nextPin,
  normalizeScore,
  scoreSummary,
  isScoredLevelGame,
} from "./scoring-core.js";
const localKey = `sheridan-hub:${CONFIG.eventId}`;
const activeKey = `${localKey}:session`;
const cacheKey = `${localKey}:data`;
const initialData = () => ({ profiles: [], codes: {}, scores: [] });
const readData = () => {
  try {
    return JSON.parse(localStorage.getItem(cacheKey)) || initialData();
  } catch {
    return initialData();
  }
};
const writeData = (data) =>
  localStorage.setItem(cacheKey, JSON.stringify(data));
const now = () => Date.now();

class BaseStore {
  constructor() {
    this.player = null;
    this.playerListeners = new Set();
    this.boardListeners = new Set();
    this.board = [];
    this.mode = "demo";
  }
  playerChanged() {
    for (const cb of this.playerListeners) cb(this.player);
  }
  listenPlayer(cb) {
    this.playerListeners.add(cb);
    cb(this.player);
    return () => this.playerListeners.delete(cb);
  }
  listenBoard(cb) {
    this.boardListeners.add(cb);
    cb(this.board);
    return () => this.boardListeners.delete(cb);
  }
  boardChanged(board) {
    this.board = board;
    for (const cb of this.boardListeners) cb(this.board);
  }
  async waitForScores() {} // Demo mode already has synchronous local data.
  questLevelScores() {
    return this.levelScoresFor("campus-quest");
  }
  levelScoresFor(gameId) {
    const profile = this.board.find((p) => p.id === this.player?.id);
    if (gameId === "campus-quest") return profile?.questLevels || {};
    if (gameId === "hardware-challenge") return profile?.hardwareLevels || {};
    return {};
  }
  currentTotal() {
    return this.board.find((p) => p.id === this.player?.id)?.total ?? 0;
  }
  setPlayer(player) {
    this.player = player;
    this.playerChanged();
  }

  // Check existing nicknames without using player codes.
  async hasExistingName(rawName) {
    const name = cleanName(rawName).toLocaleLowerCase("en");

    return this.board.some(
      (player) => player.name.toLocaleLowerCase("en") === name,
    );
  }

  validateGame(gameId) {
    const game = getGame(gameId);
    if (isScoredLevelGame(gameId)) return;
    // Multi-level games must only submit individual level records.
    if (gameId === "campus-quest" || gameId === "hardware-challenge")
      throw Error("Submit a scored level instead of a game-wide total.");
    if (!game || !game.competitive || game.status !== "playable")
      throw Error("This game is not available for scoring yet.");
  }
  checkScore(gameId, points) {
    this.validateGame(gameId);
    if (!this.player) throw new Error("Please join before playing.");
    return normalizeScore(points);
  }
}

class DemoStore extends BaseStore {
  constructor() {
    super();
    this.mode = "demo";
  }
  async init() {
    this.refresh();
    const previous = sessionStorage.getItem(activeKey);
    if (previous) {
      const data = readData();
      const profile = data.profiles.find((p) => p.id === previous);
      const pin = Object.keys(data.codes).find(
        (key) => data.codes[key] === previous,
      );
      this.setPlayer(profile && pin ? { ...profile, pin } : null);
    }
    window.addEventListener("storage", (e) => {
      if (e.key === cacheKey) this.refresh();
    });
    return this;
  }
  refresh() {
    const data = readData();
    this.boardChanged(scoreSummary(data.profiles, data.scores));
  }
  async createPlayer(rawName) {
    const name = cleanName(rawName);
    const data = readData();
    let pin,
      tries = 0;
    do {
      pin = nextPin();
      tries++;
    } while (data.codes[pin] && tries < 50);
    if (data.codes[pin])
      throw new Error("Unable to create a player code. Please try again.");
    const player = { id: crypto.randomUUID(), displayName: name, pin };
    data.profiles.push({ id: player.id, displayName: name, createdAt: now() });
    data.codes[pin] = player.id;
    writeData(data);
    sessionStorage.setItem(activeKey, player.id);
    this.setPlayer(player);
    this.refresh();
    return player;
  }
  async resumePlayer(input) {
    const pin = formatPin(input);
    if (pin.length !== 4) throw new Error("Enter your four-digit player code.");
    const data = readData();
    const id = data.codes[pin];
    const profile = data.profiles.find((p) => p.id === id);
    if (!profile) throw new Error("Player code not found for this event.");
    const player = { ...profile, pin };
    sessionStorage.setItem(activeKey, id);
    this.setPlayer(player);
    this.refresh();
    return player;
  }
  async switchPlayer() {
    sessionStorage.removeItem(activeKey);
    this.setPlayer(null);
  }
  async submitScore(gameId, rawPoints) {
    const points = this.checkScore(gameId, rawPoints);
    const data = readData();
    const record = data.scores.find(
      (s) => s.playerId === this.player.id && s.gameId === gameId,
    );
    const previous = record?.points ?? 0;
    if (!record || points > previous) {
      if (record) record.points = points;
      else data.scores.push({ playerId: this.player.id, gameId, points });
      writeData(data);
      this.refresh();
    }
    return {
      points,
      previous,
      gained: Math.max(0, points - previous),
      best: Math.max(points, previous),
      total: this.currentTotal(),
    };
  }
}

export class FirestoreStore extends BaseStore {
  constructor({ fullBoard = false, fullProfiles = false } = {}) {
    super();

    // Only the public leaderboard loads all scores. Complete nickname data
    // is needed on the homepage and on the public leaderboard, not every game.
    this.fullBoard = fullBoard;
    this.fullProfiles = fullProfiles || fullBoard;
    this.stopProfiles = null;
    this.snapshotsStarted = false;
    this.stopScores = null;
    this.mode = "live";
    this.live = {};
    this.profiles = [];
    this.scores = [];

    // Wait for Firebase's first player snapshot.
    this.profilesReady = new Promise((resolve) => {
      this.resolveProfilesReady = resolve;
    });

    this.profilesError = null;
    this.scoresReady = new Promise((resolve) => {
      this.resolveScoresReady = resolve;
    });
    this.scoresError = null;
  }

  async waitForScores() {
    await this.scoresReady;
    if (this.scoresError) throw new Error("Could not load game progress.");
  }

  setPlayer(player) {
    const previousPlayerId = this.player?.id;
    // Games only need the selected player profile to calculate personal
    // score summaries. Keep full profiles on the homepage/leaderboard.
    if (!this.fullProfiles) {
      this.profiles = player
        ? [{ id: player.id, displayName: player.displayName }]
        : [];
    }
    super.setPlayer(player);
    if (!this.fullProfiles) this.refresh();
    // A new registration, returning-player PIN, or player switch changes
    // which personal scores need to be watched.
    if (
      this.snapshotsStarted &&
      !this.fullBoard &&
      previousPlayerId !== this.player?.id
    ) {
      this.watchScores();
    }
  }

  watchScores() {
    // Prevent old listeners and their callbacks from mixing players' scores.
    this.stopScores?.();
    this.stopScores = null;
    this.scores = [];
    this.scoresError = null;
    this.refresh();

    const playerId = this.player?.id;
    if (!this.fullBoard && !playerId) {
      // Direct visits to game pages must not wait forever when no player
      // has joined yet. The game can redirect to the join screen normally.
      this.resolveScoresReady();
      return;
    }

    const source = this.fullBoard
      ? this.collection("scores")
      : this.live.query(
          this.collection("scores"),
          this.live.where("playerId", "==", playerId),
        );

    this.stopScores = this.live.onSnapshot(
      source,
      (snapshot) => {
        if (!this.fullBoard && this.player?.id !== playerId) return;
        this.scores = snapshot.docs.map((s) => s.data());
        this.refresh();
        this.resolveScoresReady();
      },
      (error) => {
        if (!this.fullBoard && this.player?.id !== playerId) return;
        this.scoresError = error;
        this.resolveScoresReady();
        this.reportConnectionError(error);
      },
    );
  }

  async hasExistingName(rawName) {
    if (!this.fullProfiles) {
      // The join dialog is also available on game pages. Read profiles
      // only when it is actually used, instead of watching them all day.
      const name = cleanName(rawName).toLocaleLowerCase("en");
      try {
        const snapshot = await this.live.getDocs(this.collection("profiles"));
        return snapshot.docs.some(
          (doc) => String(doc.data().displayName || "")
            .toLocaleLowerCase("en") === name,
        );
      } catch {
        throw new Error("Could not check player names. Please try again.");
      }
    }
    await this.profilesReady;
    if (this.profilesError) {
      throw new Error("Could not check player names. Please try again.");
    }
    return super.hasExistingName(rawName);
  }
  watchProfiles() {
    if (!this.fullProfiles) {
      this.resolveProfilesReady();
      return;
    }
    this.stopProfiles = this.live.onSnapshot(
      this.collection("profiles"),
      (snapshot) => {
        this.profiles = snapshot.docs.map((s) => ({ id: s.id, ...s.data() }));
        this.refresh();
        this.resolveProfilesReady();
      },
      (error) => {
        this.profilesError = error;
        this.resolveProfilesReady();
        this.reportConnectionError(error);
      },
    );
  }

  path(...segments) {
    return ["events", CONFIG.eventId, ...segments];
  }
  ref(...segments) {
    return this.live.doc(this.db, ...this.path(...segments));
  }
  collection(...segments) {
    return this.live.collection(this.db, ...this.path(...segments));
  }
  async init() {
    // Pinned CDN browser modules: no npm, no build process, GitHub Pages compatible.
    const base = "https://www.gstatic.com/firebasejs/12.19.0/";
    const [app, auth, fs] = await Promise.all([
      import(base + "firebase-app.js"),
      import(base + "firebase-auth.js"),
      import(base + "firebase-firestore.js"),
    ]);
    this.live = { ...fs };
    this.db = fs.getFirestore(app.initializeApp(CONFIG.firebase));
    this.auth = auth.getAuth();
    await new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(
        this.auth,
        async (user) => {
          unsubscribe();
          if (user) {
            resolve();
            return;
          }
          try {
            await auth.signInAnonymously(this.auth);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
        reject,
      );
    });
    await this.restorePlayer();

    this.watchProfiles();

    // Game pages subscribe only to their own scores; the public leaderboard
    // subscribes to every player's scores.
    this.snapshotsStarted = true;
    this.watchScores();
    return this;
  }
  reportConnectionError(error) {
    window.dispatchEvent(
      new CustomEvent("hub-error", {
        detail: error?.message || "Live updates stopped.",
      }),
    );
  }
  refresh() {
    this.boardChanged(scoreSummary(this.profiles, this.scores));
  }
  membership() {
    return this.ref("memberships", this.auth.currentUser.uid);
  }
  async restorePlayer() {
    const until = Number(sessionStorage.getItem(activeKey + ":time") || 0);
    if (!until || Date.now() - until > CONFIG.inactivityMinutes * 60_000) {
      sessionStorage.removeItem(activeKey + ":time");
      this.setPlayer(null);
      return;
    }
    const member = await this.live.getDoc(this.membership());
    if (!member.exists()) {
      this.setPlayer(null);
      return;
    }
    const { playerId, pin } = member.data();
    const profile = await this.live.getDoc(this.ref("profiles", playerId));
    this.setPlayer(
      profile.exists()
        ? { id: playerId, displayName: profile.data().displayName, pin }
        : null,
    );
  }
  async createPlayer(rawName) {
    const name = cleanName(rawName);
    const uid = this.auth.currentUser.uid;
    for (let attempt = 0; attempt < 35; attempt++) {
      const pin = nextPin(),
        playerId = crypto.randomUUID();
      const codeRef = this.ref("codes", pin),
        profileRef = this.ref("profiles", playerId),
        memberRef = this.membership();
      try {
        await this.live.runTransaction(this.db, async (tx) => {
          const existing = await tx.get(codeRef);
          if (existing.exists()) throw new Error("PIN_COLLISION");
          tx.set(profileRef, {
            displayName: name,
            createdBy: uid,
            createdAt: this.live.serverTimestamp(),
          });
          tx.set(codeRef, { playerId, createdAt: this.live.serverTimestamp() });
          tx.set(memberRef, {
            playerId,
            pin,
            updatedAt: this.live.serverTimestamp(),
          });
        });
        const player = { id: playerId, displayName: name, pin };
        sessionStorage.setItem(activeKey + ":time", String(Date.now()));
        this.setPlayer(player);
        return player;
      } catch (error) {
        if (error.message === "PIN_COLLISION") continue;
        throw error;
      }
    }
    throw new Error("Could not assign a unique player code. Please retry.");
  }
  async resumePlayer(input) {
    const pin = formatPin(input);
    if (pin.length !== 4) throw new Error("Enter your four-digit player code.");
    const code = await this.live.getDoc(this.ref("codes", pin));
    if (!code.exists())
      throw new Error("Player code not found for this event.");
    const playerId = code.data().playerId;
    const profile = await this.live.getDoc(this.ref("profiles", playerId));
    if (!profile.exists()) throw new Error("Player profile not found.");
    await this.live.setDoc(this.membership(), {
      playerId,
      pin,
      updatedAt: this.live.serverTimestamp(),
    });
    const player = {
      id: playerId,
      displayName: profile.data().displayName,
      pin,
    };
    sessionStorage.setItem(activeKey + ":time", String(Date.now()));
    this.setPlayer(player);
    return player;
  }
  async switchPlayer() {
    const old = this.player;
    this.setPlayer(null);
    sessionStorage.removeItem(activeKey + ":time");
    if (old) {
      try {
        await this.live.deleteDoc(this.membership());
      } catch (err) {
        this.reportConnectionError(err);
      }
    }
  }
  async submitScore(gameId, rawPoints) {
    const points = this.checkScore(gameId, rawPoints),
      playerId = this.player.id;
    const docId = `${playerId}_${gameId}`;
    const scoreRef = this.ref("scores", docId);
    const previous = await this.live.runTransaction(this.db, async (tx) => {
      const snapshot = await tx.get(scoreRef);
      const prior = snapshot.exists() ? snapshot.data().points : 0;
      if (!snapshot.exists())
        tx.set(scoreRef, {
          playerId,
          gameId,
          points,
          updatedAt: this.live.serverTimestamp(),
        });
      else if (points > prior)
        tx.update(scoreRef, { points, updatedAt: this.live.serverTimestamp() });
      return prior;
    });
    // The live listener supplies the updated running total across devices.
    return {
      points,
      previous,
      gained: Math.max(0, points - previous),
      best: Math.max(points, previous),
      total: null,
    };
  }
}

export async function initStore({
  forceDemo = false,
  fullBoard = false,
  fullProfiles = false,
} = {}) {
  const store = !forceDemo && firebaseIsConfigured()
    ? new FirestoreStore({ fullBoard, fullProfiles })
    : new DemoStore();
  await store.init();
  return store;
}
export function markSessionActivity() {
  sessionStorage.setItem(activeKey + ":time", String(Date.now()));
}
export function clearSessionActivity() {
  sessionStorage.removeItem(activeKey + ":time");
}
