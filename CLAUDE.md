# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`@pipedrive/app-extensions-sdk` is a small client-side TypeScript library published to npm. It runs inside the iframe of a Pipedrive custom UI extension (panel, modal, or floating window) and lets that extension talk to the parent Pipedrive window via `postMessage`/`MessageChannel` — issuing commands (resize, open a modal, show a snackbar, etc.) and listening for events (visibility changes, user settings changes). There is no server component; the entire implementation lives in `src/`.

## Commands

- `npm run build` — compile `src/` with Rollup into `dist/` (CJS `dist/index.js` + UMD `dist/index.umd.js`, both via `tsc`/rollup-typescript, UMD is minified with terser).
- `npm run watch` — Rollup in watch mode.
- `npm test` — run Jest (`--passWithNoTests`; there are currently no test files, though the harness is fully configured — see Testing below).
- `npm run coverage` — Jest with coverage.
- `npm run lint` — `tsc --noEmit` followed by ESLint over `**/*.{js,jsx,ts,tsx}`.
- `npm run format` — Prettier write + `eslint --fix`.
- `npm run docs:ai` — invokes Claude Code headlessly with `.claude/prompts/readme-docs.md` as an appended system prompt to reconcile `README.md` against the current source/scripts.

Node >=22 and npm >=8 are required (`devEngines` in package.json); `.nvmrc` pins Node 24. A Husky `pre-commit` hook runs `npm run format && npm run lint` — don't bypass it.

## Testing

Jest is configured (`jest.config.js`) with `jsdom` environment and `testRegex: '__tests__/.*\.test\.[tj]s?$'` — new tests belong in a `__tests__/` directory (e.g. `src/__tests__/index.test.ts`) using that naming convention, not colocated `*.test.ts` files next to source. Coverage thresholds are currently set to 0, so nothing is enforced yet.

## Architecture

Everything lives in four files under `src/`:

- **`types.ts`** — the source of truth for the protocol: `Command` and `Event` enums (the full set of message types the parent window understands), plus the `Args<T>` / `CommandResponse<T>` mapped types that tie each `Command` to its request/response shape. Adding a new SDK capability starts here: add the enum member, then extend `Args`/`CommandResponse`.
- **`index.ts`** — the `AppExtensionsSDK` class. Two message-passing primitives underpin everything:
  - `postMessage()` (private) opens a `MessageChannel`, posts `{ payload, id: identifier }` to `this.window` (the parent, by default `window.parent`), and resolves/rejects based on the response received on `channel.port1`. `execute()` (public) is the typed wrapper around this for `Command`s.
  - `listen()` sets up either a `MessageChannel`-based subscription (for events proxied from the parent, e.g. `USER_SETTINGS_CHANGE`) or, for `PAGE_VISIBILITY_STATE`, a native `document.visibilitychange` listener — that one event never leaves the iframe. `listen()` also side-effects `this.userSettings` when a `USER_SETTINGS_CHANGE` payload arrives.
  - The SDK must be constructed with an `identifier` (auto-detected from the `?id=` URL query param via `detectIdentifier()` if not passed) and must have `initialize()` awaited before `execute()` will work — `execute()` throws if `initialized` is false.
- **`utils.ts`** — small DOM-dependent helpers used by the constructor: `detectIdentifier` (reads `?id=`), `detectUserSettings` (reads `?theme=`), `detectIframeFocus` (fires a callback on the iframe's first `focus` after a `blur`, used to emit the `FOCUSED` tracking event).
- **`umd.ts`** — a separate Rollup entry point that re-exports `AppExtensionsSDK` with all enums (`Command`, `Event`, `Modal`, `Color`, etc.) attached as static properties, for consumers loading the library via a plain `<script>` tag (global `AppExtensionsSDK`) instead of a module bundler.

Because every `Command`/`Event` is a discriminated union keyed off the enums in `types.ts`, changes to the wire protocol should be made there first and will then surface as type errors everywhere else that needs updating (`index.ts`'s `commandKeys`/`eventKeys` runtime guards included).

## Documentation

`README.md` is the single source of truth for public API docs and is organized into six top-level sections:
Overview, Setup, Testing, Architecture, Endpoints (Commands & Events), References/Links. "Endpoints" is a
deliberate misnomer kept for consistency with the org-wide docs template — this SDK has no HTTP endpoints; that
section documents the `Command`/`Event` protocol instead (Commands = "routes", `execute()`/`listen()` = "methods").
When changing public behavior in `src/`, update `README.md` to match — `npm run docs:ai` automates this
reconciliation but a manual edit is equally valid.

Notes for future doc reconciliation passes:
- The README currently contains no images, screenshots, or diagrams — if any are added later, they must be
  preserved verbatim on future passes.
- GitHub's Markdown anchor slugs depend only on heading *text*, not heading level — so nesting a section deeper
  (e.g. `## Commands` → `### Commands`) does not break existing `#commands`-style links elsewhere.
- `demo/`, `custom-modal-test/`, and `issue-63/` may exist locally but are untracked/gitignored scratch dirs, not
  part of the repository — do not reference them in `README.md` or treat them as documented structure.
- There are currently no test files anywhere in `src/` despite Jest being fully configured; `npm test` passes
  trivially via `--passWithNoTests`. Don't let README/CLAUDE docs imply real test coverage exists until it does.
- `npm run watch:sync` shells out to an `npm-utils` CLI that is not a listed `devDependency` — likely internal
  tooling; flag as "Needs verification" rather than assuming it works for external contributors.
- Verify every `[text](#anchor)` link's fragment against the real heading slug it targets, not just that the
  target heading exists somewhere. The README carried a broken link for at least several releases —
  `[JSON modal](#json-modal)` in the "Open modal" intro pointed at a heading literally titled "JSON modal
  action" (slug `#json-modal-action`) — because the link text and heading text quietly drifted apart. Fixed in
  the `b4ce00d`+ doc restructure; re-check this class of bug (link text ≠ heading text) on future passes.
