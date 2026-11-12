package app.flickgrab

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import app.flickgrab.intake.LinkIntake
import app.flickgrab.ui.FlickGrabApp
import app.flickgrab.ui.theme.FlickGrabTheme

class MainActivity : ComponentActivity() {

    private var incomingUrl by mutableStateOf<String?>(null)

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.dark(Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.dark(Color.TRANSPARENT),
        )
        incomingUrl = LinkIntake.fromIntent(intent)
        setContent {
            FlickGrabTheme {
                FlickGrabApp(
                    incomingUrl = incomingUrl,
                    onIncomingConsumed = { incomingUrl = null },
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        incomingUrl = LinkIntake.fromIntent(intent)
    }
}
