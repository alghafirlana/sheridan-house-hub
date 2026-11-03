HARDWARE CHALLENGE — PHOTO VIEWER & LAYOUT UPDATE

Based on the already-approved HC images + hotspot update.

WHAT CHANGED
- At 100%, the complete hardware photo fits within a fixed-height viewer. No internal scrollbars.
- Plus/minus zoom controls (up to 300%), Fit reset, drag-to-pan when zoomed, expandable viewer.
- SVG hotspots use the exact same contain/scale/translate geometry as the image.
- Cleaner gameplay spacing and shorter mobile layout, with the question above the photo.
- One clear back-to-Hardware-Challenge-home button; Exit to all levels is separate.
- Persistent unsaved-score warning if Firebase submit fails, with Retry saving score.
- Existing images, hotspot regions, randomization, Firestore rules and scoring logic unchanged.

INSTALL (RECOMMENDED)
1. Extract this update ZIP into the root of your existing Sheridan Game Hub repository.
2. Allow replacement of the two matching files:
   games/hardware-challenge/hardware.js
   games/hardware-challenge/hardware.css
3. Run the site locally using your current development workflow / VS Code Live Server.
4. Test: desktop + phone, fit at 100%, zoom, drag, Fit, expanded view,
   hotspots, Home, Exit to Levels, and finish/save a level.
5. Commit and push when satisfied.

No Firestore rules or Firebase configuration updates required for this UI-only patch.

VALIDATION
- 15 automated JavaScript tests passed.
- Isolated real-Chromium rendering at 1440x960 and 390x844 verified no
  internal photo scrolling at 100%, working hotspot clicks, zoom/Fit,
  expand/collapse, and no JavaScript page errors.
- Simulated failed score save verified a persistent warning, retry, then success.
- A full live-site Firebase/network browser test was not possible in this environment.

The four approved image files hc1.png–hc4.png are untouched.
