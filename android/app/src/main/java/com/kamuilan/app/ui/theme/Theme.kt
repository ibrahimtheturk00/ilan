package com.kamuilan.app.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = BrandLight,
    secondary = BrandSubtle,
    background = DarkOledBackground,
    surface = DarkSurfaceCard,
    surfaceVariant = DarkSurfaceElevated,
    onPrimary = Color.White,
    onBackground = Color(0xFFF1F5F9),
    onSurface = Color(0xFFF1F5F9),
    outline = DarkBorderSlate
)

private val LightColorScheme = lightColorScheme(
    primary = BrandPrimary,
    secondary = BrandDark,
    background = BackgroundLight,
    surface = SurfaceLight,
    surfaceVariant = Color(0xFFF1F5F9),
    onPrimary = Color.White,
    onBackground = Slate900,
    onSurface = Slate900,
    outline = Slate200
)

@Composable
fun KamuIlanMerkeziTheme(
    darkTheme: Boolean = false, // Şimdilik varsayılan tamamen aydınlık mod
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    // Kullanıcı talebi: Şimdilik sadece aydınlık (Light) tema aktif
    val colorScheme = LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
