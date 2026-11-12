package app.flickgrab.util

import java.util.Locale
import kotlin.math.roundToInt

fun formatBytes(bytes: Long): String {
    if (bytes <= 0L) return "—"
    val units = listOf("B", "KB", "MB", "GB")
    var value = bytes.toDouble()
    var unit = 0
    while (value >= 1024 && unit < units.lastIndex) {
        value /= 1024
        unit++
    }
    val pattern = if (value >= 100 || unit == 0) "%.0f %s" else "%.1f %s"
    return String.format(Locale.US, pattern, value, units[unit])
}

fun formatSpeed(bytesPerSecond: Long): String {
    if (bytesPerSecond <= 0L) return "—"
    return "${formatBytes(bytesPerSecond)}/s"
}

fun formatEta(progress: Float, bytesPerSecond: Long, totalBytes: Long): String {
    if (progress <= 0.01f || bytesPerSecond <= 0L) return "estimating"
    val remaining = (totalBytes * (1f - progress)).toLong().coerceAtLeast(0L)
    val seconds = (remaining.toDouble() / bytesPerSecond.toDouble()).roundToInt()
    return when {
        seconds <= 0 -> "a moment left"
        seconds < 60 -> "${seconds}s left"
        else -> "${seconds / 60}m ${seconds % 60}s left"
    }
}

/** Pulls the first http(s) URL out of shared text ("Check this out: https://…"). */
fun firstUrlIn(text: String?): String? {
    if (text == null) return null
    val match = Regex("https?://\\S+").find(text) ?: return null
    return match.value.trimEnd('.', ',', ')', ']', '"', '\'')
}
