package com.kamuilan.app.data.model

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Agriculture
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.CleaningServices
import androidx.compose.material.icons.filled.Computer
import androidx.compose.material.icons.filled.Engineering
import androidx.compose.material.icons.filled.Folder
import androidx.compose.material.icons.filled.Gavel
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.MedicalServices
import androidx.compose.material.icons.filled.Museum
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Science
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Shield
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector

data class DepartmentCategory(
    val id: String,
    val name: String,
    val keywords: List<String>,
    val dbCategory: String? = null,
    val icon: ImageVector,
    val color: Color,
    val bgColor: Color
)

object YokDepartments {

    val LIST: List<DepartmentCategory> = listOf(
        DepartmentCategory(
            id = "bilisim",
            name = "Bilgisayar & Bilişim & Yazılım",
            keywords = listOf("yazilim", "bilgisayar", "bilisim", "programci", "cozumleyici", "siber", "yapay zeka"),
            dbCategory = "bilisim",
            icon = Icons.Default.Computer,
            color = Color(0xFF2563EB),
            bgColor = Color(0xFFEFF6FF)
        ),
        DepartmentCategory(
            id = "egitim",
            name = "Eğitim Fakültesi & Öğretmenlik",
            keywords = listOf("ogretmen", "ogretim uyesi", "ogretim elemani", "akademisyen", "docent", "profesor", "arastirma gorevlisi"),
            dbCategory = "egitim",
            icon = Icons.Default.School,
            color = Color(0xFFD97706),
            bgColor = Color(0xFFFFFBEB)
        ),
        DepartmentCategory(
            id = "hukuk",
            name = "Hukuk & Adalet",
            keywords = listOf("hukuk", "avukat", "hakim", "savci", "icra mudur", "adli", "yargitay"),
            dbCategory = "hukuk",
            icon = Icons.Default.Gavel,
            color = Color(0xFF9333EA),
            bgColor = Color(0xFFFAF5FF)
        ),
        DepartmentCategory(
            id = "saglik",
            name = "Sağlık & Tıp & Diş Hekimliği",
            keywords = listOf("tabip", "hekim", "doktor", "dis hekimi", "eczaci", "tip fakultesi"),
            dbCategory = "saglik",
            icon = Icons.Default.MedicalServices,
            color = Color(0xFFE11D48),
            bgColor = Color(0xFFFFF1F2)
        ),
        DepartmentCategory(
            id = "hemsirelik",
            name = "Hemşirelik & Ebelik & Sağlık Teknikerliği",
            keywords = listOf("hemsire", " ebe ", "saglik teknik", "anestezi", "laborant", "paramedik", "diyaliz", "fizyoterapist", "biyolog", "odyolog"),
            dbCategory = null,
            icon = Icons.Default.LocalHospital,
            color = Color(0xFF0D9488),
            bgColor = Color(0xFFF0FDFA)
        ),
        DepartmentCategory(
            id = "iibf",
            name = "İktisat, İşletme, Maliye & Denetim",
            keywords = listOf("maliye", "iktisat", "isletme", "kamu yonetimi", "muhasebe", "finans", "ekonometri", "denetci", "denetmen", "bddk", "spk", "tmsf", "hazine"),
            dbCategory = "maliye",
            icon = Icons.Default.AccountBalance,
            color = Color(0xFF059669),
            bgColor = Color(0xFFECFDF5)
        ),
        DepartmentCategory(
            id = "muhendislik",
            name = "Mühendislik & Mimarlık (Tüm Branşlar)",
            keywords = listOf("muhendis", "mimar", "insaat", "makine", "elektrik", "elektronik", "harita", "jeoloji", "maden", "endustri"),
            dbCategory = "muhendislik",
            icon = Icons.Default.Engineering,
            color = Color(0xFF4F46E5),
            bgColor = Color(0xFFEEF2FF)
        ),
        DepartmentCategory(
            id = "buro",
            name = "Büro Yönetimi & İdari Personel",
            keywords = listOf("buro", "sekreter", "veri hazirlama", "vhki", "danisma", "arsiv"),
            dbCategory = null,
            icon = Icons.Default.Folder,
            color = Color(0xFF0891B2),
            bgColor = Color(0xFFECFEFF)
        ),
        DepartmentCategory(
            id = "zabita",
            name = "Zabıta, İtfaiye & Özel Güvenlik",
            keywords = listOf("zabita", "itfaiye", "ozel guvenlik", "koruma ve guvenlik"),
            dbCategory = null,
            icon = Icons.Default.Security,
            color = Color(0xFFEA580C),
            bgColor = Color(0xFFFFF7ED)
        ),
        DepartmentCategory(
            id = "sosyal",
            name = "Sosyal Hizmetler & Psikoloji & PDR",
            keywords = listOf("sosyal hizmet", "sosyal calismaci", "psikolog", "pdr", "sosyolog", "pedagog"),
            dbCategory = null,
            icon = Icons.Default.Psychology,
            color = Color(0xFF7C3AED),
            bgColor = Color(0xFFF5F3FF)
        ),
        DepartmentCategory(
            id = "fen_edebiyat",
            name = "Fen - Edebiyat & Temel Bilimler",
            keywords = listOf("matematik", "fizik", "kimya", "biyoloji", "tarih", "turk dili", "edebiyat", "cografya", "felsefe", "istatistik"),
            dbCategory = null,
            icon = Icons.Default.Science,
            color = Color(0xFF0F766E),
            bgColor = Color(0xFFF0FDFA)
        ),
        DepartmentCategory(
            id = "ziraat_veteriner",
            name = "Ziraat, Orman, Hayvancılık & Gıda",
            keywords = listOf("ziraat", "veteriner", "orman muhendisi", "gida muhendisi", "tarim", "bahcivan", "peyzaj"),
            dbCategory = null,
            icon = Icons.Default.Agriculture,
            color = Color(0xFF16A34A),
            bgColor = Color(0xFFF0FDF4)
        ),
        DepartmentCategory(
            id = "teknik_usta",
            name = "Tekniker, Teknisyen, Usta & Mekanik",
            keywords = listOf("tekniker", "teknisyen", "mekanik", "tamirci", "elektrikci", "kaynakci", "operator", "lastikci", "sofor", "motor"),
            dbCategory = null,
            icon = Icons.Default.Build,
            color = Color(0xFF475569),
            bgColor = Color(0xFFF8FAFC)
        ),
        DepartmentCategory(
            id = "savunma_askeri",
            name = "Milli Savunma & Askeri Kadrolar",
            keywords = listOf("subay", "astsubay", "askeri", "jandarma", "sahil guvenlik", "milli savunma"),
            dbCategory = null,
            icon = Icons.Default.Shield,
            color = Color(0xFF1E293B),
            bgColor = Color(0xFFF1F5F9)
        ),
        DepartmentCategory(
            id = "kultur_sanat",
            name = "Kültür, Sanat, Arkeoloji & Müze",
            keywords = listOf("restorator", "muze", "sanat tarih", "arkeolog", "kutuphaneci", "grafiker", "milli saraylar", "vakif"),
            dbCategory = null,
            icon = Icons.Default.Museum,
            color = Color(0xFFB45309),
            bgColor = Color(0xFFFFFBEB)
        ),
        DepartmentCategory(
            id = "destek_hizmet",
            name = "Temizlik, Aşçılık & Destek Hizmetleri",
            keywords = listOf("temizlik", "hizmetli", "asci", "destek personeli", "beden iscisi", "garson", "bulasik"),
            dbCategory = null,
            icon = Icons.Default.CleaningServices,
            color = Color(0xFF047857),
            bgColor = Color(0xFFECFDF5)
        )
    )

