# ✳ Sheridan Game Hub

**Discover. Play. Explore.** A single-site game experience for prospective students at Sheridan Open House.

> **Project status:** Working portal foundation + a playable Tech Sprint sample quiz. The other game cards are marked **Coming Soon** until their real implementations are added. This is a student-built activity, not an official Sheridan College service.

## What's ready

- Responsive Sheridan-inspired homepage with six game slots
- New player registration with automatic **4-digit code**
- Returning players can use that code on another station
- Player name and accumulated Sheridan Points in the header
- Finish & Switch Player plus **10-minute inactivity timeout**, suspended during active gameplay
- Shared scoring: **0–100 points per game; only the highest attempt counts**
- Separate fullscreen-friendly live leaderboard at `leaderboard.html` (not linked in the portal)
- A playable **Tech Sprint** quiz for end-to-end testing
- **No npm / frameworks / backend server** required for site hosting

## Get running in minutes

1. Extract the folder and open a local web server in it:
   ```bash
   cd sheridan-game-hub
   python3 -m http.server 8080
   ```
2. Visit `http://localhost:8080/` and `http://localhost:8080/leaderboard.html` in separate tabs.
3. Without Firebase configuration, the app clearly displays **DEMO MODE**. This uses browser storage, useful for testing on one computer; **it does not sync between computers.**
4. Create a player, save the four-digit code, play **Tech Sprint**, then view the leaderboard. Try the Returning Player tab after switching.

> Opening HTML files directly as `file://` may block JavaScript modules. Use the tiny HTTP server above, or publish on GitHub Pages.

## Enable true real-time multi-computer scoring (Firebase)

This is **required for the Open House**. GitHub Pages serves static files only; Firebase supplies the shared database and real-time listeners.

1. Create a Firebase project at https://console.firebase.google.com/.
2. Add a **Web app** and copy its public Firebase configuration values.
3. Go to **Authentication → Sign-in method → Anonymous** and enable it. This runs invisibly; students do not create accounts or enter emails.
4. Create a **Cloud Firestore** database in Native mode. **Do not publish test-mode/unrestricted security rules.**
5. Open Firestore **Rules**, replace the rules with the exact contents of [`firestore.rules`](./firestore.rules), then **Publish**.
6. Open [`js/config.js`](./js/config.js) and fill in `firebase.apiKey`, `firebase.authDomain`, `firebase.projectId`, and `firebase.appId`. Firebase web configuration is **not a secret**; database security is enforced by Firestore Rules.
7. Publish to GitHub Pages, then test **two different computers** and the scoreboard display.

For a project Pages URL (`https://USERNAME.github.io/REPO/`) this site uses **relative paths** and works under the repository subfolder.

### GitHub Pages publishing

1. Create a new GitHub repository (e.g. `sheridan-game-hub`).
2. Upload all files and folders from this directory to the repository root (do **not** nest the folder an extra level).
3. Go to **Settings → Pages → Build and deployment**, choose **Deploy from a branch**, `main`, and `/ (root)`; save.
4. Open `https://USERNAME.github.io/REPOSITORY/`.
5. For the separate TV screen enter `https://USERNAME.github.io/REPOSITORY/leaderboard.html` in the address bar; you can use the screen's fullscreen button.

## Add a game in 3 steps

1. Add its game files in `games/new-game/` (e.g. `index.html`, `game.js`, `game.css`).
2. Add its entry in [`js/config.js`](./js/config.js) with `id`, `status: 'playable'`, `competitive: true`, and `href: 'games/new-game/index.html'`.
3. For a competitive game, add its ID to the allowed list in [`firestore.rules`](./firestore.rules) and republish the rules. Import the shared store and submit a **completed 0–100 score** through `store.submitScore('new-game', points)`.

Minimal game outline (use **relative** URLs from its folder):

```js
import { initStore } from "../../js/store.js";
import { initChrome, requirePlayer, setGameplayActive } from "../../js/ui.js";

const store = await initStore();
initChrome(store);
// Before the game begins, even if the visitor typed the game URL directly:
await requirePlayer("My Game");
setGameplayActive(true);
// Run your actual gameplay and determine the final normalized score.
setGameplayActive(false);
const result = await store.submitScore("new-game", 85);
console.log(result); // { points, previous, gained, best, total }
```

Only mark a game playable after you have tested its complete flow; leave unfinished games as `status: 'soon'`.

### Integrating Campus Quest

If your original Campus Quest uses Vite/React, its **built static output** can still be served from a folder under this same GitHub Pages site. Integrate the player context and completion submission via a small adapter, or migrate its gameplay files when time permits. Do not assume that copying Vite source files directly into a vanilla JavaScript folder will work.

## Scoring specification

