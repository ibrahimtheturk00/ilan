package com.kamuilan.app

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch
import com.kamuilan.app.data.local.PreferencesManager
import com.kamuilan.app.notification.JobNotificationHelper
import com.kamuilan.app.notification.NotificationScheduler
import com.kamuilan.app.ui.navigation.AppNavigation
import com.kamuilan.app.ui.theme.KamuIlanMerkeziTheme

class MainActivity : ComponentActivity() {

    private val requestNotificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        if (isGranted) {
            NotificationScheduler.schedulePeriodicSync(this)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // 1. Bildirim kanalını başlat
        JobNotificationHelper.createNotificationChannel(this)

        // 2. Android 13+ için bildirim iznini denetle
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                requestNotificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            } else {
                NotificationScheduler.schedulePeriodicSync(this)
            }
        } else {
            NotificationScheduler.schedulePeriodicSync(this)
        }

        // 3. Bildirime tıklanarak açıldıysa ilgili ilanın id'sini al
        val initialJobId = intent?.getLongExtra(JobNotificationHelper.EXTRA_JOB_ID, -1L)?.takeIf { it > 0 }

        // 4. Web sitesindeki tekil sayaç ile entegre mobil açılış kaydı (arka planda bir kez sayar)
        lifecycleScope.launch {
            com.kamuilan.app.data.api.VisitorTracker.trackAppLaunch(applicationContext)
        }

        val preferencesManager = PreferencesManager(applicationContext)

        setContent {
            val themeMode by preferencesManager.themeModeFlow.collectAsState(initial = "system")
            val systemDark = androidx.compose.foundation.isSystemInDarkTheme()
            val isDark = when (themeMode) {
                "dark" -> true
                "light" -> false
                else -> systemDark
            }

            KamuIlanMerkeziTheme(darkTheme = isDark) {
                AppNavigation(
                    initialJobId = initialJobId,
                    currentThemeMode = themeMode,
                    onThemeModeChange = { newMode ->
                        lifecycleScope.launch {
                            preferencesManager.setThemeMode(newMode)
                        }
                    }
                )
            }
        }
    }
}