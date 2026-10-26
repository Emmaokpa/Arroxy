# Technology Stack and Engineering Standards

## 1. Purpose

This document defines the preferred technologies and boundaries for the product. It is not permission to replace working dependencies casually. Preserve the repository's existing stack unless a platform-specific need or verified compatibility issue justifies a change.

## 2. Existing desktop stack — preserve

Audit-time stack:
- **Language:** TypeScript, strict mode.
- **Package manager/workspaces:** Bun workspaces, with lockfile pinned in the repository.
- **Desktop shell:** Electron.
- **Build tooling:** electron-vite and electron-builder.
- **UI:** Next js in the client folder, Tailwind CSS v4, shadcn/ui base-nova components.
- **State:** Zustand.
- **Validation/contracts:** Zod.
- **Localization:** i18next with 31 locale catalogs.
- **Downloader:** yt-dlp runtime managed by the existing BinaryManager and signed runtime manifest.
- **Media helper binaries:** FFmpeg/FFprobe embedded/fetched through existing verified build scripts.
- **Tests:** Vitest and Playwright.
- **CI/release:** GitHub Actions.
- **Existing portable package candidates:** `packages/yt-dlp-bridge/`, `packages/ytdlp-errors/`, and selected pure modules under `src/shared/`.

Re-check current `package.json`, lockfile, runtime versions, and repository scripts before making changes.

## 3. Desktop rules

- Keep the current Electron + React desktop renderer and main-process service architecture.
- Do not rewrite the download engine or queue unless tests reveal a concrete defect or a requirement demands it.
- Keep Electron APIs in the main/preload/shell boundary. Renderer code should communicate through the existing typed `AppApi`/preload bridge.
- Maintain `contextIsolation: true` and `nodeIntegration: false`.
- Do not weaken the Electron fuses/security posture casually. The audit notes `runAsNode` must remain enabled for the current yt-dlp JS runtime packaging approach; if that changes, validate the full runtime dependency path before changing the fuse.
- Do not use shell-string process execution for user-controlled values. Preserve safe spawn/argument handling.
- Validate IPC payloads using Zod or equivalent schema validation. Close the four direct `ipcMain` registration gaps called out by the audit.
- Parse external URLs with the URL parser and allow only explicit `http:`/`https:` protocols for external opening.
- Preserve filename/path sanitization and signed binary verification.

## 4. Web stack

- Inspect the Arena.ai prototype before selecting or changing the web stack.
- Reuse existing React/TypeScript/UI components when the prototype and implementation make that practical.
- If the prototype is built in a different stack, first inspect its structure and decide whether to port the design into the repo's existing React/TypeScript conventions or keep a separate web app. Explain the decision; do not blindly replace the prototype.
- Use a browser-specific adapter implementing only the subset of `AppApi` that is actually feasible in a browser.
- Use browser-native APIs for local state/storage only where appropriate; never emulate desktop process execution in the browser.
- No server endpoint may download, proxy, merge, transcode, or store user video.
- Do not add a backend framework merely because a typical web app has one. Static output is the default.
- Any direct download path must be proven with real browser tests for each explicitly supported source. CORS, signed URL expiry, referer/cookie requirements, and separate DASH/HLS streams must be tested, not assumed.

## 5. Android stack — conditional

Preferred direction only after feasibility spike:
- React Native for UI if the runtime spike proves the app can deliver the required experience.
- Reuse portable TypeScript contracts and pure workflow/argument planning/parsing modules.
- Native Android code or a verified runtime integration may be needed for process execution, storage, foreground services, notifications, and binary/runtime handling.
- Use Android share intents as the primary URL intake path.
- Clipboard inspection is allowed only while the app is foregrounded and must be visible/user-understandable.
- Use current Android storage APIs (MediaStore/SAF as appropriate) and platform-compliant background execution.
- Verify current Android API-level requirements, notification permission, foreground-service type, ABI support, signing, and store rules during the spike.
- Do not select a Python bundling strategy, FFmpeg distribution, or APK size target based solely on audit estimates. Measure on physical devices.

If the spike fails or is too costly, recommend delaying or removing Android from v1 instead of building an unreliable imitation.

## 6. VPS and infrastructure stack

Default:
- Static site assets.
- Caddy or nginx with HTTPS, or a managed static host/CDN.
- Static `version.json` or release metadata if required.
- GitHub Releases or a selected static release host for installers.
- Basic uptime monitoring and logs.

Do not add by default:
- Node/Express/Next backend for video downloads.
- Database.
- User accounts/authentication.
- Redis or job queue.
- Video workers, object storage for user media, proxying, transcoding, or server-side extraction.

Any proposed addition must include the concrete requirement it solves, operational cost, privacy impact, and confirmation that it does not process/store video.

## 7. Dependency and supply-chain rules

- Resolve the audit's three production high advisories before release; re-check actual advisory status at implementation time.
- Keep lockfiles committed and reproducible.
- Do not run broad automatic upgrades without reviewing the diff and test failures.
- Preserve exact pin/check tooling unless a justified migration is approved.
- Verify checksums/signatures for downloaded runtime binaries.
- Create a new product-owned signing key for a new runtime index; never reuse upstream private keys or claim control of an upstream key.
- Store signing secrets in a dedicated secret manager/GitHub Actions secrets; never commit private keys.
- Review transitive dependency licenses and generate/maintain accurate third-party notices.

## 8. Ads and analytics

- No provider chosen yet. Do not add an ad SDK before explicit selection.
- Build a provider-agnostic `AdSlot`/feature-flag interface only when needed.
- Ads must be outside download-engine and process-execution code.
- Web non-essential cookies/identifiers require an appropriate consent flow before activation.
- Disable or re-point upstream Counterscale heartbeat and Cloudflare feedback upload before release.
- Collect the minimum data necessary, disclose it, provide a meaningful opt-out where appropriate, and do not transmit URLs, titles, file paths, or download history unless a later explicit, reviewed decision changes this policy.

## 9. Test standards

Before and after material changes, use the actual scripts defined by the repository. Likely checks include:
- Install with the pinned lockfile.
- Type/lint/static check (`vp check` or repository's documented equivalent).
- Unit/integration test suite.
- Build.
- Package dry-run.
- Dependency vulnerability gate.
- Relevant Playwright fixture/E2E tests.
- Windows/macOS installer smoke tests when infrastructure permits.
- Manual live-site tests only when legally appropriate, with the exact source, date, environment, and result documented.

Do not report a command as passing unless it was actually run and passed.
