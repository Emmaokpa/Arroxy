# Product Decisions and Interface Ownership

Status of the build-out described in [`arroxy blueprint/plan.md`](arroxy%20blueprint/plan.md).
This file is the single place for decisions that the blueprint says must not be
guessed, and for the ownership matrix that Phase 1 requires.

Legend: **OWN** (replaced with product-owned value), **DISABLE** (removed),
**NOT-IN-V1** (channel dropped for this release), **DECIDE** (blocked on the owner).

---

## 1. Interface ownership matrix (P0.3)

Every row below currently points at the upstream Arroxy operator. None of these may
ship under the new brand until it is owned, disabled, or deliberately dropped.

| Surface | Current value / location | Status | Required action |
| --- | --- | --- | --- |
| App identity | `appId` `com.arroxy.app`, `productName` `Arroxy` (`electron-builder.json5`) | DECIDE | New app ID and product name after brand decision (§2.1). Keep `WINDOWS_APP_USER_MODEL_ID` in lockstep — it is pinned by `tests/unit/release-asset-names.test.ts`. |
| Desktop app mode | Windows Electron builds disabled; only web app runs | DISABLE | Comment out Windows Electron matrix entries in `.github/workflows/release.yml` and `.github/workflows/ci.yml`; web app is the primary runner until further notice. |
| Package metadata | `name: arroxy`, author `Antonio Orionus`, homepage/repository | DECIDE | Rewrite with the owner's identity. Keep MIT copyright attribution for derived MIT code. |
| Update feed | `updateFeed.ts` → `provider: github, owner: antonio-orionus, repo: Arroxy`; `electron-builder.json5` `publish` | OWN | Repoint to the owned release repository, or disable the updater until owned. |
| Runtime-binary index | `RuntimeBinaryTrust.ts` → `github.com/antonio-orionus/arroxy-runtime-binaries` | OWN | New owned index host **and** a new Ed25519 keypair. Never reuse the upstream key; never weaken signature verification. |
| Runtime signing key | public key embedded via `RUNTIME_BINARY_INDEX_PUBLIC_KEY_PEM` | OWN | Generate a new keypair; private half only in CI secrets. Document rotation. |
| Heartbeat telemetry | `stats.orionus.dev` Counterscale collector | **DISABLE — done in Phase 1** | Module, call site, setting, and dependency removed (§4). |
| Feedback diagnostics upload | Cloudflare Worker → R2 (`workers/feedback-upload`, `orionus.dev/arroxy/api/feedback-diagnostics`) | **DISABLE — done in Phase 1** | Service, IPC channel, preload method, worker, and tests removed (§4). |
| Feedback form | Tally form `Ek6M8B` opened by `FeedbackDialog.tsx` | DECIDE | User-initiated, but it posts to a form the upstream operator controls. Needs the owner's feedback destination before release. |
| Website / community links | `WEBSITE_URL` = `https://orionus.dev/arroxy/`, `DISCORD_URL` = upstream invite (`src/shared/constants.ts`) | DECIDE | Replace with owned destinations or remove until they exist. |
| Homebrew tap | `HOMEBREW_CASK` = `antonio-orionus/arroxy/arroxy` | DECIDE | Own tap or drop the channel in v1. |
| Flatpak identity | `flatpak/io.github.antonio_orionus.Arroxy.*` + `flatpak/repo-signing-key.asc` | DECIDE | New app ID, new signing key, or drop Flatpak in v1. The committed public repo key is upstream's. |
| Scoop / Winget / Homebrew publishing | `.github/workflows/release.yml` (`antonio-orionus/scoop-bucket`, `winget`, `antonio-orionus/homebrew-arroxy`) | DECIDE | Point at owned repos or remove the step for channels not shipping. |
| Release website dispatch | `release.yml` → `antonio-orionus/arroxy-web` | DECIDE | Own landing-site repo or remove the dispatch. |
| Donations | `DONATE.md` + `check:donation-addresses` gate | DECIDE | Never ship upstream addresses. Update or remove the gate intentionally. |
| Upstream package identity | `yt-dlp-bridge`, `ytdlp-errors` are published from this repo | OWN later | Keep the npm names only while they remain this repo's packages; no runtime endpoint depends on them. |
| Reverse-engineered token provider | `src/main/token/**` (hidden window) | DECIDE | Legal review required; not a redirection item. |
| Explore (embedded browser) | `src/main/services/explore/**` | DECIDE | Keep only if v1 keeps Explore; it carries MPL-2.0 obligations. |

## 2. Open owner decisions (P0.4)

Each item changes scope, cost, legal exposure, or data flow; none is guessed here.

### 2.1 Final product name and brand

