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
  if (!originalUrl) return "https://kamuilan.sbb.gov.tr/";
  const inst = (institution || "").toLowerCase();

  // Eğer SBB'nin süresi dolan geçici oturum linki ise (ilanDetay.aspx?kod=...)
  if (originalUrl.includes("kamuilan.sbb.gov.tr/ilanDetay.aspx")) {
    if (inst.includes("milli savunma") || inst.includes("millî savunma") || inst.includes("msb")) {
      return "https://personeltemin.msb.gov.tr/";
    }
    if (inst.includes("jandarma")) {
      return "https://vatandas.jandarma.gov.tr/ptm/giris";
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
    if (inst.includes("tmsf")) {
      return "https://www.tmsf.org.tr/";
    }
    if (inst.includes("bddk")) {
      return "https://www.bddk.org.tr/";
    }
    if (inst.includes("vakıflar")) {
      return "https://www.vgm.gov.tr/";
    }
    // Genel güvenli SBB ana portal sayfası
    return "https://kamuilan.sbb.gov.tr/";
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
