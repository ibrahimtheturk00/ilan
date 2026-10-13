"use client";

import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { FilterSidebar } from "@/components/FilterSidebar";
import { JobList } from "@/components/JobList";
import { DepartmentSearch } from "@/components/DepartmentSearch";
import { Sparkles, LayoutList, GraduationCap } from "lucide-react";

export default function HomePage() {
  // Görünüm Modu: 'all' (Tüm İlanlar) veya 'department' (Bölüme Göre Ara)
  const [activeTab, setActiveTab] = useState<"all" | "department">("all");

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* Hero Başlık */}
      <div className="text-center max-w-3xl mx-auto mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Tüm Resmi Kamu İlanları Tek Ekranda</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Kamu Personeli ve Memur Alım İlanları
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Kariyer Kapısı, İlan.gov.tr, SBB, İŞKUR ve Resmî Gazete ilanlarını saatlik otomatik tarıyor, temizliyor ve size sunuyoruz.
        </p>
      </div>

      {/* İki Ana Buton: "Tüm İlanlar" ve "Bölümüne Göre Ara" */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <button
          onClick={() => setActiveTab("all")}
          type="button"
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
            activeTab === "all"
              ? "bg-brand-600 text-white shadow-md shadow-brand-500/20 scale-[1.02]"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60"
          }`}
        >
          <LayoutList className="w-4 h-4" />
          <span>Tüm İlanlar</span>
        </button>

        <button
          onClick={() => setActiveTab("department")}
          type="button"
          className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm ${
            activeTab === "department"
              ? "bg-brand-600 text-white shadow-md shadow-brand-500/20 scale-[1.02]"
              : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/60"
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
        <div className="space-y-6 animate-fadeIn">
          {/* Canlı Arama Çubuğu */}
          <div className="max-w-2xl mx-auto">
            <SearchBar />
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
