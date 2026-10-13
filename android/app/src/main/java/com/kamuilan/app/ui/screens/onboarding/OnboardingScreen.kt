package com.kamuilan.app.ui.screens.onboarding

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.WorkspacePremium
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.data.local.PreferencesManager
import com.kamuilan.app.ui.theme.AmbientGlassBackground
import com.kamuilan.app.ui.theme.BrandDark
import com.kamuilan.app.ui.theme.BrandLight
import com.kamuilan.app.ui.theme.BrandPrimary
import com.kamuilan.app.ui.theme.BrandSubtle
import com.kamuilan.app.ui.theme.Slate100
import com.kamuilan.app.ui.theme.Slate200
import com.kamuilan.app.ui.theme.Slate400
import com.kamuilan.app.ui.theme.Slate500
import com.kamuilan.app.ui.theme.Slate700
import com.kamuilan.app.ui.theme.Slate900
import kotlinx.coroutines.launch

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun OnboardingScreen(
    onComplete: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val preferencesManager = remember { PreferencesManager(context) }

    var selectedDepartment by remember { mutableStateOf("bilisim") }
    var selectedEducation by remember { mutableStateOf("Lisans") }
    var selectedKpss by remember { mutableStateOf("KPSS P3 (Lisans)") }
    var selectedCity by remember { mutableStateOf("Tüm Türkiye") }

    val departments = remember {
        com.kamuilan.app.data.model.YokDepartments.LIST.map { it.id to it.name } + listOf("all" to "Farketmez / Tüm Alanlar")
    }

    val educationLevels = listOf(
        "Lisans",
        "Önlisans",
        "Lise / Ortaöğretim",
        "Tümü"
    )

    val kpssTypes = listOf(
        "KPSS P3 (Lisans)",
        "KPSS P93 (Önlisans)",
        "KPSS P94 (Ortaöğretim)",
        "KPSS Şartsız",
        "Tümü"
    )

    val cities = listOf(
        "Tüm Türkiye",
        "Ankara",
        "İstanbul",
        "İzmir",
        "Bursa",
        "Antalya",
        "Adana",
        "Konya"
    )

    AmbientGlassBackground(modifier = modifier) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 24.dp)
        ) {
            Spacer(modifier = Modifier.height(10.dp))

            // Üst Karşılama Başlığı
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .background(
                            brush = Brush.linearGradient(listOf(BrandDark, BrandLight)),
                            shape = RoundedCornerShape(14.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Business,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(26.dp)
                    )
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Text(
                        text = "Kamu İlan",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Text(
                        text = "Kişisel İlan Kurulum Sihirbazı",
                        fontSize = 12.sp,
                        color = Slate500
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Karşılama Kartı
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(width = 1.dp, color = Slate200, shape = RoundedCornerShape(16.dp)),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface.copy(alpha = 0.92f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "Hedef İlanlarınızı Belirleyin",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate900
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Mezuniyet alanınızı ve puan türünüzü seçin; size uygun olmayan binlerce ilanın arasında kaybolmadan doğrudan başvurabileceğiniz kadroları öne çıkaralım.",
                        fontSize = 13.sp,
                        color = Slate500,
                        lineHeight = 19.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 1. Bölüm Seçimi
            SelectionSection(
                title = "1. Mezuniyet Alanınız / Branşınız",
                icon = Icons.Default.FilterList
            ) {
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    departments.forEach { (slug, title) ->
                        SelectablePill(
                            text = title,
                            isSelected = selectedDepartment == slug,
                            onClick = { selectedDepartment = slug }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // 2. Eğitim Düzeyi
            SelectionSection(
                title = "2. Eğitim Düzeyiniz",
                icon = Icons.Default.School
            ) {
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    educationLevels.forEach { level ->
                        SelectablePill(
                            text = level,
                            isSelected = selectedEducation == level,
                            onClick = { selectedEducation = level }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // 3. KPSS Puan Türü
            SelectionSection(
                title = "3. KPSS Puan Türünüz",
                icon = Icons.Default.WorkspacePremium
            ) {
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    kpssTypes.forEach { type ->
                        SelectablePill(
                            text = type,
                            isSelected = selectedKpss == type,
                            onClick = { selectedKpss = type }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // 4. Şehir Tercihi
            SelectionSection(
                title = "4. Öncelikli İl Tercihi",
                icon = Icons.Default.LocationOn
            ) {
                FlowRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    cities.forEach { city ->
                        SelectablePill(
                            text = city,
                            isSelected = selectedCity == city,
                            onClick = { selectedCity = city }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Tamamla Butonu
            Button(
                onClick = {
                    coroutineScope.launch {
                        preferencesManager.saveUserProfile(
                            department = selectedDepartment,
                            educationLevel = selectedEducation,
                            kpssType = selectedKpss,
                            city = selectedCity
                        )
                        onComplete()
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = BrandPrimary)
            ) {
                Text(
                    text = "Kurulumu Tamamla & Bana Özel İlanları Gör",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.width(8.dp))
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Atla Butonu
            TextButton(
                onClick = {
                    coroutineScope.launch {
                        preferencesManager.setOnboardingCompleted(true)
                        onComplete()
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Şimdilik Atla (Daha Sonra Ayarla)",
                    color = Slate500,
                    fontSize = 13.sp
                )
            }

            Spacer(modifier = Modifier.height(24.dp))
        }
    }
}

@Composable
private fun SelectionSection(
    title: String,
    icon: ImageVector,
    content: @Composable () -> Unit
) {
    Column(modifier = Modifier.fillMaxWidth()) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = BrandPrimary,
                modifier = Modifier.size(18.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Slate900
            )
        }
        Spacer(modifier = Modifier.height(10.dp))
        content()
    }
}

@Composable
private fun SelectablePill(
    text: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val shape = RoundedCornerShape(12.dp)
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = Modifier
            .clip(shape)
            .clickable { onClick() }
            .then(
                if (isSelected) {
                    Modifier
                        .background(BrandPrimary, shape)
                        .padding(horizontal = 14.dp, vertical = 9.dp)
                } else {
                    Modifier
                        .background(MaterialTheme.colorScheme.surface, shape)
                        .border(1.dp, Slate200, shape)
                        .padding(horizontal = 14.dp, vertical = 9.dp)
                }
            )
    ) {
        if (isSelected) {
            Icon(
                imageVector = Icons.Default.Check,
                contentDescription = null,
                tint = Color.White,
                modifier = Modifier.size(14.dp)
            )
            Spacer(modifier = Modifier.width(5.dp))
        }
        Text(
            text = text,
            fontSize = 12.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
            color = if (isSelected) Color.White else Slate700
        )
    }
}
