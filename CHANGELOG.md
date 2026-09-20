# Changelog

All notable changes to this project will be documented in this file.

## [1.0.3] - 2026-09-20

### Changed

- Restyle the PiP button to match Disney+'s compact video controls.
- Position the button inside the video's top-right corner instead of over the bottom controls.

## [1.0.2] - 2026-09-20

### Fixed

- Generate valid content-script bundles by preventing the source-map comment from swallowing CRXJS's closing wrapper.
- Validate the syntax of every generated JavaScript file during each build.

## [1.0.1] - 2026-09-20

### Fixed

- Mount the PiP control immediately and use inline visibility fallbacks so Disney+ player changes cannot hide it.

## [1.0.0] - 2026-09-20

### Added

- Picture-in-Picture button for the Disney+ web player.
- Toolbar action for toggling PiP.
- Support for Disney+ client-side navigation, fullscreen playback, and recreated video elements.
- Isolated Shadow DOM overlay so Disney+ player styles and clipping cannot hide the PiP button.
- TypeScript, Vite, CRXJS, Vitest, ESLint, and Prettier project setup.
- CI, packaging, promotion, tagging, and GitHub Release workflows.
