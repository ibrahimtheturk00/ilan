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
    surfaceVariant = Zinc800,
    onPrimary = Zinc950,
    onSecondary = Color.White,
    onBackground = Zinc50,
    onSurface = Zinc50,
    outline = DarkThemeBorder
)

private val LightColorScheme = lightColorScheme(
    primary = LightThemePrimary,
    secondary = LightThemeSecondary,
    background = LightThemeBg,
    surface = LightThemeSurface,
    surfaceVariant = Zinc100,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = Zinc950,
    onSurface = Zinc950,
    outline = LightThemeBorder
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
