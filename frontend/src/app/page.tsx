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
import { LayoutList, GraduationCap, Heart, BarChart3 } from "lucide-react";

export default function HomePage() {
  // Görünüm Sekmeleri: 'all' | 'department' | 'favorites' | 'report'
  const [activeTab, setActiveTab] = useState<"all" | "department" | "favorites" | "report">("all");
  const { count: favoriteCount } = useFavorites();
  const { setCategory, setCity, setOnlyUrgent, resetFilters } = useFilters();

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
      {/* Hero Başlık */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Kamu Personeli ve Memur Alımları
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
          Kariyer Kapısı, SBB Kamu İlan, İlan.gov.tr ve Resmî Gazete ilanları anlık taranıp tek adreste listelenir.
        </p>
      </div>

      {/* 4 Ana Menü Butonu: Düzenli ve Kullanıcı Dostu */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
        {/* 1. Tüm İlanlar */}
        <button
          onClick={() => setActiveTab("all")}
          type="button"
          className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <LayoutList className="w-4 h-4" />
          <span>Tüm İlanlar</span>
        </button>

        {/* 2. Bölümüne Göre Ara */}
        <button
          onClick={() => setActiveTab("department")}
          type="button"
          className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "department"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <GraduationCap className="w-4 h-4 text-amber-500" />
          <span>Bölümüne Göre Ara</span>
        </button>

        {/* 3. Favorilerim */}
        <button
          onClick={() => setActiveTab("favorites")}
          type="button"
          className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "favorites"
              ? "bg-rose-600 text-white shadow-sm shadow-rose-600/20"
              : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-slate-50 dark:hover:bg-slate-800"
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

        {/* 4. İstihdam Raporu */}
        <button
          onClick={() => setActiveTab("report")}
          type="button"
          className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "report"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-emerald-500" />
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

      {/* 4. SEÇENEK: Tüm İlanlar Ekranı (Filtreli Feed) */}
      {activeTab === "all" && (
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
