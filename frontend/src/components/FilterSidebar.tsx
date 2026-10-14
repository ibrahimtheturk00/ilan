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

export const CITIES = [
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
export const TURKEY_CITIES = CITIES;

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
    <aside className="w-full lg:w-64 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-4 space-y-5 transition-all sticky top-20 shadow-sm">
      {/* Üst Başlık & Sıfırla */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-200 font-bold text-sm">
          <Filter className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
          <span>Filtreler</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Temizle</span>
          </button>
        )}
      </div>

      {/* Hızlı Filtre Butonları (Bugün Eklenenler & Son 3 Gün) */}
      <div className="space-y-1.5">
        {/* Bugün Eklenenler */}
        <button
          type="button"
          onClick={() => setOnlyToday(!onlyToday)}
          className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-sm font-semibold transition-colors ${
            onlyToday
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100"
              : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${onlyToday ? "text-white dark:text-zinc-900" : "text-emerald-600 dark:text-emerald-400"}`} />
            <span>Bugün Eklenenler</span>
          </div>
          {onlyToday && <Check className="w-4 h-4 text-white dark:text-zinc-900" />}
        </button>

        {/* Son 3 Gün Filtresi (Emoji ve Ünlemsiz) */}
        <button
          type="button"
          onClick={() => setOnlyUrgent(!onlyUrgent)}
          className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-sm font-semibold transition-colors ${
            onlyUrgent
              ? "bg-rose-600 text-white border-rose-700"
              : "bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${onlyUrgent ? "text-white" : "text-rose-600 dark:text-rose-400"}`} />
            <span>Son 3 Gün</span>
          </div>
          {onlyUrgent && <Check className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* Şehir Seçimi & GPS Butonu */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
            Şehir / İl
          </label>
          <button
            type="button"
            onClick={handleDetectLocation}
            disabled={isLocating}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-sky-400 hover:text-emerald-800 dark:hover:text-sky-300 transition-colors"
            title="GPS ile yakınımdaki ilanları filtrele"
          >
            {isLocating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span>Konumumu Bul</span>
          </button>
        </div>

        {locationMessage && (
          <div className="text-xs p-2 rounded-lg bg-emerald-50 text-emerald-950 border border-emerald-300/80 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30">
            {locationMessage}
          </div>
        )}

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full text-sm py-2 px-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
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
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-emerald-600 dark:text-sky-400" />
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
                className={`w-full text-left text-sm px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-emerald-50 text-emerald-950 border border-emerald-300/80 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-sky-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Eğitim Düzeyi Filtresi */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4 text-teal-600 dark:text-cyan-400" />
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
                className={`w-full text-left text-sm px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                  isSelected
                    ? "bg-teal-50 text-teal-950 border border-teal-300/80 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-400/30 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                }`}
              >
                <span>{opt.label}</span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kadro Türü */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Kadro Türü
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setPostType("")}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !postType
                ? "bg-emerald-50 text-emerald-950 border border-emerald-300/80 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
          >
            Tüm Kadrolar
          </button>
          {Object.entries(POST_TYPE_LABELS).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setPostType(postType === key ? "" : key)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                postType === key
                  ? "bg-emerald-50 text-emerald-950 border border-emerald-300/80 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              }`}
            >
              <span>{info.label}</span>
              {postType === key && <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-sky-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Meslek Alanı / Kategori */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Meslek / Alan
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setCategory("")}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !category
                ? "bg-emerald-50 text-emerald-950 border border-emerald-300/80 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30 font-bold"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
            }`}
          >
            Tüm Alanlar
          </button>
          {Object.entries(CATEGORY_LABELS).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setCategory(category === key ? "" : key)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                category === key
                  ? "bg-emerald-50 text-emerald-950 border border-emerald-300/80 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              }`}
            >
              <span>{info.label}</span>
              {category === key && <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-sky-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Sadece Aktif İlanlar */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60">
        <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 dark:text-sky-500 focus:ring-emerald-500 dark:focus:ring-sky-400 border-slate-300 dark:border-slate-600 dark:bg-slate-700"
          />
          <span>Sadece Yayında Olanlar</span>
        </label>
      </div>
    </aside>
  );
}
