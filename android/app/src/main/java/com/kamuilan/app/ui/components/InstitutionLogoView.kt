package com.kamuilan.app.ui.components

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Apartment
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Handshake
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.Scale
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import org.json.JSONObject
import java.io.InputStream
import java.util.concurrent.ConcurrentHashMap

enum class InstitutionLogoType {
    MINISTRY,
    JUSTICE,
    DEFENSE,
    HEALTH,
    UNIVERSITY,
    MUNICIPALITY,
    ISKUR,
    FINANCE,
    DEVELOPMENT,
    GENERAL
}

object InstitutionLogoDetector {
    fun detectType(institution: String?): InstitutionLogoType {
        if (institution.isNullOrBlank()) return InstitutionLogoType.GENERAL

        val norm = institution.lowercase()
            .replace("ç", "c")
            .replace("ğ", "g")
            .replace("ı", "i")
            .replace("i̇", "i")
            .replace("ö", "o")
            .replace("ş", "s")
            .replace("ü", "u")

        if (norm.contains("adalet") ||
            norm.contains("yargitay") ||
            norm.contains("danistay") ||
            norm.contains("mahkeme") ||
            norm.contains("cezaevi") ||
            norm.contains("icra")
        ) {
            return InstitutionLogoType.JUSTICE
        }

        if (norm.contains("milli savunma") ||
            norm.contains("msb") ||
            norm.contains("kara kuvvetleri") ||
            norm.contains("deniz kuvvetleri") ||
            norm.contains("hava kuvvetleri") ||
            norm.contains("jandarma") ||
            norm.contains("emniyet") ||
            norm.contains("polis") ||
            norm.contains("sahil guvenlik") ||
            norm.contains("savunma sanayii")
        ) {
            return InstitutionLogoType.DEFENSE
        }

        if (norm.contains("saglik") ||
            norm.contains("hastane") ||
            norm.contains("tip") ||
            norm.contains("hemsire") ||
            norm.contains("tabip")
        ) {
            return InstitutionLogoType.HEALTH
        }

        if (norm.contains("universite") ||
            norm.contains("rektorluk") ||
            norm.contains("fakulte") ||
            norm.contains("enstitu") ||
            norm.contains("yok")
        ) {
            return InstitutionLogoType.UNIVERSITY
        }

        if (norm.contains("belediye") ||
            norm.contains("belediyesi") ||
            norm.contains("personel as") ||
            norm.contains("belka") ||
            norm.contains("iett") ||
            norm.contains("iski") ||
            norm.contains("aski")
        ) {
            return InstitutionLogoType.MUNICIPALITY
        }

        if (norm.contains("iskur") ||
            norm.contains("is kurumu") ||
            norm.contains("sgk") ||
            norm.contains("sosyal guvenlik") ||
            norm.contains("calisma ve sosyal")
        ) {
            return InstitutionLogoType.ISKUR
        }

        if (norm.contains("hazine ve maliye") ||
            norm.contains("bddk") ||
            norm.contains("spk") ||
            norm.contains("tmsf") ||
            norm.contains("kamu ihale") ||
            norm.contains("rekabet kurumu") ||
            norm.contains("turk patent") ||
            norm.contains("merkez bankasi") ||
            norm.contains("gelir idaresi")
        ) {
            return InstitutionLogoType.FINANCE
        }

        if (norm.contains("kalkinma ajansi") || norm.contains("ajansi")) {
            return InstitutionLogoType.DEVELOPMENT
        }

        if (norm.contains("bakanlik") ||
            norm.contains("bakanligi") ||
            norm.contains("cumhurbaskanligi") ||
            norm.contains("valilik") ||
            norm.contains("kaymakamlik")
        ) {
            return InstitutionLogoType.MINISTRY
        }

        return InstitutionLogoType.GENERAL
    }
}

object NativeLogoResolver {
    private val bitmapCache = ConcurrentHashMap<String, Bitmap?>()
    private var isLoaded = false
    private val sbbEntries = mutableListOf<Pair<String, String>>()
    private val extraRules = mutableListOf<Pair<List<String>, String>>()

    private fun normalize(str: String): String {
        return str.lowercase()
            .replace("ç", "c")
            .replace("ğ", "g")
            .replace("ı", "i")
            .replace("i̇", "i")
            .replace("î", "i")
            .replace("ï", "i")
            .replace("â", "a")
            .replace("ä", "a")
            .replace("û", "u")
            .replace("ö", "o")
            .replace("ş", "s")
            .replace("ü", "u")
            .replace(Regex("[^a-z0-9]"), " ")
            .replace(Regex("\\s+"), " ")
            .trim()
    }

    private fun loadRules(context: Context) {
        if (isLoaded) return
        try {
            val jsonStr = context.assets.open("institutionLogoData.json").bufferedReader().use { it.readText() }
            val root = JSONObject(jsonStr)
            val sbbArr = root.optJSONArray("sbbEntries")
            if (sbbArr != null) {
                for (i in 0 until sbbArr.length()) {
                    val obj = sbbArr.getJSONObject(i)
                    sbbEntries.add(Pair(obj.getString("key"), obj.getString("file")))
                }
            }
            val extraArr = root.optJSONArray("extraRules")
            if (extraArr != null) {
                for (i in 0 until extraArr.length()) {
                    val obj = extraArr.getJSONObject(i)
                    val keysArr = obj.getJSONArray("keys")
                    val keysList = mutableListOf<String>()
                    for (k in 0 until keysArr.length()) {
                        keysList.add(keysArr.getString(k))
                    }
                    extraRules.add(Pair(keysList, obj.getString("file")))
                }
            }
            isLoaded = true
        } catch (_: Exception) {
            isLoaded = true
        }
    }

