# Target Architecture and Platform Boundaries

## 1. Core principle

**Keep the existing desktop product stable; separate platform shells from reusable logic only when a second consumer actually needs it.** The repo already has a strong `AppApi` boundary, shared schemas, and pure downloader planning/parsing modules. Use them instead of duplicating business logic.

The VPS is not a downloader backend. There is no server-side video path.

## 2. Target system at a glance

```text
Product repository
├── Desktop app (existing Electron app)
│   ├── Existing React renderer
│   ├── Preload / typed AppApi
│   ├── Main-process shell + IPC
│   ├── Queue / download / probe services
│   └── Local binaries, files, settings and queue
│
├── Web app (based on Arena.ai prototype) based on the next ui on the client folder thats our ui template
│   ├── Prototype-derived UI
│   ├── Browser AppApi adapter (limited capabilities)
│   ├── Shared URL classification/contracts where feasible
│   ├── Honest support checks + desktop funnel
│   └── Direct downloads only for proven browser-compatible sources
│
├── Android app (conditional on feasibility spike)
│   ├── React Native UI if validated
│   ├── Shared contracts/pure planning logic
│   ├── Android-specific runtime/process/storage adapter
│   ├── Share intents + foreground clipboard intake
│   └── Foreground/background download service as permitted
│
├── packages/
│   ├── Shared contracts (future extraction only if needed)
│   ├── Pure yt-dlp workflow planning/parsing
│   └── Error taxonomy
│
└── infrastructure/
    ├── Static site hosting + HTTPS
    └── Static release/config metadata
```

## 3. Existing desktop request path

Preserve the current shape unless inspection reveals drift:
1. User enters a URL from the existing UI, bulk dialog, tray/hotkey, or supported clipboard autofill.
2. Shared URL cleaning/classification runs.
3. ProbeService obtains metadata through the native runtime path.
4. The user selects profile/format/options.
5. QueueService manages persisted queue state and concurrency.
6. DownloadService runs its phase pipeline.
7. The yt-dlp bridge plans arguments; native process execution uses safe spawning.
8. Progress/parser events return to the UI through typed IPC.
9. Files are saved locally and queue state is persisted locally.

Do not move video bytes through the VPS.

## 4. Reusable code versus platform-specific code

### Reuse as-is or with minimal extraction
- URL cleaning/classification and source/site metadata.
- Shared Zod schemas and types.
- Filename templates and path/name sanitization logic, with platform-specific limits kept parameterized.
- Error taxonomy and localization strings.
- Pure progress parsing/normalization.
- Queue transition/state-machine logic where it has no platform API dependencies.
- Pure `planWorkflow`/argument planning, option catalog, parsers, redaction, and `ytdlp-errors`.
- `AppApi` as the contract between UI and platform implementation.

### Desktop-only
- Electron main/preload/IPC.
- Node process spawning and filesystem operations.
- BinaryManager and desktop binary provisioning.
- Electron stores, tray, hotkeys, notifications, native dialogs.
- Hidden Electron window used by token provider.
- Desktop updater and installer signing.

### Browser-only
- Arena.ai-derived UI.
- Browser adapter implementing only capabilities available without server media fetching.
- Browser-supported URL classification, metadata, local UI state, and desktop download CTA.
- Optional direct download only after source-specific browser proof.

### Android-only
- Native process/runtime integration.
- Android storage integration.
- Share intent receiver.
- Foreground service and notifications.
- Android-specific queue persistence and runtime permissions.
- Any native bridge needed by the chosen yt-dlp/FFmpeg strategy.

## 5. Web product behavior

The browser must never pretend it can run the desktop downloader. It must:
- Classify a pasted URL using shared logic where possible.
- Show source recognition and an honest capability result.
- Call a metadata endpoint only if the endpoint is browser-accessible, allowed, and tested.
- If a source is unsupported, explain why and offer the desktop app.
- For a supported direct file, use a real browser-initiated direct download from the source's own allowed URL; do not proxy through the VPS.
- Surface CORS, authentication, expiry, format-merging, and permission failures honestly.
- Never send the user's URL to a server merely to work around CORS.

The web UI is to be built from the user's existing Arena.ai prototype. The prototype must be located and inspected first. Keep its design system, spacing, layout, responsive behavior, and intended interactions unless implementation constraints justify a documented change.

## 6. VPS data flow

Allowed:
- Serve HTML/CSS/JS/assets.
- Serve TLS.
- Serve static release/version/config metadata.
- Serve installer links or redirect to release assets.
- Provide a basic health endpoint only if needed.

Forbidden under current requirements:
- Accept a social URL and fetch the media server-side.
- Proxy media streams.
- Merge HLS/DASH streams on the server.
- Run yt-dlp or FFmpeg against user requests.
- Store downloaded videos or user download history.
- Introduce an account database or job queue.

## 7. Runtime-binary trust and releases

The current desktop app relies on a signed runtime-binary index. A commercial fork must not point to the upstream index/key as if it were owned by this product.

Required design:
- New product-owned runtime-index repository or hosting location.
- New Ed25519 keypair generated and controlled by the product owner.
- Private signing key stored only in protected CI secrets or a suitable secret manager.
- Public key embedded in the app.
- Signed manifests and checksums validated before binaries are trusted.
- Documented rotation/recovery process.
- Separate release feed and release repository.
- Update round-trip test from beta to stable before public release.

Do not reuse an upstream private key or weaken signature checks for convenience.

## 8. Telemetry and feedback data flow

Current audit findings:
- Daily anonymous heartbeat posts to upstream Counterscale.
- Feedback diagnostics upload through a Cloudflare Worker to R2.
- Clipboard watcher reads clipboard on focus/show and fills a URL field; it does not queue automatically or transmit clipboard content.

Before release:
- Disable or re-point heartbeat.
- Disable or replace upstream feedback upload.
- Audit every network request and endpoint.
- Keep clipboard behavior visible and documented.
- Confirm URLs, titles, file paths, cookies, and download history are not sent to product servers.
- Write an accurate privacy policy based on actual code, not aspirations.

## 9. Security boundaries

- Keep context isolation enabled and Node integration disabled in renderer.
- Keep IPC contracts typed and validated.
- Validate every external URL by parsing it and allowlisting protocols.
- Keep shell execution disabled for user-controlled command values.
- Keep path/filename sanitization.
- Keep runtime signature/checksum verification.
- Audit raw IPC handlers.
- Do not add access-control circumvention or DRM bypass.
- Keep ad and analytics code out of download services.
- Never commit credentials, signing private keys, user data, or real secrets.

## 10. Architecture decision records

Before a structural change, review `docs/adr/` and `dev-docs/dual-deploy-plan.md`. The audit says the core/shell split is designed but not started. Follow the existing ADR direction where relevant, but do not adopt any self-hosted video-serving mode that conflicts with this plan.

Do not physically extract all shared modules before there is a second real consumer. Keep the current monorepo shape until web or Android implementation demonstrates a need.
