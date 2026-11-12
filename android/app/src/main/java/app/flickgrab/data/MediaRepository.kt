package app.flickgrab.data

import app.flickgrab.BuildConfig
import app.flickgrab.domain.Accessibility
import app.flickgrab.domain.FormatKind
import app.flickgrab.domain.FormatOption
import app.flickgrab.domain.MediaItem
import app.flickgrab.domain.Source
import kotlinx.coroutines.delay

/**
 * The one seam the UI is written against. M0/M1 replace the implementation with
 * a real on-device extractor; nothing above this interface has to change.
 */
interface MediaRepository {
    /** Feed shown on Home. Empty when no extractor is wired. */
    suspend fun feed(): List<MediaItem>

    /** Resolve a link handed over by the share sheet or a deep link. */
    suspend fun resolve(link: String): MediaItem?
}

/**
 * Placeholder data used only by debug builds (`BuildConfig.PREVIEW_DATA`).
 *
 * It exists so the layout, sheet and progress states can be reviewed before the
 * extractor lands. The UI labels every screen that renders it, and release
 * builds never construct it — see [EmptyMediaRepository].
 */
class PreviewMediaRepository : MediaRepository {

    override suspend fun feed(): List<MediaItem> {
        delay(420)
        return DEMO_ITEMS
    }

    override suspend fun resolve(link: String): MediaItem? {
        delay(500)
        if (link.startsWith("flickgrab://")) {
            val inner = link.substringAfter("url=", "")
            return DEMO_ITEMS.firstOrNull { inner.contains(it.sourceKey) } ?: DEMO_ITEMS.first()
        }
        return DEMO_ITEMS.firstOrNull { link.contains(it.sourceKey) }
    }

    private val MediaItem.sourceKey: String
        get() = when (source) {
            Source.YouTube -> "youtu"
            Source.TikTok -> "tiktok"
            Source.Instagram -> "instagram"
            Source.Facebook -> "facebook"
            Source.DirectFile -> "."
        }
}

/** What release builds use until the extractor exists: no invented content. */
class EmptyMediaRepository : MediaRepository {
    override suspend fun feed(): List<MediaItem> = emptyList()
    override suspend fun resolve(link: String): MediaItem? = null
}

object Repositories {
    fun media(): MediaRepository =
        if (BuildConfig.PREVIEW_DATA) PreviewMediaRepository() else EmptyMediaRepository()
}

private val hd = FormatOption(
    id = "v1080",
    kind = FormatKind.Video,
    label = "1080p",
    container = "MP4",
    sizeBytes = 214_958_080L,
    note = "Best available · video + audio merged on device",
    requiresMux = true,
)

private val sd = FormatOption(
    id = "v720",
    kind = FormatKind.Video,
    label = "720p",
    container = "MP4",
    sizeBytes = 96_468_992L,
    note = "Smaller file · video + audio merged on device",
    requiresMux = true,
)

private val low = FormatOption(
    id = "v480",
    kind = FormatKind.Video,
    label = "480p",
    container = "MP4",
    sizeBytes = 41_943_040L,
    note = "Data saver",
    requiresMux = true,
)

private val audio = FormatOption(
    id = "a128",
    kind = FormatKind.Audio,
    label = "Audio only",
    container = "M4A",
    sizeBytes = 5_242_880L,
    note = "128 kbps · keeps the soundtrack, drops the picture",
    requiresMux = false,
)

private val DEMO_ITEMS: List<MediaItem> = listOf(
    MediaItem(
        id = "demo-1",
        title = "Coastline at golden hour — a slow drone pass",
        author = "Northwind Films",
        source = Source.YouTube,
        durationLabel = "4:12",
        thumbnailUrl = "https://picsum.photos/seed/flickgrab-coast/960/540",
        statsLabel = "128K views · 2 days ago",
        formats = listOf(hd, sd, low, audio),
    ),
    MediaItem(
        id = "demo-2",
        title = "Street food night market, one continuous take",
        author = "@nightbites",
        source = Source.TikTok,
        durationLabel = "0:38",
        thumbnailUrl = "https://picsum.photos/seed/flickgrab-market/960/540",
        statsLabel = "1.2M views · 6 days ago",
        formats = listOf(hd, low, audio),
    ),
    MediaItem(
        id = "demo-3",
        title = "Studio session: building a beat from a single hum",
        author = "loftaudio",
        source = Source.YouTube,
        durationLabel = "12:47",
        thumbnailUrl = "https://picsum.photos/seed/flickgrab-studio/960/540",
        statsLabel = "46K views · 1 week ago",
        formats = listOf(hd, sd, audio),
    ),
    MediaItem(
        id = "demo-4",
        title = "Rooftop train timelapse in the rain",
        author = "@cityframes",
        source = Source.Instagram,
        durationLabel = "0:21",
        thumbnailUrl = "https://picsum.photos/seed/flickgrab-rooftop/960/540",
        statsLabel = "Reel · 88K plays",
        formats = listOf(hd, audio),
        accessibility = Accessibility.SignInRequired,
    ),
    MediaItem(
        id = "demo-5",
        title = "Making pasta without a machine",
        author = "Kitchen Notes",
        source = Source.Facebook,
        durationLabel = "8:03",
        thumbnailUrl = "https://picsum.photos/seed/flickgrab-pasta/960/540",
        statsLabel = "312K views · 3 weeks ago",
        formats = listOf(sd, low, audio),
        accessibility = Accessibility.SignInRequired,
    ),
    MediaItem(
        id = "demo-6",
        title = "A quiet walk through the old town at dawn",
        author = "Slow Streets",
        source = Source.YouTube,
        durationLabel = "6:58",
        thumbnailUrl = "https://picsum.photos/seed/flickgrab-dawn/960/540",
        statsLabel = "94K views · 4 days ago",
        formats = listOf(hd, sd, audio),
    ),
    MediaItem(
        id = "demo-7",
        title = "Sourdough starter, day by day",
        author = "@wellflour",
        source = Source.TikTok,
        durationLabel = "0:52",
        thumbnailUrl = "https://picsum.photos/seed/flickgrab-sourdough/960/540",
        statsLabel = "740K views · 1 day ago",
        formats = listOf(hd, low, audio),
    ),
    MediaItem(
        id = "demo-8",
        title = "Restoring a 1970s field radio",
        author = "Bench Work",
        source = Source.YouTube,
        durationLabel = "22:15",
        thumbnailUrl = "https://picsum.photos/seed/flickgrab-radio/960/540",
        statsLabel = "27K views · 5 days ago",
        formats = listOf(hd, sd, low, audio),
    ),
)