    fun resolveFilename(context: Context, name: String?): String? {
        if (name.isNullOrBlank()) return null
        loadRules(context)
        val n = normalize(name)

        // 1. Extra rules first (specific municipalities like Şile, Rize, Kuşadası and specific ministries)
        for ((keys, file) in extraRules) {
            if (file == "BEL2.png") continue
            for (k in keys) {
                if (n.contains(k)) return file
            }
        }

        // 2. SBB exact/substring
        for ((key, file) in sbbEntries) {
            if (file == "BEL2.png") continue
            if (n.contains(key) || key.contains(n)) {
                return file
            }
        }

        // 3. Fallback municipal
        if (n.contains("belediye") || n.contains("belediyesi") || n.contains("personel as") || n.contains("belka") || n.contains("ltd sti")) {
            return "BEL2.png"
        }

        return null
    }

    fun loadBitmap(context: Context, filename: String): Bitmap? {
        return bitmapCache.computeIfAbsent(filename) { file ->
            try {
                context.assets.open("logos/$file").use { inputStream ->
                    BitmapFactory.decodeStream(inputStream)
                }
            } catch (_: Exception) {
                null
            }
        }
    }
}

data class LogoVisualMeta(
    val icon: ImageVector,
    val primaryColor: Color,
    val iconTint: Color,
    val label: String
)

private fun getLogoMeta(type: InstitutionLogoType): LogoVisualMeta {
    return when (type) {
        InstitutionLogoType.JUSTICE -> LogoVisualMeta(
            icon = Icons.Default.Scale,
            primaryColor = Color(0xFF781010),
            iconTint = Color(0xFFF1D28C),
            label = "Adalet / Yargı"
        )
        InstitutionLogoType.DEFENSE -> LogoVisualMeta(
            icon = Icons.Default.Shield,
            primaryColor = Color(0xFF0C2340),
            iconTint = Color(0xFFF59E0B),
            label = "Savunma / Emniyet"
        )
        InstitutionLogoType.HEALTH -> LogoVisualMeta(
            icon = Icons.Default.LocalHospital,
            primaryColor = Color(0xFFE11D48),
            iconTint = Color(0xFFE3E3E3),
            label = "Sağlık Bakanlığı"
        )
        InstitutionLogoType.UNIVERSITY -> LogoVisualMeta(
            icon = Icons.Default.School,
            primaryColor = Color(0xFF4338CA),
            iconTint = Color(0xFFE3E3E3),
            label = "Üniversite"
        )
        InstitutionLogoType.MUNICIPALITY -> LogoVisualMeta(
            icon = Icons.Default.Apartment,
            primaryColor = Color(0xFF0284C7),
            iconTint = Color(0xFFE3E3E3),
            label = "Belediye"
        )
        InstitutionLogoType.ISKUR -> LogoVisualMeta(
            icon = Icons.Default.Handshake,
            primaryColor = Color(0xFF0D9488),
            iconTint = Color(0xFFE3E3E3),
            label = "İŞKUR / SGK"
        )
        InstitutionLogoType.FINANCE -> LogoVisualMeta(
            icon = Icons.Default.AccountBalance,
            primaryColor = Color(0xFFB45309),
            iconTint = Color(0xFFFEF3C7),
            label = "Hazine / Finans"
        )
        InstitutionLogoType.DEVELOPMENT -> LogoVisualMeta(
            icon = Icons.Default.Explore,
            primaryColor = Color(0xFF059669),
            iconTint = Color(0xFFE3E3E3),
            label = "Kalkınma Ajansı"
        )
        InstitutionLogoType.MINISTRY -> LogoVisualMeta(
            icon = Icons.Default.Stars,
            primaryColor = Color(0xFFB91C1C),
            iconTint = Color(0xFFFCD34D),
            label = "T.C. Bakanlıklar"
        )
        InstitutionLogoType.GENERAL -> LogoVisualMeta(
            icon = Icons.Default.Business,
            primaryColor = Color(0xFF1E293B),
            iconTint = Color(0xFFF8FAFC),
            label = "Kamu Kurumu"
        )
    }
}

/**
 * Hem web hem de mobilde tüm kurumların gerçek logolarını birebir eşit ebatta çizen bileşen.
 */
@Composable
fun InstitutionLogoView(
    institution: String?,
    modifier: Modifier = Modifier,
    size: Dp = 38.dp
) {
    val context = LocalContext.current
    val realBitmap = remember(institution) {
        val filename = NativeLogoResolver.resolveFilename(context, institution)
        if (filename != null) NativeLogoResolver.loadBitmap(context, filename) else null
    }

    Box(
        modifier = modifier
            .size(size)
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFFE3E3E3))
            .border(1.dp, Color(0xFFE4E4E7), RoundedCornerShape(8.dp)),
        contentAlignment = Alignment.Center
    ) {
        if (realBitmap != null) {
            Image(
                bitmap = realBitmap.asImageBitmap(),
                contentDescription = institution ?: "Kurum Logosu",
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .size(size)
                    .padding(3.dp)
            )
        } else {
            val type = InstitutionLogoDetector.detectType(institution)
            val meta = getLogoMeta(type)
            Box(
                modifier = Modifier
                    .size(size - 6.dp)
                    .clip(CircleShape)
                    .background(meta.primaryColor),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = meta.icon,
                    contentDescription = meta.label,
                    tint = meta.iconTint,
                    modifier = Modifier.size(size * 0.54f)
                )
            }
        }
    }
}
