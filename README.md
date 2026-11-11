# FlickGrab

A web video downloader for YouTube, Instagram and TikTok. The Next.js app in
`src/` is the entire product: a marketing landing page plus a real download
flow backed by server-side `yt-dlp`.

## Requirements

- Node.js 22.13+
- `yt-dlp` on the server (fetched into `.bin/` by the setup script)
- `ffmpeg` — installed automatically by npm via `ffmpeg-static`; used for video+audio merging and MP3 conversion

## Setup

```bash
npm install
npm run setup:bin        # downloads yt-dlp into .bin/ (or set YTDLP_PATH)
npm run dev              # http://localhost:3000
```

Check readiness at `GET /api/health`. It reports whether `yt-dlp` and `ffmpeg`
were found.

Environment variables (all optional):

| Variable | Purpose |
|---|---|
| `YTDLP_PATH` | Absolute path to a yt-dlp binary. Overrides `.bin/`. |
| `FFMPEG_PATH` | Absolute path to an ffmpeg binary. Defaults to `.bin/ffmpeg`, then `ffmpeg-static`, then `ffmpeg` on `PATH`. |

## How it works

1. `POST /api/analyze` validates the URL against the supported hosts, probes it
   with `yt-dlp --dump-single-json`, and returns real metadata plus download
   options.
2. `POST /api/download` verifies the requested option is actually offered for
   that link, then starts a background `yt-dlp` process.
3. `GET /api/download/[id]` reports progress; `GET /api/download/[id]/file`
   streams the finished file to the browser.
4. Temporary files live under the OS temp directory and are deleted after 30
   minutes. No database, accounts or queue persistence.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run setup:bin` | Download the standalone yt-dlp binary |

Bun works too (`bun install`, `bun run dev`); the scripts are package-manager agnostic.

## Notes

- Downloads run on the server. Deploying this publicly means paying for CPU,
  bandwidth and temporary disk, and it is your responsibility to review the
  target platforms' terms and local copyright law.
- Only `youtube.com`, `youtu.be`, `instagram.com` and `tiktok.com` (including
  subdomains) are accepted.

## License

MIT — see [`LICENSE`](LICENSE) and [`THIRD_PARTY_NOTICES.txt`](THIRD_PARTY_NOTICES.txt).
