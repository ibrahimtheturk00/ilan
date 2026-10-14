package com.kamuilan.app.ui.components

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import kotlin.random.Random

/**
 * Modern Ambient Gradient Background:
 * Eski ok/chevron deseni tamamen kaldırıldı; yerine ultra modern, yumuşak
 * ambiyans gradyan renk geçişleri (Aurora / Glow Mesh) yerleştirildi.
 * Açık temada soft zümrüt-gökyüzü geçişi, koyu temada derin gece mavisi & mor ışıma.
 */
@Composable
fun OnwardBackground(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    val isDark = isAppDark()
    val bgColor = MaterialTheme.colorScheme.background

    // Üst sağ ışıma rengi
    val glowTopRight = if (isDark) Color(0x2438BDF8) else Color(0x14059669)
    // Sol alt ışıma rengi
    val glowBottomLeft = if (isDark) Color(0x1E818CF8) else Color(0x102563EB)
    // Orta hafif parlama
    val glowCenter = if (isDark) Color(0x146366F1) else Color(0x0A0284C7)

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(bgColor)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height

            // 1. Üst Sağ Yumuşak Radyal Gradyan Işıma
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(glowTopRight, Color.Transparent),
                    center = Offset(width * 0.92f, height * 0.12f),
                    radius = width * 0.85f
                ),
                center = Offset(width * 0.92f, height * 0.12f),
                radius = width * 0.85f
            )

            // 2. Sol Alt Yumuşak Gradyan Işıma
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(glowBottomLeft, Color.Transparent),
                    center = Offset(width * 0.08f, height * 0.75f),
                    radius = width * 0.95f
                ),
                center = Offset(width * 0.08f, height * 0.75f),
                radius = width * 0.95f
            )

            // 3. Orta Katman Çok Hafif Vurgu
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(glowCenter, Color.Transparent),
                    center = Offset(width * 0.5f, height * 0.45f),
                    radius = width * 0.6f
                ),
                center = Offset(width * 0.5f, height * 0.45f),
                radius = width * 0.6f
            )
        }

        content()
    }
}

/**
 * DotGridBackground: Web sitesindeki "Sana Özel" sekmesinin
 * geometrik ışık noktaları, radyal karartma (vignette) ve kendiliğinden random yanıp sönen
 * (twinkling flare) modern teknolojik arka planı.
 */
@Composable
fun DotGridBackground(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    val isDark = isAppDark()
    val bgColor = MaterialTheme.colorScheme.background

    // Nokta temel renkleri
    val baseDotColor = if (isDark) Color(0xFFF8F9FA) else Color(0xFF0F172A)
    val flareGlowColor = if (isDark) Color(0xFF38BDF8) else Color(0xFF059669)

    // Rastgele parıldayan özel noktaların animasyon fazları
    val transition = rememberInfiniteTransition(label = "twinkle")
    val pulse1 by transition.animateFloat(
        initialValue = 0.2f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(2200, easing = LinearEasing), RepeatMode.Reverse),
        label = "pulse1"
    )
    val pulse2 by transition.animateFloat(
        initialValue = 1f,
        targetValue = 0.15f,
        animationSpec = infiniteRepeatable(tween(3100, easing = LinearEasing), RepeatMode.Reverse),
        label = "pulse2"
    )
    val pulse3 by transition.animateFloat(
        initialValue = 0.3f,
        targetValue = 0.9f,
        animationSpec = infiniteRepeatable(tween(2700, easing = LinearEasing), RepeatMode.Reverse),
        label = "pulse3"
    )

    val gridSeed = remember { 42 }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(bgColor)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val width = size.width
            val height = size.height

            // Üst sağ & sol alt ambiyans ışıma katmanı
            val glowTop = if (isDark) Color(0x2438BDF8) else Color(0x12059669)
            val glowBottom = if (isDark) Color(0x1E818CF8) else Color(0x0E2563EB)

            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(glowTop, Color.Transparent),
                    center = Offset(width * 0.9f, height * 0.1f),
                    radius = width * 0.85f
                ),
                center = Offset(width * 0.9f, height * 0.1f),
                radius = width * 0.85f
            )

            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(glowBottom, Color.Transparent),
                    center = Offset(width * 0.1f, height * 0.8f),
                    radius = width * 0.9f
                ),
                center = Offset(width * 0.1f, height * 0.8f),
                radius = width * 0.9f
            )

            val gap = 24.dp.toPx()
            val cols = (size.width / gap).toInt() + 1
            val rows = (size.height / gap).toInt() + 1
            val offsetX = (size.width - (cols - 1) * gap) / 2f
            val offsetY = (size.height - (rows - 1) * gap) / 2f

            val centerX = size.width / 2f
            val centerY = size.height / 2f
            val maxDist = Math.hypot(centerX.toDouble(), centerY.toDouble()).toFloat()

            for (r in 0 until rows) {
                for (c in 0 until cols) {
                    val x = offsetX + c * gap
                    val y = offsetY + r * gap

                    // Merkeze olan mesafe (radial vignette etkisi için)
                    val dist = Math.hypot((x - centerX).toDouble(), (y - centerY).toDouble()).toFloat()
                    val distRatio = (dist / maxDist).coerceIn(0f, 1f)

                    val isSpecial = (r * 7 + c * 13) % 19 == 0
                    val isCluster = (r * 11 + c * 5) % 11 == 0
                    val isFlare1 = (r == 3 && c == 4) || (r == 12 && c == 8) || (r == 20 && c == 2)
                    val isFlare2 = (r == 6 && c == 11) || (r == 15 && c == 3) || (r == 25 && c == 9)
                    val isFlare3 = (r == 8 && c == 2) || (r == 18 && c == 12) || (r == 22 && c == 7)

                    val baseRadius = when {
                        isSpecial -> 2.2.dp.toPx()
                        isCluster -> 1.7.dp.toPx()
                        else -> 1.1.dp.toPx()
                    }

                    var opacity = when {
                        isSpecial -> if (isDark) 0.55f else 0.40f
                        isCluster -> if (isDark) 0.35f else 0.25f
                        else -> if (isDark) 0.16f else 0.12f
                    }

                    // Merkezde hafif karartma (yazı okunabilirliği için)
                    val vignetteFactor = 0.4f + 0.6f * distRatio
                    opacity *= vignetteFactor

                    // Kendiliğinden random yanıp sönme (twinkling)
                    var radius = baseRadius
                    var dotColor = baseDotColor

                    if (isFlare1) {
                        opacity = (opacity + pulse1 * 0.7f).coerceIn(0.1f, 0.95f)
                        radius *= (1f + pulse1 * 0.45f)
                        dotColor = flareGlowColor
                    } else if (isFlare2) {
                        opacity = (opacity + pulse2 * 0.65f).coerceIn(0.1f, 0.95f)
                        radius *= (1f + pulse2 * 0.4f)
                        dotColor = flareGlowColor
                    } else if (isFlare3) {
                        opacity = (opacity + pulse3 * 0.6f).coerceIn(0.1f, 0.95f)
                        radius *= (1f + pulse3 * 0.35f)
                        dotColor = flareGlowColor
                    }

                    drawCircle(
                        color = dotColor.copy(alpha = opacity),
                        radius = radius,
                        center = Offset(x, y)
                    )
                }
            }

            // Hafif radyal vinyet katmanı
            drawRect(
                brush = Brush.radialGradient(
                    colors = listOf(
                        bgColor.copy(alpha = if (isDark) 0.65f else 0.45f),
                        Color.Transparent
                    ),
                    center = Offset(centerX, centerY),
                    radius = size.width * 0.75f
                )
            )
        }

        content()
    }
}
