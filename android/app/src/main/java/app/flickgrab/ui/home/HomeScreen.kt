package app.flickgrab.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ContentPaste
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.Settings
import androidx.compose.material.icons.rounded.Tune
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import app.flickgrab.domain.MediaItem
import app.flickgrab.domain.Source
import app.flickgrab.ui.AppUiState
import app.flickgrab.ui.components.DemoBanner
import app.flickgrab.ui.components.EmptyState
import app.flickgrab.ui.components.FlickMark
import app.flickgrab.ui.components.GhostButton
import app.flickgrab.ui.components.LoadingBlock
import app.flickgrab.ui.components.MediaCard
import app.flickgrab.ui.components.SectionHeader
import app.flickgrab.ui.components.SourceBadge
import app.flickgrab.ui.components.Thumbnail
import app.flickgrab.ui.components.sourceColor
import app.flickgrab.ui.theme.Cyan
import app.flickgrab.ui.theme.Ink
import app.flickgrab.ui.theme.Outline
import app.flickgrab.ui.theme.Surface1
import app.flickgrab.ui.theme.TextPrimary
import app.flickgrab.ui.theme.TextSecondary
import app.flickgrab.ui.theme.TextTertiary

private val FEED_FILTERS = listOf<Source?>(
    null,
    Source.YouTube,
    Source.TikTok,
    Source.Instagram,
    Source.Facebook,
)

@Composable
fun HomeScreen(
    state: AppUiState,
    onQueryChange: (String) -> Unit,
    onFilterChange: (Source?) -> Unit,
    onOpenItem: (MediaItem) -> Unit,
    onDismissPreviewNotice: () -> Unit,
    onOpenSettings: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val clipboard = LocalClipboardManager.current

    val visible = state.feed.filter { item ->
        val matchesSource = state.filter == null || item.source == state.filter
        val q = state.query.trim()
        val matchesQuery = q.isEmpty() ||
            item.title.contains(q, ignoreCase = true) ||
            item.author.contains(q, ignoreCase = true) ||
            item.source.label.contains(q, ignoreCase = true)
        matchesSource && matchesQuery
    }

    if (state.loadingFeed && state.feed.isEmpty()) {
        LoadingBlock(modifier.fillMaxSize())
        return
    }

    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 10.dp, bottom = 120.dp),
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        item(span = { GridItemSpan(maxLineSpan) }) {
            AppBar(onOpenSettings)
        }

        item(span = { GridItemSpan(maxLineSpan) }) {
            Column {
                Text(
                    text = "Save it before\nit disappears.",
                    style = MaterialTheme.typography.displaySmall,
                    color = TextPrimary,
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    text = "Extraction and merging happen on this phone. Nothing is uploaded.",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextTertiary,
                )
            }
        }

        item(span = { GridItemSpan(maxLineSpan) }) {
            SearchField(
                query = state.query,
                onQueryChange = onQueryChange,
                onPaste = {
                    val text = clipboard.getText()?.text
                    if (!text.isNullOrBlank()) onQueryChange(text.trim())
                },
            )
        }

        item(span = { GridItemSpan(maxLineSpan) }) {
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                item {
                    FilterChip(
                        label = "All",
                        selected = state.filter == null,
                        onClick = { onFilterChange(null) },
                    )
                }
                items(FEED_FILTERS.drop(1).size) { index ->
                    val source = FEED_FILTERS.drop(1)[index]
                    if (source != null) {
                        FilterChip(
                            label = source.label,
                            selected = state.filter == source,
                            tint = sourceColor(source),
                            onClick = { onFilterChange(source) },
                        )
                    }
                }
            }
        }

        if (state.previewData) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                DemoBanner(
                    text = "Preview build: the feed below is placeholder data. The extractor " +
                        "arrives with the M0 device probe.",
                    onDismiss = onDismissPreviewNotice,
                )
            }
        }

        if (state.feed.isEmpty()) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                EmptyState(
                    title = "No extractor wired yet",
                    body = "This build can classify links and show what each source needs, but " +
                        "it cannot resolve media until the on-device extractor passes the M0 gate.",
                    action = { GhostButton("See what each source needs", onOpenSettings) },
                )
            }
        } else {
            val spotlight = visible.firstOrNull()
            if (spotlight != null && state.query.isBlank()) {
                item(span = { GridItemSpan(maxLineSpan) }) {
                    SpotlightCard(item = spotlight, onClick = { onOpenItem(spotlight) })
                }
            }

            item(span = { GridItemSpan(maxLineSpan) }) {
                SectionHeader(
                    title = if (state.query.isBlank()) "Trending now" else "Results",
                    trailing = {
                        Text(
                            text = "${visible.size} links",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextTertiary,
                        )
                    },
                )
            }

            val rest = if (spotlight != null && state.query.isBlank()) visible.drop(1) else visible

            if (rest.isEmpty()) {
                item(span = { GridItemSpan(maxLineSpan) }) {
                    EmptyState(
                        title = "Nothing matches that",
                        body = "Try a different word, or clear the source filter.",
                    )
                }
            }

            items(rest, key = { it.id }) { item ->
                MediaCard(item = item, onClick = { onOpenItem(item) })
            }
        }
    }
}

