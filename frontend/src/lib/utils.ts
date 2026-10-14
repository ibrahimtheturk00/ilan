import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

/**
 * İŞKUR veya diğer kaynaklardan gelen hatalı/süreli başlıkları düzeltir.
 * Örn: "(son 1 gün kaldı)" veya "(bugün sona eriyor)" gibi metinler başlık veya kurum adı
 * olarak girilmişse, PDF dosya adından veya şehirden temiz başlık ve kurum türetir.
 */
export function cleanJobTitle(title: string | null | undefined, city?: string | null, originalUrl?: string | null): string {
  if (!title) return "Resmi Kamu İlanı";
  let cleaned = title.trim();
  const lower = cleaned.toLowerCase();
  const isFaulty =
    lower.includes("gün kaldı") ||
    lower.includes("gn kald") ||
    lower.includes("sona eriyor") ||
    lower.startsWith("(son") ||
    lower.startsWith("(bugün");

  if (isFaulty) {
    // URL'den dosya adını çıkarıp güzelleştir
    if (originalUrl && originalUrl.includes("/")) {
      try {
        const fileName = decodeURIComponent(originalUrl.split("/").pop() || "")
          .replace(/\.pdf$/i, "")
          .replace(/[-_]+/g, " ")
          .trim();

        if (fileName && fileName.length > 3 && !/^\d+$/.test(fileName)) {
          // İlk harfleri büyüt
          const formatted = fileName
            .split(" ")
            .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1).toLocaleLowerCase("tr-TR"))
            .join(" ");

          if (!formatted.toLowerCase().includes("doc0") && !formatted.toLowerCase().includes("scan")) {
            cleaned = `${formatted} Personel Alım İlanı`;
          }
        }
      } catch {
        // ignore
      }
    } else {
      const prefix = city ? `${city} ` : "";
      cleaned = `${prefix}Kamu Kurumu Personel Alım İlanı`;
    }
  }

  // Başlıktaki yapışık tarihleri (örn. 17102026) ve mükerrer "Personel Personel" ifadelerini temizle
  cleaned = cleaned
    .replace(/\b\d{8}\b/g, "")
    .replace(/\b\d{1,2}\s+(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\s+\d{4}\b/gi, "")
    .replace(/personel\s+personel/gi, "Personel")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || "Resmi Kamu İlanı";
}

export function sanitizePositionCount(count: number | null | undefined): number {
  if (!count || typeof count !== "number" || isNaN(count) || count <= 0) return 1;
  // Takvim yılları (2020..2035) örn. "2026 Personel" gibi hatalı yakalanan yılları 1 say
  if (count >= 2020 && count <= 2035) return 1;
  // 5000'den büyük sayılar (örn. 17102026 gibi DDMMYYYY tarihleri) hatalı kontenjandır
  if (count > 5000) return 1;
  return Math.round(count);
}

