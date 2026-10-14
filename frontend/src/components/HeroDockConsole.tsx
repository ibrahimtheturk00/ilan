"use client";

import { useState, useRef, useEffect } from "react";
import {
  LayoutList,
  Sparkles,
  GraduationCap,
  Heart,
  BarChart3,
  Search,
  X,
  ArrowUpDown,
  Check,
  ChevronDown,
  Target,
} from "lucide-react";
import { useFilters } from "@/hooks/useFilters";
import { usePersonalizedCriteria } from "@/hooks/usePersonalizedCriteria";
import { SortOption } from "@/types";

interface HeroDockConsoleProps {
  activeTab: "all" | "today" | "personalized" | "department" | "favorites" | "report";
  setActiveTab: (tab: "all" | "today" | "personalized" | "department" | "favorites" | "report") => void;
  favoriteCount: number;
  onResetFilters: () => void;
  onSelectToday: () => void;
  onSelectPersonalized?: () => void;
}

const QUICK_SEARCH_TAGS = [
  "Sağlık",
  "Büro Personeli",
  "Mühendis",
  "Bilişim",
  "Öğretim Görevlisi",
  "KPSS Şartsız",
  "Temizlik",
  "Belediye",
];

interface PostTypeOption {
  key: string;
  label: string;
  dotColor: string;
}

const POST_TYPES: PostTypeOption[] = [
  { key: "", label: "Tüm Kadrolar", dotColor: "bg-zinc-400 dark:bg-zinc-500" },
  { key: "memur", label: "Memur", dotColor: "bg-emerald-600 dark:bg-sky-400" },
  { key: "sozlesmeli", label: "Sözleşmeli", dotColor: "bg-teal-600 dark:bg-cyan-400" },
  { key: "isci", label: "İşçi", dotColor: "bg-amber-600 dark:bg-amber-400" },
  { key: "akademik", label: "Akademik", dotColor: "bg-purple-600 dark:bg-indigo-400" },
];

const SORT_OPTIONS: { key: SortOption; label: string; desc: string }[] = [
  { key: "deadline_desc", label: "Son Başvuru (İleri Tarihli)", desc: "En geç bitecek ilanlar önce" },
  { key: "deadline_asc", label: "Kalan Süre (Azalan / Acil)", desc: "Son günü yaklaşan ilanlar önce" },
  { key: "position_desc", label: "Kontenjan (Çoktan Aza)", desc: "En yüksek kadro sayısı önce" },
  { key: "published_desc", label: "En Yeni Eklenenler", desc: "En son yayınlanan ilanlar önce" },
  { key: "title_asc", label: "İlan Başlığı (A → Z)", desc: "Alfabetik artan sıralama" },
  { key: "title_desc", label: "İlan Başlığı (Z → A)", desc: "Alfabetik azalan sıralama" },
];

