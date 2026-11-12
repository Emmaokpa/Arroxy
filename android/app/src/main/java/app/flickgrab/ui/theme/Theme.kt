package app.flickgrab.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

private val FlickColors = darkColorScheme(
    primary = SnapYellow,
    onPrimary = Color.Black,
    primaryContainer = Color(0xFF332900),
    onPrimaryContainer = Color(0xFFFFEBA3),
    secondary = SnapYellow,
    onSecondary = Color.Black,
    tertiary = SnapRed,
    background = Ink,
    onBackground = TextPrimary,
    surface = Surface1,
    onSurface = TextPrimary,
    surfaceVariant = Surface2,
    onSurfaceVariant = TextSecondary,
    surfaceContainerLowest = Ink,
    surfaceContainerLow = Surface1,
    surfaceContainer = Surface2,
    surfaceContainerHigh = Surface3,
    outline = Outline,
    outlineVariant = Hairline,
    error = SnapRed,
    onError = Color.White,
    scrim = Color(0xCC000000),
)

val FlickShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(18.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(32.dp),
)

@Composable
fun FlickGrabTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = FlickColors,
        typography = FlickTypography,
        shapes = FlickShapes,
        content = content,
    )
}
