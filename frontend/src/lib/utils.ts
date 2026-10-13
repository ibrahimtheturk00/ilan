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

    // 3. Üniversiteler (Özel Domainler)
    if (norm.includes("eskisehir teknik")) return "https://www.eskisehir.edu.tr/";
    if (norm.includes("sirnak")) return "https://www.sirnak.edu.tr/";
    if (norm.includes("ondokuz mayis")) return "https://www.omu.edu.tr/";
    if (norm.includes("necmettin erbakan")) return "https://www.erbakan.edu.tr/";
    if (norm.includes("ankara universitesi")) return "https://www.ankara.edu.tr/";
    if (norm.includes("ataturk universitesi")) return "https://atauni.edu.tr/";
    if (norm.includes("batman universitesi")) return "https://batman.edu.tr/";
    if (norm.includes("istanbul teknik") || norm.includes("itu")) return "https://www.itu.edu.tr/";

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

    // B) İlçe / Belde Belediyeleri: "<İsim> Belediye..." -> "https://www.<isim>.bel.tr/"
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
