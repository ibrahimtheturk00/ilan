package com.kamuilan.app.ui.screens.categories

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Agriculture
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.Campaign
import androidx.compose.material.icons.filled.Computer
import androidx.compose.material.icons.filled.Engineering
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.Hotel
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material.icons.filled.Mosque
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.ui.theme.Slate200
import com.kamuilan.app.ui.theme.Slate400
import com.kamuilan.app.ui.theme.Slate500
import com.kamuilan.app.ui.theme.Slate900

data class DepartmentCategory(
    val title: String,
    val icon: ImageVector,
    val color: Color,
    val bgColor: Color,
    val queryKeyword: String
)

val POPULAR_CATEGORIES = listOf(
    DepartmentCategory("Bilişim & Yazılım", Icons.Default.Computer, Color(0xFF2563EB), Color(0xFFEFF6FF), "yazılım"),
    DepartmentCategory("Sağlık & Tıp", Icons.Default.MedicalServices, Color(0xFFE11D48), Color(0xFFFFF1F2), "tabip"),
    DepartmentCategory("Hemşirelik & Ebelik", Icons.Default.LocalHospital, Color(0xFF0D9488), Color(0xFFF0FDFA), "hemşire"),
    DepartmentCategory("Eğitim & Öğretmenlik", Icons.Default.School, Color(0xFFD97706), Color(0xFFFFFBEB), "öğretim"),
    DepartmentCategory("Mühendislik & Mimarlık", Icons.Default.Engineering, Color(0xFF4F46E5), Color(0xFFEEF2FF), "mühendis"),
    DepartmentCategory("Hukuk & Adalet", Icons.Default.Gavel, Color(0xFF9333EA), Color(0xFFFAF5FF), "hukuk"),
    DepartmentCategory("İktisat & Maliye", Icons.Default.AccountBalance, Color(0xFF059669), Color(0xFFECFDF5), "maliye"),
    DepartmentCategory("Büro Yönetimi", Icons.Default.Folder, Color(0xFF0891B2), Color(0xFFECFEFF), "büro"),
    DepartmentCategory("Zabıta & Güvenlik", Icons.Default.Security, Color(0xFFEA580C), Color(0xFFFFF7ED), "güvenlik"),
    DepartmentCategory("Psikoloji & PDR", Icons.Default.Psychology, Color(0xFF7C3AED), Color(0xFFF5F3FF), "psikolog"),
    DepartmentCategory("Fen & Temel Bilimler", Icons.Default.Science, Color(0xFF0F766E), Color(0xFFF0FDFA), "biyolog"),
    DepartmentCategory("Ziraat & Veterinerlik", Icons.Default.Agriculture, Color(0xFF16A34A), Color(0xFFF0FDF4), "ziraat"),
    DepartmentCategory("İlahiyat & Diyanet", Icons.Default.Mosque, Color(0xFFCA8A04), Color(0xFFFEFCE8), "imam"),
    DepartmentCategory("İletişim & Medya", Icons.Default.Campaign, Color(0xFFDB2777), Color(0xFFFDF2F8), "iletişim"),
    DepartmentCategory("Turizm & Otelcilik", Icons.Default.Hotel, Color(0xFFD97706), Color(0xFFFFFBEB), "turizm"),
    DepartmentCategory("Teknik Hizmetler", Icons.Default.Build, Color(0xFF475569), Color(0xFFF8FAFC), "teknisyen")
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
        // Başlık Alanı (Hero)
        Text(
            text = "Bölümünüze Göre İlanlar",
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
            color = Slate900
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = "Mezuniyet alanınızı seçerek ilgili kamu kadrolarına anında ulaşın",
            fontSize = 13.sp,
            color = Slate500
        )

        Spacer(modifier = Modifier.height(16.dp))

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
    val cardShape = RoundedCornerShape(14.dp)
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .border(width = 1.dp, color = Slate200, shape = cardShape),
        shape = cardShape,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.5.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            // İkon Kutusu
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(color = category.bgColor, shape = RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = category.icon,
                    contentDescription = null,
                    tint = category.color,
                    modifier = Modifier.size(22.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Başlık
            Text(
                text = category.title,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900,
                lineHeight = 17.sp,
                maxLines = 2
            )

            Spacer(modifier = Modifier.height(6.dp))

            // İlanları Gör Linki
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "İlanları Gör",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = category.color
                )
                Spacer(modifier = Modifier.width(3.dp))
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    tint = category.color,
                    modifier = Modifier.size(12.dp)
                )
            }
        }
    }
}
