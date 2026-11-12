package app.flickgrab.domain

/** Sources the app is designed around. Nothing else is accepted from a link. */
enum class Source(val label: String) {
    YouTube("YouTube"),
    TikTok("TikTok"),
    Instagram("Instagram"),
    Facebook("Facebook"),
    DirectFile("Direct file"),
}

enum class FormatKind { Video, Audio }

/**
 * One row in the quality picker. Sizes are byte counts rather than pre-formatted
 * strings so the CTA can total them without parsing text back.
 */
data class FormatOption(
    val id: String,
    val kind: FormatKind,
    val label: String,
    val container: String,
    val sizeBytes: Long,
    val note: String,
    /** True when video and audio arrive separately and must be merged on device. */
    val requiresMux: Boolean,
)

/** What the app can honestly do with this item right now. */
enum class Accessibility {
    /** Extractable on this device. */
    Ready,

    /** Public metadata exists but saving needs an authenticated session. */
    SignInRequired,

    /** Recognised, but no extraction path is wired in this build. */
    NotWiredYet,
}

data class MediaItem(
    val id: String,
    val title: String,
    val author: String,
    val source: Source,
    val durationLabel: String,
    val thumbnailUrl: String?,
    val statsLabel: String,
    val formats: List<FormatOption>,
    val accessibility: Accessibility = Accessibility.Ready,
    /** Set when the item came from a share-sheet handoff. */
    val sharedFrom: String? = null,
)

enum class DownloadStage(val label: String) {
    Queued("Queued"),
    Resolving("Resolving link"),
    Downloading("Downloading"),
    Muxing("Merging streams"),
    Saving("Saving to gallery"),
    Completed("Saved"),
    Failed("Failed"),
    Cancelled("Cancelled"),
}

data class DownloadTask(
    val id: String,
    val item: MediaItem,
    val format: FormatOption,
    val stage: DownloadStage,
    val progress: Float = 0f,
    val bytesPerSecond: Long = 0L,
    val error: String? = null,
    /** True while the task is driven by demo data rather than a real extractor. */
    val preview: Boolean = false,
) {
    val isActive: Boolean
        get() = stage == DownloadStage.Queued ||
            stage == DownloadStage.Resolving ||
            stage == DownloadStage.Downloading ||
            stage == DownloadStage.Muxing ||
            stage == DownloadStage.Saving
}

/**
 * Capability table for the "More" screen. Mirrors `server/capabilities.ts`:
 * this app must not claim a source works before the M0 probe proves it.
 */
data class CapabilityRow(
    val source: Source,
    val status: CapabilityStatus,
    val detail: String,
)

enum class CapabilityStatus(val label: String) {
    Ready("Ready"),
    NeedsGate("Not wired yet"),
    SignIn("Sign-in required"),
    Unsupported("Unsupported"),
}
