import {
  GraduationCap,
  Building2,
  Landmark,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Scale,
  Briefcase,
  Trees,
  Hammer,
  Palette,
  LucideIcon,
} from "lucide-react";

export interface InstitutionVisualInfo {
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  categoryLabel: string;
}

export function detectInstitutionVisual(institution?: string | null): InstitutionVisualInfo {
  if (!institution || !institution.trim()) {
    return {
      icon: Building2,
      iconColor: "text-slate-600 dark:text-slate-400",
      bgColor: "bg-slate-100 dark:bg-slate-800",
      borderColor: "border-slate-200 dark:border-slate-700",
      categoryLabel: "Kamu Kurumu",
    };
  }

  const norm = institution
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/i̇/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u");

  // Üniversiteler ve Akademik Kurumlar
  if (norm.includes("universite") || norm.includes("rektorluk") || norm.includes("fakulte") || norm.includes("enstitu")) {
    return {
      icon: GraduationCap,
      iconColor: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/40",
      borderColor: "border-purple-200/80 dark:border-purple-800/60",
      categoryLabel: "Üniversite",
    };
  }

  // Belediyeler & Yerel Yönetimler
  if (norm.includes("belediye") || norm.includes("belediyesi")) {
    return {
      icon: Landmark,
      iconColor: "text-sky-600 dark:text-sky-400",
      bgColor: "bg-sky-50 dark:bg-sky-950/40",
      borderColor: "border-sky-200/80 dark:border-sky-800/60",
      categoryLabel: "Belediye",
    };
  }

  // Valilik & Kaymakamlık & İl Özel İdare
  if (norm.includes("valilik") || norm.includes("kaymakamlik") || norm.includes("il ozel idare")) {
    return {
      icon: Landmark,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/40",
      borderColor: "border-indigo-200/80 dark:border-indigo-800/60",
      categoryLabel: "Valilik / Mülki İdare",
    };
  }

  // Sağlık Kurumları & Hastaneler
  if (norm.includes("saglik") || norm.includes("hastane") || norm.includes("tip") || norm.includes("hemsire")) {
    return {
      icon: Stethoscope,
      iconColor: "text-rose-600 dark:text-rose-400",
      bgColor: "bg-rose-50 dark:bg-rose-950/40",
      borderColor: "border-rose-200/80 dark:border-rose-800/60",
      categoryLabel: "Sağlık Kurumu",
    };
  }

  // Adalet & Hukuk Kurumları
  if (norm.includes("adalet") || norm.includes("mahkeme") || norm.includes("yargitay") || norm.includes("danistay") || norm.includes("baro")) {
    return {
      icon: Scale,
      iconColor: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950/40",
      borderColor: "border-amber-200/80 dark:border-amber-800/60",
      categoryLabel: "Adalet / Hukuk",
    };
  }

  // Askeri, Güvenlik, Polis & Savunma
  if (norm.includes("milli savunma") || norm.includes("msb") || norm.includes("jandarma") || norm.includes("emniyet") || norm.includes("polis") || norm.includes("sahil guvenlik")) {
    return {
      icon: ShieldCheck,
      iconColor: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/40",
      borderColor: "border-emerald-200/80 dark:border-emerald-800/60",
      categoryLabel: "Savunma & Güvenlik",
    };
  }

  // İtfaiye & Afet & Zabıta
  if (norm.includes("afad") || norm.includes("itfaiye") || norm.includes("zabita")) {
    return {
      icon: ShieldAlert,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/40",
      borderColor: "border-orange-200/80 dark:border-orange-800/60",
      categoryLabel: "Afet / Güvenlik",
    };
  }

  // Orman, Tarım & Hayvancılık
  if (norm.includes("orman") || norm.includes("tarim") || norm.includes("doga") || norm.includes("dhi") || norm.includes("dsi")) {
    return {
      icon: Trees,
      iconColor: "text-teal-600 dark:text-teal-400",
      bgColor: "bg-teal-50 dark:bg-teal-950/40",
      borderColor: "border-teal-200/80 dark:border-teal-800/60",
      categoryLabel: "Tarım & Orman",
    };
  }

  // Kültür, Sanat, Turizm
  if (norm.includes("kultur") || norm.includes("turizm") || norm.includes("muze") || norm.includes("tiyatro") || norm.includes("opera")) {
    return {
      icon: Palette,
      iconColor: "text-fuchsia-600 dark:text-fuchsia-400",
      bgColor: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
      borderColor: "border-fuchsia-200/80 dark:border-fuchsia-800/60",
      categoryLabel: "Kültür & Sanat",
    };
  }

  // Bakanlıklar (Genel)
  if (norm.includes("bakanlik") || norm.includes("bakanligi") || norm.includes("baskanligi") || norm.includes("baskanlik")) {
    return {
      icon: Landmark,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/40",
      borderColor: "border-blue-200/80 dark:border-blue-800/60",
      categoryLabel: "Bakanlık / Başkanlık",
    };
  }

  // Varsayılan Kamu Kurumu
  return {
    icon: Building2,
    iconColor: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-100 dark:bg-slate-800",
    borderColor: "border-slate-200 dark:border-slate-700",
    categoryLabel: "Kamu Kurumu",
  };
}