    private val byIdMap: Map<String, DepartmentCategory> = LIST.associateBy { it.id }

    fun getById(id: String): DepartmentCategory? = byIdMap[id]

    /**
     * Web sitesindeki matching motoru ile birebir aynı:
     * fullContent = normalizeText("${job.title} ${job.description ?: ""}")
     * matchesCategory = dept.dbCategory && job.category === dept.dbCategory
     * matchesKeyword = dept.keywords.some((kw) => fullContent.includes(kw))
     * return matchesCategory || matchesKeyword
     */
    fun matches(job: JobPost, department: DepartmentCategory): Boolean {
        val fullContent = TurkishMatcher.normalize("${job.title} ${job.description ?: ""}")
        val matchesCategory = !department.dbCategory.isNullOrBlank() &&
                job.category?.equals(department.dbCategory, ignoreCase = true) == true
        val matchesKeyword = department.keywords.any { kw -> fullContent.contains(kw) }
        return matchesCategory || matchesKeyword
    }

    fun matches(job: JobPost, departmentId: String): Boolean {
        val dept = getById(departmentId) ?: return false
        return matches(job, dept)
    }

    /**
     * Tüm kategoriler için anlık aktif ilan sayılarını hesaplar.
     */
    fun calculateCounts(jobs: List<JobPost>): Map<String, Int> {
        return LIST.associate { dept ->
            dept.id to jobs.count { job -> matches(job, dept) }
        }
    }
}
