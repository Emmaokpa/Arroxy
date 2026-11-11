# AGENTS.md

FlickGrab is a **Next.js 16 web app** (App Router, React 19, Tailwind v4). There is
no desktop app. The whole product lives in this repo:

- `src/app` — pages and API routes
- `src/components` — UI
- `src/lib` — server-side yt-dlp integration, job manager, shared contracts

## Commands

```bash
npm install
npm run setup:bin     # fetch yt-dlp into .bin/ (needed for real downloads)
npm run dev           # http://localhost:3000
npm run typecheck     # tsc --noEmit
npm run lint          # eslint
npm run build         # production build
```

`GET /api/health` reports whether `yt-dlp` and `ffmpeg` are available.

## Engineering rules

- **Strict TypeScript.** No `any` in production code. Use `unknown` plus a
  parser at trust boundaries.
- **Validate at boundaries.** API request bodies and third-party process output
  go through the zod schemas in `src/lib/contracts.ts` or `src/lib/ytdlp.ts`
  before domain code sees them.
- **No fake behavior.** Never ship a button, progress bar or metadata field that
  is not backed by a real request/process. The prototype's simulated downloader
  was removed for this reason.
- **Only supported sources.** URL classification and host allowlisting live in
  `src/lib/sources.ts`. Do not pass arbitrary user URLs to `yt-dlp`.
- **No shell interpolation.** Spawn `yt-dlp` with `spawn`/`execFile` and argument
  arrays, never a shell string.
- **Client never talks to the binaries.** The browser only calls the Next.js API
  routes.
- **Downloads are ephemeral.** Jobs are in-memory and files live in the OS temp
  directory with a 30-minute TTL. Do not add a database or user accounts without
  an explicit product decision.
- The project runs on Node 22.13+ with npm. Bun is optional; do not add scripts
  that require a package manager the project does not declare.

## Product constraints

- Supported sources: YouTube, Instagram, TikTok.
- Deploying publicly means the server runs `yt-dlp` on user-supplied links:
  review platform terms, copyright law and hosting/abuse limits before shipping.
- `ffmpeg` comes from the `ffmpeg-static` npm package. Without a working ffmpeg,
  only progressive video and original audio streams are offered — do not claim
  MP3 conversion or HD merging when it is unavailable.