The Next.js prototype in `client/nextjs-snaptube-clone-ui (3)` brands itself
**FlickGrab** (`src/app/layout.tsx` title, `metadata`). That is the only brand name
present in the supplied prototype, so it is the working name — **not** a trademark
clearance. **DECIDE:** confirm FlickGrab or supply the final name, and confirm whether
all Arroxy-derived naming must disappear from shipped UI.

### 2.2 Target markets/regions

Determines GDPR/consent scope, ad-network eligibility, and local copyright posture.
**DECIDE.**

### 2.3 Priority source platforms for v1

Blueprint names YouTube, TikTok, Instagram, Facebook and X/Twitter as unverified. The
prototype claims YouTube, Instagram and TikTok. Browser feasibility for those three is
**UNVERIFIED** (Phase 4). **DECIDE:** the 3–5 sources that matter for v1.

### 2.4 Code signing and notarization budget

`mac.identity` is `null` and Windows signing is unconfigured; no secrets exist.
**DECIDE:** Apple Developer Program and Windows certificate budget. Until then the
build is unsigned and must be described as unsigned.

### 2.5 Desktop monetization model

Free-with-ads, free/donations, or freemium. No ad SDK is installed and none will be
before a provider and privacy review exist. **DECIDE.**

### 2.6 Infrastructure ownership

Owned GitHub org + release/runtime/telemetry/feedback endpoints, or the deliberately
simpler static release feed. **DECIDE.** Phase 1 assumes only that the existing
upstream endpoints are off.

### 2.7 Android

Feasibility spike is unfunded and unstarted. **DECIDE:** fund now, later, or exclude
Android from v1.

### 2.8 Web scope

Link checker / metadata / desktop funnel, or direct downloads for proven sources only.
The prototype currently simulates downloads, which is not acceptable in production
(`FREEBUFF_EXECUTION_RULES.md` §5). **DECIDE after the Phase 4 capability matrix.**

## 3. Legal and licensing questions for counsel (P0.1)

Recorded as questions, **not** as legal conclusions.

1. **MIT obligations.** The repository is MIT (`LICENSE`, author Antonio Orionus). Keep
   the copyright notice and permission text for copied/substantial portions.
2. **FFmpeg/FFprobe GPLv3.** The packaged binaries are distributed as extra resources.
   Confirm corresponding-source and notice obligations for each platform build.
3. **Third-party notices.** `THIRD_PARTY_NOTICES.txt` must match the shipped dependency
   set after rebranding; MPL-2.0 components (Explore/adblock) need source availability
   statements.
4. **Platform terms.** Downloading from YouTube/TikTok/Instagram/Facebook/X may violate
   their terms regardless of technical feasibility. Confirm the v1 source list against
   counsel's guidance before promising support.
5. **Trademark.** "FlickGrab" is unverified; no clearance was performed.
6. **Token provider.** The reverse-engineered provider in `src/main/token/**` needs an
   explicit legal decision before it ships commercially.

## 4. Phase 1 changes applied in this repository

Privacy/telemetry (P0.5):

- Removed `src/main/services/heartbeat.ts`, the launch call site and hourly re-check in
  `src/main/index.ts`, the `@counterscale/tracker` dependency, `analyticsEnabled` and
  `lastHeartbeatDay` from settings/types/schemas, the Settings toggle, and the E2E
  `disableAnalytics` flag. Legacy persisted keys are stripped on read and cannot be
  re-introduced by a renderer patch.
- Removed `src/main/services/FeedbackDiagnostics.ts`, the `logs:uploadFeedbackDiagnostic`
  IPC channel, its preload method and `AppApi` type, the renderer upload call, and the
  `workers/feedback-upload` Cloudflare Worker. **No branded build uploads diagnostic
  logs anywhere.**

Security:

- `shell:openExternal` now parses the payload and allowlists `http:`/`https:` instead of
  accepting any string that starts with `http` (`src/main/ipc/fileHandlers.ts`).

Dependencies (P0.2):

- `electron` 44.6.0 → 44.9.3, `undici` 7.29.1 → 7.30.1, `zod` 4.6.6 → 4.6.7 (root and
  `yt-dlp-bridge`). (44.11.0 and undici 7.30.2 are newer but blocked by the repository's
  seven-day minimum release age.)

## 5. Confirmed audit baseline against this checkout

- Branch `main`, 790 commits, working tree had uncommitted telemetry edits at session
  start; they were completed rather than discarded.
- Test suite at audit time: 377 files / 5,196 tests. Baseline for the two broken
  telemetry files: 17 failing tests, plus formatting errors in three files.
- Prototype: `client/nextjs-snaptube-clone-ui (3)` — Next.js 16 App Router, Tailwind v4,
  React 19, Drizzle + PostgreSQL (`src/db/`), `/api/health` route. The database and route
  handler are **not** part of the permitted architecture (static-only, no server media
  path); they must be removed or left unused when the web surface is built.
- No Electron payload was present on this machine; it is fetched by `postinstall`.
