package com.kamuilan.app.ui.theme

import androidx.compose.ui.graphics.Color

// ─── Brand Primaries ───────────────────────────────────────────────────────────
val BrandPrimary      = Color(0xFF2563EB)
val BrandDark         = Color(0xFF1D4ED8)
val BrandLight        = Color(0xFF3B82F6)
val BrandSubtle       = Color(0xFFEFF6FF)

// ─── 2026 Glassmorphic Additions ──────────────────────────────────────────────
val BrandGradientStart = Color(0xFF1D4ED8)
val BrandGradientEnd   = Color(0xFF7C3AED)
val SurfaceGlass       = Color(0xFFFFFFFE)
val GlowBlue           = Color(0x332563EB)
val GlowPurple         = Color(0x337C3AED)
val CardShadow         = Color(0x14000000)
val SuccessGreen       = Color(0xFF10B981)
val WarningAmber       = Color(0xFFF59E0B)

// ─── OLED & Dark Mode Renk Paleti ─────────────────────────────────────────────
val DarkOledBackground = Color(0xFF090D16) // Derin gece laciverti / OLED siyah
val DarkSurfaceCard    = Color(0xFF111827) // Gece kart zemini
val DarkSurfaceElevated= Color(0xFF1E293B) // Yükseltilmiş kart
val DarkBorderSlate    = Color(0xFF1F2937) // Gece kenarlık

// ─── Category Gradient Pairs ──────────────────────────────────────────────────
val BilisimGradStart   = Color(0xFFEFF6FF)
val BilisimGradEnd     = Color(0xFFDBEAFE)

val SaglikGradStart    = Color(0xFFFFF1F2)
val SaglikGradEnd      = Color(0xFFFFE4E6)

val HemsireGradStart   = Color(0xFFF0FDFA)
val HemsireGradEnd     = Color(0xFFCCFBF1)

val EgitimGradStart    = Color(0xFFFFFBEB)
val EgitimGradEnd      = Color(0xFFFEF3C7)

val MuhendisGradStart  = Color(0xFFEEF2FF)
val MuhendisGradEnd    = Color(0xFFE0E7FF)

val HukukGradStart     = Color(0xFFFAF5FF)
val HukukGradEnd       = Color(0xFFF3E8FF)

// ─── Nötr Renkler (Zinc & Slate - Web 1:1) ───────────────────────────────────
val Zinc950 = Color(0xFF09090B)
val Zinc900 = Color(0xFF18181B)
val Zinc800 = Color(0xFF27272A)
val Zinc700 = Color(0xFF3F3F46)
val Zinc600 = Color(0xFF52525B)
val Zinc500 = Color(0xFF71717A)
val Zinc400 = Color(0xFFA1A1AA)
val Zinc300 = Color(0xFFD4D4D8)
val Zinc200 = Color(0xFFE4E4E7)
val Zinc100 = Color(0xFFF4F4F5)
val Zinc50  = Color(0xFFFAFAFA)

val Slate900 = Color(0xFF0F172A)
val Slate800 = Color(0xFF1E293B)
val Slate700 = Color(0xFF334155)
val Slate600 = Color(0xFF475569)
val Slate500 = Color(0xFF64748B)
val Slate400 = Color(0xFF94A3B8)
val Slate300 = Color(0xFFCBD5E1)
val Slate200 = Color(0xFFE2E8F0)
val Slate100 = Color(0xFFF1F5F9)
val Slate50  = Color(0xFFF8FAFC)

val BackgroundLight = Color(0xFFFAFAFA)
val SurfaceLight    = Color(0xFFFFFFFF)

// ─── Web Tema Dinamik Renkleri ────────────────────────────────────────────────
// Açık tema: Zümrüt Yeşili birincil, Kraliyet Mavi ikincil
val LightThemePrimary   = Color(0xFF059669) // Emerald-600
val LightThemeSecondary = Color(0xFF2563EB) // Blue-600
val LightThemeBg        = Color(0xFFFAFAFA)
val LightThemeSurface   = Color(0xFFFFFFFF)
val LightThemeBorder    = Color(0xFFE4E4E7)

// Koyu tema: Elektrik Gök Mavisi birincil, İndigo/Mor ikincil
val DarkThemePrimary    = Color(0xFF38BDF8) // Sky-400
val DarkThemeSecondary  = Color(0xFF818CF8) // Indigo-400
val DarkThemeBg         = Color(0xFF09090B) // Zinc-950
val DarkThemeSurface    = Color(0xFF18181B) // Zinc-900
val DarkThemeBorder     = Color(0xFF27272A) // Zinc-800

