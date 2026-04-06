# Copilot instructions

This repo is a small static countdown timer app with two main pages:
- `index.html` + `controlScript.js`: controller settings UI for duration, sync-to-minute/hour, event title, and optional completion image.
- `display.html` + `displayScript.js`: live full-screen display that reads state from `localStorage` and updates via `storage` events.

Key project details:
- State is passed between the controller and display pages using localStorage keys: `timerSeconds`, `timerTotalSeconds`, `eventTitle`, and `completionImage`.
- `controlScript.js` is the single source of truth for timer state and uses `window.open('display.html', ...)` to launch the display window.
- `displayScript.js` does not communicate back to the controller; it only listens for `storage` events and reads initial values on load.
- The completion image is stored as a Base64 data URL in `localStorage` and applied to `#completion-overlay` in `display.html`.
- `sync-minute-btn` and `sync-hour-btn` use a `targetTime` flow instead of a raw duration; this is a different timer mode in `controlScript.js`.

Conventions and workflows:
- There is no build tool, bundler, or test suite in this repo. Work directly with the HTML/CSS/JS files.
- Use a browser or simple local server from the repo root, e.g. `python -m http.server 8000`, then open `http://localhost:8000/index.html`.
- Ignore backup files with `_old` suffix, such as `controlScript_old.js`, `display_old.html`, and `index_old.html`.
- `index.html` uses Tailwind CDN plus `styles.css` for the controller page; `display.html` keeps its own inline CSS for the live timer display.
- Keep presentation updates in `displayScript.js` and controller logic in `controlScript.js`.

Important files:
- `index.html` — controller UI and event wiring point.
- `controlScript.js` — timer lifecycle, sync behavior, localStorage writes, and image upload handling.
- `display.html` — live display layout, overlay, and progress bar.
- `displayScript.js` — read-only display state, urgency styling, and completion overlay logic.
- `styles.css` — shared and controller-specific styling.

When editing, preserve the existing localStorage contract and the two-window communication pattern.
