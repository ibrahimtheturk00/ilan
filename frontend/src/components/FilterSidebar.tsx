"use client";

import { useFilters } from "@/hooks/useFilters";
import { POST_TYPE_LABELS, CATEGORY_LABELS } from "@/lib/utils";
import { Filter, RotateCcw } from "lucide-react";

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

export function FilterSidebar() {
  const {
    city,
    postType,
    category,
    onlyActive,
    setCity,
    setPostType,
    setCategory,
    setOnlyActive,
    resetFilters,
  } = useFilters();

  const hasActiveFilters = Boolean(city || postType || category || !onlyActive);

  return (
    <aside className="w-full lg:w-64 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
          <Filter className="w-4 h-4 text-brand-600" />
          <span>Filtreler</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Temizle</span>
          </button>
        )}
      </div>

      {/* Şehir Seçimi */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Şehir / İl
        </label>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
        >
          <option value="">Tüm Türkiye</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Kadro Türü */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Kadro Türü
        </label>
        <div className="space-y-1.5">
          <button
            onClick={() => setPostType("")}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
              !postType
                ? "bg-brand-50 text-brand-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50"
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
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{info.label}</span>
              {postType === key && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Meslek Alanı / Kategori */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-2">
          Meslek / Alan
        </label>
        <div className="space-y-1.5">
          <button
            onClick={() => setCategory("")}
            className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
              !category
                ? "bg-brand-50 text-brand-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50"
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
                  ? "bg-brand-50 text-brand-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{info.label}</span>
              {category === key && <span className="w-1.5 h-1.5 rounded-full bg-brand-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Sadece Aktif İlanlar */}
      <div className="pt-2 border-t border-slate-100">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
            className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
          />
          <span>Sadece Yayında Olanlar</span>
        </label>
      </div>
    </aside>
  );
}
