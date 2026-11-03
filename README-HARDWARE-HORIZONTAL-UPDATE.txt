Sheridan Game Hub — Hardware Challenge horizontal-viewer update

Apply to the existing game:
1. Extract sheridan-hardware-horizontal-update.zip into the ROOT of your current Sheridan Game Hub repository.
2. Allow the matching 5 files to be replaced.
3. Preview games/hardware-challenge/index.html through your local dev server.
4. Verify all 4 missions: click hotspots at Fit 100%, zoom in, pan, rotate, and open expanded view.
5. Confirm Firebase score saving in your actual deployed configuration before the event.

CHANGED FILES:
- games/hardware-challenge/hardware-data.js
  Adds displayRotation (90 on 2 ASUS/Dell motherboards; 0 on Wi-Fi adapter)
  Removes orientation-dependent question wording (top/right) so questions remain correct after rotation.
- games/hardware-challenge/hardware-logic.js
  Adds pure fittedPhotoGeometry helper for portrait/landscape contain fit.
- games/hardware-challenge/hardware.js
  Rotates photo and SVG together, adds Rotate button, makes expanded prompt labels separate.
  Uses the original hotspots unchanged, supports rotate/zoom/pan with bounded panning.
  On narrow mobile screens, shows motherboard images in portrait by default.
- games/hardware-challenge/hardware.css
  Sets centred natural-aspect photo stage; styles expanded prompt and rotate control.
- tests/hardware-challenge.test.mjs
  New orientation and geometry regression test.

FUTURE HARDWARE:
- Specify displayRotation: 0 or 90 in the item in hardware-data.js.
- Each image and SVG hotspots are transformed together at display time.
- Original hc1.png - hc4.png image bytes were NOT modified.
- Existing hotspot polygon coordinates were NOT modified.
- Score counting, Firebase rules, and Campus Quest were NOT modified.

Testing:
- 16 node tests passed.
- Isolated Chromium render using the actual page CSS/JS and a mocked player showed horizontal default, correct aligned CPU polygon, functional rotate button, and expanded heading with correct spacing.
- Mobile viewport layout verified with no horizontal document overflow.
- These tests did not contact or write to live Firebase. Confirm real score saving yourself.

Commands:
  node --test tests/*.test.mjs
  git add games/hardware-challenge/ tests/hardware-challenge.test.mjs
  git commit -m "Improve Hardware Challenge landscape photo viewer and expanded prompt"
  git push origin main
