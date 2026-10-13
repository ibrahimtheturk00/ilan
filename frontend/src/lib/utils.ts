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
  type: "upcoming" | "active" | "urgent" | "expired" | "unknown";
  statusTitle: string;
  daysText: string;
  fullBadgeText: string;
  badgeClass: string;
  isUpcoming: boolean;
  isActive: boolean;
  isExpired: boolean;
}

export function getJobApplicationStatus(
  publishedStr: string | null | undefined,
  deadlineStr: string | null | undefined
): ApplicationStatusInfo {
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
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 font-semibold",
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
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
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
      badgeClass: "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
      isUpcoming: false,
      isActive: false,
      isExpired: true,
    };
  } else if (diffDays <= 3) {
    return {
      type: "urgent",
      statusTitle: "Başvuru Aktif (Acil)",
      daysText: diffDays === 0 ? "Bugün Son Gün!" : `Son ${diffDays} gün kaldı!`,
      fullBadgeText: diffDays === 0 ? "Bugün Son Gün!" : `Aktif • Son ${diffDays} gün!`,
      badgeClass: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/70 dark:text-rose-300 font-bold animate-pulse",
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
      badgeClass: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 font-semibold",
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
  const inst = (institution || "").toLowerCase();

  // Eğer SBB'nin linki ise (ilanDetay.aspx?kod=...)
  if (originalUrl.includes("kamuilan.sbb.gov.tr/ilanDetay.aspx")) {
    // 1. Askeri / Güvenlik Kurumları
    if (inst.includes("milli savunma") || inst.includes("millî savunma") || inst.includes("msb")) {
      return "https://personeltemin.msb.gov.tr/";
    }
    if (inst.includes("jandarma")) {
      return "https://vatandas.jandarma.gov.tr/ptm/giris";
    }
    if (inst.includes("sahil güvenlik")) {
      return "https://www.sg.gov.tr/";
    }
    if (inst.includes("emniyet") || inst.includes("polis")) {
      return "https://www.pa.edu.tr/";
    }

    // 2. Bakanlıklar ve Bağlı Kuruluşlar
    if (inst.includes("tapu ve kadastro") || inst.includes("tkgm")) {
      return "https://kariyerkapisi.gov.tr/isealim";
    }
    if (inst.includes("adalet bakanlığı") || inst.includes("icra")) {
      return "https://pgm.adalet.gov.tr/";
    }
    if (inst.includes("kalkınma ajansı") || inst.includes("ajansı")) {
      return "https://sinavbasvuru.sanayi.gov.tr/";
    }
    if (inst.includes("tübitak")) {
      return "https://kariyer.tubitak.gov.tr/";
    }
    if (inst.includes("tmsf") || inst.includes("tasarruf mevduatı")) {
      return "https://www.tmsf.org.tr/";
    }
    if (inst.includes("bddk") || inst.includes("bankacılık düzenleme")) {
      return "https://www.bddk.org.tr/";
    }
    if (inst.includes("vakıflar")) {
      return "https://vgm.gov.tr/";
    }
    if (inst.includes("yargıtay")) {
      return "https://www.yargitay.gov.tr/";
    }
    if (inst.includes("danıştay")) {
      return "https://www.danistay.gov.tr/";
    }
    if (inst.includes("gelir idaresi") || inst.includes("gib")) {
      return "https://www.gib.gov.tr/";
    }
    if (inst.includes("özeleştirme") || inst.includes("özelleştirme")) {
      return "https://kariyerkapisi.gov.tr/isealim";
    }
    if (inst.includes("iletişim başkanlığı")) {
      return "https://kariyerkapisi.gov.tr/isealim";
    }
    if (inst.includes("savunma sanayii") || inst.includes("ssb")) {
      return "https://www.ssb.gov.tr/";
    }
    if (inst.includes("türk patent")) {
      return "https://www.turkpatent.gov.tr/";
    }
    if (inst.includes("spk") || inst.includes("sermaye piyasası")) {
      return "https://spk.gov.tr/";
    }

    // 3. Üniversiteler (Akademik Personel / İdari Başvuru)
    if (inst.includes("eskişehir teknik") || inst.includes("eskisehir teknik")) {
      return "https://www.eskisehir.edu.tr/";
    }
    if (inst.includes("şırnak") || inst.includes("sirnak")) {
      return "https://www.sirnak.edu.tr/";
    }
    if (inst.includes("ondokuz mayıs")) {
      return "https://www.omu.edu.tr/";
    }
    if (inst.includes("necmettin erbakan")) {
      return "https://www.erbakan.edu.tr/";
    }
    if (inst.includes("ankara üniversitesi")) {
      return "https://www.ankara.edu.tr/";
    }
    if (inst.includes("atatürk üniversitesi")) {
      return "https://atauni.edu.tr/";
    }
    if (inst.includes("batman üniversitesi")) {
      return "https://batman.edu.tr/";
    }
    if (inst.includes("istanbul teknik") || inst.includes("itü")) {
      return "https://www.itu.edu.tr/";
    }
    if (inst.includes("üniversite") || inst.includes("universite")) {
      return "https://kariyerkapisi.gov.tr/isealim";
    }

    // 4. Belediyeler
    if (inst.includes("şile") || inst.includes("sile")) {
      return "https://www.sile.bel.tr/";
    }
    if (inst.includes("çeltik") || inst.includes("celtik")) {
      return "https://www.celtik.bel.tr/";
    }
    if (inst.includes("sarıidris") || inst.includes("sariidris")) {
      return "https://www.sariidris.bel.tr/";
    }
    if (inst.includes("eleşkirt") || inst.includes("eleskirt")) {
      return "http://www.eleskirt.bel.tr/";
    }
    if (inst.includes("keşan") || inst.includes("kesan")) {
      return "https://www.kesan.bel.tr/";
    }
    if (inst.includes("ortahisar")) {
      return "https://www.ortahisar.bel.tr/";
    }
    if (inst.includes("belediye") || inst.includes("belediyesi")) {
      return "https://yerelyonetimler.csb.gov.tr/";
    }

    // 5. Resmi Kamu Kariyer Kapısı (Cumhurbaşkanlığı İşe Alım Portalı - Tüm bakanlık ve kamu kurumlarının tek adresi)
    return "https://kariyerkapisi.gov.tr/isealim";
  }

  return originalUrl;
}

export const POST_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  memur: { label: "Memur", color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300" },
  isci: { label: "İşçi", color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300" },
  akademik: { label: "Akademik", color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300" },
  sozlesmeli: { label: "Sözleşmeli", color: "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300" },
  diger: { label: "Diğer", color: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300" },
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
