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
 * OnwardBackground: Web sitesindeki ikonik Onward Summit chevron / ok desenini
 * sayfanın en altına kadar kesintisiz ve performanslı bir şekilde çizer.
 */
@Composable
fun OnwardBackground(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    val isDark = isSystemInDarkTheme()
    val bgColor = MaterialTheme.colorScheme.background

    // Açık temada tok kömür arduvaz, koyu temada çelik mavisi (mobilde net görünür kontrast)
    val arrowColor = if (isDark) Color(0xFF94A3B8).copy(alpha = 0.22f)
                     else Color(0xFF334155).copy(alpha = 0.24f)

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(bgColor)
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val cellPx = 28.dp.toPx()
            val strokePx = 1.4.dp.toPx()
            val h = cellPx * 0.28f

            val cols = (size.width / cellPx).toInt() + 1
            val rows = (size.height / cellPx).toInt() + 1

            for (r in 0 until rows) {
                for (c in 0 until cols) {
                    val cx = c * cellPx + cellPx / 2f
                    val cy = r * cellPx + cellPx / 2f

                    // Çapraz gövde çizgisi
                    drawLine(
                        color = arrowColor,
                        start = Offset(cx - h, cy + h),
                        end = Offset(cx + h, cy - h),
                        strokeWidth = strokePx,
                        cap = StrokeCap.Round
                    )

                    // Ok ucu (sağ-üst açı)
                    val arrowPath = Path().apply {
                        moveTo(cx - h * 0.15f, cy - h)
                        lineTo(cx + h, cy - h)
                        lineTo(cx + h, cy + h * 0.15f)
                    }
                    drawPath(
                        path = arrowPath,
                        color = arrowColor,
                        style = Stroke(width = strokePx, cap = StrokeCap.Round, join = StrokeJoin.Round)
                    )
                }
            }
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
    val isDark = isSystemInDarkTheme()
    val bgColor = MaterialTheme.colorScheme.background

    // Nokta temel renkleri
    val baseDotColor = if (isDark) Color.White else Color(0xFF0F172A)
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
