# Multi-surface plan — Android, desktop, extension (+ website as the shopfront)

**Status:** resumed 2026-11-12. Android UI shell is in `android/` (see §0) and the
next gate is M0, which needs a physical device and an Android SDK.
**Current repo state:** web app + media-free Express API on `main` at `ceb63365`, plus
the new `android/` Compose app (uncompiled — no SDK on the last machine).
The previous server-side downloader still exists in history at `4e0a7044` if needed.

---

## Decisions made (owner, 2026-11-11)

1. **Downloads move to user-owned hardware.** No media ever passes through our servers.
2. **Two product surfaces will be built:** Android app, then desktop app. The browser
   extension is dropped (2026-11-12, see §0).
3. **All four platforms are in scope:** YouTube, TikTok, Instagram, Facebook.
4. **The website is rebranded into an advertising shopfront** for the apps — see §3.
5. **Backend runs on the owner's VPS via Coolify** (control plane only).
6. **Owner will buy a residential proxy** — but see the correction below before spending.
7. Order of work: **Android first** (the Snaptube-style core), then desktop.
8. **Desktop means Electron, not Tauri** (owner, 2026-11-12). Faster path, and this
   repository already shipped Electron once, so the packaging knowledge exists.

---

## 0. Session log — 2026-11-12

**Built:** the Android UI shell at `android/` (Kotlin + Compose, Material 3, dark only).
It covers the whole M2 surface without the extractor:

- Bottom-nav shell: Home, Downloads, Library, Settings.
- Home: greeting app bar, search with clipboard paste, source filter chips, animated
  spotlight card, two-column feed.
- Quality sheet: video/audio segment, per-format rows with container and size, mux
  explanation, save-location row, gradient CTA.
- Progress modal: circular progress, stage timeline (resolve → download → merge →
  save), speed, ETA, bytes written, cancel and "run in background".
- Downloads queue, active-download strip above the nav bar, Library grid.
- Settings: save location, processing note, Wi-Fi-only toggle, and the measured
  capability table copied from `server/capabilities.ts`.
- Intake: share-sheet `ACTION_SEND` text and `flickgrab://inspect?url=…`, with a
  "link received" dialog before anything is resolved.
- Browser design preview at `android/preview/index.html` — one self-contained file,
  no build or server, with clickable Home → quality sheet → progress → queue flow and
  hash-addressable screens. Verified rendering all seven screens in headless Chrome;
  it is a design artefact, not a second implementation.

**Honesty rule used:** placeholder data lives behind `BuildConfig.PREVIEW_DATA`.
Debug builds use `PreviewMediaRepository` and label every simulated task `PREVIEW`;
release builds use `EmptyMediaRepository`, which renders the "no extractor wired
 yet" state instead of a fake download. Details in `android/README.md`.

**UI direction:** the owner asked for a Snaptube-like screen set. Implemented as the
same *layout grammar* (feed → quality sheet → progress → downloads queue) with
FlickGrab's own palette, type scale and components — not a copy of that app's
artwork, icons or branding, which are not ours to reproduce.

**Not verified:** the project has never been compiled. This machine has no JDK, no
Gradle and no `ANDROID_HOME`, so the only checks run were a structural pass over the
Kotlin sources. First sync in Android Studio is expected to surface a few API-level
fixes.

**Next actions, in order:**

1. Install JDK 17 + Android SDK 35 (or open `android/` in Android Studio) and get a
   green `assembleDebug`. Generate the wrapper JAR once: `gradle wrapper`.
2. Run M0 on a physical phone. Do not build more Android UI before its gate passes.
3. Replace the repository implementations with the real extractor behind the same
   `MediaRepository` interface; no UI changes are needed.
4. MediaStore write + share target, then delete `PREVIEW_DATA` and the demo list.

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

| | Android app | Desktop app (Electron) |
|---|---|---|
| Primary job | Snaptube-style downloads on the phone | Same, for PC/Mac/Linux, plus queue + playlists |
| Extraction | yt-dlp (`youtubedl-android`) or NewPipe Extractor | Embedded yt-dlp binary |
| Muxing | Media3 Transformer, ffmpeg binary as fallback | Native ffmpeg |
| UI | Kotlin + Compose (built, see §0) | Electron renderer, shares the web design system |
| Intake | Share sheet + paste | Paste, clipboard watch, drag-drop |
| Distribution | Signed APK, GitHub Releases + Obtainium | Signed installers, GitHub Releases |
| Effort | Largest | Medium |

**Dropped:** the browser extension. It only ever worked as a thin client of the
desktop helper, stores remove this category, and the desktop app already covers PC.
Keeping it would add a third release pipeline for the smallest surface.

### 4.1 Android
Stack: Kotlin + Compose, `youtubedl-android` for extractor parity with yt-dlp,
Media3 `Transformer` for muxing where possible, ffmpeg binary as fallback (note:
**`ffmpeg-kit` is retired** — verify any binary before committing to it), save via
MediaStore to `Movies/FlickGrab/`.

### 4.2 Desktop
**Electron** (owner decision, 2026-11-12). Heavier than Tauri but the fastest path,
and this repository already shipped an Electron app, so the packaging knowledge and
an older renderer are both in history if we need them.

The app embeds yt-dlp + ffmpeg, keeps a queue with a folder picker, and reuses the
palette and components from `android/` and the website so the three surfaces read as
one product. No native-messaging host is needed any more, since the extension is
dropped.

### 4.3 Extension — dropped
No longer in scope (2026-11-12). The reasons it could ever have worked are also the
reasons it was expensive: it needed the desktop helper for muxing, it could only be
sideloaded because both stores remove this category, and it duplicated the desktop
app's job on the same machine. Archived for the record in git history only.

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
logout wipes it. `verify:` one Reel and one Facebook video save and play.**M5 — Desktop app (Electron).** yt-dlp + ffmpeg embedded, queue, folder picker,
shared design system with the Android app.
`verify:` install on a clean machine, download 3 links from a playlist folder.
**M6 — retired.** The browser extension is out of scope.

**M7 — Website rebrand.** Shopfront with per-platform CTAs and deep-link handoff
(`flickgrab://inspect?url=…`, `verify:` phone taps the button → app opens pre-filled).

**M8 — Release.** Signed APK + installers on GitHub Releases, Obtainium-compatible,
in-app update check against the VPS. No Play Store.

Order rationale: M0 de-risks everything; M2's UI is already built and waiting on it;
M7 can happen any time after M2; M5 follows the Android release.

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
4. ~~Desktop: Tauri or Electron?~~ **Electron** (2026-11-12).
5. Keep the website's direct-file download, or drop it once "Open in app" exists?
6. Meta app registration for IG/FB metadata — willing to create one?
7. ~~Extension: worth building if sideload-only?~~ **Dropped** (2026-11-12).
8. Who has a JDK 17 + Android SDK machine? Nothing Android has been compiled yet, and
   M0 needs a physical device on the owner's network.
9. Does the Android quality sheet keep the "Change" save-location control, or is
   `Movies/FlickGrab` fixed? It is currently rendered but inert.
