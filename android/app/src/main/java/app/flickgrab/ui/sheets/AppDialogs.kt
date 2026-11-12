package app.flickgrab.ui.sheets

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import app.flickgrab.ui.AppDialog
import app.flickgrab.ui.components.Pill
import app.flickgrab.ui.theme.Coral
import app.flickgrab.ui.theme.Cyan
import app.flickgrab.ui.theme.InkSoft
import app.flickgrab.ui.theme.Outline
import app.flickgrab.ui.theme.TextPrimary
import app.flickgrab.ui.theme.TextSecondary
import app.flickgrab.ui.theme.TextTertiary

@Composable
fun AppDialogHost(
    dialog: AppDialog,
    onDismiss: () -> Unit,
    onAcceptLink: (String) -> Unit,
) {
    val title: String
    val body: String
    val confirm: String?
    val tone: Color

    when (dialog) {
        is AppDialog.ReceivedLink -> {
            title = "Link received"
            body = "FlickGrab was handed this link. Nothing has been fetched yet — you choose " +
                "the quality before anything is written to the phone."
            confirm = "Choose quality"
            tone = Cyan
        }
        is AppDialog.SignInRequired -> {
            title = "${dialog.source.label} needs a session"
            body = "Public metadata for this source is gone, and the media URLs are signed. " +
                "The encrypted cookie store and the sign-in screen are milestone M4, so this " +
                "build stops here instead of pretending."
            confirm = null
            tone = Coral
        }
        is AppDialog.NotWired -> {
            title = "Extractor not wired yet"
            body = "This build can classify a link and tell you what saving it would need. The " +
                "on-device extractor lands after the M0 physical-device probe passes, so no " +
                "download is started."
            confirm = null
            tone = Coral
        }
        is AppDialog.Failure -> {
            title = "Something went wrong"
            body = dialog.message
            confirm = null
            tone = Coral
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = InkSoft,
        shape = RoundedCornerShape(26.dp),
        title = {
            Column {
                Pill(
                    text = "FLICKGRAB",
                    container = tone.copy(alpha = 0.14f),
                    content = tone,
                )
                Spacer(Modifier.height(10.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleLarge,
                    color = TextPrimary,
                )
            }
        },
        text = {
            Column {
                Text(
                    text = body,
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                )
                if (dialog is AppDialog.ReceivedLink) {
                    Spacer(Modifier.height(12.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(
                                color = Color(0xFF141826),
                                shape = RoundedCornerShape(14.dp),
                            )
                            .padding(12.dp),
                        horizontalArrangement = Arrangement.Start,
                    ) {
                        Text(
                            text = dialog.url,
                            style = MaterialTheme.typography.labelSmall,
                            color = TextTertiary,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
            }
        },
        confirmButton = {
            if (confirm != null && dialog is AppDialog.ReceivedLink) {
                TextButton(onClick = { onAcceptLink(dialog.url) }) {
                    Text(confirm, color = Cyan)
                }
            } else {
                TextButton(onClick = onDismiss) {
                    Text("Close", color = TextSecondary)
                }
            }
        },
        dismissButton = if (confirm != null) {
            {
                TextButton(onClick = onDismiss) {
                    Text("Not now", color = TextTertiary)
                }
            }
        } else {
            null
        },
    )
}
