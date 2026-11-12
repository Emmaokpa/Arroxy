# AGENTS.md

FlickGrab is a **Next.js 16 web app** plus a small **Express API**, and a Kotlin +
Compose **Android app** under `android/`. The Android app is currently a UI shell: it
has no extractor, muxer or download path yet (milestones M0–M2 in `android.md`). There
is no media pipeline on any server anywhere in this repository.

- `src/app` — page
- `src/components` — UI
- `src/lib` — shared contracts (zod) and URL classification, used by both sides
- `server/` — Express API (config, app, inspect, metadata, links, capabilities)
- `tests/server` — API tests
- `android/` — Compose app; see `android/README.md` for its build and honesty rules

## Commands

```bash
npm install
npm run dev        # web :3000 + API :4000
npm test           # vitest + supertest
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run build      # next build

# Android (needs JDK 17, Android SDK 35, Gradle 8.9 — none are installed on every machine)
cd android && ./gradlew :app:assembleDebug
```

## Hard invariants

- **No media on the server.** Never add a route that downloads, proxies, muxes,
  transcodes, stores or streams video/audio, and never add `yt-dlp`, `ffmpeg` or
  a job queue. This is the product's core promise, not a preference.
- **No fabricated capability.** `server/capabilities.ts` is the single source of
  truth for what each source can do, and every row quotes something measured.
  Re-run a probe before changing a row; never upgrade a source on optimism.
- **No fake UI.** Do not render a download button, progress bar or quality picker
  the backend cannot back. If a source cannot be saved in a browser, say so.
- **Only measured claims in copy and docs.** The landing page, FAQ and README
  describe what the build does today — no review counts, no invented formats.

## Engineering rules

- **Strict TypeScript.** No `any` in production code. Parse third-party and
  request data from `unknown` with zod before it reaches domain logic.
- **Trust boundaries.** Request bodies go through `src/lib/contracts.ts`. oEmbed
  responses and redirect targets are validated before use.
- **Only allowlisted hosts are contacted.** Short-link expansion follows at most
  three hops, reads `Location` instead of following it, and rejects any hop that
  leaves a supported source. Never fetch a user-supplied URL server-side — the
  direct-file path is downloaded by the browser, which also avoids SSRF.
- **Rate limits stay on.** `POST /api/inspect` is capped per address; raise the
  cap deliberately, never remove it to make a test pass.
- **Two processes.** The UI is served by Next and proxies `/api/*` to Express via
  `next.config.ts`. Keep the origin configurable with `FLICKGRAB_API_ORIGIN`.
- **No new heavy dependencies.** The API needs no ORM, database, queue or
  template engine; adding one contradicts the product constraints.
- **Android preview data stays fenced.** Placeholder items may only be served by
  `PreviewMediaRepository` when `BuildConfig.PREVIEW_DATA` is true (debug builds),
  and every task it produces must say `PREVIEW` in the UI. Release builds use
  `EmptyMediaRepository` and show the not-wired state. Never ship a fake download
  button, progress bar or quality list.

## Product constraints

- Supported sources: YouTube, Instagram, TikTok, plus direct media URLs.
- Only YouTube/TikTok metadata is publicly readable (oEmbed); Instagram needs a
  Meta token, which this deployment does not have.
- If a future change makes on-device downloads real (e.g. an Android build), keep
  the web surface honest and update `capabilities.ts` with fresh measurements.