export function HeroDockConsole({
  activeTab,
  setActiveTab,
  favoriteCount,
  onResetFilters,
  onSelectToday,
  onSelectPersonalized,
}: HeroDockConsoleProps) {
  const { searchQuery, setSearchQuery, postType, setPostType, sortBy, setSortBy } = useFilters();
  const { isConfigured: isPersonalizedConfigured } = usePersonalizedCriteria();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // Ctrl+K veya Cmd+K ile arama odağı
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchFocused(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Dışarı tıklandığında arama kategorilerini ve sıralama menüsünü kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    if (activeTab !== "all" && activeTab !== "today") {
      setActiveTab("all");
    }
  };

  const handleTagClick = (tag: string) => {
    const isSelected = searchQuery.toLowerCase() === tag.toLowerCase();
    setSearchQuery(isSelected ? "" : tag);
    if (activeTab !== "all" && activeTab !== "today") {
      setActiveTab("all");
    }
  };

  const handlePostTypeClick = (typeKey: string) => {
    setPostType(typeKey);
    if (activeTab !== "all" && activeTab !== "today") {
      setActiveTab("all");
    }
  };

  const currentSort = SORT_OPTIONS.find((s) => s.key === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="relative w-full mb-6">
      {/* Ambient Halo Glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-zinc-300/30 via-zinc-200/10 to-zinc-300/30 dark:from-white/10 dark:via-white/5 dark:to-white/10 rounded-[32px] blur-xl opacity-70 pointer-events-none transition-all duration-500" />

      {/* Hero Dock Glass Container */}
      <div className="relative rounded-2xl sm:rounded-[30px] border border-zinc-200/90 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl shadow-xl dark:shadow-2xl p-3 sm:p-5 space-y-3.5 transition-all before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-zinc-300/60 dark:before:via-white/20 before:to-transparent">
        
        {/* 1. Üst Sekme Navigasyonu (Dock Tabs) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto sm:overflow-x-visible no-scrollbar p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-zinc-100/70 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-white/5">
          {/* Tüm İlanlar */}
          <button
            onClick={() => {
              onResetFilters();
              setActiveTab("all");
            }}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === "all"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/80 dark:hover:bg-zinc-800/80"
            }`}
          >
            <LayoutList className="w-4 h-4" />
            <span>Tüm İlanlar</span>
          </button>

          {/* Bugün Eklenenler */}
          <button
            onClick={onSelectToday}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === "today"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/80 dark:hover:bg-zinc-800/80"
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-sky-400" />
            <span>Bugün Eklenenler</span>
            <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-950 border border-emerald-300 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30">
              Yeni
            </span>
          </button>

          {/* Sana Özel */}
          <button
            onClick={() => {
              if (onSelectPersonalized) {
                onSelectPersonalized();
              } else {
                setActiveTab("personalized");
              }
            }}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === "personalized"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/80 dark:hover:bg-zinc-800/80"
            }`}
          >
            <Target
              className={`w-4 h-4 transition-colors ${
                activeTab === "personalized"
                  ? "text-emerald-700 dark:text-sky-400"
                  : "text-emerald-600 dark:text-sky-400"
              }`}
            />
            <span>Sana Özel</span>
            {isPersonalizedConfigured && (
              <span
                className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-sky-400 animate-pulse ml-0.5"
                title="Kişiselleştirilmiş profil aktif"
              />
            )}
          </button>

          {/* Bölümüne Göre Ara */}
          <button
            onClick={() => setActiveTab("department")}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === "department"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/80 dark:hover:bg-zinc-800/80"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Bölümüne Göre Ara</span>
          </button>

          {/* Favorilerim */}
          <button
            onClick={() => setActiveTab("favorites")}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === "favorites"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/80 dark:hover:bg-zinc-800/80"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                activeTab === "favorites"
                  ? "fill-white text-white dark:fill-zinc-900 dark:text-zinc-900"
                  : "text-rose-500"
              }`}
            />
            <span>Favorilerim</span>
            {favoriteCount > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-mono tabular-nums font-bold ${
                  activeTab === "favorites"
                    ? "bg-zinc-700 text-white dark:bg-zinc-200 dark:text-zinc-900"
                    : "bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300"
                }`}
              >
                {favoriteCount}
              </span>
            )}
          </button>

          {/* İstihdam Raporu */}
          <button
            onClick={() => setActiveTab("report")}
            type="button"
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-lg sm:rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${
              activeTab === "report"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-white/80 dark:hover:bg-zinc-800/80"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>İstihdam Raporu</span>
          </button>
        </div>

        {/* 2. Arama Çubuğu (Search Bar) & Tıklandığında Açılan Kategoriler */}
        <div ref={searchContainerRef} className="relative w-full space-y-2">
          <div className="relative w-full group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onFocus={handleSearchFocus}
              onClick={handleSearchFocus}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== "all" && activeTab !== "today") {
                  setActiveTab("all");
                }
              }}
              placeholder="Unvan, kurum veya şehir ara (örn. Mühendis, Büro, Sağlık, İTÜ, Ankara)..."
              className="w-full pl-10 pr-20 py-3 sm:py-3.5 text-sm sm:text-base bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 rounded-xl sm:rounded-2xl placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/20 dark:focus:ring-white/10 focus:border-zinc-400 dark:focus:border-zinc-600 transition-all text-zinc-900 dark:text-zinc-100 shadow-inner"
            />

            <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    inputRef.current?.focus();
                  }}
                  className="p-1 rounded text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors"
                  title="Aramayı Temizle"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <div className="hidden sm:flex items-center gap-0.5 px-2 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800/80 border border-zinc-300/70 dark:border-zinc-700 text-xs font-mono text-zinc-500 dark:text-zinc-400 select-none pointer-events-none">
                  <span>Ctrl</span>
                  <span>K</span>
                </div>
              )}
            </div>
          </div>

          {/* Sadece arama çubuğuna tıklandığında/odaklanıldığında açılan kategoriler */}
          {isSearchFocused && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-sm py-1.5 px-1.5 rounded-xl bg-zinc-100/60 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-white/5 transition-all animate-fadeIn">
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 shrink-0 pl-1">
                Kategoriler:
              </span>
              {QUICK_SEARCH_TAGS.map((tag) => {
                const isSelected = searchQuery.toLowerCase() === tag.toLowerCase();
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagClick(tag)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors border ${
                      isSelected
                        ? "bg-emerald-700 text-white border-emerald-700 dark:bg-sky-500 dark:text-zinc-950 dark:border-sky-400 font-semibold shadow-xs"
                        : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Kadro Filtreleri (Tüm Kadrolar, Memur, Sözleşmeli, İşçi, Akademik) & Sıralama */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-zinc-200/60 dark:border-white/5">
          {/* Sol: Kadro Türü Butonları */}
          <div className="flex items-center gap-1.5 overflow-x-auto sm:overflow-x-visible py-0.5 no-scrollbar flex-1">
            {POST_TYPES.map((item) => {
              const isSelected = postType === item.key;
              return (
                <button
                  key={item.key || "all"}
                  type="button"
                  onClick={() => handlePostTypeClick(item.key)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg sm:rounded-xl text-sm font-semibold whitespace-nowrap transition-colors border shrink-0 ${
                    isSelected
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs"
                      : "bg-white/80 dark:bg-zinc-900/80 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
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
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg sm:rounded-xl text-sm font-semibold border transition-colors ${
                isSortOpen
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-zinc-900 dark:border-zinc-100 shadow-xs"
                  : "bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
              title="Sıralama Seçenekleri"
            >
              <ArrowUpDown className="w-4 h-4 text-zinc-500" />
              <span className="hidden md:inline">Sırala:</span>
              <span className="font-bold truncate max-w-[130px] sm:max-w-[160px]">
                {currentSort.label}
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isSortOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Açılır Sıralama Menüsü */}
            {isSortOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-30 py-1.5 animate-fadeIn overflow-hidden">
                <div className="px-3.5 py-1.5 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-700/60">
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
                          if (activeTab !== "all" && activeTab !== "today") {
                            setActiveTab("all");
                          }
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between transition-colors ${
                          isActive
                            ? "bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-bold"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/60"
                        }`}
                      >
                        <div>
                          <div className="leading-tight">{opt.label}</div>
                          <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 font-normal">
                            {opt.desc}
                          </div>
                        </div>
                        {isActive && (
                          <Check className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0 ml-2" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