export function cleanInstitution(institution: string | null | undefined, title: string | null | undefined, city?: string | null, originalUrl?: string | null): string {
  if (!institution) return "Resmi Kamu Kurumu";
  let cleaned = institution.trim();

  const lower = cleaned.toLowerCase();
  const isFaulty =
    lower.includes("gün kaldı") ||
    lower.includes("gn kald") ||
    lower.includes("sona eriyor") ||
    lower.startsWith("(son") ||
    lower.startsWith("(bugün");

  if (isFaulty) {
    // Başlıktan veya URL'den kurum türet
    if (originalUrl && originalUrl.includes("/")) {
      try {
        const fileName = decodeURIComponent(originalUrl.split("/").pop() || "")
          .replace(/\.pdf$/i, "")
          .replace(/[-_]+/g, " ")
          .trim();

        if (fileName && fileName.length > 3 && !/^\d+$/.test(fileName)) {
          const formatted = fileName
            .split(" ")
            .map((w) => w.charAt(0).toLocaleUpperCase("tr-TR") + w.slice(1).toLocaleLowerCase("tr-TR"))
            .join(" ");

          if (!formatted.toLowerCase().includes("doc0") && !formatted.toLowerCase().includes("scan")) {
            cleaned = formatted;
          }
        }
      } catch {
        // ignore
      }
    } else {
      const prefix = city ? `${city} ` : "";
      return `${prefix}Belediyesi / Kamu Kurumu`;
    }
  }

  // Tarih ve gereksiz ek temizliği (örn. "Gazibel Ltd Şti 17102026 Personel" -> "Gazibel Ltd Şti")
  cleaned = cleaned
    .replace(/\b\d{8}\b/g, "")
    .replace(/\b\d{1,2}\s+(Ocak|Şubat|Mart|Nisan|Mayıs|Haziran|Temmuz|Ağustos|Eylül|Ekim|Kasım|Aralık)\s+\d{4}\b/gi, "")
    .replace(/\s+Personel\s*$/i, "")
    .replace(/\s+Alım\s*$/i, "")
    .replace(/\s+İlanı\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned || "Resmi Kamu Kurumu";
}

export interface ApplicationStatusInfo {
  type: "cancelled" | "upcoming" | "active" | "urgent" | "expired" | "unknown";
  statusTitle: string;
  daysText: string;
  fullBadgeText: string;
  badgeClass: string;
  isCancelled: boolean;
  isUpcoming: boolean;
  isActive: boolean;
  isExpired: boolean;
}

export function getJobApplicationStatus(
  publishedStr: string | null | undefined,
  deadlineStr: string | null | undefined,
  title?: string
): ApplicationStatusInfo {
  // 0. İptal / Düzeltme İlanı Kontrolü (Türkçe büyük/küçük İ-ı duyarlı kontrol)
  const rawTitle = title || "";
  const titleLower = rawTitle.toLocaleLowerCase("tr-TR");
  // Bazı tarayıcılarda I->ı veya i̇ dönüşüm varyasyonlarını da yakalamak için normalize et
  const normalized = titleLower
    .replace(/i̇/g, "i")
    .replace(/ı/g, "i");

  const isIptal = titleLower.includes("iptal") || normalized.includes("iptal");
  const isDuzeltme = titleLower.includes("düzeltme") || normalized.includes("duzeltme");

  if (isIptal || isDuzeltme) {
    return {
      type: "cancelled",
      statusTitle: isIptal ? "İptal İlanı" : "Düzeltme İlanı",
      daysText: isIptal ? "Başvuru İptal Edildi" : "Şartlar Güncellendi",
      fullBadgeText: isIptal ? "İptal Edildi" : "Düzeltme İlanı",
      badgeClass: "bg-red-600 text-white font-bold shadow-sm ring-1 ring-red-700",
      isCancelled: true,
      isUpcoming: false,
      isActive: false,
      isExpired: true,
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // 1. Gelecek Başvuru Kontrolü (published_at gelecekteyse)
  if (publishedStr) {
    const pubDate = new Date(publishedStr);
    pubDate.setHours(0, 0, 0, 0);
    const diffToStart = Math.ceil((pubDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffToStart > 0) {
      return {
        type: "upcoming",
        statusTitle: "Gelecek Başvuru",
        daysText: `${diffToStart} gün sonra başlıyor`,
        fullBadgeText: `Gelecek Başvuru • ${diffToStart} gün sonra`,
        badgeClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50 font-medium",
        isCancelled: false,
        isUpcoming: true,
        isActive: false,
        isExpired: false,
      };
    }
  }

  // 2. Deadline Kontrolü
  if (!deadlineStr) {
    return {
      type: "unknown",
      statusTitle: "Başvuru Aktif",
      daysText: "Süresiz / Belirtilmemiş",
      fullBadgeText: "Başvuru Aktif",
      badgeClass: "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
      isCancelled: false,
      isUpcoming: false,
      isActive: true,
      isExpired: false,
    };
  }

  const deadline = new Date(deadlineStr);
  deadline.setHours(23, 59, 59, 999);
  const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      type: "expired",
      statusTitle: "Süresi Doldu",
      daysText: "Başvuru Kapandı",
      fullBadgeText: "Süresi Doldu",
      badgeClass: "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700",
      isCancelled: false,
      isUpcoming: false,
      isActive: false,
      isExpired: true,
    };
  } else if (diffDays <= 3) {
    return {
      type: "urgent",
      statusTitle: "Başvuru Aktif (Acil)",
      daysText: diffDays === 0 ? "Bugün Son Gün!" : `Son ${diffDays} gün kaldı!`,
      fullBadgeText: diffDays === 0 ? "Bugün Son Gün!" : `Son ${diffDays} gün!`,
      badgeClass: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 font-semibold",
      isCancelled: false,
      isUpcoming: false,
      isActive: true,
      isExpired: false,
    };
  } else {
    return {
      type: "active",
      statusTitle: "Başvuru Aktif",
      daysText: `${diffDays} gün kaldı`,
      fullBadgeText: `Başvuru Aktif • ${diffDays} gün kaldı`,
      badgeClass: "bg-rose-50 text-rose-700 border border-rose-200/80 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800/50 font-medium",
      isCancelled: false,
      isUpcoming: false,
      isActive: true,
      isExpired: false,
    };
  }
}

// Geriye dönük uyumluluk için eski getDaysRemaining sarmalayıcısı
export function getDaysRemaining(deadlineStr: string | null | undefined) {
  const status = getJobApplicationStatus(null, deadlineStr);
  return {
    days: null,
    text: status.fullBadgeText,
    isExpired: status.isExpired,
    isUrgent: status.type === "urgent",
  };
}

export function resolveApplicationUrl(institution: string | null | undefined, originalUrl: string): string {
  if (!originalUrl) return "https://kariyerkapisi.gov.tr/isealim";

  // Eğer SBB'nin linki ise (ilanDetay.aspx?kod=...)
  if (originalUrl.includes("kamuilan.sbb.gov.tr/ilanDetay.aspx")) {
    const rawInst = institution || "";
    // Türkçe karakterleri ve aksanları temiz normalize et
    const norm = rawInst
      .toLocaleLowerCase("tr-TR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ç/g, "c")
      .replace(/ğ/g, "g")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ş/g, "s")
      .replace(/ü/g, "u");

    // 1. Askeri / Güvenlik Kurumları
    if (norm.includes("milli savunma") || norm.includes("msb")) {
      return "https://personeltemin.msb.gov.tr/";
    }
    if (norm.includes("jandarma")) {
      return "https://vatandas.jandarma.gov.tr/ptm/giris";
    }
    if (norm.includes("sahil guvenlik")) {
      return "https://www.sg.gov.tr/";
    }
    if (norm.includes("emniyet") || norm.includes("polis")) {
      return "https://www.pa.edu.tr/";
    }

    // 2. Bakanlıklar ve Bağlı Kuruluşlar
    if (norm.includes("tapu ve kadastro") || norm.includes("tkgm")) {
      return "https://kariyerkapisi.gov.tr/isealim";
    }
    if (norm.includes("adalet bakanligi") || norm.includes("icra")) {
      return "https://pgm.adalet.gov.tr/";
    }
    if (norm.includes("kalkinma ajansi") || norm.includes("ajansi")) {
      return "https://sinavbasvuru.sanayi.gov.tr/";
    }
    if (norm.includes("tubitak")) {
      return "https://kariyer.tubitak.gov.tr/";
    }
    if (norm.includes("tmsf") || norm.includes("tasarruf mevduati")) {
      return "https://www.tmsf.org.tr/";
    }
    if (norm.includes("bddk") || norm.includes("bankacilik duzenleme")) {
      return "https://www.bddk.org.tr/";
    }
    if (norm.includes("vakiflar")) {
      return "https://vgm.gov.tr/";
    }
    if (norm.includes("yargitay")) {
      return "https://www.yargitay.gov.tr/";
    }
    if (norm.includes("danistay")) {
      return "https://www.danistay.gov.tr/";
    }
    if (norm.includes("gelir idaresi") || norm.includes("gib")) {
      return "https://www.gib.gov.tr/";
    }
    if (norm.includes("ozellestirme")) {
      return "https://kariyerkapisi.gov.tr/isealim";
    }
    if (norm.includes("iletisim baskanligi")) {
      return "https://kariyerkapisi.gov.tr/isealim";
    }
    if (norm.includes("savunma sanayii") || norm.includes("ssb")) {
      return "https://www.ssb.gov.tr/";
    }
    if (norm.includes("turk patent")) {
      return "https://www.turkpatent.gov.tr/";
    }
    if (norm.includes("spk") || norm.includes("sermaye piyasasi")) {
      return "https://spk.gov.tr/";
    }
    if (norm.includes("iett")) {
      return "https://iett.istanbul/";
    }
    if (norm.includes("orta karadeniz") || norm.includes("oka")) {
      return "https://www.oka.ka.gov.tr/";
    }
    if (norm.includes("mevlana") || norm.includes("mevka")) {
      return "https://www.mevka.org.tr/";
    }

    // 3. Üniversiteler (Doğrulanmış Resmî Web & Personel Portalları)
    const uniDomains: [string, string][] = [
      ["sakarya", "https://www.subu.edu.tr/"],
      ["subu", "https://www.subu.edu.tr/"],
      ["canakkale", "https://www.comu.edu.tr/"],
      ["onsekiz mart", "https://www.comu.edu.tr/"],
      ["yildiz", "https://www.yildiz.edu.tr/"],
      ["medeniyet", "https://www.medeniyet.edu.tr/"],
      ["ondokuz mayis", "https://www.omu.edu.tr/"],
      ["erbakan", "https://www.erbakan.edu.tr/"],
      ["sirnak", "https://www.sirnak.edu.tr/"],
      ["bandirma", "https://www.bandirma.edu.tr/"],
      ["marmara", "https://www.marmara.edu.tr/"],
      ["giresun", "https://www.giresun.edu.tr/"],
      ["bozok", "https://bozok.edu.tr/"],
      ["siirt", "https://www.siirt.edu.tr/"],
      ["bogazici", "https://www.boun.edu.tr/"],
      ["dicle", "https://www.dicle.edu.tr/"],
      ["akdeniz", "https://www.akdeniz.edu.tr/"],
      ["artvin", "https://www.artvin.edu.tr/"],
      ["ahi evran", "https://www.ahievran.edu.tr/"],
      ["haci bayram", "https://hacibayram.edu.tr/"],
      ["isparta", "https://isparta.edu.tr/"],
      ["samsun", "https://samsun.edu.tr/"],
      ["igdir", "https://www.igdir.edu.tr/"],
      ["adiyaman", "https://www.adiyaman.edu.tr/"],
      ["adnan menderes", "https://www.adu.edu.tr/"],
      ["balikesir", "https://www.baun.edu.tr/"],
      ["karatekin", "https://www.karatekin.edu.tr/"],
      ["cankiri", "https://www.karatekin.edu.tr/"],
      ["usak", "https://www.usak.edu.tr/"],
      ["suleyman demirel", "https://w3.sdu.edu.tr/"],
      ["yuzuncu yil", "https://www.yyu.edu.tr/"],
      ["turk-alman", "https://www.tau.edu.tr/"],
      ["turk alman", "https://www.tau.edu.tr/"],
      ["alaaddin keykubat", "https://www.alanya.edu.tr/"],
      ["gaziosmanpasa", "https://www.gop.edu.tr/"],
      ["tokat", "https://www.gop.edu.tr/"],
      ["eskisehir", "https://www.eskisehir.edu.tr/"],
      ["duzce", "https://duzce.edu.tr/"],
      ["ankara", "https://www.ankara.edu.tr/"],
      ["ataturk", "https://atauni.edu.tr/"],
      ["batman", "https://batman.edu.tr/"],
      ["itu", "https://www.itu.edu.tr/"],
      ["istanbul teknik", "https://www.itu.edu.tr/"],
    ];

    for (const [key, url] of uniDomains) {
      if (norm.includes(key)) {
        return url;
      }
    }

    // Otomatik Üniversite Tespiti: "<İsim> Üniversite..." -> "https://www.<isim>.edu.tr/"
    const uniMatch = norm.match(/([a-z]+)\s+universite/);
    if (uniMatch && uniMatch[1]) {
      const slug = uniMatch[1];
      if (slug.length >= 3 && slug !== "teknik") {
        return `https://www.${slug}.edu.tr/`;
      }
    }

    // 4. BELEDİYELER (Tüm Büyükşehir, İlçe ve Belde Belediyelerini Otomatik Bağlama)
    // A) Büyükşehir Belediyeleri: "<İsim> Büyükşehir Belediye..." -> "https://www.<isim>.bel.tr/"
    const bsehirMatch = norm.match(/([a-z]+)\s+buyuksehir\s+belediye/);
    if (bsehirMatch && bsehirMatch[1]) {
      return `https://www.${bsehirMatch[1]}.bel.tr/`;
    }

    // B) Özel / Doğrulanmış Belde ve İlçe Belediyeleri
    if (norm.includes("sariidris")) return "https://sariidris.bel.tr/";
    if (norm.includes("eleskirt")) return "http://www.eleskirt.bel.tr/";
    if (norm.includes("sile")) return "https://www.sile.bel.tr/";
    if (norm.includes("celtik")) return "https://www.celtik.bel.tr/";
    if (norm.includes("kesan")) return "https://www.kesan.bel.tr/";
    if (norm.includes("ortahisar")) return "https://www.ortahisar.bel.tr/";
    if (norm.includes("inebolu")) return "https://www.inebolu.bel.tr/";
    if (norm.includes("malazgirt")) return "https://www.malazgirt.bel.tr/";
    if (norm.includes("rize")) return "https://rize.bel.tr/";
    if (norm.includes("posof")) return "https://posof.bel.tr/";
    if (norm.includes("atalan")) return "https://www.atalan.bel.tr/";
    if (norm.includes("elmakaya")) return "https://elmakaya.bel.tr/";
    if (norm.includes("mucur")) return "https://mucur.bel.tr/";
    if (norm.includes("didim")) return "https://www.didim.bel.tr/";
    if (norm.includes("gerede")) return "https://gerede.bel.tr/";
    if (norm.includes("pursaklar")) return "https://www.pursaklar.bel.tr/";
    if (norm.includes("taskesti")) return "https://www.taskesti.bel.tr/";
    if (norm.includes("aralik")) return "https://www.aralik.bel.tr/";
    if (norm.includes("cukurkuyu")) return "https://cukurkuyu.bel.tr/";

    // C) İlçe / Belde Belediyeleri Dinamik: "<İsim> Belediye..." -> "https://www.<isim>.bel.tr/"
    const belMatch = norm.match(/([a-z]+)\s+belediye/);
    if (belMatch && belMatch[1]) {
      const slug = belMatch[1];
      if (slug.length >= 3 && !["merkez", "ilce"].includes(slug)) {
        return `https://www.${slug}.bel.tr/`;
      }
    }

    if (norm.includes("belediye") || norm.includes("belediyesi")) {
      return "https://yerelyonetimler.csb.gov.tr/";
    }

    if (norm.includes("universite") || norm.includes("universitesi")) {
      return "https://kariyerkapisi.gov.tr/isealim";
    }

    // 5. Resmi Kamu Kariyer Kapısı (Cumhurbaşkanlığı İşe Alım Portalı)
    return "https://kariyerkapisi.gov.tr/isealim";
  }

  return originalUrl;
}

export const POST_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  memur: {
    label: "Memur",
    color: "bg-sky-600 text-white dark:bg-sky-500 font-bold shadow-sm shadow-sky-500/20",
  },
  isci: {
    label: "İşçi",
    color: "bg-amber-600 text-white dark:bg-amber-500 font-bold shadow-sm shadow-amber-500/20",
  },
  akademik: {
    label: "Akademik",
    color: "bg-purple-600 text-white dark:bg-purple-500 font-bold shadow-sm shadow-purple-500/20",
  },
  sozlesmeli: {
    label: "Sözleşmeli",
    color: "bg-teal-600 text-white dark:bg-teal-500 font-bold shadow-sm shadow-teal-500/20",
  },
  diger: {
    label: "Genel",
    color: "bg-slate-700 text-white dark:bg-slate-600 font-semibold shadow-sm",
  },
};

export const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  bilisim: { label: "Bilişim & Yazılım", icon: "Code" },
  saglik: { label: "Sağlık & Tıp", icon: "HeartPulse" },
  egitim: { label: "Eğitim & Akademi", icon: "GraduationCap" },
  muhendislik: { label: "Mühendislik & Teknik", icon: "Wrench" },
  hukuk: { label: "Hukuk & Adalet", icon: "Scale" },
  maliye: { label: "Maliye & Finans", icon: "Coins" },
  diger: { label: "Genel / Diğer", icon: "Briefcase" },
};
