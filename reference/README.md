# Peek Photobooth (Multi‑Page Edition)

Hands‑free browser photobooth that captures 9 shots, lets you pick the best 4, style them, and download a collage — all locally. Now styled with a subtle classic / renaissance gold-accent theme.

## Flow (4 Steps)
1. Welcome (index) – explains process.
2. Layout & Capture – pick grid, auto 9-shot session (every 8s, visible 5s countdown before each shot).
3. Select – choose exactly 4 favorites from the captured set.
4. Templates & Final – pick a frame style, choose Color or B&W, download PNG.

State (layout, captures, selections, template, mode) is persisted across pages using `sessionStorage` so you can navigate back without losing progress (until the tab is closed).

## Run Locally
Start the simple static server:
```
npm start
```
Visit http://localhost:3000

Or open `index.html` directly (camera APIs may require localhost/HTTPS for some browsers).

## Key Files
- `index.html` – Welcome page
- `layout.html` – Step 1 (layout + capture)
- `select.html` – Step 2 (choose 4)
- `templates.html` – Step 3 (frame style)
- `final.html` – Step 4 (mode + download)
- `app.js` – Core logic (layouts, capture session, selection, collage build)
- `pages.js` – Lightweight multi-page state persistence wrapper
- `styles.css` – Unified styling

## Current Features
- Automatic timed capture (9 frames / 8s interval)
- Countdown overlay for last 5 seconds of each interval
- Select exactly 4 best shots
- Frame style selection (placeholder styles) + color/B&W filter
- PNG download with layout grid

## Ideas / Roadmap
- More diverse layouts (strip, film) and configurable counts
- Custom frame designer / overlay support
- Cropping & drag reposition inside slots
- Stickers / text layers before export
- Animated GIF export
- Print layout (paper size presets)
- Offline PWA support & “retake” specific shots

## Privacy
All processing happens in-browser; images are never uploaded to a server.

## License
MIT
