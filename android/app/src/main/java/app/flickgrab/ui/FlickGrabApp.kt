package app.flickgrab.ui

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Download
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.MoreHoriz
import androidx.compose.material.icons.rounded.VideoLibrary
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import app.flickgrab.BuildConfig
import app.flickgrab.domain.DownloadStage
import app.flickgrab.ui.downloads.ActiveDownloadStrip
import app.flickgrab.ui.downloads.DownloadsScreen
import app.flickgrab.ui.home.HomeScreen
import app.flickgrab.ui.library.LibraryScreen
import app.flickgrab.ui.more.MoreScreen
import app.flickgrab.ui.sheets.AppDialogHost
import app.flickgrab.ui.sheets.DownloadProgressDialog
import app.flickgrab.ui.sheets.DownloadSheet
import app.flickgrab.ui.theme.Cyan
import app.flickgrab.ui.theme.Hairline
import app.flickgrab.ui.theme.Ink
import app.flickgrab.ui.theme.InkSoft
import app.flickgrab.ui.theme.TextTertiary
import app.flickgrab.ui.theme.Violet

@Composable
fun FlickGrabApp(
    incomingUrl: String?,
    onIncomingConsumed: () -> Unit,
) {
    val viewModel: AppViewModel = viewModel()
    val state by viewModel.state.collectAsStateWithLifecycle()
    var tab by rememberSaveable { mutableStateOf(Tab.Home) }

    LaunchedEffect(incomingUrl) {
        val url = incomingUrl
        if (!url.isNullOrBlank()) {
            tab = Tab.Home
            viewModel.onIncomingLink(url)
            onIncomingConsumed()
        }
    }

    BackHandler(
        enabled = state.dialog != null || state.sheetItem != null || state.progressTaskId != null,
    ) {
        when {
            state.dialog != null -> viewModel.dismissDialog()
            state.sheetItem != null -> viewModel.closeSheet()
            else -> viewModel.hideProgress()
        }
    }

    val activeTask = state.downloads.firstOrNull { it.isActive }

    Box(
        Modifier
            .fillMaxSize()
            .background(Ink),
    ) {
        // Ambient brand glow behind the feed header.
        Box(
            Modifier
                .fillMaxWidth()
                .height(360.dp)
                .background(
                    Brush.radialGradient(
                        colors = listOf(Violet.copy(alpha = 0.22f), Color.Transparent),
                    ),
                ),
        )

        Scaffold(
            containerColor = Color.Transparent,
            bottomBar = {
                Column {
                    if (activeTask != null) {
                        ActiveDownloadStrip(
                            task = activeTask,
                            onClick = { viewModel.showProgress(activeTask.id) },
                            onCancel = { viewModel.cancelDownload(activeTask.id) },
                        )
                    }
                    BottomBar(selected = tab, onSelect = { tab = it })
                }
            },
        ) { innerPadding ->
            Box(Modifier.padding(innerPadding)) {
                when (tab) {
                    Tab.Home -> HomeScreen(
                        state = state,
                        onQueryChange = viewModel::onQueryChange,
                        onFilterChange = viewModel::onFilterChange,
                        onOpenItem = viewModel::openSheet,
                        onDismissPreviewNotice = viewModel::dismissPreviewNotice,
                        onOpenSettings = { tab = Tab.More },
                    )

                    Tab.Downloads -> DownloadsScreen(
                        downloads = state.downloads,
                        onShowProgress = viewModel::showProgress,
                        onCancel = viewModel::cancelDownload,
                        onRemove = viewModel::removeTask,
                        onClearFinished = viewModel::clearFinished,
                        onBrowse = { tab = Tab.Home },
                    )

                    Tab.Library -> LibraryScreen(
                        downloads = state.downloads,
                        onOpenItem = { task ->
                            if (task.stage == DownloadStage.Completed) {
                                viewModel.showProgress(task.id)
                            } else {
                                viewModel.openSheet(task.item)
                            }
                        },
                        onBrowse = { tab = Tab.Home },
                    )

                    Tab.More -> MoreScreen(versionName = BuildConfig.VERSION_NAME)
                }
            }
        }
    }

    state.sheetItem?.let { item ->
        DownloadSheet(
            item = item,
            selectedFormatId = state.selectedFormatId,
            previewData = state.previewData,
            onSelectFormat = viewModel::selectFormat,
            onDismiss = viewModel::closeSheet,
            onDownload = viewModel::startDownload,
            onSignIn = viewModel::requestSignIn,
        )
    }

    state.progressTask?.let { task ->
        DownloadProgressDialog(
            task = task,
            onHide = viewModel::hideProgress,
            onCancel = { viewModel.cancelDownload(task.id) },
        )
    }

    state.dialog?.let { dialog ->
        AppDialogHost(
            dialog = dialog,
            onDismiss = viewModel::dismissDialog,
            onAcceptLink = viewModel::acceptReceivedLink,
        )
    }
}

@Composable
private fun BottomBar(selected: Tab, onSelect: (Tab) -> Unit) {
    Column {
        Box(
            Modifier
                .fillMaxWidth()
                .height(1.dp)
                .background(Hairline),
        )
        Surface(color = InkSoft.copy(alpha = 0.98f)) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .navigationBarsPadding()
                    .padding(horizontal = 12.dp, vertical = 8.dp),
            ) {
                Tab.entries.forEach { entry ->
                    val active = entry == selected
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(16.dp))
                            .clickable { onSelect(entry) }
                            .padding(vertical = 7.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Icon(
                            imageVector = entry.icon(),
                            contentDescription = entry.label,
                            tint = if (active) Cyan else TextTertiary,
                            modifier = Modifier.size(21.dp),
                        )
                        Spacer(Modifier.height(4.dp))
                        Text(
                            text = entry.label,
                            style = MaterialTheme.typography.labelSmall,
                            color = if (active) Cyan else TextTertiary,
                        )
                        Spacer(Modifier.height(4.dp))
                        Box(
                            Modifier
                                .size(4.dp)
                                .clip(CircleShape)
                                .background(if (active) Cyan else Color.Transparent),
                        )
                    }
                }
            }
        }
    }
}

private fun Tab.icon(): ImageVector = when (this) {
    Tab.Home -> Icons.Rounded.Home
    Tab.Downloads -> Icons.Rounded.Download
    Tab.Library -> Icons.Rounded.VideoLibrary
    Tab.More -> Icons.Rounded.MoreHoriz
}