@Composable
private fun AppBar(onOpenSettings: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        FlickMark()
        Spacer(Modifier.width(11.dp))
        Column(Modifier.weight(1f)) {
            Text(
                text = "FlickGrab",
                style = MaterialTheme.typography.titleLarge,
                color = TextPrimary,
            )
            Text(
                text = "on-device · no uploads",
                style = MaterialTheme.typography.labelSmall,
                color = TextTertiary,
            )
        }
        Box(
            modifier = Modifier
                .size(42.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(Surface1)
                .border(1.dp, Outline, RoundedCornerShape(14.dp))
                .clickable(onClick = onOpenSettings),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = Icons.Rounded.Settings,
                contentDescription = "Settings",
                tint = TextSecondary,
                modifier = Modifier.size(19.dp),
            )
        }
    }
}

@Composable
private fun SearchField(
    query: String,
    onQueryChange: (String) -> Unit,
    onPaste: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(54.dp)
            .clip(RoundedCornerShape(18.dp))
            .background(Surface1)
            .border(1.dp, Outline, RoundedCornerShape(18.dp))
            .padding(start = 16.dp, end = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(
            imageVector = Icons.Rounded.Search,
            contentDescription = null,
            tint = TextTertiary,
            modifier = Modifier.size(19.dp),
        )
        Spacer(Modifier.width(12.dp))
        BasicTextField(
            value = query,
            onValueChange = onQueryChange,
            singleLine = true,
            textStyle = MaterialTheme.typography.bodyMedium.copy(color = TextPrimary),
            cursorBrush = SolidColor(Cyan),
            modifier = Modifier.weight(1f),
            decorationBox = { inner ->
                Box {
                    if (query.isEmpty()) {
                        Text(
                            text = "Paste a link or search",
                            style = MaterialTheme.typography.bodyMedium,
                            color = TextTertiary,
                        )
                    }
                    inner()
                }
            },
        )
        Box(
            modifier = Modifier
                .size(38.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Color(0x1A22D3EE))
                .clickable(onClick = onPaste),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = Icons.Rounded.ContentPaste,
                contentDescription = "Paste link",
                tint = Cyan,
                modifier = Modifier.size(17.dp),
            )
        }
    }
}

@Composable
private fun FilterChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    tint: Color = Cyan,
) {
    Row(
        modifier = Modifier
            .height(38.dp)
            .clip(RoundedCornerShape(50))
            .background(if (selected) tint.copy(alpha = 0.16f) else Surface1)
            .border(
                1.dp,
                if (selected) tint.copy(alpha = 0.7f) else Outline,
                RoundedCornerShape(50),
            )
            .clickable(onClick = onClick)
            .padding(horizontal = 15.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        if (!selected) {
            Box(
                Modifier
                    .size(6.dp)
                    .clip(CircleShape)
                    .background(if (label == "All") TextTertiary else tint),
            )
            Spacer(Modifier.width(7.dp))
        }
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = if (selected) TextPrimary else TextSecondary,
        )
    }
}

@Composable
private fun SpotlightCard(item: MediaItem, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .clickable(onClick = onClick),
    ) {
        Thumbnail(
            url = item.thumbnailUrl,
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(16f / 10f),
            corner = 24.dp,
            showPlayGlyph = false,
        )
        Box(
            Modifier
                .fillMaxWidth()
                .aspectRatio(16f / 10f)
                .background(
                    Brush.verticalGradient(
                        0.3f to Color.Transparent,
                        1f to Color(0xF207080C),
                    ),
                ),
        )
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(16.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                SourceBadge(source = item.source)
                Spacer(Modifier.width(8.dp))
                Text(
                    text = "SPOTLIGHT",
                    style = MaterialTheme.typography.labelSmall,
                    color = Cyan,
                )
            }
            Spacer(Modifier.height(9.dp))
            Text(
                text = item.title,
                style = MaterialTheme.typography.headlineSmall,
                color = TextPrimary,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
            Spacer(Modifier.height(5.dp))
            Text(
                text = "${item.author} · ${item.statsLabel}",
                style = MaterialTheme.typography.labelSmall,
                color = TextSecondary,
            )
            Spacer(Modifier.height(12.dp))
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(50))
                        .background(Brush.linearGradient(listOf(Color(0xFF7A5AF8), Color(0xFF22D3EE))))
                        .padding(horizontal = 14.dp, vertical = 8.dp),
                ) {
                    Text(
                        text = "Choose quality",
                        style = MaterialTheme.typography.labelMedium,
                        color = Ink,
                    )
                }
                Spacer(Modifier.width(10.dp))
                Text(
                    text = item.durationLabel,
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary,
                )
            }
        }
        Box(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(14.dp)
                .size(36.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Color(0x66000000)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = Icons.Rounded.Tune,
                contentDescription = null,
                tint = Color(0xE6FFFFFF),
                modifier = Modifier.size(17.dp),
            )
        }
    }
}
