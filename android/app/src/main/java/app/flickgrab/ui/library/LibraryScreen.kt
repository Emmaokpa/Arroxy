package app.flickgrab.ui.library

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import app.flickgrab.domain.DownloadStage
import app.flickgrab.domain.DownloadTask
import app.flickgrab.ui.components.EmptyState
import app.flickgrab.ui.components.GhostButton
import app.flickgrab.ui.components.MediaCard
import app.flickgrab.ui.components.ScreenTitle
import app.flickgrab.ui.theme.TextTertiary

@Composable
fun LibraryScreen(
    downloads: List<DownloadTask>,
    onOpenItem: (DownloadTask) -> Unit,
    onBrowse: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val saved = downloads.filter { it.stage == DownloadStage.Completed }

    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 14.dp, bottom = 120.dp),
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp),
    ) {
        item(span = { GridItemSpan(maxLineSpan) }) {
            ScreenTitle(
                title = "Library",
                subtitle = "Everything this build has saved, with the format it used",
            )
        }

        if (saved.isEmpty()) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                EmptyState(
                    title = "Your library is empty",
                    body = "Completed downloads appear here. FlickGrab keeps no second copy — " +
                        "the file itself lives in your gallery.",
                    action = { GhostButton("Find something to save", onBrowse) },
                )
            }
        } else {
            items(saved, key = { it.id }) { task ->
                MediaCard(item = task.item, onClick = { onOpenItem(task) })
            }
            item(span = { GridItemSpan(maxLineSpan) }) {
                Text(
                    text = "Sizes shown were reported when each file was saved.",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextTertiary,
                )
            }
        }
    }
}
