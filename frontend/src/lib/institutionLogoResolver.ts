import rulesData from "./institutionLogoData.json";

export function normalizeInstitutionName(str: string): string {
  return (str || "")
    .toLowerCase()
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

  // 1. SBB official logos (exact or substring match)
  for (const s of rulesData.sbbEntries) {
    if (s.file === "BEL2.png") continue;
    if (n.includes(s.key) || s.key.includes(n)) {
      return `/logos/${s.file}`;
    }
  }

  // 2. Extra major government rules
  for (const rule of rulesData.extraRules) {
    if (rule.file === "BEL2.png") continue;
    for (const k of rule.keys) {
      if (n.includes(k)) {
        return `/logos/${rule.file}`;
      }
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
    return "/logos/BEL2.png";
  }

  return null;
}
