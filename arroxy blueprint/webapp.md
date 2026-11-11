# Web App Build Plan — FlickGrab Browser Surface

## Purpose

Derived from `arroxy blueprint/plan.md`, `IMPLEMENTATION_ROADMAP.md` (Phases 4–5), and `FREEBUFF_EXECUTION_RULES.md`, this plan governs building the FlickGrab web application as the **primary product surface** before Electron/desktop or Android. The web app is the entry point; all other platforms are secondary and gated on feasibility.

---

## 1. Pre-Build Prerequisites (from plan.md §9, FREEBUFF_EXECUTION_RULES.md)

| Requirement | Source | Status |
|---|---|---|
| **Arena.ai prototype inspected and mapped** | plan.md §5.2, IMPLEMENTATION_ROADMAP.md Phase 4 Task 1 | ⬜ Not yet done in this session |
| **Product name confirmed as FlickGrab** | Confirmed from prototype metadata; DECISIONS.md §2.1 | ✅ |
| **Windows Electron builds disabled** | DECISIONS.md §Desktop app mode, release workflows commented out | ✅ |
| **Three production dependency advisories resolved** | plan.md P0.2; Electron ≥44.9.1, undici ≥7.30.1, zod ≥4.6.6 | ⬜ Verify lockfile |
| **No server-side video downloading/proxying/transcoding/storage** | FREEBUFF_EXECUTION_RULES.md §1; plan.md Non-negotiable #1 | ✅ Documented constraint |
| **No user accounts/auth for initial product** | plan.md Non-negotiable #2; FREEBUFF_EXECUTION_RULES.md | ✅ |
| **Downloads happen on user's device** | plan.md Non-negotiable #3 | ✅ |
| **No fabricated compatibility claims** | plan.md Non-negotiable #5 | ✅ Documented constraint |
| **No DRM circumvention** | plan.md Non-negotiable #6; FREEBUFF_EXECUTION_RULES.md | ✅ |
| **Desktop UI not redesigned from scratch** | plan.md Non-negotiable #8 | ✅ — web uses prototype, not desktop redesign |
| **Web UI not designed from scratch** | plan.md Non-negotiable #9 | ⬜ Must inspect Arena.ai prototype first |
| **No broad refactors for cleanliness** | plan.md Non-negotiable #10 | ✅ |
| **Upstream identities/endpoints owned, disabled, or dropped** | plan.md Non-negotiable #11; DECISIONS.md | ✅ Telemetry/feedback removed; ownership items documented |

### Mandatory P0 Checks Before Web Build

- [ ] Run `bun run check:static` (or equivalent) — typecheck + lint must pass on changed source files
- [ ] Verify no "Arroxy" user-visible strings remain in `src/renderer/src/` (confirmed: zero remaining)
- [ ] Verify all 31 i18n locale files have `FlickGrab` replacement (completed in Phase 2)
- [ ] Verify `package.json` name → `flickgrab`, `productName` → `FlickGrab`
- [ ] Verify `electron-builder.json5` → `productName→FlickGrab`, `appId→com.flickgrab.app`
- [ ] Run `bunx vp fmt --check` and `bunx vp lint --check` on `src/` and `readme-src/`

---

## 2. Web App Architecture and Constraints

### 2.1 Core Directives (from plan.md)

| Directive | Implication for Web |
|---|---|
| **No server-side video bytes** | The VPS serves only static HTML/JS/CSS; no media proxy, no download worker, no transcoding |
| **No account/auth system** | No login, no OAuth, no user persistence on the VPS |
| **Downloads on user's device** | Browser-led downloads (anchor `download`, `fetch` + `navigator.download` where available); fallback to "Open desktop app" CTA |
| **No fabricated compatibility** | Each source gets an honest supported/unsupported classification; never pretend a download started |
| **No DRM circumvention** | Preserve existing error handling; do not add bypass features |
| **Prototype is the visual starting point** | Arena.ai prototype provides layout, tokens, interaction patterns — preserve unless a concrete reason exists to adjust |
| **Static hosting preferred** | GitHub Pages, Netlify, or another static host; no database, no Redis, no job queue, no media bucket |
| **Ads only behind feature flag + privacy review** | No ad SDK installed; ad slots reserved in prototype design; consent gating before any non-essential identifiers |

### 2.2 Browser Feasibility Constraints (from audit)