- **100 maximum Sheridan Points** from each competitive game.
- Only the **best completed attempt per game** contributes to ranking.
- Score documents are stored once per player/game. The portal **calculates totals from those documents**, rather than allowing browsers to write arbitrary overall totals.
- Rankings sort by points descending, then number of games completed, then nickname, then player ID.
- `Program Discovery` is exploratory and does not earn competitive points.
- The Kahoot-themed slot is currently a placeholder for a **future in-portal quiz**; no external website is launched.
- To reset for a future event, change `eventId` in `js/config.js`. The database data is segregated by event.

## Data layout

```text
events/{eventId}/
  profiles/{playerId}        public nickname and creation metadata
  codes/{fourDigitPin}       private lookup: PIN -> player ID (get-only; no list)
  memberships/{anonUid}      private station association to player ID and PIN
  scores/{playerId_gameId}  public game ID and best score (NO PIN)
```

The browser automatically gets a temporary **Firebase Anonymous Authentication** identity. This is only used to apply basic database permissions; **it is not a student login system**. A returning student uses their PIN, which changes the station's current player association.

## Important limitations

- **Four digits are intentionally easy to remember, not secure.** Anyone who guesses a valid code can access that player's event profile. Do not use this for prizes or personally sensitive information.
- Since there is no trusted game server, a determined user can forge a completed score. Rules limit values and prevent total-score inflation or changing another player's score without claiming their PIN, but **cannot verify whether answers were correct**.
- Firebase Authentication helps restrict writes to temporary browser identities; it is **not a substitute for a protected server** or strong rate limiting. Four-digit code guessing cannot be reliably blocked by client-only JavaScript.
- Never expose emails, phone numbers, student numbers or private information in public nicknames.
- An event organizer can manually remove inappropriate entries in Firebase Console if necessary; this release has no staff dashboard.
- Firestore requires internet connectivity. Transactions fail offline; the app displays an error/retry rather than pretending a score was saved.
- The demo fallback is **not** the production database. Verify the yellow demo banner disappears after Firebase is configured.
- The hero and game cards are original CSS/vector designs with Sheridan-inspired styling. For official Sheridan logos, request the approved brand assets from Sheridan's communications team.

## Before doors open — quick checklist

- [ ] Firebase configuration added and demo banner gone
- [ ] Anonymous Authentication enabled, Firestore Rules published
- [ ] Confirm registration + PIN returns on two **different** computers
- [ ] Play Tech Sprint and verify the other computer's leaderboard changes **without refresh**
- [ ] Check replays: a lower score does not lower or increase the player's total
- [ ] Verify Switch Player and idle timeout behavior
- [ ] Run the leaderboard fullscreen on the actual display
- [ ] Test a mobile/tablet screen and the event Wi-Fi
- [ ] Replace placeholder games as each becomes playable

## Reference documentation

