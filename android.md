# Multi-surface plan — Android, desktop, extension (+ website as the shopfront)

**Status:** paused 2026-11-11. Resume from this file. It is the source of truth for the next session.
**Current repo state:** web app + media-free Express API pushed to `main` at `3bbb3ac2`.
The previous server-side downloader still exists in history at `4e0a7044` if needed.

---

## Decisions made (owner, 2026-11-11)

1. **Downloads move to user-owned hardware.** No media ever passes through our servers.
2. **Three product surfaces will be built:** Android app, desktop app, browser extension.
3. **All four platforms are in scope:** YouTube, TikTok, Instagram, Facebook.
4. **The website is rebranded into an advertising shopfront** for the apps — see §3.
5. **Backend runs on the owner's VPS via Coolify** (control plane only).
6. **Owner will buy a residential proxy** — but see the correction below before spending.
7. Order of work: **Android first** (the Snaptube-style core), then desktop, then extension.

---

## 1. ⚠️ Correction: the residential proxy does NOT fix browser downloads

The browser is blocked by three independent things, and a proxy only touches the
one that is not the blocker:

| Blocker | Fixed by residential proxy? |
|---|---|
| Media CDN sends no `Access-Control-Allow-Origin` | **No.** CORS is about the *host's response headers*. A new exit IP adds no header; page JS still cannot read the bytes. |
| Media URLs are signed to the resolving IP (`ip=…` in `sparams`) | **No — it makes it worse.** Resolve through the proxy and the URL is sealed to the *proxy's* IP; the phone requests from a different IP and gets 403. |
| Video and audio arrive as separate streams needing a muxer | **No.** A browser has no ffmpeg. Two files do not become one playable file. |

The only way a proxy makes a browser succeed is if the server fetches through it
and streams bytes down — a server-side downloader at residential bandwidth rates
(10–50× datacenter egress).

**What the proxy is actually for:** YouTube's 2026 anti-abuse stack rejects
datacenter IP ranges at TLS handshake and demands PO tokens / "confirm you're not
a bot". A Coolify VPS on Hetzner/DO/Contabo will hit that for **metadata** too. So
the proxy belongs on the **VPS control plane** (few KB per request), not the
download path.

**The devices already have residential IPs.** Phone, desktop and browser all sit
on the user's own connection, so the IP-seal is satisfied for free. Buy the proxy
only if M0 proves the VPS metadata endpoint is blocked.

---

## 2. Architecture

```
Android / Desktop / Extension
        │  extraction + download + mux  (on the user's device, user's IP)
        ▼
   media CDN  ◀── bytes go device ↔ CDN, never through us
        │
        └──▶ VPS (Coolify): classify, metadata, verdicts, app-update manifest
                             no media bytes, no job queue, no storage
```

**Rule to keep:** the VPS never downloads, proxies, transcodes or stores media.
That keeps hosting near-zero, keeps bandwidth at zero and keeps the legal surface
small. Any change to this rule goes into `DECISIONS.md` *first*.

---

## 3. Website becomes the shopfront (rebrand)

The existing Next.js UI is **not** deleted — it is repurposed as the place people
land before installing. Rebrand it to advertise the apps:

| Section | Becomes |
|---|---|
| Hero | "Download videos on your own device" + primary buttons: **Get it for Android** / **Get it for Desktop** / (secondary) **Add to browser** |
| Downloader | Keep it, demoted: a "check a link" panel that explains what works and, on a phone, offers **Open in app** (`flickgrab://`) |
| Features | Rewritten per surface: on-device processing, no upload, quality up to source, subtitles |
| How-It-Works | Install → share a link → saved to gallery/Downloads |
| App-status section | **Replaced** by real platform cards: version, size, last update, download buttons |
| Stats | Only real numbers (downloads served, versions shipped) — nothing invented |
| FAQ | Now explains the browser limitation AND the app model honestly |
| Footer | License, third-party notices, "only download what you have rights to" |

Platform detection on load (UA + `navigator.platform`) to surface the right button
first, with manual override. Buttons point at GitHub Releases assets until stores
exist.

**Do the same rebrand for the desktop and extension landing states** — one page,
three CTAs, no separate marketing sites.

**Open question:** keep the website's direct-file "Download to this device" path?
Recommendation: keep it (it works for CORS-allowed files and costs nothing), but
demote it to the "check a link" panel.

---

## 4. Surfaces and division of labour

| | Android app | Desktop app | Browser extension |
|---|---|---|---|
| Primary job | Snaptube-style downloads on the phone | Same, for PC/Mac/Linux, plus queue + playlists | One-click download from the page you're on |
| Extraction | yt-dlp (`youtubedl-android`) or NewPipe Extractor | Embedded yt-dlp binary | Shares the desktop helper's core |
| Muxing | Native ffmpeg | Native ffmpeg | Native helper via messaging (WASM fallback) |
| UI | Kotlin + Compose | See 4.2 | Popup + options page |
| Intake | Share sheet + paste | Paste, clipboard watch, drag-drop | Context menu on the current tab |
| Distribution | Signed APK, GitHub Releases + Obtainium | Signed installers, GitHub Releases | **Sideload only** (stores ban the category) |
| Effort | Largest | Medium | Smallest, but needs the desktop helper |

### 4.1 Android
Stack: Kotlin + Compose, `youtubedl-android` for extractor parity with yt-dlp,
Media3 `Transformer` for muxing where possible, ffmpeg binary as fallback (note:
**`ffmpeg-kit` is retired** — verify any binary before committing to it), save via
MediaStore to `Movies/FlickGrab/`.

