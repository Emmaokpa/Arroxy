# Master Implementation Plan — Multi-Platform Downloader Product

> **Purpose:** This is the master source of truth for Freebuff while transforming the existing Arroxy fork into a new commercial multi-platform downloader product.
>
> **Supporting documents:** Read all five companion documents before changing code:
> 1. `TECH_STACK.md`
> 2. `ARCHITECTURE.md`
> 3. `IMPLEMENTATION_ROADMAP.md`
> 4. `FILE_CHANGE_MAP.md`
> 5. `FREEBUFF_EXECUTION_RULES.md`
>
> **Repository:** `https://github.com/Emmaokpa/Arroxy`
>
> **Starting point:** Existing Electron + TypeScript + React + yt-dlp desktop application. The repository audit dated 2026-10-26 is the factual baseline. Do not assume that unverified capabilities work in production.

---

## 1. Mission

Evolve the existing Arroxy codebase into a branded, commercially operated, multi-platform downloader product with:

- A Windows/macOS desktop app that reuses the current mature downloader engine and UI.
- A web app that starts from the user's existing Arena.ai UI prototype and offers only capabilities that can honestly work in a browser.
- An Android app as a planned track, gated by a real-device feasibility spike before committing to full implementation.
- A minimal VPS deployment for static web hosting, HTTPS, and static release/config metadata only.
- Optional, carefully placed monetization/ad slots behind feature flags, with no ads in the download execution path.
- Clear privacy behavior, owned release/update infrastructure, reliable updates, security fixes, and accurate product/legal notices.

This is not a greenfield rewrite. Preserve working, tested capabilities. Make platform-specific adaptations only where evidence requires them.

## 2. Non-negotiable product constraints

1. **No server-side video downloading, processing, proxying, transcoding, or video storage.** The VPS must not become a download worker or media proxy.
2. **No user account/authentication system for the initial product.**
3. **Downloads should happen on the user's device** wherever the platform/runtime permits it.
4. **No silent server fallback.** If a web source cannot be supported client-side, explain the limitation and offer the desktop app as an alternative.
5. **No fabricated compatibility claims.** YouTube, TikTok, Instagram, Facebook, and X/Twitter live compatibility was not verified in the audit. Test it lawfully and document actual results.
6. **No DRM circumvention or bypass of access controls.** Preserve the current error handling and do not add circumvention features.
7. **No covert clipboard monitoring.** Android clipboard inspection may happen only while the app is foregrounded and in an understandable user-facing flow. Share intent is the primary Android intake path.
8. **Do not redesign the desktop UI from scratch.** Preserve the current renderer and behavior; rebrand and fix what is necessary.
9. **Do not design the web UI from scratch.** Inspect the user's Arena.ai prototype and use it as the visual/interaction starting point. Preserve its intended layout and visual language unless there is a concrete implementation or accessibility reason to adjust it.
10. **Do not make broad refactors merely for cleanliness.** Split shared code only when a real second consumer requires it and tests can protect the move.
11. **Do not ship upstream identities or endpoints under the new brand.** Release feeds, runtime-binary trust, telemetry, feedback upload, package manager definitions, signing keys, donation addresses, and app identifiers must be owned, disabled, or deliberately replaced before release.
12. **No production release until the three production dependency advisories are resolved and the vulnerability gate passes.**

## 3. Source-of-truth hierarchy

Use this order when instructions appear to conflict:

1. The user's explicit product constraints in this document.
2. The six blueprint files as a set, with this file defining goals and priorities.
3. The repository's current implementation, tests, ADRs, and development docs.
4. The audit findings recorded in the handoff.
5. Freebuff's assumptions.

Never silently resolve a conflict by guessing. Record it and ask the user if it changes scope, cost, legal exposure, data flow, or platform behavior.

## 4. Audit baseline

The audit found a mature application, not a starter scaffold:

