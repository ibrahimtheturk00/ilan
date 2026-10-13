package com.kamuilan.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.kamuilan.app.ui.navigation.AppNavigation
import com.kamuilan.app.ui.theme.KamuIlanMerkeziTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            KamuIlanMerkeziTheme {
                AppNavigation()
            }
        }
    }
}