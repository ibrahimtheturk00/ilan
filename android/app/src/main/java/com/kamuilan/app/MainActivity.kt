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

        setContent {
            KamuIlanMerkeziTheme {
                AppNavigation(initialJobId = initialJobId)
            }
        }
    }
}