- Electron + TypeScript + React 19 + Tailwind v4 + Zustand + i18next.
- Bun workspaces, strict TypeScript, Electron Vite, electron-builder.
- Existing yt-dlp integration, download queue, profiles, playlist/channel handling, audio-only, subtitles, SponsorBlock, progress reporting, pause/cancel/resume, runtime-binary verification, and 31 locales.
- Existing `src/shared` contracts and pure planning/parsing code in `packages/yt-dlp-bridge` that may be shared across platforms.
- Browser mock mode demonstrates that much of the renderer can boot in a normal browser, but it does **not** prove that the downloader engine works in browsers.
- The audit reported 377 test files and 5,196 passing tests, 1 skipped test, passing production build and fixture E2E tests.
- The audit reported the dependency vulnerability gate failing on three production high advisories: Electron 44.6.0, undici 7.29.1, and Zod 4.6.5. Confirm the current lockfile and safe patched versions before upgrading.
- Full E2E, live-site compatibility, Windows/macOS installer behavior, and Android runtime feasibility were not verified.
- No ad network is integrated.
- Existing upstream release, telemetry, runtime index, feedback worker, and package-manager identities need ownership decisions.

Treat these as audit-time observations, not a guarantee that repository state has remained unchanged. Re-run checks before modifying.

## 5. Product surfaces and scope

### 5.1 Desktop — first priority

Reuse the existing Electron app and its tested download pipeline.

Deliver:
- New product identity: package/app ID, display name, icon set, tray assets, notifications, translations, README, notices, release metadata.
- Preserve core download queue and engine behavior.
- Fix security gaps identified by the audit.
- Resolve production dependency advisories.
- Disable or re-point upstream telemetry and feedback endpoints.
- Own runtime-binary index/signing key and release/update feed.
- Add code signing/notarization only after the user has chosen budget and ownership.
- Run regression tests and platform installer smoke tests.

Do not remove features simply because they are complex. Propose a removal only if it conflicts with product requirements, legal review, security, or ongoing maintenance, and explain the trade-off.

### 5.2 Web — use the Arena.ai prototype

The existing Arena.ai prototype is the visual starting point. Freebuff must locate the supplied prototype files/assets or ask the user where they are if they are not in the repository. Do not invent a replacement visual design before inspecting it.

Web v1 is expected to be a browser-compatible product surface:
- Paste/inspect a URL.
- Classify the source using shared URL/site logic.
- Show supported/unsupported status accurately.
- Offer metadata only when a lawful, browser-compatible source/API is actually available and tested.
- Provide a clear desktop-app CTA for sources that need the native yt-dlp runtime.
- Offer direct-to-device downloads only for sources that are proven to permit them and pass a browser feasibility proof of concept.
- Use a friendly, informative failure state; never pretend a download started when it did not.
- Keep the website static if possible.

Do not promise browser-only downloads from YouTube, TikTok, Instagram, Facebook, or X before the proof of concept. The audit says this is unlikely to be feasible without server fetching or other constraints that are out of scope.

### 5.3 Android — conditional, not yet a committed full build

Before implementing the full app, complete a 1–2 week feasibility spike on a physical Android device:
- Can yt-dlp run using a distributable bundled runtime strategy?
- Can required FFmpeg operations work on supported ABIs?
- Can downloads continue reliably in the background under current Android restrictions?
- What is the real APK/AAB size?
- What permissions, foreground-service types, and notifications are required?
- Can the resulting implementation meet store-distribution and legal requirements?

Use React Native only after confirming a viable runtime approach. Reuse portable TypeScript contracts and pure planning/parsing logic, not Electron/Node-specific process, filesystem, or service code.

### 5.4 VPS and hosting

Initial infrastructure should be intentionally minimal:
- Static web hosting.
- HTTPS.
- Static version/config/release metadata if needed.
- Optional lightweight health check/uptime monitoring.
- GitHub Releases or another deliberately chosen release asset host.

Do **not** add a database, user accounts, Redis, job queue, video worker, media bucket, or backend download API without a new explicit product decision. No server-side video bytes should pass through this infrastructure.

### 5.5 Monetization

No provider is selected yet. Do not install an ad SDK or make network calls for ads before the user selects a provider and the privacy/data-flow review is complete.

