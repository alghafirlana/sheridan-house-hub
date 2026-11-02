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
