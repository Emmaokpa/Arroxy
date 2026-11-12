package app.flickgrab.intake

import android.content.Intent

/**
 * Where a link can enter the app: the share sheet or the website's
 * `flickgrab://inspect?url=…` deep link.
 */
object LinkIntake {

    fun fromIntent(intent: Intent?): String? {
        if (intent == null) return null
        return when (intent.action) {
            Intent.ACTION_SEND -> firstUrlIn(intent.getStringExtra(Intent.EXTRA_TEXT))
            Intent.ACTION_VIEW -> intent.dataString
            else -> null
        }
    }

    private fun firstUrlIn(text: String?): String? {
        if (text.isNullOrBlank()) return null
        val match = Regex("https?://\\S+").find(text) ?: return null
        return match.value.trimEnd('.', ',', ')', ']', '"', '\'')
    }
}
