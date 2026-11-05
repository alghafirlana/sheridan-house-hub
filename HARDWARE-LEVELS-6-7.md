# Hardware Challenge — illustrated practice levels 6 and 7

Two new *optional practice* missions have been added to Explore Hardware:

- Level 6 **Laptop Repair Lab** — 11 selectable components (battery, two fans, copper heat pipes, fin stacks, SO-DIMM, M.2 SSD, WLAN module, flexible ribbon cable and two speakers); 6 randomized prompts per attempt.
- Level 7 **Ports & Connections** — 8 connector types (USB Type-A, USB Type-C, HDMI Type-A, DisplayPort, Ethernet 8P8C/RJ45-style, analog 3.5 mm audio, VGA DE-15, full-size SD); 6 randomized prompts per attempt.

## Images and coordinate precision

The two images are **original technical illustrations** with the same soft beige/off-white background as `hc5.png`, not photos of actual hardware. Every visible component is drawn in a known original pixel coordinate system (1448 × 1086). In both new levels, the `regions` values are emitted from exactly the same geometry used to render the illustration. This prevents the visual-coordinate drift experienced when manually tracing AI-generated hardware photos. Target polygons do not overlap other target polygons in either new level.

Files:

- `games/hardware-challenge/assets/hc6.png` and `hc6-source.svg` (plus `hc6-thumbnail.jpg`)
- `games/hardware-challenge/assets/hc7.png` and `hc7-source.svg` (plus `hc7-thumbnail.jpg`)
- `games/hardware-challenge/hardware-laptop-level.js` and `hardware-ports-level.js`
- `games/hardware-challenge/new-level-hotspot-map.json` — exported geometry for regression tests
- `scripts/render-hardware-levels.py` — source script for art generation (optional)

To regenerate the same images and geometry export, install `Pillow`, `CairoSVG` and `Shapely` then run `python scripts/render-hardware-levels.py`. **If modifying the generator**, update the matching target polygons in `hardware-laptop-level.js` and `hardware-ports-level.js` from the regenerated JSON before deploying. The `new-hardware-levels.test.mjs` regression test checks for drift.

## Scoring and rules

Levels 1–5 and their original asset images, question data and hotspot coordinates are unchanged. `js/config.js` continues to score five Hardware Challenge levels. Levels 6–7 are playable practice (do not submit to Firestore, cannot alter a participant's score), and remain outside Quick Challenge's competitive selection. The practice results UI now uses the current level's name instead of wrongly calling every practice round a server mission.

No Firestore changes are required unless you later intentionally change the scoring roster for a **new event**. Do not increase the scored level count during an event without considering the leaderboard effect.

## Visual identification references

The illustrations are educational arrangements, **not a diagram of a specific Dell/Intel laptop or a claim that all these connectors appear together on one real machine**. Component roles and visual teaching points were checked against:

- Dell Inspiron 15 5501 service manual — major components and typical internals: https://www.dell.com/support/manuals/en-mp/inspiron-15-5501-laptop/inspiron-5501-service-manual/major-components-of-inspiron-15-5501?guid=guid-34b6572b-98d5-45ff-94f8-6b4651c7571d&lang=en-us
- Dell Latitude 7530 — major components: https://www.dell.com/support/manuals/en-in/latitude-15-7530-laptop/lat-7530_sm/major-components-of-latitude-7530?guid=guid-d8923b1b-17a3-4f3c-afa1-8bb58d464e96&lang=en-us
- USB Implementers Forum — USB-C connector specification and reversibility: https://www.usb.org/usb-type-cr-cable-and-connector-specification
- Intel — standard HDMI Type-A pin and connector reference: https://www.intel.com/content/www/us/en/support/articles/000029650/graphics.html

## QA

Run `node --test tests/*.test.mjs` from the project root. Then serve `index.html` via a local static HTTP server (for example VS Code Live Server) and manually open both missions at `games/hardware-challenge/index.html?debug=hotspots`. Verify mobile/desktop Fit and Expand views and a complete practice attempt before event day.
