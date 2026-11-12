package app.flickgrab.data

import app.flickgrab.domain.CapabilityRow
import app.flickgrab.domain.CapabilityStatus
import app.flickgrab.domain.Source

/**
 * Copy of the server's measured capability table (`server/capabilities.ts`,
 * measured 2026-11-11). Update both together, from a probe, never from optimism.
 */
object Capabilities {

    const val MEASURED_ON = "2026-11-11"

    val rows: List<CapabilityRow> = listOf(
        CapabilityRow(
            source = Source.YouTube,
            status = CapabilityStatus.NeedsGate,
            detail = "Needs the on-device extractor and a PO token. Blocked until the M0 " +
                "physical-device probe passes.",
        ),
        CapabilityRow(
            source = Source.TikTok,
            status = CapabilityStatus.NeedsGate,
            detail = "Public posts are extractable by yt-dlp, which is not bundled in this build yet.",
        ),
        CapabilityRow(
            source = Source.Instagram,
            status = CapabilityStatus.SignIn,
            detail = "Anonymous extraction is mostly dead. Needs an encrypted on-device cookie store.",
        ),
        CapabilityRow(
            source = Source.Facebook,
            status = CapabilityStatus.SignIn,
            detail = "Almost every video needs an authenticated session, same store as Instagram.",
        ),
        CapabilityRow(
            source = Source.DirectFile,
            status = CapabilityStatus.Ready,
            detail = "A direct .mp4/.webm/.mp3 link is fetched by the device itself and written to Movies/FlickGrab.",
        ),
    )
}