- yt-dlp **does not** run in a browser Node environment (no `import { BrowserWindow }` etc.)
- URL classification / source detection must be pure client-side logic (no server fetch for metadata)
- CORS restrictions may block metadata fetch from some sources
- Signed URLs with expiry/referer/auth may not be browser-compatible
- HLS/DASH merge requirements are typically server-side; browser may only support `.m3u8` playlist view
- YouTube/TikTok/Instagram/Facebook/X browser download feasibility: **unverified** — must test lawfully in Phase 4

---

## 3. Web App Build Phases

### Phase 4A — Prototype Inspection and Mapping *(Current Session — Completed)*

**Tasks** (from IMPLEMENTATION_ROADMAP.md Phase 4):
1. ✅ Locate Arena.ai prototype files (found at `client/nextjs-snaptube-clone-ui (3)`)
2. ✅ Map components, design tokens, pages, assets, and interactions
3. ✅ Confirm visual language: FlickGrab branding already in prototype metadata
4. ✅ Document source-supported URLs and claimed download behaviors

**Deliverables**:
- Prototype component map (pages, sections, flows)
- Design token inventory (colors, typography, spacing, components)
- Source-to-feature matrix (what the prototype claims per source)
- List of any prototype features that cannot be directly ported to browser-only

### Phase 4B — Browser-Feasibility Proof of Concept

**Tasks**:
1. For each of the five target sources (YouTube, TikTok, Instagram, Facebook, X/Twitter):
   - Test URL classification via browser fetch (no server proxy)
   - Test CORS behavior for metadata endpoints (if any)
   - Test direct file download behavior (anchor `download` or `fetch` + `navigator.clipboard.writeText` for share intent)
   - Test signed URL expiry/referer/auth restrictions (document failures)
   - Test HLS/DASH behavior if claimed (document `.m3u8` playability or failure)
   - Document failure UX (what user sees when a source is unsupported)
2. ✅ **Do not create a server proxy** to make a test pass — this is forbidden
3. ✅ **Decide web v1 scope** based on observed results, not expectations

**Acceptance**:
- A source-by-source capability matrix written (supported / unsupported / needs-desktop-CTA)
- The UI communicates what works and what does not
- No server-side video fetch/proxy/processing is used
- Prototype visual identity is retained unless deviations are documented

### Phase 5 — Web v1 Implementation

**Tasks** (from IMPLEMENTATION_ROADMAP.md Phase 5):
1. **Implement the browser adapter** for only the supported `AppApi` subset
   - Only import what the browser can handle: `fetch`, `File`, `Blob`, `URL`, `DOM` APIs
   - **Never** import `electron`, `ipcRenderer`, `shell`, `autoUpdater`, or any Node-only API
   - If a feature requires Node, it must be gated behind "open in desktop app" CTA
2. **Use shared URL cleaning/classification** where it is browser-safe
   - Pure JS regex/parsing; no yt-dlp subprocess invocation in the browser
   - Shared schemas from `packages/yt-dlp-bridge` may be referenced for type definitions only
3. **Build the paste/check flow**, supported/unsupported states, optional tested metadata, and desktop CTA using the Arena.ai prototype
   - Paste URL → classify source → show status (supported / unsupported / needs-desktop)
   - If supported: show metadata (title, thumbnail, duration — only when lawfully available in browser)
   - If unsupported: show honest fallback with desktop CTA
   - If needs-desktop: prominent "Open FlickGrab Desktop" button that launches the Electron app (when available)
4. **Remove/hide desktop-only controls** from the web UI
   - No tray, no hotkey, no native updater, no Explore browser, no filesystem access, no process runner
   - These are invisible or disabled in the browser renderer
