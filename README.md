# Disney+ Picture in Picture

A small Manifest V3 Chrome/Edge extension that restores Picture-in-Picture controls to the Disney+ web player.

## Features

- Adds an accessible PiP button near the lower-right corner of the Disney+ player.
- Uses the same button to leave PiP again.
- Provides the extension toolbar icon as a fallback toggle.
- Removes Disney+'s `disablepictureinpicture` flag from the active video.
- Handles client-side navigation, recreated video elements, preload videos, open shadow roots, and fullscreen mode.
- Includes no analytics, tracking, storage, or external requests.

## Stack

- TypeScript
- Vite 8
- CRXJS Vite plugin (Manifest V3)
- Vitest
- ESLint + typescript-eslint
- Prettier
- GitHub Actions

## Project structure

```text
src/
  background/             # Toolbar action and page injection
  content/                # PiP controller, player button, toast, and styles
  disney/                 # Disney+ player/video adapter and selection logic
  shared/                 # Shared URL helpers
public/icons/              # Chrome extension icons
tests/                     # Unit tests for player selection and URL checks
scripts/                   # Release packaging/version checks
.github/workflows/         # CI and releases
```

Disney+ selectors and video discovery belong in `src/disney/`. Keeping site-specific DOM knowledge there makes future player changes easier to repair without spreading brittle selectors through the extension.

## Development

Requirements: Node.js 22.13+.

```bash
npm install
npm run dev
```

CRXJS/Vite writes the development extension to `dist/`. In Chrome:

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked**.
4. Select the `dist/` directory.
5. Reload an already-open Disney+ tab once.

## Validation

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Or run the main checks with:

```bash
npm run check
```

## Production package

```bash
npm run package
```

This creates:

```text
release/disney-plus-pip-<version>.zip
```

`package.json` is the source of truth for the version. `manifest.config.ts` reads it during the build, and the packaging script refuses to package a mismatched manifest.

## Branches and releases

The repository follows the same flow as YouTube Tools:

```text
feature/* -> development -> main -> vX.Y.Z tag -> GitHub Release
```

- `development` is the integration branch.
- `main` is the stable/release branch.
- CI validates formatting, linting, types, tests, build output, and the ZIP package.
- The **Promote & Release** workflow bumps the version, promotes `development` to `main`, tags it, and attaches the ZIP to a GitHub Release.
- The tag-based **Release** workflow also supports releases created from an up-to-date local `main` branch.

## Privacy

Disney+ Picture in Picture does not collect data, make network requests, or store user preferences. It only interacts with the Disney+ player in the current tab.

## Disclaimer

This is an unofficial extension and is not affiliated with Disney. Disney+ may change its web player at any time.
