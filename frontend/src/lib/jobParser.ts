import { JobPost } from "@/types";

export type KpssScoreType = "p3" | "p93" | "p94" | "sartsiz" | "a_grubu" | null;
export type EducationLevel = "lisans" | "onlisans" | "ortaogretim" | "ilkogretim" | null;

export interface JobMetaDetails {
  kpssType: KpssScoreType;
  kpssLabel: string | null;
  educationLevel: EducationLevel;
  educationLabel: string | null;
  maxAge: number | null;
  isToday: boolean;
}

/**
 * Türkçe karakterleri ASCII harflere dönüştürür ve küçük harfe çevirir.
 */
export function normalizeTurkish(text: string): string {
  if (!text) return "";
  return text
    .toLocaleLowerCase("tr-TR")
    .replace(/i̇/g, "i")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

/**
 * İlandan KPSS puan türünü tespit eder.
 */
export function detectKpssType(job: JobPost): { type: KpssScoreType; label: string | null } {
  const text = `${job.title} ${job.description || ""} ${job.raw_content || ""}`;
  const norm = normalizeTurkish(text);

  // 1. KPSS Şartsız / Sınavsız Kontrolleri
  if (
    norm.includes("kpss sartsiz") ||
    norm.includes("kpss sarti aranmaz") ||
    norm.includes("kpss sarti aranmamaktadir") ||
    norm.includes("kpss puani aranmaksizin") ||
    norm.includes("kpss siz") ||
    norm.includes("kpsssiz") ||
    norm.includes("sinavsiz alim") ||
    job.post_type === "akademik"
  ) {
    return { type: "sartsiz", label: "KPSS Şartsız" };
  }

  // 2. Doğrudan Puan Türü Kodları
  if (/\b(kp?ss[- ]?p[- ]?3|p3\s*puani?)\b/i.test(text) || norm.includes("kp-p3") || norm.includes("kpssp3")) {
    return { type: "p3", label: "KPSS P3 (Lisans)" };
  }
  if (/\b(kp?ss[- ]?p[- ]?93|p93\s*puani?)\b/i.test(text) || norm.includes("kpssp93")) {
    return { type: "p93", label: "KPSS P93 (Önlisans)" };
  }
  if (/\b(kp?ss[- ]?p[- ]?94|p94\s*puani?)\b/i.test(text) || norm.includes("kpssp94")) {
    return { type: "p94", label: "KPSS P94 (Ortaöğretim)" };
  }

  // 3. A Grubu / Kariyer Meslek
  if (
    norm.includes("uzman yardimci") ||
    norm.includes("mufettis yardimci") ||
    norm.includes("denetmen yardimci") ||
    norm.includes("a grubu memur") ||
    norm.includes("kariyer meslek")
  ) {
    return { type: "a_grubu", label: "KPSS (A Grubu)" };
  }

  // 4. İŞKUR İşçi İlanları için varsayılan KPSS Şartsız
  if (job.post_type === "isci" || (job.sources?.slug === "iskur" && !norm.includes("kpss"))) {
    return { type: "sartsiz", label: "KPSS Şartsız" };
  }

  // 5. Unvana Göre Akıllı Çıkarım (Lisans / Önlisans / Lise)
  if (
    norm.includes("muhendis") ||
    norm.includes("avukat") ||
    norm.includes("mimar") ||
    norm.includes("doktor") ||
    norm.includes("tabip") ||
    norm.includes("psikolog") ||
    norm.includes("ogretmen")
  ) {
    return { type: "p3", label: "KPSS P3 (Lisans)" };
  }

  if (norm.includes("tekniker")) {
    return { type: "p93", label: "KPSS P93 (Önlisans)" };
  }

  if (norm.includes("teknisyen") || norm.includes("sofor") || norm.includes("guvenlik gorevlisi")) {
    return { type: "p94", label: "KPSS P94 (Ortaöğretim)" };
  }

  return { type: null, label: null };
}

/**
 * İlandan eğitim düzeyini tespit eder.
 */
export function detectEducationLevel(job: JobPost): { level: EducationLevel; label: string | null } {
  const text = `${job.title} ${job.description || ""}`;
  const norm = normalizeTurkish(text);

  // 1. Lisans (Fakülte / 4 Yıllık)
  if (
    norm.includes("lisans mezun") ||
    norm.includes("fakulte") ||
    norm.includes("4 yillik") ||
    norm.includes("muhendis") ||
    norm.includes("mimar") ||
    norm.includes("avukat") ||
    norm.includes("doktor") ||
    norm.includes("tabip") ||
    norm.includes("psikolog") ||
    norm.includes("veteriner") ||
    norm.includes("ogretim gorevlisi") ||
    norm.includes("uzman yardimci") ||
    norm.includes("ogretmen")
  ) {
    return { level: "lisans", label: "Lisans" };
  }

  // 2. Önlisans (2 Yıllık / MYO)
  if (
    norm.includes("onlisans") ||
    norm.includes("on lisans") ||
    norm.includes("meslek yuksekokul") ||
    norm.includes("myo") ||
    norm.includes("2 yillik") ||
    norm.includes("tekniker") ||
    norm.includes("tibbi sekreter") ||
    norm.includes("laborant")
  ) {
    return { level: "onlisans", label: "Önlisans" };
  }

  // 3. Ortaöğretim (Lise / Dengi)
  if (
    norm.includes("ortaogretim") ||
    norm.includes("lise mezun") ||
    norm.includes("dengi okul") ||
    norm.includes("teknisyen") ||
    norm.includes("hizmetli") ||
    norm.includes("sofor") ||
    norm.includes("asci") ||
    norm.includes("temizlik personeli") ||
    norm.includes("guvenlik")
  ) {
    return { level: "ortaogretim", label: "Ortaöğretim" };
  }

  // 4. İlköğretim / İlkokul
  if (norm.includes("ilkogretim") || norm.includes("ilkokul")) {
    return { level: "ilkogretim", label: "İlköğretim" };
  }

  return { level: null, label: null };
}

/**
 * İlandan yaş sınırını tespit eder (örn: 35 yaşını doldurmamış -> 35).
 */
export function detectMaxAge(job: JobPost): number | null {
  const text = `${job.title} ${job.description || ""} ${job.raw_content || ""}`;

  // "35 yaşını doldurmamış", "30 yaşını bitirmemiş", "35 yaşından gün almamış"
  const m1 = text.match(/(\d{2})\s*yaşını\s*(?:doldurmamış|bitirmemiş|aşmamış|geçmemiş)/i);
  if (m1 && m1[1]) {
    const age = parseInt(m1[1], 10);
    if (age >= 18 && age <= 65) return age;
  }

  // "en fazla 35 yaş", "maksimum 35 yaş"
  const m2 = text.match(/(?:en\s*fazla|maksimum|azami)\s*(\d{2})\s*yaş/i);
  if (m2 && m2[1]) {
    const age = parseInt(m2[1], 10);
    if (age >= 18 && age <= 65) return age;
  }

  // "35 yaşından gün almamış"
  const m3 = text.match(/(\d{2})\s*yaşından\s*gün\s*almamış/i);
  if (m3 && m3[1]) {
    const age = parseInt(m3[1], 10);
    if (age >= 18 && age <= 65) return age;
  }

  // Genel kamu ilanlarında "35 yaş" kalıbı
  if (text.includes("35 yaşını") || text.includes("35 yaş sınırı")) return 35;
  if (text.includes("30 yaşını") || text.includes("30 yaş sınırı")) return 30;

  return null;
}

/**
 * İlanın bugün yayınlanıp yayınlanmadığını kontrol eder.
 */
export function isJobPublishedToday(job: JobPost): boolean {
  if (!job.published_at) return false;
  try {
    const pub = new Date(job.published_at);
    const now = new Date();
    // Tarihlerin aynı gün/ay/yıl olduğunu kontrol et
    return (
      pub.getFullYear() === now.getFullYear() &&
      pub.getMonth() === now.getMonth() &&
      pub.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

/**
 * İlanın tüm zenginleştirilmiş meta bilgilerini tek seferde döner.
 */
export function getJobMetaDetails(job: JobPost): JobMetaDetails {
  const kpss = detectKpssType(job);
  const edu = detectEducationLevel(job);
  const maxAge = detectMaxAge(job);
  const isToday = isJobPublishedToday(job);

  return {
    kpssType: kpss.type,
    kpssLabel: kpss.label,
    educationLevel: edu.level,
    educationLabel: edu.label,
    maxAge,
    isToday,
  };
}

/**
 * Levenshtein Mesafesi (Yazım yanlışı toleransı)
 */
function levenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = Array.from({ length: bn + 1 }, () => new Array(an + 1).fill(0));
  for (let i = 0; i <= an; ++i) matrix[0][i] = i;
  for (let i = 0; i <= bn; ++i) matrix[i][0] = i;

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Türkçe toleranslı, semantik eşanlamlı ve yazım hatası tolere eden akıllı arama motoru.
 * Hem metin hem de doğrudan JobPost nesnesi alabilir.
 * Örneğin:
 * - "sağlık" -> Tabip, Hemşire, Doktor, Hastane, Ebe, Sağlık Teknikeri ilanlarını getirir.
 * - "büro personeli" -> Büro, Memur, VHKİ, Sekreter, Zabıt Katibi, İdari Personel ilanlarını getirir.
 * - "öğretim görevlisi" -> Tüm Öğretim Üyesi, Araştırma Görevlisi ve Akademik kadroları getirir.
 */
export function fuzzyTurkishMatch(target: string | JobPost, searchQuery: string): boolean {
  if (!searchQuery || !searchQuery.trim()) return true;
  if (!target) return false;

  let title = "";
  let institution = "";
  let description = "";
  let city = "";
  let category = "";
  let postType = "";
  let combinedText = "";
  let jobObj: JobPost | null = null;

  if (typeof target === "string") {
    combinedText = target;
  } else {
    jobObj = target;
    title = target.title || "";
    institution = target.institution || "";
    description = target.description || "";
    city = target.city || "";
    category = target.category || "";
    postType = target.post_type || "";
    combinedText = `${title} ${institution} ${description} ${city} ${category} ${postType}`;
  }

  const queryNorm = normalizeTurkish(searchQuery);
  const targetNorm = normalizeTurkish(combinedText);
  const titleNorm = normalizeTurkish(title);

  // 1. Doğrudan alt metin eşleşmesi
  if (targetNorm.includes(queryNorm)) return true;

  // 2. Semantik & Eş Anlamlı Akıllı Filtreleme
  // A. SAĞLIK
  if (
    queryNorm.includes("saglik") ||
    queryNorm === "doktor" ||
    queryNorm === "hemsire" ||
    queryNorm === "tabip" ||
    queryNorm === "hekim" ||
    queryNorm === "ebe"
  ) {
    if (category === "saglik") return true;
    const healthWords = [
      "saglik", "tabip", "hekim", "doktor", "hemsire", "ebe", "hastane", "hastanesi",
      "tibbi", "eczaci", "fizyoterapist", "diyetisyen", "laborant", "paramedik", "veteriner",
      "biyolog", "psikolog", "tip fakultesi"
    ];
    if (healthWords.some((w) => targetNorm.includes(w))) return true;
  }

  // B. BÜRO PERSONELİ / MEMUR / İDARİ
  if (
    queryNorm.includes("buro") ||
    queryNorm.includes("idari") ||
    queryNorm === "memur" ||
    queryNorm === "sekreter" ||
    queryNorm === "katip"
  ) {
    if (category === "buro") return true;
    const buroTerms = [
      "buro", "vhki", "veri hazirlama", "sekreter", "zabit katibi", "katip",
      "yazi isleri", "arsiv", "danisma", "santral", "veznedar", "ambar", "idari"
    ];
    if (buroTerms.some((w) => targetNorm.includes(w))) return true;
    if (titleNorm.includes("memur") || titleNorm.includes("idari") || titleNorm.includes("buro")) return true;
    if (postType === "memur") return true;
  }

  // C. ÖĞRETİM GÖREVLİSİ / ÜYESİ / AKADEMİK
  if (
    queryNorm.includes("ogretim") ||
    queryNorm.includes("akademik") ||
    queryNorm.includes("arastirma gorevlisi") ||
    queryNorm === "hoca" ||
    queryNorm.includes("profesor") ||
    queryNorm.includes("docent")
  ) {
    if (postType === "akademik" || category === "egitim") return true;
    const acadTerms = [
      "ogretim uyesi", "ogretim elemani", "ogretim gorevlisi", "arastirma gorevlisi",
      "docent", "profesor", "akademik", "rektorluk", "fakulte"
    ];
    if (acadTerms.some((w) => targetNorm.includes(w))) return true;
  }

  // D. BİLİŞİM / YAZILIM
  if (
    queryNorm.includes("bilisim") ||
    queryNorm.includes("yazilim") ||
    queryNorm.includes("programci") ||
    queryNorm.includes("bilgisayar")
  ) {
    if (category === "bilisim") return true;
    const itTerms = [
      "bilisim", "yazilim", "programci", "bilgisayar", "siber", "network",
      "sistem uzmani", "sistem yoneticisi", "web", "cozumleyici", "veri analist"
    ];
    if (itTerms.some((w) => targetNorm.includes(w))) return true;
  }

  // E. MÜHENDİS / TEKNİK
  if (
    queryNorm.includes("muhendis") ||
    queryNorm.includes("mimar") ||
    queryNorm.includes("tekniker") ||
    queryNorm.includes("teknisyen")
  ) {
    if (category === "muhendislik") return true;
    const engTerms = [
      "muhendis", "mimar", "tekniker", "teknisyen", "harita", "insaat",
      "makine", "elektrik", "elektronik", "jeoloji", "maden", "sehir plancisi"
    ];
    if (engTerms.some((w) => targetNorm.includes(w))) return true;
  }

  // F. TEMİZLİK / DESTEK PERSONELİ
  if (
    queryNorm.includes("temizlik") ||
    queryNorm.includes("hizmetli") ||
    queryNorm.includes("asci") ||
    queryNorm.includes("kaloriferci")
  ) {
    const cleanTerms = ["temizlik", "hizmetli", "asci", "kaloriferci", "beden iscisi", "destek personeli", "sofor", "guvenlik"];
    if (cleanTerms.some((w) => targetNorm.includes(w))) return true;
  }

  // G. BELEDİYE
  if (queryNorm.includes("belediye") || queryNorm.includes("buyuksehir")) {
    const muniTerms = ["belediye", "belediyesi", "buyuksehir", "belpas", "beltas", "personel as", "personel a.s"];
    if (muniTerms.some((w) => targetNorm.includes(w))) return true;
  }

  // H. KPSS ŞARTSIZ
  if (
    queryNorm.includes("kpss sartsiz") ||
    queryNorm.includes("sinavsiz") ||
    queryNorm.includes("kpsssiz") ||
    queryNorm.includes("kpss siz")
  ) {
    if (jobObj) {
      const kpss = detectKpssType(jobObj);
      if (kpss.type === "sartsiz") return true;
    }
    if (
      targetNorm.includes("kpss sartsiz") ||
      targetNorm.includes("kpss puani aranmaksizin") ||
      targetNorm.includes("sinavsiz") ||
      postType === "akademik"
    ) {
      return true;
    }
  }

  // 3. Kelime bazında fuzzy kontrol (Levenshtein toleransı)
  const queryTokens = queryNorm.split(/\s+/).filter((t) => t.length >= 2);
  const targetTokens = targetNorm.split(/[\s,\.\-\/\(\)]+/).filter((t) => t.length >= 2);

  return queryTokens.every((qToken) => {
    // Tam veya önek eşleşme
    if (targetTokens.some((tToken) => tToken.includes(qToken) || qToken.includes(tToken))) {
      return true;
    }

    // 4 harften uzunsa Levenshtein toleransı (1 veya 2 harf farkı)
    const maxAllowedDist = qToken.length >= 6 ? 2 : 1;
    return targetTokens.some((tToken) => {
      if (Math.abs(tToken.length - qToken.length) > maxAllowedDist) return false;
      return levenshteinDistance(tToken, qToken) <= maxAllowedDist;
    });
  });
}
