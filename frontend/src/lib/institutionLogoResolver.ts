import rulesData from "./institutionLogoData.json";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const EXISTING_LOGOS = new Set([
  "10065.png","10090.png","10135.png","15.png","165.png","213.png","232.png","240.png","250.png",
  "289.png","300.png","376.png","381.png","383.png","389.png","398.png","399.png","400.png",
  "405.png","407.png","408.png","415.png","420.png","425.png","440.png","485.png","495.png",
  "505.png","530.png","535.png","541.png","543.png","545.png","554.png","555.png","562.png",
  "569.png","571.png","588.png","592.png","594.png","596.png","601.png","603.png","604.png",
  "607.png","608.png","615.png","804.png","808.png","813.png","A1032.png","A1034.png","A1041.png",
  "A1042.png","A1055.png","BEL2.png","adalet.png","ankara.png","aydin.png","bakircay.png",
  "bursa.png","celtik.png","csb.png","denizli.png","didim.png","edirne.png","eleskirt.png",
  "gop.png","gsb.png","hmb.png","igdir.png","iskur.png","istanbul.png","kesan.png","kik.png",
  "konya.png","ktb.png","kusadasi.png","malazgirt.png","meb.png","millisaraylar.png","msb.png",
  "ortahisar.png","osmangazi.png","pursaklar.png","rize.png","saglik.png","sariidris.png",
  "sgk.png","sile.png","tarimorman.png","tbb.png","yenimahalle.png","zonguldak.png"
]);

export function normalizeInstitutionName(str: string): string {
  return (str || "")
    .toLowerCase()
    .replace(/[îï]/g, "i")
    .replace(/[âä]/g, "a")
    .replace(/[ûü]/g, "u")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/i̇/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolveInstitutionLogo(name?: string | null): string | null {
  if (!name || !name.trim()) return null;
  const n = normalizeInstitutionName(name);

  // 1. Extra specific rules FIRST (matches specific municipalities like Şile, Rize, Kuşadası, Pursaklar and specific ministries)
  for (const rule of rulesData.extraRules) {
    if (rule.file === "BEL2.png") continue;
    for (const k of rule.keys) {
      if (n.includes(k) && EXISTING_LOGOS.has(rule.file)) {
        return `${BASE_PATH}/logos/${rule.file}`;
      }
    }
  }

  // 2. SBB official logos (exact or substring match for universities, agencies)
  for (const s of rulesData.sbbEntries) {
    if (s.file === "BEL2.png") continue;
    if ((n.includes(s.key) || s.key.includes(n)) && EXISTING_LOGOS.has(s.file)) {
      return `${BASE_PATH}/logos/${s.file}`;
    }
  }

  // 3. General municipal / local company fallback
  if (
    n.includes("belediye") ||
    n.includes("belediyesi") ||
    n.includes("personel as") ||
    n.includes("belka") ||
    n.includes("ltd sti")
  ) {
    return `${BASE_PATH}/logos/BEL2.png`;
  }

  return null;
}
