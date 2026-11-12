package app.flickgrab.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * FlickGrab palette — matching the iconic Snaptube yellow & dark aesthetic.
 */
val Ink = Color(0xFF0E0E10)
val InkSoft = Color(0xFF141416)
val Surface1 = Color(0xFF1B1B1E)
val Surface2 = Color(0xFF242428)
val Surface3 = Color(0xFF2E2E34)
val Outline = Color(0xFF2C2C32)
val Hairline = Color(0xFF1F1F24)
val TextPrimary = Color(0xFFFFFFFF)
val TextSecondary = Color(0xFFD1D1D6)
val TextTertiary = Color(0xFF8E8E93)

// Snaptube Signature Brand Colors
val SnapYellow = Color(0xFFFFCB05)
val SnapYellowHover = Color(0xFFE6B600)
val SnapRed = Color(0xFFFF3B30)
val SnapHotspot = Color(0xFF2892E8)
val SnapGreen = Color(0xFF34C759)

// Theme compatibility aliases
val Violet = SnapYellow
val VioletBright = SnapYellow
val Cyan = SnapYellow
val Coral = SnapRed
val Success = SnapGreen
val Warning = SnapYellow

val BrandGradient = listOf(SnapYellow, Color(0xFFFFD53F), Color(0xFFFFE066))
val WarmGradient = listOf(SnapYellow, SnapRed)
