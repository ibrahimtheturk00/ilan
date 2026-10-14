"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { PostTypeQuickFilter } from "@/components/PostTypeQuickFilter";
import { FilterSidebar } from "@/components/FilterSidebar";
import { JobList } from "@/components/JobList";
import { DepartmentSearch } from "@/components/DepartmentSearch";
import { FavoritesView } from "@/components/FavoritesView";
import { EmploymentReport } from "@/components/EmploymentReport";
import { useFavorites } from "@/hooks/useFavorites";
import { useFilters } from "@/hooks/useFilters";
import { LayoutList, GraduationCap, Heart, BarChart3, Sparkles } from "lucide-react";

export default function HomePage() {
  // Görünüm Sekmeleri: 'all' | 'today' | 'department' | 'favorites' | 'report'
  const [activeTab, setActiveTab] = useState<"all" | "today" | "department" | "favorites" | "report">("all");
  const { count: favoriteCount } = useFavorites();
  const { setCategory, setCity, setOnlyUrgent, setOnlyToday, resetFilters } = useFilters();

  const handleReportFilterCategory = (cat: string) => {
    setCategory(cat);
    setActiveTab("all");
  };

  const handleReportFilterCity = (selectedCity: string) => {
    setCity(selectedCity);
    setActiveTab("all");
  };

  const handleGoToAllJobs = () => {
    resetFilters();
    setActiveTab("all");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleGoToUrgentJobs = () => {
    resetFilters();
    setOnlyUrgent(true);
    setActiveTab("all");
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* 2026 Modern Hero Başlık & Canlı Durum Rozeti */}
      <div className="relative text-center max-w-3xl mx-auto mb-10 pt-2">
        {/* Canlı Sistem Senkronizasyon Rozeti */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs text-xs font-semibold mb-4 text-slate-700 dark:text-slate-300 hover:scale-105 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md transition-all duration-200 cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>6 Resmî Kaynak Canlı Eşzamanlanıyor</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-brand-600 dark:text-brand-400 font-bold">2026 Güncel</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Kamu Personeli ve <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-ambient-gradient inline-block">
            Memur Alımları Portalı
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-3 max-w-xl mx-auto leading-relaxed">
          Kariyer Kapısı, SBB Kamu İlan, İlan.gov.tr, İŞKUR ve Resmî Gazete ilanları anlık taranıp tek adreste listelenir.
        </p>
      </div>

      {/* 5 Ana Menü Butonu: Düzenli ve Kullanıcı Dostu */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
        {/* 1. Tüm İlanlar */}
        <button
          onClick={() => {
            resetFilters();
            setActiveTab("all");
          }}
          type="button"
          className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
            activeTab === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md shadow-slate-900/20 dark:shadow-white/20"
              : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:border-brand-400 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md hover:shadow-brand-500/10"
          }`}
        >
          <LayoutList className="w-4 h-4" />
          <span>Tüm İlanlar</span>
        </button>

        {/* 2. Bugün Eklenenler */}
        <button
          onClick={() => {
            resetFilters();
            setOnlyToday(true);
            setActiveTab("today");
          }}
          type="button"
          className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
            activeTab === "today"
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/25"
              : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 hover:shadow-md hover:shadow-emerald-500/10"
          }`}
        >
          <Sparkles className={`w-4 h-4 ${activeTab === "today" ? "text-white" : "text-emerald-500"}`} />
          <span>Bugün Eklenenler</span>
        </button>

        {/* 3. Bölümüne Göre Ara */}
        <button
          onClick={() => setActiveTab("department")}
          type="button"
          className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
            activeTab === "department"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md shadow-slate-900/20 dark:shadow-white/20"
              : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-600 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 hover:shadow-md hover:shadow-amber-500/10"
          }`}
        >
          <GraduationCap className="w-4 h-4 text-amber-500" />
          <span>Bölümüne Göre Ara</span>
        </button>

        {/* 4. Favorilerim */}
        <button
          onClick={() => setActiveTab("favorites")}
          type="button"
          className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
            activeTab === "favorites"
              ? "bg-rose-600 text-white shadow-md shadow-rose-600/25"
              : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:border-rose-400 dark:hover:border-rose-600 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/30 hover:shadow-md hover:shadow-rose-500/10"
          }`}
        >
          <Heart className={`w-4 h-4 ${activeTab === "favorites" ? "fill-white text-white" : "text-rose-500"}`} />
          <span>Favorilerim</span>
          {favoriteCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "favorites"
                  ? "bg-white text-rose-600"
                  : "bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300"
              }`}
            >
              {favoriteCount}
            </span>
          )}
        </button>

        {/* 5. İstihdam Raporu */}
        <button
          onClick={() => setActiveTab("report")}
          type="button"
          className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
            activeTab === "report"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md shadow-slate-900/20 dark:shadow-white/20"
              : "bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 hover:shadow-md hover:shadow-purple-500/10"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-purple-500" />
          <span>İstihdam Raporu</span>
        </button>
      </div>

      {/* 1. SEÇENEK: Bölümüne Göre Ara Ekranı */}
      {activeTab === "department" && (
        <DepartmentSearch onSwitchToAll={() => setActiveTab("all")} />
      )}

      {/* 2. SEÇENEK: Favorilerim Ekranı */}
      {activeTab === "favorites" && (
        <FavoritesView onSwitchToAll={() => setActiveTab("all")} />
      )}

      {/* 3. SEÇENEK: Kamu İstihdam Raporu Ekranı */}
      {activeTab === "report" && (
        <EmploymentReport
          onFilterCategory={handleReportFilterCategory}
          onFilterCity={handleReportFilterCity}
          onGoToAllJobs={handleGoToAllJobs}
          onGoToUrgentJobs={handleGoToUrgentJobs}
        />
      )}

      {/* 4. SEÇENEK: Tüm İlanlar veya Bugün Eklenenler Ekranı (Filtreli Feed) */}
      {(activeTab === "all" || activeTab === "today") && (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Sol: Filtreleme Yan Paneli (En Üstten Başlar) */}
          <div className="w-full lg:w-64 shrink-0">
            <FilterSidebar />
          </div>

          {/* Sağ: Arama Çubuğu, Kadro Filtreleri + Sıralama ve İlan Listesi */}
          <div className="flex-1 w-full space-y-5">
            <SearchBar />
            <PostTypeQuickFilter />
            <div className="pt-1">
              <JobList />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
