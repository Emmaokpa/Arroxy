# Product Decisions

## 2026-11-11 — Web-only project with a real download backend

**Decision.** The Electron desktop app, its renderer, the publishable workspace
packages, release tooling, translations and their docs were removed. The Next.js
app in `client/nextjs-snaptube-clone-ui (3)` was promoted to the repository root
and is now the only product surface.

**Backend.** This overrides the earlier blueprint constraint in
`arroxy blueprint/plan.md` §2.1 ("no server-side video downloading/proxying").
The owner chose a real backend so the download UI does something real instead of
simulating progress. Consequences accepted with that choice:

- The server runs `yt-dlp` on user-supplied URLs and temporarily stores the
  produced file in the OS temp directory (30-minute TTL).
- Hosting must tolerate CPU, bandwidth and temporary disk for downloads.
- Platform terms, copyright and abuse limits now apply to this deployment and
  need review before it is made public.
- `ffmpeg` remains optional. Without it the app offers progressive video and
  original audio streams only; MP3 conversion and HD merging are unavailable.

**Why a backend at all.** A browser cannot run `yt-dlp`, and the target sources
block cross-origin media fetches. Without a server the "Download" buttons could
only ever be decorative, which the blueprint (and good practice) forbids.

**Scope intentionally left out.**

- No database, accounts, auth or persisted queue. The Drizzle/PostgreSQL template
  code and the `/api/health` database check were removed.
- No ads, analytics or telemetry.
- No desktop app and no Android app.

**Known limitations.**

- Jobs are in-memory: a server restart loses in-flight downloads.
- At most 3 concurrent downloads; temporary files expire after 30 minutes.
- Only `youtube.com`, `youtu.be`, `instagram.com` and `tiktok.com` hosts are
  accepted.

## 2026-11-11 — Brand

`FlickGrab` remains the working product name. No trademark clearance has been
performed.
