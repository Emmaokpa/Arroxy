package app.flickgrab.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

private val FlickColors = darkColorScheme(
    primary = VioletBright,
    onPrimary = Ink,
    primaryContainer = Color(0xFF241C4A),
    onPrimaryContainer = Color(0xFFDCD4FF),
    secondary = Cyan,
    onSecondary = Ink,
    tertiary = Coral,
    background = Ink,
    onBackground = TextPrimary,
    surface = Surface1,
    onSurface = TextPrimary,
    surfaceVariant = Surface2,
    onSurfaceVariant = TextSecondary,
    surfaceContainerLowest = InkSoft,
    surfaceContainerLow = Surface1,
    surfaceContainer = Surface2,
    surfaceContainerHigh = Surface3,
    outline = Outline,
    outlineVariant = Color(0xFF1F2331),
    error = Coral,
    onError = Ink,
    scrim = Color(0xE607080C),
)

val FlickShapes = Shapes(
    extraSmall = RoundedCornerShape(10.dp),
    small = RoundedCornerShape(14.dp),
    medium = RoundedCornerShape(20.dp),
    large = RoundedCornerShape(26.dp),
    extraLarge = RoundedCornerShape(34.dp),
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
