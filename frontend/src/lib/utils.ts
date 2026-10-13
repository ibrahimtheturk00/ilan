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

export function getDaysRemaining(deadlineStr: string | null | undefined): {
  days: number | null;
  text: string;
  isExpired: boolean;
  isUrgent: boolean;
} {
  if (!deadlineStr) {
    return { days: null, text: "Süresiz / Belirtilmemiş", isExpired: false, isUrgent: false };
  }

  const deadline = new Date(deadlineStr);
  const now = new Date();
  // Gece yarısı karşılaştırması
  deadline.setHours(23, 59, 59, 999);
  now.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: diffDays, text: "Süresi Doldu", isExpired: true, isUrgent: false };
  } else if (diffDays === 0) {
    return { days: 0, text: "Bugün Son Gün!", isExpired: false, isUrgent: true };
  } else if (diffDays <= 3) {
    return { days: diffDays, text: `${diffDays} gün kaldı (Acil)`, isExpired: false, isUrgent: true };
  } else {
    return { days: diffDays, text: `${diffDays} gün kaldı`, isExpired: false, isUrgent: false };
  }
}

export const POST_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  memur: { label: "Memur", color: "bg-blue-100 text-blue-800 border-blue-200" },
  isci: { label: "İşçi", color: "bg-amber-100 text-amber-800 border-amber-200" },
  akademik: { label: "Akademik", color: "bg-purple-100 text-purple-800 border-purple-200" },
  sozlesmeli: { label: "Sözleşmeli", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  diger: { label: "Diğer", color: "bg-slate-100 text-slate-800 border-slate-200" },
};

export const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  bilisim: { label: "Bilişim & Yazılım", icon: "Code" },
  saglik: { label: "Sağlık", icon: "HeartPulse" },
  egitim: { label: "Eğitim", icon: "GraduationCap" },
  muhendislik: { label: "Mühendislik & Teknik", icon: "Wrench" },
  hukuk: { label: "Hukuk & Adalet", icon: "Scale" },
  maliye: { label: "Maliye & Muhasebe", icon: "Coins" },
  diger: { label: "Genel / Diğer", icon: "Briefcase" },
};
