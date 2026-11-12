package app.flickgrab.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import app.flickgrab.BuildConfig
import app.flickgrab.data.MediaRepository
import app.flickgrab.data.Repositories
import app.flickgrab.domain.DownloadStage
import app.flickgrab.domain.DownloadTask
import app.flickgrab.domain.MediaItem
import app.flickgrab.domain.Source
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID

enum class Tab(val label: String) {
    Home("Home"),
    Downloads("Downloads"),
    Library("Library"),
    More("More"),
}

/** One-shot overlays the app can show above the current tab. */
sealed interface AppDialog {
    data class ReceivedLink(val url: String) : AppDialog
    data class SignInRequired(val source: Source) : AppDialog
    data class NotWired(val source: Source) : AppDialog
    data class Failure(val message: String) : AppDialog
}

data class AppUiState(
    val feed: List<MediaItem> = emptyList(),
    val loadingFeed: Boolean = true,
    val query: String = "",
    val filter: Source? = null,
    val downloads: List<DownloadTask> = emptyList(),
    val sheetItem: MediaItem? = null,
    val selectedFormatId: String? = null,
    val progressTaskId: String? = null,
    val dialog: AppDialog? = null,
    /** True when the app is rendering placeholder data (debug builds only). */
    val previewData: Boolean = BuildConfig.PREVIEW_DATA,
) {
    val progressTask: DownloadTask? get() = downloads.firstOrNull { it.id == progressTaskId }
}

class AppViewModel : ViewModel() {

    // A property rather than a constructor parameter: the default ViewModel
    // factory needs a real no-arg constructor on Android.
    private val repository: MediaRepository = Repositories.media()

    private val _state = MutableStateFlow(AppUiState())
    val state: StateFlow<AppUiState> = _state.asStateFlow()

    private val jobs = mutableMapOf<String, Job>()

    init {
        refresh()
    }

    fun refresh() {
        viewModelScope.launch {
            _state.update { it.copy(loadingFeed = true) }
            val items = repository.feed()
            _state.update { it.copy(feed = items, loadingFeed = false) }
        }
    }

    fun onQueryChange(value: String) {
        _state.update { it.copy(query = value) }
    }

    fun onFilterChange(source: Source?) {
        _state.update { it.copy(filter = if (it.filter == source) null else source) }
    }

    fun openSheet(item: MediaItem) {
        _state.update {
            it.copy(
                sheetItem = item,
                selectedFormatId = item.formats.firstOrNull { f -> f.kind == app.flickgrab.domain.FormatKind.Video }?.id
                    ?: item.formats.firstOrNull()?.id,
            )
        }
    }

    fun closeSheet() {
        _state.update { it.copy(sheetItem = null, selectedFormatId = null) }
    }

    fun selectFormat(formatId: String) {
        _state.update { it.copy(selectedFormatId = formatId) }
    }

    fun startDownload() {
        val snapshot = _state.value
        val item = snapshot.sheetItem ?: return
        val format = item.formats.firstOrNull { it.id == snapshot.selectedFormatId } ?: return

        if (item.accessibility == app.flickgrab.domain.Accessibility.SignInRequired) {
            _state.update { it.copy(dialog = AppDialog.SignInRequired(item.source)) }
            return
        }
        if (!snapshot.previewData) {
            _state.update { it.copy(dialog = AppDialog.NotWired(item.source)) }
            return
        }

        val task = DownloadTask(
            id = UUID.randomUUID().toString(),
            item = item,
            format = format,
            stage = DownloadStage.Resolving,
            preview = true,
        )
        _state.update {
            it.copy(
                sheetItem = null,
                selectedFormatId = null,
                downloads = listOf(task) + it.downloads,
                progressTaskId = task.id,
            )
        }
        runPreviewTask(task)
    }

    fun cancelDownload(taskId: String) {
        jobs.remove(taskId)?.cancel()
        updateTask(taskId) { it.copy(stage = DownloadStage.Cancelled, bytesPerSecond = 0L) }
        if (_state.value.progressTaskId == taskId) {
            _state.update { it.copy(progressTaskId = null) }
        }
    }

    fun hideProgress() {
        _state.update { it.copy(progressTaskId = null) }
    }

    fun showProgress(taskId: String) {
        _state.update { it.copy(progressTaskId = taskId) }
    }

    fun removeTask(taskId: String) {
        jobs.remove(taskId)?.cancel()
        _state.update { s -> s.copy(downloads = s.downloads.filterNot { it.id == taskId }) }
    }

    fun clearFinished() {
        _state.update { s -> s.copy(downloads = s.downloads.filter { it.isActive }) }
    }

    fun dismissDialog() {
        _state.update { it.copy(dialog = null) }
    }

    /** "Sign in" / "Learn more" on a source that needs a session (M4). */
    fun requestSignIn() {
        val item = _state.value.sheetItem ?: return
        _state.update { it.copy(dialog = AppDialog.SignInRequired(item.source)) }
    }

    /** A link arrived from the share sheet or the website deep link. */
    fun onIncomingLink(link: String) {
        _state.update { it.copy(dialog = AppDialog.ReceivedLink(link)) }
    }

    fun acceptReceivedLink(link: String) {
        viewModelScope.launch {
            _state.update { it.copy(dialog = null) }
            val item = repository.resolve(link)
            if (item == null) {
                _state.update { it.copy(dialog = AppDialog.NotWired(Source.DirectFile)) }
            } else {
                openSheet(item.copy(sharedFrom = link))
            }
        }
    }

    fun dismissPreviewNotice() {
        _state.update { it.copy(previewData = false) }
    }

    private fun updateTask(taskId: String, transform: (DownloadTask) -> DownloadTask) {
        _state.update { s ->
            s.copy(downloads = s.downloads.map { if (it.id == taskId) transform(it) else it })
        }
    }

    /**
     * Preview-only progression so the progress modal and queue can be reviewed.
     * It is never started when [BuildConfig.PREVIEW_DATA] is false, and every
     * task it creates is flagged `preview = true` and labelled in the UI.
     */
    private fun runPreviewTask(task: DownloadTask) {
        jobs[task.id] = viewModelScope.launch {
            delay(700)
            updateTask(task.id) { it.copy(stage = DownloadStage.Downloading, progress = 0.03f) }
            var progress = 0.03f
            while (progress < 0.98f) {
                delay(240)
                progress = (progress + 0.042f).coerceAtMost(0.98f)
                val speed = (task.format.sizeBytes * 0.042f / 0.24f).toLong()
                updateTask(task.id) { it.copy(progress = progress, bytesPerSecond = speed) }
            }
            if (task.format.requiresMux) {
                updateTask(task.id) {
                    it.copy(stage = DownloadStage.Muxing, progress = 1f, bytesPerSecond = 0L)
                }
                delay(1500)
            }
            updateTask(task.id) { it.copy(stage = DownloadStage.Saving) }
            delay(600)
            updateTask(task.id) {
                it.copy(stage = DownloadStage.Completed, progress = 1f, bytesPerSecond = 0L)
            }
            jobs.remove(task.id)
        }
    }
}