- [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)
- [Firebase web setup](https://firebase.google.com/docs/web/setup)
- [Firestore real-time listeners](https://firebase.google.com/docs/firestore/query-data/listen)
- [Firebase anonymous authentication](https://firebase.google.com/docs/auth/web/anonymous-auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firestore transactions](https://firebase.google.com/docs/firestore/manage-data/transactions)


## Sheridan Campus Quest integration (November 2026)

Campus Quest is now available as a competitive game inside the same GitHub Pages website:

- Hub card: `games/campus-quest/home.html`
- Level 1: `games/campus-quest/game/game.html?level=1`
- Level 2: `games/campus-quest/game/game.html?level=2`

The game uses the **existing Game Hub 4-digit player code** and Firebase project.
Do **not** enable the standalone Campus Quest email/password login or publish its old `firestore.rules`;
those are deliberately not included in the integrated game.

### Required: publish the new Game Hub Firestore rules

Open Firebase Console → your **Game Hub project** → Firestore Database → Rules.
Replace the deployed rules with the updated root `firestore.rules` in this project and click **Publish**.
The two additional allowed score IDs are `campus-quest-level-1` and `campus-quest-level-2`.
Committing this file to GitHub alone **does not deploy Firestore rules**.

### Fair points across games

Campus Quest contains two playable levels. Each level's best score is stored as
its own 0–100 document, but they count together as **one** competitive game:

`Campus Quest points = round((Level 1 best + Level 2 best) / 2)`

Example: 100 on Level 1 plus 80 on Level 2 → 90 Campus Quest points, not 180.
A completed Level 1 (even a score of zero) unlocks Level 2 on other stations using the same player code.
Tech Sprint remains independently worth up to 100 points.

For a future event with additional Campus Quest levels, add their level files and
manifest entries, change the **single** `SCORED_LEVEL_COUNTS["campus-quest"]`
setting in `js/config.js`, then run `node scripts/sync-firestore-rules.mjs`
and **publish** the generated rules in Firebase Console. Do not increase the
scored-level count during an existing event.

### Shared files and protections

- Original level backgrounds, hotspot coordinates, clues, and timing rules are retained.
- `games/campus-quest/js/hub-integration.js` bridges the existing player and scoring store.
- No second database, no new web API keys, and no independent Campus Quest leaderboard.
- `games/campus-quest/css/hub-integration.css` adds the shared player/points header.
- Quest gameplay does not time out while actively in progress; the idle timer resumes after completion.
- As with other static-client games, browser-reported results are **not cheat-proof**.

### Tests

Run `node --test tests/*.mjs` to validate scoring, unlocks, returning-player behavior,
and best-attempt updates. The test suite uses isolated demo storage and does not
write to live Firebase. Also test the actual deployed portal on a phone and on two
separate computers before Open House. QR codes should point to the published site,
not to localhost.

## Hardware Challenge and shared level scoring (November 2026)

**Playable URL:** `games/hardware-challenge/index.html`. The portal card is enabled.

Hardware Challenge has **two scored ways to play**:

- **Explore Hardware:** select one of the hardware photos, identify random components, and save your best level result.
- **Quick Challenge:** get a randomly selected hardware level (prefer unplayed levels), answer random questions, and save to that **same** level result. Playing both modes does **not** double your points.

Both modes share the same hotspot renderer, photo zoom tools, second-chance feedback, and short explanations. Each round selects 3 or 4 different targets from its level's question bank; an answer correct on the first try earns 10 question points, second try 5, and two misses 0. The round total is normalized to a whole score out of 100 and only the **best completed score per level** is saved. Hotspots are SVG polygons aligned against the included photographs. Keyboard users can Tab through regions and press Enter; zoom buttons help on phones.

### Change the level count in ONE place for a future event

Open **`js/config.js`** and find:

```js
export const SCORED_LEVEL_COUNTS = Object.freeze({
  "campus-quest": 2,
  "hardware-challenge": 4,
});
```

**This is the only place you edit the number of scored levels.** Every scored level has equal weight, unplayed levels count as zero, and the single combined score per game is the rounded average of level bests. Thus Hardware Challenge with 4 levels: `round((L1 + L2 + L3 + L4) / 4)`, maximum **100 Sheridan Points** total. Campus Quest with 2 levels: `round((L1 + L2) / 2)`. Scores always reflect the same formula in the game result and in the live leaderboard. Replay scores never replace a higher score.

**Freeze the counts during an Open House.** For a future event that uses more scored levels:

1. Add the next numbered level(s) and their photo/hotspot/question data to `games/hardware-challenge/hardware-data.js`; put the corresponding images in `games/hardware-challenge/assets/`.
2. In `js/config.js`, set the **new eventId** and change only the corresponding entry in `SCORED_LEVEL_COUNTS` (e.g. Hardware Challenge from `4` to `5`). **Do not change the count mid-event**, since that would alter scores already on the live leaderboard.
3. Run `node scripts/sync-firestore-rules.mjs` once. This generates the exact level-score IDs allowed by Firestore from the same config. **Publish the updated root `firestore.rules` in Firebase Console → Firestore Database → Rules**. Committing rules to GitHub alone will not publish them.
4. Run `node --test tests/*.mjs` and test on a phone + two computers before opening the event.

If a fifth hardware item is prepared during an existing event, you can add it to the collection, but it remains a **Next event** preview until you activate it in the next event's scored-level count. This is intentional: adding a fifth scoring level during an active four-level event would lower everyone's score even though they did nothing wrong. A hardware image can be used digitally without its physical component being displayed.

### Hardware image fidelity and hotspot review

The four launch assets in `games/hardware-challenge/assets/` are **cropped from the professor's original photographs, not AI recreations**. Their printed markings, chips, ports and other components are not redrawn. The first ASUS motherboard has **two** RAM slots, the second **four**, and the Dell board has its CPU installed. The wireless card retains the visible iMicro label. Crops were used because AI recreation can subtly replace critical board details.

A hidden QA aid shows every region outline for verification: open
`games/hardware-challenge/index.html?debug=hotspots` after joining. You can zoom the images and compare region boundaries against the physical component. The hotspots are configured as pixel-coordinate polygon points in `hardware-data.js`; changing the crop or image dimensions **requires adjusting the hotspot coordinates**. Keep the saved level IDs stable after launch to preserve scores.

The user-facing physical-display status isn't guessed from the photo. Future hardware can be added digitally even if no physical version is available at the event.

### Limitations and testing

- This static GitHub Pages site does not have a trusted backend, so a determined visitor could forge game outcomes. The Firestore rules constrain the allowed score IDs, ranges, player membership and best-score updates; they do not prove that someone tapped the right component.
- The score ID allowlist is generated by `scripts/sync-firestore-rules.mjs`; whenever you edit the scoring config you must regenerate **and publish** the rules.
- User scores are tied to the existing shared four-digit player code and existing Firebase project. No second account or Firebase project is needed.
- Local/demo mode saves only on that browser. Check that the demo banner disappears in your production deployment.

Official references: [Firebase Firestore security rules](https://firebase.google.com/docs/firestore/security/get-started), [Firebase transactions](https://firebase.google.com/docs/firestore/manage-data/transactions), [GitHub Pages static deployment](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages).
