package app.flickgrab.ui.sheets

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.DownloadDone
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import app.flickgrab.domain.DownloadStage
import app.flickgrab.domain.DownloadTask
import app.flickgrab.ui.components.GhostButton
import app.flickgrab.ui.components.Pill
import app.flickgrab.ui.theme.Coral
import app.flickgrab.ui.theme.Cyan
import app.flickgrab.ui.theme.InkSoft
import app.flickgrab.ui.theme.Outline
import app.flickgrab.ui.theme.Success
import app.flickgrab.ui.theme.Surface1
import app.flickgrab.ui.theme.Surface3
import app.flickgrab.ui.theme.TextPrimary
import app.flickgrab.ui.theme.TextSecondary
import app.flickgrab.ui.theme.TextTertiary
import app.flickgrab.util.formatBytes
import app.flickgrab.util.formatEta
import app.flickgrab.util.formatSpeed

private fun stepsFor(requiresMux: Boolean): List<Pair<DownloadStage, String>> = buildList {
    add(DownloadStage.Resolving to "Resolve link on device")
    add(
        DownloadStage.Downloading to
            if (requiresMux) "Download video + audio" else "Download file",
    )
    if (requiresMux) add(DownloadStage.Muxing to "Merge streams on device")
    add(DownloadStage.Saving to "Save to gallery")
}

@Composable
fun DownloadProgressDialog(
    task: DownloadTask,
    onHide: () -> Unit,
    onCancel: () -> Unit,
) {
    val done = task.stage == DownloadStage.Completed
    val accent = if (done) Success else Cyan

    Dialog(
        onDismissRequest = onHide,
        properties = DialogProperties(usePlatformDefaultWidth = false),
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth(0.9f)
                .clip(RoundedCornerShape(28.dp))
                .background(InkSoft)
                .border(1.dp, Outline, RoundedCornerShape(28.dp))
                .padding(20.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = if (done) "Saved" else "Downloading",
                    style = MaterialTheme.typography.titleLarge,
                    color = TextPrimary,
                    modifier = Modifier.weight(1f),
                )
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(Surface1)
                        .clickable(onClick = onHide),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Close,
                        contentDescription = "Hide",
                        tint = TextSecondary,
                        modifier = Modifier.size(16.dp),
                    )
                }
            }

            Spacer(Modifier.height(20.dp))

            Box(
                modifier = Modifier
                    .align(Alignment.CenterHorizontally)
                    .size(126.dp),
                contentAlignment = Alignment.Center,
            ) {
                CircularProgressIndicator(
                    progress = { if (done) 1f else task.progress },
                    modifier = Modifier.size(126.dp),
                    color = accent,
                    trackColor = Surface3,
                    strokeWidth = 9.dp,
                )
                if (done) {
                    Icon(
                        imageVector = Icons.Rounded.DownloadDone,
                        contentDescription = null,
                        tint = accent,
                        modifier = Modifier.size(40.dp),
                    )
                } else {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "${(task.progress * 100).toInt()}%",
                            style = MaterialTheme.typography.headlineMedium,
                            color = TextPrimary,
                        )
                        Text(
                            text = task.stage.label,
                            style = MaterialTheme.typography.labelSmall,
                            color = accent,
                        )
                    }
                }
            }

            Spacer(Modifier.height(18.dp))

            Text(
                text = task.item.title,
                style = MaterialTheme.typography.titleSmall,
                color = TextPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(5.dp))
            Text(
                text = "${task.format.label} · ${task.format.container} · ${formatBytes(task.format.sizeBytes)}",
                style = MaterialTheme.typography.labelSmall,
                color = TextTertiary,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth(),
            )

            Spacer(Modifier.height(16.dp))

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(Surface1)
                    .padding(vertical = 12.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
            ) {
                Metric("Speed", if (done) "—" else formatSpeed(task.bytesPerSecond))
                Metric("Left", if (done) "0s" else formatEta(task.progress, task.bytesPerSecond, task.format.sizeBytes))
                Metric(
                    "Written",
                    formatBytes((task.format.sizeBytes * task.progress).toLong().coerceAtLeast(0L)),
                )
            }

            Spacer(Modifier.height(16.dp))

            val steps = stepsFor(task.format.requiresMux)
            Column(verticalArrangement = Arrangement.spacedBy(9.dp)) {
                steps.forEachIndexed { index, step ->
                    StepRow(
                        label = step.second,
                        state = stepState(task, steps, index),
                    )
                }
            }

            if (task.preview) {
                Spacer(Modifier.height(14.dp))
                Pill(
                    text = "PREVIEW · SIMULATED PROGRESS",
                    container = Color(0x1A22D3EE),
                    content = Cyan,
                )
            }

            Spacer(Modifier.height(18.dp))

            if (done) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0x1A34D399))
                        .clickable(onClick = onHide),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        text = "Done · file is in Movies/FlickGrab",
                        style = MaterialTheme.typography.labelMedium,
                        color = Success,
                    )
                }
            } else {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    GhostButton("Run in background", onHide)
                    Spacer(Modifier.weight(1f))
                    Text(
                        text = "Cancel",
                        style = MaterialTheme.typography.labelMedium,
                        color = Coral,
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .clickable(onClick = onCancel)
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                    )
                }
            }
        }
    }
}

private enum class StepState { Done, Current, Pending }

private fun stepState(
    task: DownloadTask,
    steps: List<Pair<DownloadStage, String>>,
    index: Int,
): StepState {
    val current = steps.indexOfFirst { it.first == task.stage }
        .let { if (it < 0) steps.size else it }
    return when {
        task.stage == DownloadStage.Completed -> StepState.Done
        index < current -> StepState.Done
        index == current -> StepState.Current
        else -> StepState.Pending
    }
}

@Composable
private fun Metric(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            style = MaterialTheme.typography.titleSmall,
            color = TextPrimary,
        )
        Spacer(Modifier.height(2.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            color = TextTertiary,
        )
    }
}

@Composable
private fun StepRow(label: String, state: StepState) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(18.dp)
                .clip(CircleShape)
                .background(
                    when (state) {
                        StepState.Done -> Success.copy(alpha = 0.18f)
                        StepState.Current -> Cyan.copy(alpha = 0.18f)
                        StepState.Pending -> Surface1
                    },
                )
                .border(
                    1.dp,
                    when (state) {
                        StepState.Done -> Success.copy(alpha = 0.6f)
                        StepState.Current -> Cyan
                        StepState.Pending -> Outline
                    },
                    CircleShape,
                ),
            contentAlignment = Alignment.Center,
        ) {
            if (state == StepState.Done) {
                Icon(
                    imageVector = Icons.Rounded.Check,
                    contentDescription = null,
                    tint = Success,
                    modifier = Modifier.size(11.dp),
                )
            } else if (state == StepState.Current) {
                Box(
                    Modifier
                        .size(6.dp)
                        .clip(CircleShape)
                        .background(Cyan),
                )
            }
        }
        Spacer(Modifier.width(10.dp))
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = if (state == StepState.Pending) TextTertiary else TextSecondary,
        )
    }
}