Prepare a provider-agnostic ad-slot component/configuration flag:
- Desktop: restrained placements away from Download buttons, queue primary actions, consent/error surfaces, and any interaction where an ad could be mistaken for a product control.
- Web: reserve layout slots in the Arena.ai prototype only where they fit its design; implement consent gating before non-essential cookies/identifiers.
- Android: reserve a layout integration point behind a feature flag; do not import an SDK until chosen.

Never let ad code touch the downloader engine, URL extraction, process runner, queue scheduling, or file operations.

## 6. Decisions to surface, not silently guess

The audit identifies these owner decisions:
1. Final product name and whether all Arroxy-derived naming must be avoided.
2. Target markets/regions, which affect legal and consent scope.
3. The 3–5 source platforms most important for v1.
4. Budget/timeline for Apple Developer Program, Windows code-signing certificate, and release operations.
5. Desktop monetization model: free-with-ads, free/donations, or freemium.
6. Infrastructure ownership: own GitHub organization and release/runtime/telemetry/feedback endpoints versus a deliberately simpler static release feed.
7. Android commitment: fund the feasibility spike now, later, or exclude Android from v1.
8. Web scope: link checker/metadata/desktop funnel versus direct downloads for proven sources only.

Freebuff may proceed with safe, reversible audit/setup tasks while these are open. It must not lock in irreversible architecture or spending assumptions.

## 7. Mandatory P0 priorities

Complete or explicitly block on these before commercial development:

### P0.1 — Legal and licensing review
- Retain MIT license/copyright notices for copied/substantial MIT code.
- Audit the full dependency license set.
- Review FFmpeg/FFprobe GPLv3 redistribution obligations and corresponding-source compliance.
- Review target-platform terms, copyright, privacy, ad policies, and source compatibility.
- Clear the new product trademark/name.
- Do not make legal conclusions on behalf of counsel.

### P0.2 — Fix production dependency advisories
- Confirm currently installed versions and advisory details.
- Upgrade to patched compatible versions (at least the audit's cited floors, if still current and applicable): Electron >=44.9.1, undici >=7.30.1, Zod >=4.6.6.
- Run unit/integration/E2E/build/package checks.
- Do not force a breaking upgrade without documenting impact and test coverage.

### P0.3 — Own or disable upstream infrastructure
- Release repository and update feed.
- Signed yt-dlp runtime-binary index and new signing keypair.
- Flatpak app identity and signing key if distributing Flatpak.
- Scoop/Homebrew/Winget definitions if distributing through those channels.
- Heartbeat telemetry collector.
- Feedback diagnostics worker/bucket.
- Donation addresses and links.
- Any upstream website/community URLs and brand references.

### P0.4 — Decide scope and ownership
Document unanswered decisions in `DECISIONS.md` or an equivalent section in the project docs. Ask the user only when the choice materially affects implementation.

### P0.5 — Disable upstream telemetry until ready
Disable the existing heartbeat by default or remove/repoint it before a branded build ships. Do not send users' data to the upstream operator. Add the product's own privacy disclosures before enabling a replacement.

## 8. Definition of done

A phase is not done merely because files were edited.

Every meaningful phase must include:
- A short summary of what changed and why.
- Files added/modified/removed.
- Commands run and actual pass/fail outcomes.
- Tests added/updated and results.
- Any remaining limitations, unresolved decisions, or risks.
- Confirmation that no forbidden server-side media processing was introduced.
- Confirmation that no upstream endpoint/identity was accidentally left enabled where relevant.

A feature is complete only when its acceptance criteria and relevant tests pass. A mock, placeholder, static screen, or untested claim must be labeled as such.

## 9. Working approach

Follow `FREEBUFF_EXECUTION_RULES.md` and `IMPLEMENTATION_ROADMAP.md`. Work in small, reviewable steps. Start by inspecting the actual repository and finding the Arena.ai prototype. Do not overwrite user work. Do not make mass edits before mapping the relevant files and tests.

The first action should be an **inspection-only baseline report**, not implementation. After the report, begin the highest-priority safe task: verify the dependency advisory state and inspect the prototype/repository structure. Ask the user for any missing prototype path or critical product decision rather than inventing it.
