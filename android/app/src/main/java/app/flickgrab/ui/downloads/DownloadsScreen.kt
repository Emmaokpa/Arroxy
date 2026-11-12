package app.flickgrab.ui.downloads

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.DeleteOutline
import androidx.compose.material.icons.rounded.DownloadDone
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import app.flickgrab.domain.DownloadStage
import app.flickgrab.domain.DownloadTask
import app.flickgrab.ui.components.EmptyState
import app.flickgrab.ui.components.HairlineDivider
import app.flickgrab.ui.components.Pill
import app.flickgrab.ui.components.ScreenTitle
import app.flickgrab.ui.components.Segmented
import app.flickgrab.ui.components.Thumbnail
import app.flickgrab.ui.components.sourceColor
import app.flickgrab.ui.theme.Coral
import app.flickgrab.ui.theme.Cyan
import app.flickgrab.ui.theme.Ink
import app.flickgrab.ui.theme.Outline
import app.flickgrab.ui.theme.Success
import app.flickgrab.ui.theme.Surface1
import app.flickgrab.ui.theme.Surface2
import app.flickgrab.ui.theme.Surface3
import app.flickgrab.ui.theme.TextPrimary
import app.flickgrab.ui.theme.TextSecondary
import app.flickgrab.ui.theme.TextTertiary
import app.flickgrab.util.formatBytes
import app.flickgrab.util.formatEta
import app.flickgrab.util.formatSpeed

@Composable
fun DownloadsScreen(
    downloads: List<DownloadTask>,
    onShowProgress: (String) -> Unit,
    onCancel: (String) -> Unit,
    onRemove: (String) -> Unit,
    onClearFinished: () -> Unit,
    onBrowse: () -> Unit,
    modifier: Modifier = Modifier,
) {
    var tab by rememberSaveable { mutableStateOf(0) }

    val active = downloads.filter { it.isActive }
    val finished = downloads.filterNot { it.isActive }
    val list = if (tab == 0) active else finished

    LazyColumn(
        modifier = modifier,
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 14.dp, bottom = 120.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            ScreenTitle(
                title = "Downloads",
                subtitle = "Files land in Movies/FlickGrab on this device",
            )
        }
        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Segmented(
                    options = listOf("Active (${active.size})", "Saved (${finished.size})"),
                    selectedIndex = tab,
                    onSelect = { tab = it },
                    modifier = Modifier.weight(1f),
                )
                if (finished.isNotEmpty() && tab == 1) {
                    Spacer(Modifier.width(10.dp))
                    Text(
                        text = "Clear",
                        style = MaterialTheme.typography.labelMedium,
                        color = TextTertiary,
                        modifier = Modifier
                            .clip(RoundedCornerShape(50))
                            .clickable(onClick = onClearFinished)
                            .padding(horizontal = 10.dp, vertical = 6.dp),
                    )
                }
            }
        }

        if (list.isEmpty()) {
            item {
                if (tab == 0) {
                    EmptyState(
                        title = "Nothing downloading",
                        body = "Pick a link from Home and choose a quality. Video and audio are " +
                            "merged on the phone, then written straight to your gallery.",
                        action = {
                            Text(
                                text = "Browse links",
                                style = MaterialTheme.typography.labelMedium,
                                color = Cyan,
                                modifier = Modifier
                                    .clip(RoundedCornerShape(50))
                                    .background(Color(0x1A22D3EE))
                                    .clickable(onClick = onBrowse)
                                    .padding(horizontal = 16.dp, vertical = 9.dp),
                            )
                        },
                    )
                } else {
                    EmptyState(
                        title = "No saved files yet",
                        body = "Completed downloads stay listed here with their format and size.",
                    )
                }
            }
        }

        items(list, key = { it.id }) { task ->
            DownloadCard(
                task = task,
                onClick = { onShowProgress(task.id) },
                onCancel = { onCancel(task.id) },
                onRemove = { onRemove(task.id) },
            )
        }

        if (tab == 1 && finished.isNotEmpty()) {
            item {
                Spacer(Modifier.height(6.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(Surface1)
                        .padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(
                        imageVector = Icons.Rounded.DownloadDone,
                        contentDescription = null,
                        tint = Success,
                        modifier = Modifier.size(18.dp),
                    )
                    Spacer(Modifier.width(10.dp))
                    Text(
                        text = "Files are saved to the gallery. FlickGrab keeps no copy.",
                        style = MaterialTheme.typography.bodySmall,
                        color = TextTertiary,
                    )
                }
            }
        }
    }
}

