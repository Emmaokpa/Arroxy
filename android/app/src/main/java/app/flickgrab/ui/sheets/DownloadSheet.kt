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
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.Folder
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import app.flickgrab.domain.Accessibility
import app.flickgrab.domain.FormatKind
import app.flickgrab.domain.FormatOption
import app.flickgrab.domain.MediaItem
import app.flickgrab.ui.components.GhostButton
import app.flickgrab.ui.components.GradientButton
import app.flickgrab.ui.components.Pill
import app.flickgrab.ui.components.Segmented
import app.flickgrab.ui.components.SourceBadge
import app.flickgrab.ui.components.Thumbnail
import app.flickgrab.ui.theme.BrandGradient
import app.flickgrab.ui.theme.Coral
import app.flickgrab.ui.theme.Cyan
import app.flickgrab.ui.theme.Ink
import app.flickgrab.ui.theme.InkSoft
import app.flickgrab.ui.theme.Outline
import app.flickgrab.ui.theme.Surface1
import app.flickgrab.ui.theme.Surface2
import app.flickgrab.ui.theme.TextPrimary
import app.flickgrab.ui.theme.TextSecondary
import app.flickgrab.ui.theme.TextTertiary
import app.flickgrab.util.formatBytes

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DownloadSheet(
    item: MediaItem,
    selectedFormatId: String?,
    previewData: Boolean,
    onSelectFormat: (String) -> Unit,
    onDismiss: () -> Unit,
    onDownload: () -> Unit,
    onSignIn: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val hasVideo = remember(item) { item.formats.any { it.kind == FormatKind.Video } }
    var kindTab by rememberSaveable(item.id) { mutableStateOf(if (hasVideo) 0 else 1) }

    val kind = if (kindTab == 0) FormatKind.Video else FormatKind.Audio
    val options = item.formats.filter { it.kind == kind }
    // Selection is per tab: switching to Audio must not leave a video format armed.
    val selected = options.firstOrNull { it.id == selectedFormatId } ?: options.firstOrNull()

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = InkSoft,
        contentColor = TextPrimary,
        shape = RoundedCornerShape(topStart = 30.dp, topEnd = 30.dp),
        dragHandle = { SheetHandle() },
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 18.dp)
                .navigationBarsPadding(),
        ) {
            Box {
                Thumbnail(
                    url = item.thumbnailUrl,
                    durationLabel = item.durationLabel,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(178.dp),
                    corner = 24.dp,
                    showPlayGlyph = false,
                )
                SourceBadge(
                    source = item.source,
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(10.dp),
                )
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(10.dp)
                        .size(32.dp)
                        .clip(CircleShape)
                        .background(Color(0x8C000000))
                        .clickable(onClick = onDismiss),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Close,
                        contentDescription = "Close",
                        tint = TextPrimary,
                        modifier = Modifier.size(16.dp),
                    )
                }
            }

            Spacer(Modifier.height(16.dp))

            Text(
                text = item.title,
                style = MaterialTheme.typography.titleLarge,
                color = TextPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(Modifier.height(5.dp))
            Text(
                text = "${item.author} · ${item.statsLabel}",
                style = MaterialTheme.typography.labelSmall,
                color = TextTertiary,
            )

            if (item.sharedFrom != null) {
                Spacer(Modifier.height(8.dp))
                Pill(
                    text = "FROM SHARE SHEET",
                    container = Color(0x1F7A5AF8),
                    content = Color(0xFFB7A6FF),
                )
            }

            Spacer(Modifier.height(18.dp))

            if (item.accessibility == Accessibility.SignInRequired) {
                SignInCard(item = item, onSignIn = onSignIn)
                Spacer(Modifier.height(18.dp))
            } else {
                if (hasVideo) {
                    Segmented(
                        options = listOf("Video", "Audio"),
                        selectedIndex = kindTab,
                        onSelect = { index ->
                            kindTab = index
                            val nextKind = if (index == 0) FormatKind.Video else FormatKind.Audio
                            item.formats.firstOrNull { it.kind == nextKind }
                                ?.let { onSelectFormat(it.id) }
                        },
                    )
                    Spacer(Modifier.height(12.dp))
                }

                Column(verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    options.forEach { option ->
                        FormatRow(
                            option = option,
                            selected = option.id == selected?.id,
                            onClick = { onSelectFormat(option.id) },
                        )
                    }
                }

                Spacer(Modifier.height(14.dp))

                if (selected?.requiresMux == true) {
                    MuxNote()
                    Spacer(Modifier.height(14.dp))
                } else if (selected != null) {
                    SingleStreamNote()
                    Spacer(Modifier.height(14.dp))
                }
            }

            SaveToRow()

            Spacer(Modifier.height(16.dp))

            if (item.accessibility == Accessibility.SignInRequired) {
                GradientButton(
                    label = "Sign in to ${item.source.label}",
                    onClick = onSignIn,
                    modifier = Modifier.fillMaxWidth(),
                )
            } else {
                GradientButton(
                    label = if (selected != null) {
                        "Download ${selected.label} · ${formatBytes(selected.sizeBytes)}"
                    } else {
                        "No format available"
                    },
                    onClick = onDownload,
                    enabled = selected != null,
                    modifier = Modifier.fillMaxWidth(),
                    icon = {
                        Icon(
                            imageVector = Icons.Rounded.Download,
                            contentDescription = null,
                            tint = if (selected != null) Ink else TextTertiary,
                            modifier = Modifier.size(19.dp),
                        )
                    },
                )
            }

            if (previewData) {
                Spacer(Modifier.height(10.dp))
                Text(
                    text = "Preview build: this task simulates progress. No file is written and " +
                        "nothing is downloaded until the on-device extractor lands.",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color(0xFF8A93A8),
                )
            }

            Spacer(Modifier.height(22.dp))
        }
    }
}

