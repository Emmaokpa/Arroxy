# FlickGrab

A media-free link control plane with an honest web UI. Paste a YouTube,
Instagram, TikTok or direct media link and FlickGrab tells you what it is, what
the browser can actually do with it, and why — then saves direct files on your
own device.

**No video ever passes through the server.** There is no downloader, no proxy, no
muxer and no media storage in this repository.

## Requirements

- Node.js 22.13+

## Setup

```bash
npm install
npm run dev        # web on :3000, API on :4000
```

## Why the browser cannot download YouTube, TikTok or Instagram

These are measured facts (2026-11-11), not guesses:

| Probe | Result |
|---|---|
| Muxed video+audio stream | None exists; every video format is video-only and needs a local muxer |
| Signed URL portability | URLs carry `ip=…` in their signed parameters, so they only work from the address that resolved them |
| CORS | The CDN returns no `Access-Control-Allow-Origin`, so page JavaScript cannot read the bytes |

A web page therefore cannot download these sources — with or without a backend.
FlickGrab says so instead of starting a download that would fail. The only
architecture that genuinely works is an on-device runtime (the planned app),
which is why nothing here fakes one.

Direct media links (`https://…/video.mp4`) are different: the browser can fetch
those from their host and save them locally, so that path is real.

## Architecture

```
browser ──▶ Next.js (:3000) ──/api rewrite──▶ Express (:4000) ──▶ public oEmbed
   │                                              (metadata only)
   └── direct media files fetched from their own host, never our server
```

- `src/app`, `src/components` — the UI
- `src/lib` — shared contracts (zod) and URL classification/canonicalisation
- `server/` — the Express API

## API

| Route | Purpose |
|---|---|
| `GET /api/health` | Readiness and uptime |
| `GET /api/capabilities` | What each source can do in a browser, with reasons |
| `POST /api/inspect` | `{ "url": "…" }` → canonical URL, public metadata, verdict |

The UI calls these through Next's rewrite, so the browser stays same-origin. The
API also allows direct cross-origin calls from the origins in `CORS_ORIGINS`.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Run web + API together |
| `npm run dev:web` / `npm run dev:api` | Run one side only |
| `npm run build` | Production build of the web app |
| `npm start` | Run the production web app + API |
| `npm test` | API tests (vitest + supertest) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `4000` | API port |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | Comma-separated allowlist for direct API calls |
| `FLICKGRAB_API_ORIGIN` | `http://127.0.0.1:4000` | Where Next proxies `/api/*` |

## Limitations

- YouTube, Instagram and TikTok links are classified but **not downloadable**
  here; that needs an on-device runtime.
- Instagram metadata needs a Meta app access token, so it returns a note instead.
- Direct-file saving depends on the host allowing cross-origin reads; browsers
  also have to hold the file in memory, so files above 512 MB are refused.
- No accounts, no database, no analytics, nothing persisted.
- The web app and API are two processes; run both in production.

## License

MIT — see [`LICENSE`](LICENSE) and [`THIRD_PARTY_NOTICES.txt`](THIRD_PARTY_NOTICES.txt).
