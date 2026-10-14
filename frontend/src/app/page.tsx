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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 transition-colors">
      {/* Kompakt, Net ve Sade Hero Başlık (AI İmzası Olmayan Profesyonel Başlık) */}
      <div className="max-w-3xl mb-4 text-left sm:text-center sm:mx-auto">
        <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          Kamu Personeli ve Memur Alımları
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Kariyer Kapısı, SBB, İlan.gov.tr, İŞKUR ve Resmî Gazete ilanları tek ekranda.
        </p>
      </div>

      {/* 5 Ana Menü Sekmesi: Sade, 8-10px Köşeli, 1px Kenarlık */}
      <div className="flex flex-wrap items-center sm:justify-center gap-1.5 sm:gap-2 mb-5">
        {/* 1. Tüm İlanlar */}
        <button
          onClick={() => {
            resetFilters();
            setActiveTab("all");
          }}
          type="button"
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "all"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <LayoutList className="w-3.5 h-3.5" />
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
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "today"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Bugün Eklenenler</span>
        </button>

        {/* 3. Bölümüne Göre Ara */}
        <button
          onClick={() => setActiveTab("department")}
          type="button"
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "department"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-zinc-500" />
          <span>Bölümüne Göre Ara</span>
        </button>

        {/* 4. Favorilerim */}
        <button
          onClick={() => setActiveTab("favorites")}
          type="button"
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "favorites"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${activeTab === "favorites" ? "fill-white text-white dark:fill-zinc-900 dark:text-zinc-900" : "text-rose-500"}`} />
          <span>Favorilerim</span>
          {favoriteCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums font-bold ${
                activeTab === "favorites"
                  ? "bg-zinc-700 text-white dark:bg-zinc-300 dark:text-zinc-900"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
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
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === "report"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-zinc-500" />
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