// ─── Kadro Türü Rozet Renkleri (Web 1:1 Light & Dark İkili Palet) ──────────────
// 1. Memur (Açıkta Yeşil, Koyu'da Elektrik Mavi)
val MemurLightBg        = Color(0xFFECFDF5)
val MemurLightText      = Color(0xFF064E3B)
val MemurLightBorder    = Color(0xFFA7F3D0)

val MemurDarkBg         = Color(0x2638BDF8)
val MemurDarkText       = Color(0xFF7DD3FC)
val MemurDarkBorder     = Color(0x4D38BDF8)

// Geriye dönük uyumluluk
val MemurSky           = Color(0xFF059669)
val MemurSkyBg         = Color(0xFFECFDF5)
val MemurSkyBorder     = Color(0xFFA7F3D0)

// 2. Sözleşmeli (Açıkta Kobalt Mavi, Koyu'da Derin İndigo - Memur ile kesin ayrım)
val SozlesmeliLightBg   = Color(0xFFEFF6FF)
val SozlesmeliLightText = Color(0xFF1E3A8A)
val SozlesmeliLightBorder = Color(0xFFBFDBFE)

val SozlesmeliDarkBg    = Color(0x33818CF8)
val SozlesmeliDarkText  = Color(0xFFA5B4FC)
val SozlesmeliDarkBorder = Color(0x59818CF8)

// Geriye dönük uyumluluk
val SozlesmeliTeal       = Color(0xFF2563EB)
val SozlesmeliTealBg     = Color(0xFFEFF6FF)
val SozlesmeliTealBorder = Color(0xFFBFDBFE)

// 3. İşçi
val IsciLightBg         = Color(0xFFFFFBEB)
val IsciLightText       = Color(0xFF78350F)
val IsciLightBorder     = Color(0xFFFDE68A)

val IsciDarkBg          = Color(0x26F59E0B)
val IsciDarkText        = Color(0xFFFCD34D)
val IsciDarkBorder      = Color(0x4DF59E0B)

val IsciAmber           = Color(0xFFD97706)
val IsciAmberBg         = Color(0xFFFFFBEB)
val IsciAmberBorder     = Color(0xFFFDE68A)

// 4. Akademik
val AkademikLightBg     = Color(0xFFFAF5FF)
val AkademikLightText   = Color(0xFF581C87)
val AkademikLightBorder = Color(0xFFE9D5FF)

val AkademikDarkBg      = Color(0x26A855F7)
val AkademikDarkText    = Color(0xFFD8B4FE)
val AkademikDarkBorder  = Color(0x4DA855F7)

val AkademikPurple       = Color(0xFF9333EA)
val AkademikPurpleBg     = Color(0xFFFAF5FF)
val AkademikPurpleBorder = Color(0xFFE9D5FF)

// 5. Genel
val GenelLightBg        = Color(0xFFF4F4F5)
val GenelLightText      = Color(0xFF18181B)
val GenelLightBorder    = Color(0xFFE4E4E7)

val GenelDarkBg         = Color(0xFF27272A)
val GenelDarkText       = Color(0xFFE4E4E7)
val GenelDarkBorder     = Color(0x26FFFFFF)

val GenelSlate           = Color(0xFF475569)
val GenelSlateBg         = Color(0xFFF8FAFC)
val GenelSlateBorder     = Color(0xFFE2E8F0)

// ─── Durum Rozetleri ──────────────────────────────────────────────────────────
val UrgentRose         = Color(0xFFE11D48)
val UrgentRoseBg       = Color(0xFFFFF1F2)
val UrgentRoseBorder   = Color(0xFFFECDD3)

val ActiveEmerald      = Color(0xFF059669)
val ActiveEmeraldBg    = Color(0xFFECFDF5)
val ActiveEmeraldBorder = Color(0xFFA7F3D0)

val CancelledRed       = Color(0xFFDC2626)

// ─── Meta Rozetleri ───────────────────────────────────────────────────────────
val KpssBlue           = Color(0xFF1D4ED8)
val KpssBlueBg         = Color(0xFFEFF6FF)
val KpssBlueBorder     = Color(0xFFBFDBFE)

val EducationPurple    = Color(0xFF7E22CE)
val EducationPurpleBg  = Color(0xFFF3E8FF)
val EducationPurpleBorder = Color(0xFFE9D5FF)

val AgeAmber           = Color(0xFFB45309)
val AgeAmberBg         = Color(0xFFFFFBEB)
val AgeAmberBorder     = Color(0xFFFEF3C7)

val SourceIndigo       = Color(0xFF4338CA)
val SourceIndigoBg     = Color(0xFFEEF2FF)
val SourceIndigoBorder = Color(0xFFC7D2FE)
