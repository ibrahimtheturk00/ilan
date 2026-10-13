"use client";

import { useEffect, useState } from "react";
import { useFilters } from "@/hooks/useFilters";
import { POST_TYPE_LABELS, CATEGORY_LABELS } from "@/lib/utils";
import { fetchCityJobCounts } from "@/lib/supabase";
import {
  Filter,
  RotateCcw,
  MapPin,
  Clock,
  Award,
  GraduationCap,
  Navigation,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";

const CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin",
  "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa",
  "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta",
  "Mersin", "İstanbul", "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir",
  "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla",
  "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt",
  "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak",
  "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman",
  "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

const KPSS_OPTIONS = [
  { key: "", label: "Tümü" },
  { key: "p3", label: "KPSS P3 (Lisans)" },
  { key: "p93", label: "KPSS P93 (Önlisans)" },
  { key: "p94", label: "KPSS P94 (Ortaöğretim)" },
  { key: "sartsiz", label: "KPSS Şartsız" },
];

const EDU_OPTIONS = [
  { key: "", label: "Tümü" },
  { key: "lisans", label: "Lisans" },
  { key: "onlisans", label: "Önlisans" },
  { key: "ortaogretim", label: "Ortaöğretim / Lise" },
];

export function FilterSidebar() {
  const {
    city,
    postType,
    category,
    onlyActive,
    kpssType,
    educationLevel,
    onlyUrgent,
    onlyToday,
    setCity,
    setPostType,
    setCategory,
    setOnlyActive,
    setKpssType,
    setEducationLevel,
    setOnlyUrgent,
    setOnlyToday,
    resetFilters,
  } = useFilters();

  const [cityCounts, setCityCounts] = useState<Record<string, number>>({});
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCityJobCounts().then((counts) => {
      setCityCounts(counts);
    });
  }, []);

  const hasActiveFilters = Boolean(
    city || postType || category || !onlyActive || kpssType || educationLevel || onlyUrgent || onlyToday
  );

  // GPS ile Konum & Şehir Tespiti
  const handleDetectLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      alert("Tarayıcınız konum servisini desteklemiyor.");
      return;
    }

    setIsLocating(true);
    setLocationMessage("Konumunuz alınıyor...");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          // OpenStreetMap Reverse Geocode
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          if (res.ok) {
            const data = await res.json();
            const province =
              data.address?.province ||
              data.address?.city ||
              data.address?.state ||
              "";

            // 81 il listesiyle eşleştir
            const matchedCity = CITIES.find((c) =>
              province.toLocaleLowerCase("tr-TR").includes(c.toLocaleLowerCase("tr-TR"))
            );

            if (matchedCity) {
              setCity(matchedCity);
              setLocationMessage(`Konumunuz tespit edildi: ${matchedCity}`);
              setTimeout(() => setLocationMessage(null), 3000);
            } else {
              setLocationMessage("Şehir eşleştirilemedi.");
              setTimeout(() => setLocationMessage(null), 2500);
            }
          }
        } catch {
          setLocationMessage("Konum servisinden yanıt alınamadı.");
          setTimeout(() => setLocationMessage(null), 2500);
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setIsLocating(false);
        setLocationMessage("Konum izni reddedildi.");
        setTimeout(() => setLocationMessage(null), 2500);
      },
      { timeout: 10000 }
    );
  };

  return (
    <aside className="w-full lg:w-64 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm space-y-6 transition-colors">
      {/* Üst Başlık & Sıfırla */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-sm">
          <Filter className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          <span>Filtreler</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Temizle</span>
          </button>
        )}
      </div>

      {/* Hızlı Filtre Butonları (Bugün Eklenenler & Son 3 Gün Acil) */}
      <div className="space-y-2">
        {/* Bugün Eklenenler */}
        <button
          type="button"
          onClick={() => setOnlyToday(!onlyToday)}
          className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
            onlyToday
              ? "bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-600/20"
              : "bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100/80"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${onlyToday ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
            <span>Bugün Eklenen İlanlar</span>
          </div>
          {onlyToday && <Check className="w-4 h-4 text-white" />}
        </button>

        {/* Son 3 Gün Acil Başvuru Alarmı */}
        <button
          type="button"
          onClick={() => setOnlyUrgent(!onlyUrgent)}
          className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
            onlyUrgent
              ? "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20"
              : "bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50 hover:bg-rose-100/80"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${onlyUrgent ? "text-white" : "text-rose-600 dark:text-rose-400"}`} />
            <span>⏰ Son 3 Gün! (Acil)</span>
          </div>
          {onlyUrgent && <Check className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* Şehir Seçimi & GPS Butonu */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Şehir / İl
          </label>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            title="GPS ile yakınımdaki ilanları filtrele"
          >
            {isLocating ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Navigation className="w-3 h-3" />
            )}
            <span>Konumumu Bul</span>
          </button>
        </div>

        {locationMessage && (
          <div className="text-[11px] p-2 rounded-lg bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
            {locationMessage}
          </div>
        )}

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full text-xs py-2 px-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
        >
          <option value="">
            Tüm Türkiye {cityCounts["Tüm Türkiye"] ? `(${cityCounts["Tüm Türkiye"]})` : ""}
          </option>
          {CITIES.map((c) => {
            const count = cityCounts[c] || 0;
            return (
              <option key={c} value={c}>
                {c} {count > 0 ? `(${count})` : ""}
              </option>
            );
          })}
        </select>
      </div>

      {/* KPSS Puan Türü Filtresi */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>KPSS Puan Türü</span>
        </label>
        <div className="space-y-1">
          {KPSS_OPTIONS.map((opt) => {
            const isSelected = (kpssType || "") === opt.key;
            return (
              <button
                key={opt.key || "all"}
                type="button"
                onClick={() => setKpssType(opt.key)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Eğitim Düzeyi Filtresi */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <GraduationCap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Eğitim Düzeyi</span>
        </label>
        <div className="space-y-1">
          {EDU_OPTIONS.map((opt) => {
            const isSelected = (educationLevel || "") === opt.key;
            return (
              <button
                key={opt.key || "all"}
                type="button"
                onClick={() => setEducationLevel(opt.key)}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kadro Türü */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Kadro Türü
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setPostType("")}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
              !postType
                ? "bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
          >
            Tüm Kadrolar
          </button>
          {Object.entries(POST_TYPE_LABELS).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setPostType(postType === key ? "" : key)}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                postType === key
                  ? "bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              }`}
            >
              <span>{info.label}</span>
              {postType === key && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Meslek Alanı / Kategori */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Meslek / Alan
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setCategory("")}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
              !category
                ? "bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
          >
            Tüm Alanlar
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setCategory(category === key ? "" : key)}
              className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                category === key
                  ? "bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              }`}
            >
              <span>{info.label}</span>
              {category === key && <span className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Sadece Aktif İlanlar */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300 dark:border-slate-600 dark:bg-slate-700"
          />
          <span>Sadece Yayında Olanlar</span>
        </label>
      </div>
    </aside>
  );
}
