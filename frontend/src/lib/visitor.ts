/**
 * Benzersiz Ziyaretçi Sayacı (Unique Visitor Tracking)
 * 
 * - İlk ziyarette /hit/ endpoint'i çağrılır ve sayaç 1 artar.
 * - Aynı cihazda sayfa yenilendiğinde veya tekrar gelindiğinde /get/ endpoint'i çağrılır (artmaz, sadece güncel sayıyı okur).
 * - CORS desteklidir (Access-Control-Allow-Origin: *).
 * - Çevrimdışı veya ad-blocker durumunda localStorage / varsayılan sayıya düşer.
 */

const COUNTER_KEY = "kamu-ilan-merkezi-visitors-v1";
const DEVICE_VISITED_KEY = "kpi_device_unique_counted";
const CACHED_COUNT_KEY = "kpi_cached_visitor_count";

export async function trackUniqueVisitor(): Promise<number> {
  if (typeof window === "undefined") {
    return 1;
  }

  const hasVisited = localStorage.getItem(DEVICE_VISITED_KEY) === "true";
  const cachedCount = Number(localStorage.getItem(CACHED_COUNT_KEY)) || 1;

  try {
    // Yeni tekil cihaz ise /hit/ ile artır, daha önce sayılmışsa sadece /get/ ile oku
    const endpoint = hasVisited
      ? `https://countapi.mileshilliard.com/api/v1/get/${COUNTER_KEY}`
      : `https://countapi.mileshilliard.com/api/v1/hit/${COUNTER_KEY}`;

    const res = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      const count = Number(data.value);
      if (!isNaN(count) && count > 0) {
        localStorage.setItem(DEVICE_VISITED_KEY, "true");
        localStorage.setItem(CACHED_COUNT_KEY, String(count));
        return count;
      }
    }
  } catch (err) {
    console.warn("Ziyaretçi sayacı API bağlantı hatası, önbellek kullanılıyor:", err);
  }

  // API erişilemezse (ad-blocker vb.) önbellekteki veya varsayılan sayıyı döndür
  return cachedCount;
}

export function getCachedVisitorCount(): number {
  if (typeof window === "undefined") return 1;
  return Number(localStorage.getItem(CACHED_COUNT_KEY)) || 1;
}
