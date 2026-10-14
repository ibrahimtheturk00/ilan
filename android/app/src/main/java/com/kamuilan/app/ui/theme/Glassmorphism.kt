package com.kamuilan.app.ui.theme

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
// AmbientGlassBackground (2026 Ethereal Animated Background)
// High-performance hardware-accelerated animated aurora background with:
// - 4 floating luminous ambient orbs (Sky, Purple, Emerald, Rose)
// - Crisp Dot Matrix Grid overlay (Vercel / Linear aesthetic)
// ─────────────────────────────────────────────────────────────────────────────
@Composable
fun AmbientGlassBackground(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "ambient_anim")

    // Orb 1: Sky / Blue Float
    val orb1X by infiniteTransition.animateFloat(
        initialValue = -50f,
        targetValue = 65f,
        animationSpec = infiniteRepeatable(
            animation = tween(15000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "orb1X"
    )
    val orb1Y by infiniteTransition.animateFloat(
        initialValue = -40f,
        targetValue = 55f,
        animationSpec = infiniteRepeatable(
            animation = tween(19000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "orb1Y"
    )

    // Orb 2: Purple / Violet Float
    val orb2X by infiniteTransition.animateFloat(
        initialValue = 40f,
        targetValue = -55f,
        animationSpec = infiniteRepeatable(
            animation = tween(17000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "orb2X"
    )
    val orb2Y by infiniteTransition.animateFloat(
        initialValue = -30f,
        targetValue = 65f,
        animationSpec = infiniteRepeatable(
            animation = tween(16000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "orb2Y"
    )

    // Orb 3: Emerald / Teal Float
    val orb3X by infiniteTransition.animateFloat(
        initialValue = -35f,
        targetValue = 55f,
        animationSpec = infiniteRepeatable(
            animation = tween(21000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "orb3X"
    )
    val orb3Y by infiniteTransition.animateFloat(
        initialValue = 25f,
        targetValue = -35f,
        animationSpec = infiniteRepeatable(
            animation = tween(18000, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "orb3Y"
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .drawBehind {
                // 1. Base clean background
                drawRect(
                    brush = Brush.verticalGradient(
                        colors = listOf(Color(0xFFFFFFFF), Color(0xFFF8FAFC), Color(0xFFF1F5F9))
                    )
                )

                // 2. Orb 1: Sky Blue Aura (top start)
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(Color(0x3838BDF8), Color(0x180284C7), Color(0x00000000)),
                        center = Offset(size.width * 0.15f + orb1X, size.height * 0.10f + orb1Y),
                        radius = size.width * 0.75f
                    ),
                    radius = size.width * 0.75f,
                    center = Offset(size.width * 0.15f + orb1X, size.height * 0.10f + orb1Y)
                )

                // 3. Orb 2: Royal Purple / Violet (top end)
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(Color(0x2E8B5CF6), Color(0x147C3AED), Color(0x00000000)),
                        center = Offset(size.width * 0.85f + orb2X, size.height * 0.15f + orb2Y),
                        radius = size.width * 0.70f
                    ),
                    radius = size.width * 0.70f,
                    center = Offset(size.width * 0.85f + orb2X, size.height * 0.15f + orb2Y)
                )

                // 4. Orb 3: Emerald / Teal (mid-height start)
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(Color(0x2210B981), Color(0x0C059669), Color(0x00000000)),
                        center = Offset(size.width * 0.10f + orb3X, size.height * 0.55f + orb3Y),
                        radius = size.width * 0.65f
                    ),
                    radius = size.width * 0.65f,
                    center = Offset(size.width * 0.10f + orb3X, size.height * 0.55f + orb3Y)
                )

                // 5. Orb 4: Coral / Rose Warmth (bottom end)
                drawCircle(
                    brush = Brush.radialGradient(
                        colors = listOf(Color(0x1CF43F5E), Color(0x08E11D48), Color(0x00000000)),
                        center = Offset(size.width * 0.85f, size.height * 0.80f),
                        radius = size.width * 0.60f
                    ),
                    radius = size.width * 0.60f,
                    center = Offset(size.width * 0.85f, size.height * 0.80f)
                )

                // 6. Dot Matrix Pattern (Apple / Linear style fine dots)
                val dotSpacing = 28.dp.toPx()
                val dotRadius = 1.0.dp.toPx()
                val dotColor = Color(0x1564748B)

                val cols = (size.width / dotSpacing).toInt() + 1
                val rows = (size.height / dotSpacing).toInt() + 1

                for (c in 0 until cols) {
                    for (r in 0 until rows) {
                        drawCircle(
                            color = dotColor,
                            radius = dotRadius,
                            center = Offset(c * dotSpacing, r * dotSpacing)
                        )
                    }
                }
            }
    ) {
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