@Composable
private fun SheetHandle() {
    Box(
        Modifier
            .padding(top = 10.dp, bottom = 6.dp)
            .size(width = 40.dp, height = 4.dp)
            .clip(RoundedCornerShape(50))
            .background(Color(0xFF343A4D)),
    )
}

@Composable
private fun FormatRow(
    option: FormatOption,
    selected: Boolean,
    onClick: () -> Unit,
) {
    val shape = RoundedCornerShape(16.dp)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(if (selected) Color(0x1F22D3EE) else Surface1)
            .border(1.dp, if (selected) Cyan.copy(alpha = 0.75f) else Outline, shape)
            .clickable(onClick = onClick)
            .padding(horizontal = 13.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(20.dp)
                .clip(CircleShape)
                .border(1.5.dp, if (selected) Cyan else Color(0xFF3A4055), CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            if (selected) {
                Box(
                    Modifier
                        .size(10.dp)
                        .clip(CircleShape)
                        .background(Cyan),
                )
            }
        }
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = option.label,
                    style = MaterialTheme.typography.titleSmall,
                    color = TextPrimary,
                )
                Spacer(Modifier.width(7.dp))
                Text(
                    text = option.container,
                    style = MaterialTheme.typography.labelSmall,
                    color = TextTertiary,
                )
            }
            Spacer(Modifier.height(2.dp))
            Text(
                text = option.note,
                style = MaterialTheme.typography.labelSmall,
                color = TextTertiary,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }
        Spacer(Modifier.width(10.dp))
        Text(
            text = formatBytes(option.sizeBytes),
            style = MaterialTheme.typography.labelMedium,
            color = if (selected) Cyan else TextSecondary,
        )
    }
}

@Composable
private fun MuxNote() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color(0x1AFBBF24))
            .border(1.dp, Color(0x4DFBBF24), RoundedCornerShape(16.dp))
            .padding(13.dp),
    ) {
        Column {
            Text(
                text = "Two streams, merged on this phone",
                style = MaterialTheme.typography.labelMedium,
                color = Color(0xFFFBD574),
            )
            Spacer(Modifier.height(3.dp))
            Text(
                text = "This quality ships video and audio separately. The merge happens " +
                    "locally — no server ever holds the file.",
                style = MaterialTheme.typography.labelSmall,
                color = TextSecondary,
            )
        }
    }
}

@Composable
private fun SingleStreamNote() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Surface1)
            .padding(13.dp),
    ) {
        Text(
            text = "One file, no merge needed. Saved straight to the gallery when it finishes.",
            style = MaterialTheme.typography.labelSmall,
            color = TextTertiary,
        )
    }
}

@Composable
private fun SaveToRow() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Surface1)
            .border(1.dp, Color(0xFF1B1F2C), RoundedCornerShape(16.dp))
            .padding(horizontal = 13.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = Icons.Rounded.Folder,
            contentDescription = null,
            tint = TextTertiary,
            modifier = Modifier.size(17.dp),
        )
        Spacer(Modifier.width(11.dp))
        Column(Modifier.weight(1f)) {
            Text(
                text = "Save to",
                style = MaterialTheme.typography.labelSmall,
                color = TextTertiary,
            )
            Text(
                text = "Movies/FlickGrab",
                style = MaterialTheme.typography.titleSmall,
                color = TextPrimary,
            )
        }
        Text(
            text = "Change",
            style = MaterialTheme.typography.labelSmall,
            color = Cyan,
        )
    }
}

@Composable
private fun SignInCard(item: MediaItem, onSignIn: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(20.dp))
            .background(
                Brush.linearGradient(listOf(Color(0xFF1A1730), Color(0xFF131B26))),
            )
            .border(1.dp, Color(0xFF2A2B45), RoundedCornerShape(20.dp))
            .padding(16.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(34.dp)
                    .clip(RoundedCornerShape(11.dp))
                    .background(Color(0x1FC9A6FF)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    imageVector = Icons.Rounded.Lock,
                    contentDescription = null,
                    tint = Color(0xFFC9A6FF),
                    modifier = Modifier.size(17.dp),
                )
            }
            Spacer(Modifier.width(11.dp))
            Text(
                text = "A session is required",
                style = MaterialTheme.typography.titleSmall,
                color = TextPrimary,
            )
        }
        Spacer(Modifier.height(10.dp))
        Text(
            text = "${item.source.label} does not serve public media URLs any more. FlickGrab " +
                "needs a signed-in session, stored encrypted on this device, and it can be " +
                "wiped at any time.",
            style = MaterialTheme.typography.bodySmall,
            color = TextSecondary,
        )
        Spacer(Modifier.height(12.dp))
        Row {
            GhostButton("Learn more", onSignIn)
            Spacer(Modifier.width(10.dp))
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color(0x14FF6B81))
                    .padding(horizontal = 12.dp, vertical = 9.dp),
            ) {
                Text(
                    text = "Not available yet",
                    style = MaterialTheme.typography.labelSmall,
                    color = Coral,
                )
            }
        }
    }
}
