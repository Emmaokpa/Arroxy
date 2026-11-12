package app.flickgrab.ui.more

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
import androidx.compose.material.icons.rounded.Folder
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.Shield
import androidx.compose.material.icons.rounded.Wifi
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import app.flickgrab.data.Capabilities
import app.flickgrab.domain.CapabilityRow
import app.flickgrab.domain.CapabilityStatus
import app.flickgrab.ui.components.HairlineDivider
import app.flickgrab.ui.components.ScreenTitle
import app.flickgrab.ui.components.sourceColor
import app.flickgrab.ui.theme.Coral
import app.flickgrab.ui.theme.Cyan
import app.flickgrab.ui.theme.Outline
import app.flickgrab.ui.theme.Success
import app.flickgrab.ui.theme.Surface1
import app.flickgrab.ui.theme.TextPrimary
import app.flickgrab.ui.theme.TextSecondary
import app.flickgrab.ui.theme.TextTertiary
import app.flickgrab.ui.theme.Warning

@Composable
fun MoreScreen(
    modifier: Modifier = Modifier,
    versionName: String,
) {
    var wifiOnly by rememberSaveable { mutableStateOf(true) }

    LazyColumn(
        modifier = modifier,
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 14.dp, bottom = 120.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item {
            ScreenTitle(
                title = "Settings",
                subtitle = "What works here, and where files go",
            )
        }

        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Surface1)
                    .border(1.dp, Color(0xFF1B1F2C), RoundedCornerShape(20.dp))
                    .padding(4.dp),
            ) {
                SettingRow(
                    icon = Icons.Rounded.Folder,
                    title = "Save location",
                    subtitle = "Movies/FlickGrab · visible in your gallery",
                    tint = Cyan,
                )
                HairlineDivider(Modifier.padding(horizontal = 12.dp))
                SettingRow(
                    icon = Icons.Rounded.Shield,
                    title = "Processing",
                    subtitle = "Extraction and muxing run on this phone. No uploads.",
                    tint = Success,
                )
                HairlineDivider(Modifier.padding(horizontal = 12.dp))
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { wifiOnly = !wifiOnly }
                        .padding(horizontal = 12.dp, vertical = 13.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(RoundedCornerShape(11.dp))
                            .background(Warning.copy(alpha = 0.14f)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            imageVector = Icons.Rounded.Wifi,
                            contentDescription = null,
                            tint = Warning,
                            modifier = Modifier.size(17.dp),
                        )
                    }
                    Spacer(Modifier.width(12.dp))
                    Column(Modifier.weight(1f)) {
                        Text(
                            text = "Wi-Fi only",
                            style = MaterialTheme.typography.titleSmall,
                            color = TextPrimary,
                        )
                        Text(
                            text = "Hold downloads until you are on Wi-Fi",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextTertiary,
                        )
                    }
                    Switch(
                        checked = wifiOnly,
                        onCheckedChange = { wifiOnly = it },
                        colors = SwitchDefaults.colors(
                            checkedThumbColor = Color(0xFF07080C),
                            checkedTrackColor = Cyan,
                            uncheckedTrackColor = Color(0xFF262B3A),
                            uncheckedBorderColor = Outline,
                        ),
                    )
                }
            }
        }

        item {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Rounded.Info,
                    contentDescription = null,
                    tint = TextTertiary,
                    modifier = Modifier.size(15.dp),
                )
                Spacer(Modifier.width(7.dp))
                Text(
                    text = "Source capability · measured ${Capabilities.MEASURED_ON}",
                    style = MaterialTheme.typography.labelMedium,
                    color = TextTertiary,
                )
            }
        }

        items(Capabilities.rows) { row ->
            CapabilityCard(row)
        }

        item {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0x14FF6B81))
                    .border(1.dp, Coral.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                    .padding(16.dp),
            ) {
                Text(
                    text = "Only save what you have the right to keep",
                    style = MaterialTheme.typography.titleSmall,
                    color = TextPrimary,
                )
                Spacer(Modifier.height(6.dp))
                Text(
                    text = "Downloading content you do not own can breach a platform's terms " +
                        "and local law. FlickGrab has no servers holding media, no accounts and " +
                        "no analytics.",
                    style = MaterialTheme.typography.bodySmall,
                    color = TextSecondary,
                )
            }
        }

        item {
            Text(
                text = "FlickGrab $versionName · on-device preview",
                style = MaterialTheme.typography.labelSmall,
                color = TextTertiary,
            )
        }
    }
}

@Composable
private fun SettingRow(
    icon: ImageVector,
    title: String,
    subtitle: String,
    tint: Color,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 13.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(34.dp)
                .clip(RoundedCornerShape(11.dp))
                .background(tint.copy(alpha = 0.14f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = tint,
                modifier = Modifier.size(17.dp),
            )
        }
        Spacer(Modifier.width(12.dp))
        Column {
            Text(
                text = title,
                style = MaterialTheme.typography.titleSmall,
                color = TextPrimary,
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.labelSmall,
                color = TextTertiary,
            )
        }
    }
}

@Composable
private fun CapabilityCard(row: CapabilityRow) {
    val tint = sourceColor(row.source)
    val statusTint = when (row.status) {
        CapabilityStatus.Ready -> Success
        CapabilityStatus.NeedsGate -> Warning
        CapabilityStatus.SignIn -> Cyan
        CapabilityStatus.Unsupported -> Coral
    }

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(Surface1)
            .border(1.dp, Color(0xFF1B1F2C), RoundedCornerShape(18.dp))
            .padding(14.dp),
    ) {
        Box(
            Modifier
                .padding(top = 5.dp)
                .size(8.dp)
                .clip(CircleShape)
                .background(tint),
        )
        Spacer(Modifier.width(12.dp))
        Column(Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    text = row.source.label,
                    style = MaterialTheme.typography.titleSmall,
                    color = TextPrimary,
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    text = row.status.label,
                    style = MaterialTheme.typography.labelSmall,
                    color = statusTint,
                    modifier = Modifier
                        .clip(RoundedCornerShape(50))
                        .background(statusTint.copy(alpha = 0.12f))
                        .padding(horizontal = 7.dp, vertical = 3.dp),
                )
            }
            Spacer(Modifier.height(5.dp))
            Text(
                text = row.detail,
                style = MaterialTheme.typography.bodySmall,
                color = TextTertiary,
            )
        }
    }
}
