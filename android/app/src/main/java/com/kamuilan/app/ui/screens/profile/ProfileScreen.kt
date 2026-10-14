package com.kamuilan.app.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material.icons.filled.DarkMode
import androidx.compose.material.icons.filled.LightMode
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.SettingsBrightness
import androidx.compose.material.icons.filled.Alarm
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.RestartAlt
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kamuilan.app.ui.theme.ActiveEmerald
import com.kamuilan.app.ui.theme.ActiveEmeraldBg
import com.kamuilan.app.ui.theme.ActiveEmeraldBorder
import com.kamuilan.app.ui.theme.AmbientGlassBackground
import com.kamuilan.app.ui.theme.BrandPrimary
import com.kamuilan.app.ui.theme.Slate100
import com.kamuilan.app.ui.theme.Slate200
import com.kamuilan.app.ui.theme.Slate400
import com.kamuilan.app.ui.theme.Slate500
import com.kamuilan.app.ui.theme.Slate700
import com.kamuilan.app.ui.theme.Slate900
import com.kamuilan.app.ui.theme.UrgentRose

@Composable
fun ProfileScreen(
    viewModel: ProfileViewModel,
    onEditPreferences: () -> Unit = {},
    currentThemeMode: String = "system",
    onThemeModeChange: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val userProfile by viewModel.userProfile.collectAsState()
    val notificationsEnabled by viewModel.notificationsEnabled.collectAsState()

    AmbientGlassBackground(modifier = modifier) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 16.dp)
        ) {
            // Başlık
            Text(
                text = "Profilim & Ayarlar",
                fontSize = 24.sp,
                fontWeight = FontWeight.ExtraBold,
                color = androidx.compose.material3.MaterialTheme.colorScheme.onSurface,
                letterSpacing = (-0.5).sp
            )
            Spacer(modifier = Modifier.height(3.dp))
            Text(
                text = "Kariyer kriterlerinizi ve uygulama tercihlerinizi yönetin",
                fontSize = 13.sp,
                color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(20.dp))

            // Bilgi Bildirimi (varsa)
            if (uiState.infoMessage != null) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(ActiveEmeraldBg)
                        .border(1.dp, ActiveEmeraldBorder, RoundedCornerShape(14.dp))
                        .padding(14.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = ActiveEmerald,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = uiState.infoMessage ?: "",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = ActiveEmerald
                        )
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // 1. Kariyer Tercihlerim Kartı
            SettingsCard(
                title = "Kariyer Tercihlerim",
                subtitle = "Bana Özel İlanlar bu kriterlere göre listelenir",
                icon = Icons.Default.AutoAwesome,
                iconColor = BrandPrimary
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    PreferenceItemRow(
                        label = "Mezuniyet / Bölüm",
                        value = if (userProfile.department.isNotBlank()) com.kamuilan.app.data.model.YokDepartments.getDisplayName(userProfile.department) else "Tüm Alanlar",
                        icon = Icons.Default.School
                    )
                    HorizontalDivider(color = androidx.compose.material3.MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f), modifier = Modifier.padding(vertical = 10.dp))

                    PreferenceItemRow(
                        label = "Eğitim Düzeyi",
                        value = if (userProfile.educationLevel.isNotBlank()) userProfile.educationLevel else "Tümü",
                        icon = Icons.Default.School
                    )
                    HorizontalDivider(color = androidx.compose.material3.MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f), modifier = Modifier.padding(vertical = 10.dp))

                    PreferenceItemRow(
                        label = "KPSS Puan Türü",
                        value = if (userProfile.kpssType.isNotBlank()) userProfile.kpssType else "Tümü",
                        icon = Icons.Default.AutoAwesome
                    )
                    HorizontalDivider(color = androidx.compose.material3.MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f), modifier = Modifier.padding(vertical = 10.dp))

                    PreferenceItemRow(
                        label = "Hedef Şehir",
                        value = if (userProfile.preferredCity.isNotBlank()) userProfile.preferredCity else "Tüm Türkiye",
                        icon = Icons.Default.LocationOn
                    )

                    Spacer(modifier = Modifier.height(14.dp))

                    // Düzenle butonu
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                brush = Brush.horizontalGradient(
                                    listOf(
                                        androidx.compose.material3.MaterialTheme.colorScheme.primary,
                                        androidx.compose.material3.MaterialTheme.colorScheme.secondary
                                    )
                                )
                            )
                            .clickable { onEditPreferences() }
                            .padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = null,
                                tint = Color(0xFFE3E3E3),
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "Kriterlerimi Güncelle",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFFE3E3E3)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 2. Görünüm & Tema Modu Kartı
            SettingsCard(
                title = "Görünüm & Tema",
                subtitle = "Uygulama renk ve tema modunu seçin",
                icon = Icons.Default.Palette,
                iconColor = androidx.compose.material3.MaterialTheme.colorScheme.primary
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        val themeOptions = listOf(
                            Triple("system", "Sistem", Icons.Default.SettingsBrightness),
                            Triple("light", "Açık", Icons.Default.LightMode),
                            Triple("dark", "Koyu", Icons.Default.DarkMode)
                        )

                        themeOptions.forEach { (modeKey, modeTitle, modeIcon) ->
                            val isSelected = currentThemeMode == modeKey
                            val shape = RoundedCornerShape(12.dp)

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(shape)
                                    .clickable {
                                        onThemeModeChange(modeKey)
                                        viewModel.setThemeMode(modeKey)
                                    }
                                    .background(
                                        if (isSelected) androidx.compose.material3.MaterialTheme.colorScheme.primary.copy(alpha = 0.15f)
                                        else androidx.compose.material3.MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                                    )
                                    .border(
                                        width = if (isSelected) 1.5.dp else 1.dp,
                                        color = if (isSelected) androidx.compose.material3.MaterialTheme.colorScheme.primary
                                                else androidx.compose.material3.MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.5f),
                                        shape = shape
                                    )
                                    .padding(vertical = 12.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(5.dp)
                                ) {
                                    Icon(
                                        imageVector = modeIcon,
                                        contentDescription = modeTitle,
                                        tint = if (isSelected) androidx.compose.material3.MaterialTheme.colorScheme.primary
                                               else androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant,
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Text(
                                        text = modeTitle,
                                        fontSize = 12.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                        color = if (isSelected) androidx.compose.material3.MaterialTheme.colorScheme.primary
                                               else androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 3. Bildirim Tercihleri Kartı
            SettingsCard(
                title = "Bildirim Tercihleri",
                subtitle = "Kamu ilan bildirimlerini yapılandırın",
                icon = Icons.Default.Notifications,
                iconColor = Color(0xFFD97706)
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Yeni İlan Bildirimleri",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = androidx.compose.material3.MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Profilinize uygun kadrolar yayımlandığında bildirim alın",
                                fontSize = 12.sp,
                                color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Switch(
                            checked = notificationsEnabled,
                            onCheckedChange = { viewModel.toggleNotifications(it) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color(0xFFE3E3E3),
                                checkedTrackColor = androidx.compose.material3.MaterialTheme.colorScheme.primary
                            )
                        )
                    }

                    HorizontalDivider(color = androidx.compose.material3.MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f), modifier = Modifier.padding(vertical = 10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Son Başvuru Hatırlatıcıları",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = androidx.compose.material3.MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Favorilediğiniz ilanların süresi dolmadan önce uyarılın",
                                fontSize = 12.sp,
                                color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Switch(
                            checked = uiState.urgentJobAlertsEnabled,
                            onCheckedChange = { viewModel.toggleUrgentJobAlerts(it) },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color(0xFFE3E3E3),
                                checkedTrackColor = androidx.compose.material3.MaterialTheme.colorScheme.primary
                            )
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 3. Veri ve Gizlilik Kartı
            SettingsCard(
                title = "Veri & Gizlilik",
                subtitle = "Cihazınızda saklanan yerel veriler",
                icon = Icons.Default.Security,
                iconColor = Color(0xFF059669)
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = ActiveEmerald,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Giriş veya kayıt gerekmez. Tüm verileriniz yalnızca cihazınızda güvenle tutulur.",
                            fontSize = 12.sp,
                            color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant,
                            lineHeight = 17.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(UrgentRose.copy(alpha = 0.12f))
                            .border(1.dp, UrgentRose.copy(alpha = 0.3f), RoundedCornerShape(10.dp))
                            .clickable { viewModel.resetPreferences() }
                            .padding(vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.RestartAlt,
                                contentDescription = null,
                                tint = UrgentRose,
                                modifier = Modifier.size(16.dp)
                            )
                            Text(
                                text = "Kayıtlı Kriterleri Sıfırla",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = UrgentRose
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 4. Uygulama Bilgisi Kartı
            SettingsCard(
                title = "Hakkında",
                subtitle = "Kamu İlan Mobil Uygulaması",
                icon = Icons.Default.Info,
                iconColor = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
            ) {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Sürüm", fontSize = 13.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(text = "v1.0.0 (Resmî Sürüm)", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurface)
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Veri Kaynakları", fontSize = 13.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(text = "T.C. Resmî Gazete, SBB, İŞKUR...", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f))
                    }
                }
            }

            Spacer(modifier = Modifier.height(80.dp))
        }
    }
}

@Composable
private fun PreferenceItemRow(
    label: String,
    value: String,
    icon: ImageVector
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                tint = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(16.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = label,
                fontSize = 13.sp,
                color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        Text(
            text = value,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = androidx.compose.material3.MaterialTheme.colorScheme.onSurface
        )
    }
}

@Composable
private fun SettingsCard(
    title: String,
    subtitle: String,
    icon: ImageVector,
    iconColor: Color,
    content: @Composable () -> Unit
) {
    val cardShape = RoundedCornerShape(18.dp)
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(2.dp, cardShape, spotColor = androidx.compose.material3.MaterialTheme.colorScheme.onSurface.copy(alpha = 0.05f))
            .clip(cardShape)
            .background(androidx.compose.material3.MaterialTheme.colorScheme.surface.copy(alpha = 0.85f))
            .border(1.dp, androidx.compose.material3.MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.6f), cardShape)
            .padding(16.dp)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Box(
                    modifier = Modifier
                        .size(34.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(iconColor.copy(alpha = 0.12f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconColor,
                        modifier = Modifier.size(18.dp)
                    )
                }
                Spacer(modifier = Modifier.width(10.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = title,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = androidx.compose.material3.MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = subtitle,
                        fontSize = 12.sp,
                        color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))
            HorizontalDivider(color = androidx.compose.material3.MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f), thickness = 1.dp)
            Spacer(modifier = Modifier.height(14.dp))

            content()
        }
    }
}
