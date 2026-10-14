package com.kamuilan.app.ui.theme

import android.graphics.Bitmap
import android.graphics.BitmapShader
import android.graphics.Shader
import androidx.compose.ui.graphics.ShaderBrush
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Paint
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

// ─────────────────────────────────────────────────────────────────────────────
// GlassBox
// A lightweight frosted-glass container: semi-transparent white background
// with a thin 1 dp white top/left border for the "glass edge" highlight.
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun GlassBox(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(16.dp),
    backgroundColor: Color = Color(0xCCFFFFFF),   // 80% white
    borderColor: Color = Color(0x40FFFFFF),        // 25% white border
    borderWidth: Dp = 1.dp,
    content: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .clip(shape)
            .background(backgroundColor)
            .border(width = borderWidth, color = borderColor, shape = shape)
    ) {
        content()
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Film Grain Noise Shader
// Deterministic, hardware-accelerated subtle grain overlay (Linear / Apple aesthetic)
// ─────────────────────────────────────────────────────────────────────────────
private val noiseBitmap: Bitmap by lazy {
    val size = 96
    val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
    val random = java.util.Random(1337)
    val pixels = IntArray(size * size)
    for (i in pixels.indices) {
        val noise = random.nextInt(256)
        val alpha = (noise * 0.045f).toInt().coerceIn(0, 255)
        pixels[i] = (alpha shl 24) or (0x18 shl 16) or (0x18 shl 8) or 0x18
    }
    bitmap.setPixels(pixels, 0, size, 0, 0, size, size)
    bitmap
}

private val grainShaderBrush by lazy {
    ShaderBrush(BitmapShader(noiseBitmap, Shader.TileMode.REPEAT, Shader.TileMode.REPEAT))
}

// ─────────────────────────────────────────────────────────────────────────────
// AmbientGlassBackground (Onward Summit Chevron Background Web 1:1)
// Web sitesindeki ikonik chevron/ok deseni sayfanın en altına kadar uzanır.
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun AmbientGlassBackground(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    com.kamuilan.app.ui.components.OnwardBackground(
        modifier = modifier,
        content = content
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// GlassCard (Clean 2026 Linear/Apple Style)
// Refined card with 10dp rounded corners, 1px crisp border, and white surface.
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(10.dp),
    backgroundColor: Color = Color.White,
    borderColor: Color = Color(0xFFE4E4E7),
    content: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .clip(shape)
            .background(backgroundColor)
            .border(width = 1.dp, color = borderColor, shape = shape)
    ) {
        content()
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GradientBox  (new 2026)
// A simple rounded container that renders a horizontal linear gradient.
// Used for category chips, hero banners, and accent sections.
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun GradientBox(
    startColor: Color,
    endColor: Color,
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(16.dp),
    borderAlpha: Float = 0.25f,
    content: @Composable () -> Unit
) {
    val gradient = Brush.linearGradient(
        colors = listOf(startColor, endColor)
    )
    val borderBrush = Brush.linearGradient(
        colors = listOf(
            endColor.copy(alpha = borderAlpha),
            startColor.copy(alpha = borderAlpha * 0.5f)
        )
    )

    Box(
        modifier = modifier
            .clip(shape)
            .background(gradient)
            .border(width = 1.dp, brush = borderBrush, shape = shape)
    ) {
        content()
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PressScaleBox  (new 2026)
// Wraps any content with a spring-based press-to-scale micro-animation.
// Scale eases from 1.0 → pressedScale (default 0.96) on press.
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun PressScaleBox(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    pressedScale: Float = 0.96f,
    content: @Composable () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()

    val scale by animateFloatAsState(
        targetValue    = if (isPressed) pressedScale else 1f,
        animationSpec  = spring(
            dampingRatio = 0.55f,
            stiffness    = 400f
        ),
        label = "pressScale"
    )

    Box(
        modifier = modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .clickable(
                interactionSource = interactionSource,
                indication        = null,
                onClick           = onClick
            ),
        contentAlignment = Alignment.Center
    ) {
        content()
    }
}