### 4.2 Desktop
Two options, decide at spike:
- **Tauri** — ~10 MB binary, uses the OS webview, Rust for the native side. Smaller,
  better long-term; more setup.
- **Electron** — heavier (~150 MB) but the fastest path, and this repo already
  shipped an Electron app before, so the packaging knowledge exists.

Either way the desktop app is the **native-messaging host for the extension**, so
building it first also unblocks surface 3.

### 4.3 Extension
Works for three concrete reasons: `host_permissions` bypass CORS, it resolves *and*
downloads from the user's own IP (satisfying the seal), and a native helper muxes.
Watch out for: MV3 service workers dying after ~30 s (use an offscreen document or
`chrome.downloads.download`), and `ffmpeg.wasm` being slow/heavy.
**Chrome Web Store and AMO both remove YouTube downloaders** — plan for sideload.

---

## 5. Platform reality check (verify every row; don't trust this table)

| Platform | Extraction | Auth needed | Notes |
|---|---|---|---|
| YouTube | yt-dlp / NewPipe on device | PO token for most clients; cookies for age-gated | Most hostile target; breaks weekly; needs an update loop. |
| TikTok | yt-dlp extractor | Usually none for public posts | Watermark-free needs the app API. |
| Instagram | yt-dlp extractor | Cookies required — anonymous extraction is mostly dead | Encrypted local cookie store. |
| Facebook | yt-dlp extractor | Cookies required for most video | Same as Instagram. |

Instagram and Facebook *metadata* needs a Meta app access token — no anonymous
oEmbed. The web shopfront must say so rather than show an empty card.

---

## 6. Milestones

Format: `verify:` is the gate. Stop at the first red result; don't build UI ahead of it.

**M0 — Feasibility spike (highest risk).** Resolve + download one public YouTube
video entirely on a physical Android device into `Movies/FlickGrab/`.
`verify:` file plays with audio from the gallery. Record which client gave a usable
URL, whether a PO token was required, and where the failure (if any) landed: IP/TLS,
token, or SABR.
**Gate:** if the block lands on the device's own IP, re-plan before M1.

**M1 — Token/session strategy.** WebView attestation (sign in, capture visitor data
+ PO token) vs local token provider. Nothing stored on the VPS.
`verify:` a token-required video resolves twice, and refresh is exercised.

**M2 — Android download UI.** Share-sheet intake, paste, real quality list, real
progress.
`verify:` sharing a link from the YouTube app produces a playable file, no typing.

**M3 — TikTok.** `verify:` three public links, one watermark-free.

**M4 — Instagram + Facebook.** Encrypted cookie store, "sign in required" state,
logout wipes it. `verify:` one Reel and one Facebook video save and play.

**M5 — Desktop app.** yt-dlp + ffmpeg embedded, queue, folder picker.
`verify:` install on a clean machine, download 3 links from a playlist folder.

**M6 — Extension.** Native messaging to the desktop helper, context-menu download.
`verify:` one-click download from a YouTube tab, file appears complete and playable.

**M7 — Website rebrand.** Shopfront with per-platform CTAs and deep-link handoff
(`flickgrab://inspect?url=…`, `verify:` phone taps the button → app opens pre-filled).

**M8 — Release.** Signed APK + installers on GitHub Releases, Obtainium-compatible,
in-app update check against the VPS. No Play Store.

Order rationale: M0 de-risks everything; M5 should land before M6 because the
extension depends on the desktop helper; M7 can happen any time after M2.

---

## 7. VPS / Coolify plan

- **Runs:** shopfront (Next.js), Express API (classify/metadata/verdicts), release
  manifest for in-app updates, deep-link fallback page.
- **Does not run:** yt-dlp, ffmpeg, media storage.
- **Proxy:** only if metadata calls get blocked — route the API's outbound calls
  through it and cache metadata in memory to save proxy bandwidth.
- **Env:** `PORT`, `CORS_ORIGINS`, `FLICKGRAB_API_ORIGIN`, later `META_APP_TOKEN`.
- **Coolify:** one container per service, one domain, `/api/*` → Express (mirrors
  today's local Next rewrite).

---

## 8. Risks to accept openly

- **Maintenance treadmill.** YouTube breaks extractors routinely; the app rots
  without fixes every few weeks.
- **Distribution.** Play Store and both extension stores ban this category.
  Sideloading narrows reach and adds trust friction.
- **Legal.** Downloading content you don't own can breach platform terms and local
  law; a public service attracts takedown requests. Keep the rights warning, and
  don't market specific platforms as piracy tools.
- **Costs.** Zero media bandwidth today; any server-side streaming flips that to the
  largest line item overnight.
- **Three surfaces is a lot.** Each needs its own release pipeline; if time is short,
  Android + shopfront ship first and desktop/extension follow.

---

## 9. Open questions for next session

1. M0 gate: does the device's own IP pass, or does even the app need a proxy?
2. `youtubedl-android` vs NewPipe Extractor — choose from M0 results.
3. Mux path: Media3 Transformer reliable enough, or bundle ffmpeg?
4. Desktop: Tauri or Electron?
5. Keep the website's direct-file download, or drop it once "Open in app" exists?
6. Meta app registration for IG/FB metadata — willing to create one?
7. Extension: worth building if it's sideload-only, given desktop already covers PC?
