package com.kamuilan.app.ui.screens.categories

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.School
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.data.model.DepartmentCategory
import com.kamuilan.app.data.model.YokDepartments
import com.kamuilan.app.ui.screens.home.HomeViewModel
import com.kamuilan.app.ui.theme.ActiveEmerald
import com.kamuilan.app.ui.theme.ActiveEmeraldBg
import com.kamuilan.app.ui.theme.ActiveEmeraldBorder
import com.kamuilan.app.ui.theme.AmbientGlassBackground
import com.kamuilan.app.ui.theme.BrandPrimary
import com.kamuilan.app.ui.theme.Slate200
import com.kamuilan.app.ui.theme.Slate400
import com.kamuilan.app.ui.theme.Slate500
import com.kamuilan.app.ui.theme.Slate900

@Composable
fun CategoriesScreen(
    homeViewModel: HomeViewModel,
    onCategoryClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by homeViewModel.uiState.collectAsState()

    // Canlı ilan sayılarını hesapla (Web sitesiyle 1-e-1 aynı matching)
    val departmentCounts = remember(uiState.allJobs) {
        YokDepartments.calculateCounts(uiState.allJobs)
    }

    AmbientGlassBackground(modifier = modifier) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Üst Rozet
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color.White.copy(alpha = 0.85f))
                    .border(1.dp, Slate200, RoundedCornerShape(20.dp))
                    .padding(horizontal = 10.dp, vertical = 5.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.School,
                    contentDescription = null,
                    tint = BrandPrimary,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "YÖK Atlas & Mezuniyet Alanları",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = BrandPrimary
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Hero başlık
            Text(
                text = "Mezuniyet Alanınızı Seçin",
                fontSize = 22.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Slate900,
                letterSpacing = (-0.4).sp
            )
            Spacer(modifier = Modifier.height(3.dp))
            Text(
                text = "Alanınıza dokunarak güncel ilanları ve canlı açık pozisyon sayılarını görün",
                fontSize = 12.sp,
                color = Slate500,
                lineHeight = 17.sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            // 16 Kategori Grid Listesi
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp),
                contentPadding = PaddingValues(bottom = 88.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(YokDepartments.LIST) { dept ->
                    val count = departmentCounts[dept.id] ?: 0
                    YokCategoryCard(
                        category = dept,
                        count = count,
                        onClick = { onCategoryClick(dept.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun YokCategoryCard(
    category: DepartmentCategory,
    count: Int,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.96f else 1f,
        animationSpec = spring(dampingRatio = 0.55f, stiffness = 380f),
        label = "cat_scale"
    )
    val elevation by animateFloatAsState(
        targetValue = if (isPressed) 1f else 3f,
        label = "cat_elevation"
    )

    val cardShape = RoundedCornerShape(16.dp)

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .graphicsLayer { scaleX = scale; scaleY = scale }
            .shadow(
                elevation = elevation.dp,
                shape = cardShape,
                spotColor = category.color.copy(alpha = 0.2f)
            )
            .clip(cardShape)
            .background(Color.White)
            .border(1.dp, Slate200.copy(alpha = 0.8f), cardShape)
            .clickable(
                interactionSource = interactionSource,
                indication = null,
                onClick = onClick
            )
    ) {
        // Üst degrade parlaklık
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(65.dp)
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            category.bgColor,
                            Color.White
                        )
                    )
                )
        )

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            // İkon + Yeşil/Mavi Sayı Rozeti
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .background(
                            brush = Brush.linearGradient(
                                colors = listOf(category.color, category.color.copy(alpha = 0.7f))
                            ),
                            shape = RoundedCornerShape(11.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = category.icon,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(19.dp)
                    )
                }

                // Canlı İlan Sayısı Rozeti
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            if (count > 0) ActiveEmeraldBg else Color(0xFFF1F5F9)
                        )
                        .border(
                            1.dp,
                            if (count > 0) ActiveEmeraldBorder else Color(0xFFE2E8F0),
                            RoundedCornerShape(12.dp)
                        )
                        .padding(horizontal = 7.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = "$count İlan",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (count > 0) ActiveEmerald else Slate400
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Kategori Adı
            Text(
                text = category.name,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900,
                lineHeight = 16.sp,
                minLines = 2,
                maxLines = 2
            )

            Spacer(modifier = Modifier.height(8.dp))

            // İlanları İncele
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(3.dp)
            ) {
                Text(
                    text = "İlanları İncele",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = category.color
                )
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    tint = category.color,
                    modifier = Modifier.size(10.dp)
                )
            }
        }
    }
}
