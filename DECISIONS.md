# Product Decisions

## 2026-11-11 — Media-free control plane on Express (supersedes the backend entry below)

**Decision.** The backend was rebuilt as an Express service that never touches
media. It classifies a link, expands share URLs, reads public oEmbed metadata and
returns an honest verdict. It runs no `yt-dlp`, no `ffmpeg`, keeps no job queue,
writes no temp files, and proxies no bytes.

**Why the pivot.** The blueprint's Phase 4B requires browser feasibility to be
measured, not assumed (`plan.md` §5.2, `IMPLEMENTATION_ROADMAP.md` Phase 4). Those
measurements were taken on 2026-11-11 against a public YouTube video:

| Probe | Result |
|---|---|
| Muxed video+audio format | None available (`-f "b[ext=mp4]/b"` fails). Every video format reports `acodec: none`, so HD needs a local muxer. |
| URL portability | `ip=…` is present and listed in `sparams`, so a signed URL is sealed to the resolving host's IP. A phone on another network gets 403. |
| CORS | `Origin` request returns no `Access-Control-Allow-Origin`; browser JS cannot read the stream. |

Together those mean **no browser, on any device, can download YouTube media** —
not with a server and not without one. Handing the phone a resolved URL would
produce a 403, which the blueprint forbids pretending otherwise ("no fabricated
compatibility claims", `plan.md` §2.5).

**What replaced the downloader.** A per-link verdict from `server/capabilities.ts`,
surfaced in the UI. Direct media URLs (`.mp4`, `.webm`, `.mp3`, …) are the one
class a browser can genuinely save, so those are offered as an on-device download:
the browser fetches the file from its host and writes it locally.

**Consequences.**

- The server needs no CPU, bandwidth or disk for media, and holds no user data.
- YouTube, Instagram and TikTok links are identified but not downloadable here.
  Real support requires an on-device runtime (the planned Android build), which
  the blueprint already gates behind a physical-device feasibility spike.
- `ffmpeg-static`, the yt-dlp fetch script and the whole download pipeline were
  removed, so `yt-dlp` and FFmpeg no longer appear in third-party notices.

**Superseded:** the entry below (server-side yt-dlp downloads) was the previous
thirteen-hour state of this repository and remains in git history at `4e0a7044`.

## 2026-11-11 — Web-only project (historical)

**Decision.** The Electron desktop app, its renderer, the publishable workspace
packages, release tooling, translations and their docs were removed. The Next.js
prototype was promoted to the repository root and is now the only product surface.

The earlier entry also declared a server-side `yt-dlp` backend, overriding
`arroxy blueprint/plan.md` §2.1. That override is withdrawn by the entry above.

## 2026-11-11 — Brand

`FlickGrab` remains the working product name. No trademark clearance has been
performed.