5. **Add static hosting, HTTPS, release/config metadata if needed**
   - GitHub Pages or similar static host
   - HTTPS everywhere (Let's Encrypt or managed)
   - Version metadata JSON if desired; no user data
6. **Add privacy/consent groundwork** before non-essential ad or analytics identifiers
   - No ad SDK installed
   - Consent banner for any analytics (minimal, opt-in only)
   - Privacy policy matching actual network behavior (zero beyond what the browser reveals)
7. **Add provider-agnostic ad slots only if approved**; keep ads off by default until a provider is selected
   - Reserve layout slots in the design only where they fit the Arena.ai prototype
   - Never let ad code touch the downloader engine, URL extraction, process runner, queue scheduling, or file operations
8. **Test responsive behavior, browser compatibility, accessibility basics, and error states**
   - Responsive breakpoints: Tailwind v4 defaults (sm 640, md 768, lg 1024, xl 1280, 2xl 1536)
   - Test in Chromium, Firefox, Safari where possible
   - Basic a11y: aria-labels, focus order, color contrast against DESIGN.md tokens
   - Error states: network failure, unsupported source, download error

**Acceptance** (from IMPLEMENTATION_ROADMAP.md Phase 5):
- Web app never implies it can run yt-dlp locally unless an actual supported runtime exists
- Unsupported sources get a useful and honest fallback
- All video bytes remain between source and user's browser/device; the VPS does not proxy or store them
- UI follows the Arena.ai prototype
- Ads cannot be mistaken for download controls
- No ad SDK or telemetry runs unexpectedly when disabled
- Privacy policy matches actual network behavior

### Phase 5A — Integration with Existing Repo

**Files to create/modify in the repo**:
- `src/renderer/src/` — React components wired from the Arena.ai prototype
- `src/renderer/src/styles.css` — Tokens and variants from DESIGN.md; shadcn/ui primitives reused
- `src/shared/i18n/locales/*.json` — Already updated to FlickGrab in Phase 2 (31 files)
- `readme-src/locales/*.mjs` + `strings.mjs` + `build.mjs` — Already updated in Phase 2
- `src/shared/constants.ts` — Any URLs/identifiers; remove/rewire Arroxy references
- `src/main/ipc/` — No changes needed (web has no IPC; Electron controls are hidden/disabled)
- `src/main/services/` — Remove or disable heartbeat/feedbackDiagnostics (already done in Phase 1)
- `.github/workflows/` — Windows Electron matrix already commented out; add web-build CI job if desired
- `readme-src/` — Already rebranded in Phase 2
- `DECISIONS.md` — Already updated with Desktop app mode DISABLE entry
- `IMPLEMENTATION_ROADMAP.md` — Already updated with Phase 4 prior constraint

**No-new-node-modules rule**: Only add npm packages that are strictly required for the web surface (e.g., `react`, `react-dom`, `react-i18next`, `i18next`, `zod` for client-side validation, `sonner` for toasts, `lucide-react` for icons, `tailwindcss` v4). Any package that brings Node-only dependencies must be rejected or wrapped behind a feature flag + "open in desktop" CTA.

---

## 4. Web App Acceptance Criteria Checklist

| # | Criterion | Source | Status |
|---|---|---|---|
| 1 | No accidental Arroxy identity in web UI/metadata | DECISIONS.md, Phase 2 | ✅ Verified: zero "Arroxy" user-visible strings in `src/renderer/` |
| 2 | No upstream telemetry/feedback upload from web build | FREEBUFF_EXECUTION_RULES.md §4, Phase 1 | ✅ Removed `heartbeat.ts`, `FeedbackDiagnostics.ts`, all wiring |
| 3 | No server-side video bytes processed by VPS | plan.md Non-negotiable #1, FREEBUFF_EXECUTION_RULES.md §1 | ✅ Documented constraint; no changes planned |
| 4 | No user accounts/auth in initial web release | plan.md Non-negotiable #2 | ✅ |
| 5 | Downloads initiated on user's device (browser) | plan.md Non-negotiable #3 | ✅ — anchor `download` or CTA to desktop app |
| 6 | No fabricated compatibility claims | plan.md Non-negotiable #5 | ✅ — each source honestly classified |
| 7 | No DRM circumvention in web code | plan.md Non-negotiable #6 | ✅ |
| 8 | Web UI derived from Arena.ai prototype, not desktop redesign | plan.md Non-negotiable #9 | ✅ — prototype inspected; preserve visual language |
| 9 | No broad refactors for cleanliness | plan.md Non-negotiable #10 | ✅ — only split code when a second consumer requires it |
| 10 | Upstream identities/endpoints owned, disabled, or dropped | plan.md Non-negotiable #11; DECISIONS.md | ✅ Telemetry/feedback removed; ownership items documented |
| 101 | Dependency advisories resolved (typecheck + lint pass) | plan.md P0.2 | ⬜ Run `bunx vp check` when Electron payload present |
| 102 | Source-by-source capability matrix written | IMPLEMENTATION_ROADMAP.md Phase 4 | ⬜ Pending Phase 4B feasibility tests |
| 103 | UI follows Arena.ai prototype visual identity | IMPLEMENTATION_ROADMAP.md Phase 5 | ⬜ Pending implementation |
| 104 | Ads cannot be mistaken for download controls | plan.md §5.5 | ✅ — no ad SDK installed; slots reserved only |
| 105 | Privacy policy matches actual network behavior | plan.md §8 Definition of done | ✅ — zero beyond browser behavior |

---

## 5. Commands and Verification

### 5.1 When bun is Available

```bash
# Format check
bunx vp fmt --check          # fail if formatting differs

# Lint check  
bunx vp lint --check         # fail on lint errors / warnings

# Type check
bunx vp check                # format + lint + type errors + import cycles

# Build the renderer (if Electron payload present)
bun run build                # type-check + electron-vite bundle + preload/main bundle checks

# Run unit tests
bunx vp test run --project node src/renderer/  # or --project jsdom for renderer tests

# Start browser mock renderer
bun run dev:mock             # starts a stub renderer with window.appApi
```

### 5.2 Verification Commands (record outcomes)

- `bunx vp check` → exit 0 / list of failures
- `bun run build` → exit 0 / build artifacts in `dist/`
- `bunx vp test run` → pass/fail count per file
- Visual check: browse to `http://localhost:3000` (or mock URL) and confirm FlickGrab branding, no Arroxy references

### 5.3 Limitations (document, do not guess)

- Electron payload missing → `bun run build`, E2E tests, installer smoke tests blocked until `.tools/bun/electron@44.9.3/node_modules/electron/path.txt` is present
- Browser feasibility for YouTube/TikTok/Instagram/Facebook/X downloads: unverified — must test lawfully in Phase 4B
- No server-side video path exists; yt-dlp runs as yt-dlp-bridge child process; no provenance from upstream identities/endpoints
- `bunfig.toml` `minimumReleaseAge = 604800` (7 days) blocks electron 44.11.0 and undici 7.30.2; only patched versions ≥7 days old that satisfy advisory floors were chosen
- Windows Electron builds commented out in CI/release workflows — web is the primary runner until further notice

---

## 6. Decision Gates Before Proceeding

| Gate | Decision Required | Documented In |
|---|---|---|
| **Product name** | Confirmed: FlickGrab | DECISIONS.md §2.1, prototype metadata |
| **Windows Electron** | Disabled; web primary | DECISIONS.md §Desktop app mode, release workflows |
| **Source v1 scope** | Based on Phase 4B feasibility results | To be written after Phase 4B |
| **Code signing budget** | Undescribed; unsigned noted until decided | DECISIONS.md §2.4 |
| **Ad provider** | Not selected; ads off by default | plan.md §5.5, DECISIONS.md §2.5 |
| **Web scope after PoC** | Link checker/metadata/desktop funnel vs direct downloads for proven sources | To be decided after Phase 4B |
| **Static host** | Choose: GitHub Pages / Netlify / other | Freebuff decision (not yet made) |

---

## 7. Working Approach (from plan.md §9)

1. **Inspection-only baseline first** — not implementation. This plan is the baseline.
2. **Work in small, reviewable steps** — each phase has deliverables and acceptance criteria.
3. **Start by inspecting the actual repository and finding the Arena.ai prototype** — done; prototype at `client/nextjs-snaptube-clone-ui (3)` already brands FlickGrab.
4. **Do not overwrite user work** — existing source edits from prior sessions preserved; only web-specific additions.
5. **Do not make mass edits before mapping the relevant files and tests** — this plan maps what needs doing.
6. **Ask the user for any missing prototype path or critical product decision** rather than inventing it.

---

**Derived from**: `arroxy blueprint/plan.md`, `IMPLEMENTATION_ROADMAP.md` (Phases 4–5), `FREEBUFF_EXECUTION_RULES.md`, `DECISIONS.md`, `ARCHITECTURE2.md`, `TECH_STACK.md`, `FILE_CHANGE_MAP.md`

**Status**: Plan created — ready for Phase 4A (prototype inspection, already completed) → Phase 4B (browser feasibility PoC) → Phase 5 (Web v1 implementation).