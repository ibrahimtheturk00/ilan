"use client";

import { useState, useRef, useEffect } from "react";
import { useFilters } from "@/hooks/useFilters";
import { SortOption } from "@/types";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";

interface PostTypeOption {
  key: string;
  label: string;
  activeColor: string;
  dotColor: string;
}

const POST_TYPES: PostTypeOption[] = [
  {
    key: "",
    label: "Tüm Kadrolar",
    activeColor: "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm border-transparent",
    dotColor: "bg-slate-400 dark:bg-slate-600",
  },
  {
    key: "memur",
    label: "Memur",
    activeColor: "bg-sky-600 text-white dark:bg-sky-500 dark:text-white shadow-sm shadow-sky-500/20 border-transparent",
    dotColor: "bg-sky-500",
  },
  {
    key: "sozlesmeli",
    label: "Sözleşmeli",
    activeColor: "bg-teal-600 text-white dark:bg-teal-500 dark:text-white shadow-sm shadow-teal-500/20 border-transparent",
    dotColor: "bg-teal-500",
  },
  {
    key: "isci",
    label: "İşçi",
    activeColor: "bg-amber-600 text-white dark:bg-amber-500 dark:text-white shadow-sm shadow-amber-500/20 border-transparent",
    dotColor: "bg-amber-500",
  },
  {
    key: "akademik",
    label: "Akademik",
    activeColor: "bg-purple-600 text-white dark:bg-purple-500 dark:text-white shadow-sm shadow-purple-500/20 border-transparent",
    dotColor: "bg-purple-500",
  },
];

const SORT_OPTIONS: { key: SortOption; label: string; desc: string }[] = [
  { key: "deadline_desc", label: "Son Başvuru (İleri Tarihli)", desc: "En geç bitecek ilanlar önce" },
  { key: "deadline_asc", label: "Kalan Süre (Azalan / Acil)", desc: "Son günü yaklaşan ilanlar önce" },
  { key: "published_desc", label: "En Yeni Eklenenler", desc: "En son yayınlanan ilanlar önce" },
  { key: "title_asc", label: "İlan Başlığı (A → Z)", desc: "Alfabetik artan sıralama" },
  { key: "title_desc", label: "İlan Başlığı (Z → A)", desc: "Alfabetik azalan sıralama" },
];

export function PostTypeQuickFilter() {
  const { postType, setPostType, sortBy, setSortBy } = useFilters();
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklandığında menüyü kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentSort = SORT_OPTIONS.find((s) => s.key === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 pt-1">
      {/* Sol / Orta: Kadro Türü Butonları */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-0.5 no-scrollbar flex-1">
        {POST_TYPES.map((item) => {
          const isSelected = postType === item.key;
          return (
            <button
              key={item.key || "all"}
              type="button"
              onClick={() => setPostType(item.key)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all border shrink-0 ${
                isSelected
                  ? item.activeColor
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full transition-colors ${
                  isSelected ? "bg-white dark:bg-slate-900" : item.dotColor
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sağ: Sıralama Butonu & Açılır Menü */}
      <div className="relative shrink-0" ref={sortRef}>
        <button
          type="button"
          onClick={() => setIsSortOpen(!isSortOpen)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
            isSortOpen
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-sm"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60"
          }`}
          title="Sıralama Seçenekleri"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span className="hidden md:inline">Sırala:</span>
          <span className="font-bold truncate max-w-[130px] sm:max-w-[160px]">{currentSort.label}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Açılır Sıralama Menüsü */}
        {isSortOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-30 py-2 animate-fadeIn overflow-hidden">
            <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/60">
              İlanları Sırala
            </div>
            <div className="p-1 space-y-0.5">
              {SORT_OPTIONS.map((opt) => {
                const isActive = sortBy === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.key);
                      setIsSortOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      isActive
                        ? "bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-bold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                    }`}
                  >
                    <div>
                      <div className="leading-tight">{opt.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-normal">
                        {opt.desc}
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 ml-2" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