@Composable
private fun DownloadCard(
    task: DownloadTask,
    onClick: () -> Unit,
    onCancel: () -> Unit,
    onRemove: () -> Unit,
) {
    val accent = when (task.stage) {
        DownloadStage.Completed -> Success
        DownloadStage.Failed -> Coral
        DownloadStage.Cancelled -> TextTertiary
        else -> Cyan
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(Surface1)
            .border(1.dp, Color(0xFF1B1F2C), RoundedCornerShape(20.dp))
            .clickable(onClick = onClick)
            .padding(12.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Thumbnail(
                url = task.item.thumbnailUrl,
                modifier = Modifier.size(58.dp),
                corner = 15.dp,
                showPlayGlyph = false,
            )
            Spacer(Modifier.width(12.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    text = task.item.title,
                    style = MaterialTheme.typography.titleSmall,
                    color = TextPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(sourceColor(task.item.source)),
                    )
                    Spacer(Modifier.width(6.dp))
                    Text(
                        text = "${task.format.label} · ${task.format.container} · ${formatBytes(task.format.sizeBytes)}",
                        style = MaterialTheme.typography.labelSmall,
                        color = TextTertiary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
            Spacer(Modifier.width(8.dp))
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(CircleShape)
                    .background(Surface2)
                    .clickable(onClick = if (task.isActive) onCancel else onRemove),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = if (task.isActive) Icons.Rounded.Close else Icons.Rounded.DeleteOutline,
                    contentDescription = if (task.isActive) "Cancel" else "Remove",
                    tint = TextSecondary,
                    modifier = Modifier.size(16.dp),
                )
            }
        }

        Spacer(Modifier.height(12.dp))

        if (task.isActive) {
            LinearProgressIndicator(
                progress = { task.progress },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(5.dp)
                    .clip(RoundedCornerShape(50)),
                color = accent,
                trackColor = Surface3,
            )
            Spacer(Modifier.height(8.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = task.stage.label,
                    style = MaterialTheme.typography.labelSmall,
                    color = accent,
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    text = "${(task.progress * 100).toInt()}%",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary,
                )
                Spacer(Modifier.weight(1f))
                Text(
                    text = if (task.stage == DownloadStage.Downloading) {
                        "${formatSpeed(task.bytesPerSecond)} · ${formatEta(task.progress, task.bytesPerSecond, task.format.sizeBytes)}"
                    } else {
                        task.stage.label
                    },
                    style = MaterialTheme.typography.labelSmall,
                    color = TextTertiary,
                )
            }
        } else {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Rounded.Check,
                    contentDescription = null,
                    tint = accent,
                    modifier = Modifier.size(15.dp),
                )
                Spacer(Modifier.width(7.dp))
                Text(
                    text = if (task.stage == DownloadStage.Completed) {
                        "Saved · ${formatBytes(task.format.sizeBytes)}"
                    } else {
                        task.stage.label
                    },
                    style = MaterialTheme.typography.labelMedium,
                    color = accent,
                )
                Spacer(Modifier.weight(1f))
                if (task.preview) {
                    Pill(
                        text = "PREVIEW",
                        container = Color(0x1A22D3EE),
                        content = Cyan,
                    )
                }
            }
        }
    }
}

@Composable
fun ActiveDownloadStrip(
    task: DownloadTask,
    onClick: () -> Unit,
    onCancel: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier) {
        HairlineDivider()
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(
                    Brush.linearGradient(listOf(Color(0xFF151226), Surface1)),
                )
                .clickable(onClick = onClick)
                .padding(horizontal = 18.dp, vertical = 11.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(RoundedCornerShape(11.dp))
                    .background(Color(0x1A22D3EE)),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    text = "${(task.progress * 100).toInt()}",
                    style = MaterialTheme.typography.labelSmall,
                    color = Cyan,
                )
            }
            Spacer(Modifier.width(11.dp))
            Column(Modifier.weight(1f)) {
                Text(
                    text = task.item.title,
                    style = MaterialTheme.typography.labelMedium,
                    color = TextPrimary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Text(
                    text = "${task.stage.label} · ${task.format.label} ${task.format.container}",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextTertiary,
                )
            }
            Box(
                modifier = Modifier
                    .size(30.dp)
                    .clip(CircleShape)
                    .background(Ink.copy(alpha = 0.4f))
                    .clickable(onClick = onCancel),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Rounded.Close,
                    contentDescription = "Cancel download",
                    tint = TextSecondary,
                    modifier = Modifier.size(15.dp),
                )
            }
        }
        LinearProgressIndicator(
            progress = { task.progress },
            modifier = Modifier
                .fillMaxWidth()
                .height(2.dp),
            color = Cyan,
            trackColor = Surface2,
        )
    }
}
