"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { PostTypeQuickFilter } from "@/components/PostTypeQuickFilter";
import { FilterSidebar } from "@/components/FilterSidebar";
import { JobList } from "@/components/JobList";
import { DepartmentSearch } from "@/components/DepartmentSearch";
import { LayoutList, GraduationCap } from "lucide-react";

export default function HomePage() {
  // Görünüm Modu: 'all' (Tüm İlanlar) veya 'department' (Bölüme Göre Ara)
  const [activeTab, setActiveTab] = useState<"all" | "department">("all");

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* Hero Başlık - Minimalist, modern ve sade */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Kamu Personeli ve Memur Alımları
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
          Kariyer Kapısı, SBB Kamu İlan, İlan.gov.tr ve Resmî Gazete ilanları anlık taranıp tek adreste listelenir.
        </p>
      </div>

      {/* İki Ana Buton: "Tüm İlanlar" ve "Bölümüne Göre Ara" */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setActiveTab("all")}
          type="button"
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <LayoutList className="w-4 h-4" />
          <span>Tüm İlanlar</span>
        </button>

        <button
          onClick={() => setActiveTab("department")}
          type="button"
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "department"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm"
              : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <GraduationCap className="w-4 h-4 text-amber-500" />
          <span>Bölümüne Göre Ara</span>
        </button>
      </div>

      {/* 1. SEÇENEK: Bölümüne Göre Ara Ekranı */}
      {activeTab === "department" && (
        <DepartmentSearch onSwitchToAll={() => setActiveTab("all")} />
      )}

      {/* 2. SEÇENEK: Tüm İlanlar Ekranı (Filtreli Feed) */}
      {activeTab === "all" && (
        <div className="space-y-6">
          {/* Canlı Arama Çubuğu & Hızlı Kadro Filtreleri */}
          <div className="max-w-2xl mx-auto space-y-4">
            <SearchBar />
            <PostTypeQuickFilter />
          </div>

          {/* Ana İçerik Grid */}
          <div className="flex flex-col lg:flex-row gap-6 items-start mt-6">
            <FilterSidebar />
            <div className="flex-1 w-full">
              <JobList />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
