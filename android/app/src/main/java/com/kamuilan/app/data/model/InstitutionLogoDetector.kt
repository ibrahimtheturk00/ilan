package com.kamuilan.app.data.model

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Agriculture
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Domain
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.HealthAndSafety
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.LocationCity
import androidx.compose.material.icons.filled.MilitaryTech
import androidx.compose.material.icons.filled.Policy
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Security
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector

data class InstitutionBadgeInfo(
    val icon: ImageVector,
    val iconColor: Color,
    val bgColor: Color,
    val categoryName: String
)

object InstitutionLogoDetector {

    fun detect(institution: String?): InstitutionBadgeInfo {
        if (institution.isNullOrBlank()) {
            return InstitutionBadgeInfo(
                icon = Icons.Default.Business,
                iconColor = Color(0xFF64748B),
                bgColor = Color(0xFFF1F5F9),
                categoryName = "Kamu Kurumu"
            )
        }

        val norm = institution.lowercase()

        return when {
            // Üniversiteler
            norm.contains("üniversite") || norm.contains("universite") || norm.contains("rektörlük") || norm.contains("rektorluk") -> {
                InstitutionBadgeInfo(
                    icon = Icons.Default.School,
                    iconColor = Color(0xFF7C3AED), // Mor
                    bgColor = Color(0xFFF5F3FF),
                    categoryName = "Üniversite"
                )
            }
            // Belediyeler & Valilikler & İl Özel İdareleri
            norm.contains("belediye") || norm.contains("belediyesi") -> {
                InstitutionBadgeInfo(
                    icon = Icons.Default.LocationCity,
                    iconColor = Color(0xFF0284C7), // Gök mavisi
                    bgColor = Color(0xFFF0F9FF),
                    categoryName = "Belediye"
                )
            }
            norm.contains("valilik") || norm.contains("kaymakamlık") || norm.contains("il özel idare") -> {
                InstitutionBadgeInfo(
                    icon = Icons.Default.AccountBalance,
                    iconColor = Color(0xFFB45309), // Kehribar/Altın
                    bgColor = Color(0xFFFFFBEB),
                    categoryName = "Mülki İdare"
                )
            }
            // Bakanlıklar & Başkanlıklar
            norm.contains("bakanlık") || norm.contains("bakanligi") || norm.contains("bakanlığı") || norm.contains("başkanlık") || norm.contains("baskanligi") -> {
                InstitutionBadgeInfo(
                    icon = Icons.Default.Domain,
                    iconColor = Color(0xFFDC2626), // Kırmızı / T.C. Resmi
                    bgColor = Color(0xFFFEF2F2),
                    categoryName = "Bakanlık"
                )
            }
            // Adalet, Mahkemeler, Yargı
            norm.contains("adalet") || norm.contains("mahkeme") || norm.contains("yargıtay") || norm.contains("danıştay") || norm.contains("savcılık") -> {
                InstitutionBadgeInfo(
                    icon = Icons.Default.Gavel,
                    iconColor = Color(0xFF9333EA),
                    bgColor = Color(0xFFFAF5FF),
                    categoryName = "Adli Kurum"
                )
            }
            // Sağlık, Hastaneler
            norm.contains("sağlık") || norm.contains("hastane") || norm.contains("tabip") || norm.contains("diş") || norm.contains("tıp") -> {
                InstitutionBadgeInfo(
                    icon = Icons.Default.LocalHospital,
                    iconColor = Color(0xFFE11D48),
                    bgColor = Color(0xFFFFF1F2),
                    categoryName = "Sağlık Kurumu"
                )
            }
            // Askeri & Savunma & Emniyet
            norm.contains("savunma") || norm.contains("tsk") || norm.contains("kuvvetleri") || norm.contains("jandarma") || norm.contains("sahil güvenlik") -> {
                InstitutionBadgeInfo(
                    icon = Icons.Default.MilitaryTech,
                    iconColor = Color(0xFF15803D), // Askeri yeşil
                    bgColor = Color(0xFFF0FDF4),
                    categoryName = "Savunma / TSK"
                )
            }
            norm.contains("emniyet") || norm.contains("polis") || norm.contains("güvenlik") -> {
                InstitutionBadgeInfo(
                    icon = Icons.Default.Security,
                    iconColor = Color(0xFF1E40AF),
                    bgColor = Color(0xFFEFF6FF),
                    categoryName = "Emniyet"
                )
            }
            // Orman & Tarım
            norm.contains("orman") || norm.contains("tarım") || norm.contains("dsi") -> {
                InstitutionBadgeInfo(
                    icon = Icons.Default.Agriculture,
                    iconColor = Color(0xFF047857),
                    bgColor = Color(0xFFECFDF5),
                    categoryName = "Tarım / Orman"
                )
            }
            else -> {
                InstitutionBadgeInfo(
                    icon = Icons.Default.Business,
                    iconColor = Color(0xFF475569),
                    bgColor = Color(0xFFF1F5F9),
                    categoryName = "Resmi Kurum"
                )
            }
        }
    }
}
