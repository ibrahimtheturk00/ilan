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
    primary = DarkThemePrimary,
    secondary = DarkThemeSecondary,
    background = DarkThemeBg,
    surface = DarkThemeSurface,
    surfaceVariant = Color(0xFF1E293B),
    onPrimary = Color(0xFF090D16),
    onSecondary = Color(0xFFF8F9FA),
    onBackground = Color(0xFFF8FAFC),
    onSurface = Color(0xFFF8FAFC),
    onSurfaceVariant = Color(0xFF94A3B8),
    outline = DarkThemeBorder,
    outlineVariant = Color(0xFF334155)
)

private val LightColorScheme = lightColorScheme(
    primary = LightThemePrimary,
    secondary = LightThemeSecondary,
    background = LightThemeBg,
    surface = LightThemeSurface,
    surfaceVariant = Color(0xFFF8F9FA),
    onPrimary = Color(0xFFF8F9FA),
    onSecondary = Color(0xFFF8F9FA),
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF0F172A),
    onSurfaceVariant = Color(0xFF475569),
    outline = LightThemeBorder,
    outlineVariant = Color(0xFFCBD5E1)
)

@Composable
fun KamuIlanMerkeziTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
