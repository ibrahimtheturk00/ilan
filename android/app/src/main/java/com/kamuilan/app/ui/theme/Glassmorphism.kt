package com.kamuilan.app.ui.theme

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
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
// AmbientGlassBackground  (enhanced 2026)
// Full-screen layered ambient: a primary radial blue glow centred top-left,
// a secondary purple glow offset bottom-right, and a neutral white base.
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun AmbientGlassBackground(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    // Base layer: pure white → very light slate
    val baseGradient = Brush.verticalGradient(
        colors = listOf(
            Color(0xFFFFFFFF),
            Color(0xFFF1F5F9)
        )
    )

    // Primary glow: brand blue radial, top-start quadrant
    val primaryGlow = Brush.radialGradient(
        colorStops = arrayOf(
            0.00f to Color(0x4A2563EB),   // ~29% blue
            0.40f to Color(0x1A2563EB),   // ~10% blue mid-fade
            0.75f to Color(0x052563EB),   // near-transparent
            1.00f to Color(0x002563EB)    // fully transparent
        ),
        radius = 900f
    )

    Box(modifier = modifier.fillMaxSize()) {
        // Layer 1 – base gradient
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(baseGradient)
        )
        // Layer 2 – primary blue glow (top-start)
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(primaryGlow)
        )
        // Layer 3 – secondary purple glow (bottom-end)
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colorStops = arrayOf(
                            0.00f to Color(0x267C3AED),
                            0.50f to Color(0x0D7C3AED),
                            1.00f to Color(0x007C3AED)
                        ),
                        radius = 1200f
                    )
                )
        )
        // Content on top of all glow layers
        content()
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// GlassCard  (new 2026)
// Elevated card with a soft shadow drawn via drawBehind, semi-transparent
// white surface (0xF8FFFFFF ≈ 97% white), and a thin white top border.
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun GlassCard(
    modifier: Modifier = Modifier,
    shape: Shape = RoundedCornerShape(20.dp),
    shadowColor: Color = CardShadow,
    shadowRadius: Dp = 24.dp,
    shadowOffsetY: Dp = 8.dp,
    content: @Composable () -> Unit
) {
    Box(
        modifier = modifier
            .drawBehind {
                drawIntoCanvas { canvas ->
                    val paint = Paint().apply {
                        asFrameworkPaint().apply {
                            isAntiAlias = true
                            color = android.graphics.Color.TRANSPARENT
                            setShadowLayer(
                                shadowRadius.toPx(),
                                0f,
                                shadowOffsetY.toPx(),
                                android.graphics.Color.argb(
                                    (shadowColor.alpha * 255).toInt(),
                                    (shadowColor.red   * 255).toInt(),
                                    (shadowColor.green * 255).toInt(),
                                    (shadowColor.blue  * 255).toInt()
                                )
                            )
                        }
                    }
                    canvas.drawRoundRect(
                        left    = 0f,
                        top     = 0f,
                        right   = size.width,
                        bottom  = size.height,
                        radiusX = 20.dp.toPx(),
                        radiusY = 20.dp.toPx(),
                        paint   = paint
                    )
                }
            }
            .clip(shape)
            .background(Color(0xF8FFFFFF))          // 97% opaque white
            .border(
                width = 1.dp,
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0x80FFFFFF),           // bright white top edge
                        Color(0x10FFFFFF)            // near-transparent bottom edge
                    )
                ),
                shape = shape
            )
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
