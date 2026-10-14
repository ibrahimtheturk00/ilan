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
    activeColor: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100",
    dotColor: "bg-zinc-400 dark:bg-zinc-600",
  },
  {
    key: "memur",
    label: "Memur",
    activeColor: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100",
    dotColor: "bg-emerald-600 dark:bg-sky-400",
  },
  {
    key: "sozlesmeli",
    label: "Sözleşmeli",
    activeColor: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100",
    dotColor: "bg-blue-600 dark:bg-indigo-400",
  },
  {
    key: "isci",
    label: "İşçi",
    activeColor: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100",
    dotColor: "bg-amber-500",
  },
  {
    key: "akademik",
    label: "Akademik",
    activeColor: "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100",
    dotColor: "bg-purple-500",
  },
];

const SORT_OPTIONS: { key: SortOption; label: string; desc: string }[] = [
  { key: "deadline_desc", label: "Son Başvuru (İleri Tarihli)", desc: "En geç bitecek ilanlar önce" },
  { key: "deadline_asc", label: "Kalan Süre (Azalan / Acil)", desc: "Son günü yaklaşan ilanlar önce" },
  { key: "position_desc", label: "Kontenjan (Çoktan Aza)", desc: "En yüksek kadro sayısı önce" },
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
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
      {/* Sol / Orta: Kadro Türü Butonları */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar flex-1">
        {POST_TYPES.map((item) => {
          const isSelected = postType === item.key;
          return (
            <button
              key={item.key || "all"}
              type="button"
              onClick={() => setPostType(item.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border shrink-0 ${
                isSelected
                  ? item.activeColor
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isSelected ? "bg-white dark:bg-zinc-900" : item.dotColor
                }`}
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Sağ: Sıralama Butonu & Açılır Menü */}
      <div className="relative shrink-0 self-end sm:self-auto" ref={sortRef}>
        <button
          type="button"
          onClick={() => setIsSortOpen(!isSortOpen)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            isSortOpen
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs"
              : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
          title="Sıralama Seçenekleri"
        >
          <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500" />
          <span className="hidden md:inline">Sırala:</span>
          <span className="font-bold truncate max-w-[130px] sm:max-w-[160px]">{currentSort.label}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Açılır Sıralama Menüsü */}
        {isSortOpen && (
          <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl z-30 py-1.5 animate-fadeIn overflow-hidden">
            <div className="px-3 py-1 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-700/60">
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
                    className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/60"
                    }`}
                  >
                    <div>
                      <div className="leading-tight">{opt.label}</div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 font-normal">
                        {opt.desc}
                      </div>
                    </div>
                    {isActive && <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-100 shrink-0 ml-2" />}
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
