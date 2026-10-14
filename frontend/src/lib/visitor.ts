/**
 * Benzersiz Ziyaretçi Sayacı (Unique Visitor Tracking)
 * 
 * - İlk ziyarette /api/visitor POST çağrılır ve Supabase sources (slug: visitor-counter) 1 artar.
 * - Aynı cihazda sayfa yenilendiğinde veya tekrar gelindiğinde /api/visitor GET çağrılır.
 * - Çevrimdışı / hata durumunda localStorage / önbelleğe düşer.
 */

const DEVICE_VISITED_KEY = "kpi_device_unique_counted";
const CACHED_COUNT_KEY = "kpi_cached_visitor_count";
const DEFAULT_FALLBACK_COUNT = 1420;

export async function trackUniqueVisitor(): Promise<number> {
  if (typeof window === "undefined") {
    return DEFAULT_FALLBACK_COUNT;
  }

  const hasVisited = localStorage.getItem(DEVICE_VISITED_KEY) === "true";
  const cachedCount = Number(localStorage.getItem(CACHED_COUNT_KEY)) || DEFAULT_FALLBACK_COUNT;

  try {
    // 1. Birincil: Dahili Next.js / Supabase Visitor API
    const res = await fetch("/api/visitor", {
      method: hasVisited ? "GET" : "POST",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const count = Number(data.count);
      if (!isNaN(count) && count > 0) {
        localStorage.setItem(DEVICE_VISITED_KEY, "true");
        localStorage.setItem(CACHED_COUNT_KEY, String(count));
        return count;
      }
    }
  } catch (err) {
    console.warn("Dahili ziyaretçi API bağlantı hatası, yedek kontrol ediliyor:", err);
  }

  try {
    // 2. İkincil Yedek (Failover): Harici yedek sayaç
    const backupUrl = hasVisited
      ? "https://countapi.mileshilliard.com/api/v1/get/kamu-ilan-merkezi-visitors-v1"
      : "https://countapi.mileshilliard.com/api/v1/hit/kamu-ilan-merkezi-visitors-v1";
    const backupRes = await fetch(backupUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (backupRes.ok) {
      const bData = await backupRes.json();
      const bCount = Number(bData.value);
      if (!isNaN(bCount) && bCount > 0) {
        localStorage.setItem(DEVICE_VISITED_KEY, "true");
        localStorage.setItem(CACHED_COUNT_KEY, String(bCount));
        return bCount;
      }
    }
  } catch {
    // Ignore fallback errors
  }

  // API erişilemezse (ad-blocker / çevrimdışı) önbellekteki veya varsayılan sayıyı döndür
  return cachedCount;
}

export function getCachedVisitorCount(): number {
  if (typeof window === "undefined") return DEFAULT_FALLBACK_COUNT;
  return Number(localStorage.getItem(CACHED_COUNT_KEY)) || DEFAULT_FALLBACK_COUNT;
}
