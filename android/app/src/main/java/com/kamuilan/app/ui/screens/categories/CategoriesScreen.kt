package com.kamuilan.app.ui.screens.categories

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.ui.theme.BluePrimary
import com.kamuilan.app.ui.theme.SlateBorder
import com.kamuilan.app.ui.theme.SlateDark
import com.kamuilan.app.ui.theme.SlateMuted

data class DepartmentCategory(
    val title: String,
    val iconEmoji: String,
    val queryKeyword: String
)

val POPULAR_CATEGORIES = listOf(
    DepartmentCategory("Bilişim & Yazılım", "💻", "yazılım"),
    DepartmentCategory("Sağlık & Tıp", "🩺", "tabip"),
    DepartmentCategory("Hemşirelik & Ebelik", "💉", "hemşire"),
    DepartmentCategory("Eğitim & Öğretmenlik", "🎓", "öğretim"),
    DepartmentCategory("Mühendislik & Mimarlık", "📐", "mühendis"),
    DepartmentCategory("Hukuk & Adalet", "⚖️", "hukuk"),
    DepartmentCategory("İktisat & Maliye", "📊", "maliye"),
    DepartmentCategory("Büro Yönetimi", "📁", "büro"),
    DepartmentCategory("Zabıta & Güvenlik", "🛡️", "güvenlik"),
    DepartmentCategory("Psikoloji & PDR", "🧠", "psikolog"),
    DepartmentCategory("Fen & Temel Bilimler", "🔬", "biyolog"),
    DepartmentCategory("Ziraat & Veterinerlik", "🌾", "ziraat"),
    DepartmentCategory("İlahiyat & Diyanet", "🕌", "imam"),
    DepartmentCategory("İletişim & Medya", "📢", "iletişim"),
    DepartmentCategory("Turizm & Otelcilik", "🏨", "turizm"),
    DepartmentCategory("Teknik Hizmetler", "🔧", "teknisyen")
)

@Composable
fun CategoriesScreen(
    onCategoryClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Bölümünüze Göre İlanlar",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = SlateDark
        )
        Text(
            text = "Mezuniyet alanınızı seçerek hedef kadrolara anında ulaşın",
            fontSize = 13.sp,
            color = SlateMuted
        )

        Spacer(modifier = Modifier.height(14.dp))

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
            contentPadding = PaddingValues(bottom = 80.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(POPULAR_CATEGORIES) { category ->
                CategoryCard(
                    category = category,
                    onClick = { onCategoryClick(category.queryKeyword) }
                )
            }
        }
    }
}

@Composable
fun CategoryCard(
    category: DepartmentCategory,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
        border = CardDefaults.outlinedCardBorder().copy(width = 1.dp, brush = androidx.compose.ui.graphics.SolidColor(SlateBorder))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = category.iconEmoji,
                    fontSize = 22.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Column(modifier = Modifier.padding(start = 8.dp)) {
                    Text(
                        text = category.title,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = SlateDark,
                        lineHeight = 16.sp
                    )
                }
            }

            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = SlateMuted,
                modifier = Modifier.padding(start = 4.dp)
            )
        }
    }
}
