"use client";

import { useState } from "react";
import { HeroDockConsole } from "@/components/HeroDockConsole";
import { FilterSidebar } from "@/components/FilterSidebar";
import { JobList } from "@/components/JobList";
import { DepartmentSearch } from "@/components/DepartmentSearch";
import { FavoritesView } from "@/components/FavoritesView";
import { EmploymentReport } from "@/components/EmploymentReport";
import { PersonalizedView } from "@/components/PersonalizedView";
import { PersonalizedCriteriaModal } from "@/components/PersonalizedCriteriaModal";
import { usePersonalizedCriteria, UserCareerCriteria } from "@/hooks/usePersonalizedCriteria";
import { useFavorites } from "@/hooks/useFavorites";
import { useFilters } from "@/hooks/useFilters";

export default function HomePage() {
  // Görünüm Sekmeleri: 'all' | 'today' | 'personalized' | 'department' | 'favorites' | 'report'
  const [activeTab, setActiveTab] = useState<"all" | "today" | "personalized" | "department" | "favorites" | "report">("all");
  const { criteria, isConfigured: isPersonalizedConfigured, saveCriteria } = usePersonalizedCriteria();
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const { count: favoriteCount } = useFavorites();
  const { setCategory, setCity, setOnlyUrgent, setOnlyToday, resetFilters } = useFilters();

  const handleSelectPersonalized = () => {
    if (!isPersonalizedConfigured) {
      // Sitede kayıtlı kriter yoksa doğrudan ana ekranda modal form açılır
      setIsCriteriaModalOpen(true);
    } else {
      // Kriter kayıtlıysa doğrudan sana özel sekmesine geçilir
      setActiveTab("personalized");
    }
  };

  const handleSaveCriteria = (newCriteria: UserCareerCriteria) => {
    saveCriteria(newCriteria);
    setIsCriteriaModalOpen(false);
    setActiveTab("personalized");
  };

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
      {/* Kompakt, Net ve Sade Hero Başlık */}
      <div className="max-w-3xl mb-5 text-left sm:text-center sm:mx-auto">
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
          Kamu Personeli ve Memur Alımları
        </h1>
        <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 mt-1.5">
          Kariyer Kapısı, SBB/DPB, ÖSYM, Resmî Gazete, İlan.gov.tr, İŞKUR, Bakanlıklar ve Belediyeler dahil 37 resmî kaynak tek ekranda.
        </p>
      </div>

      {/* Birleşik Hero Dock Konsolu (Sekmeler + Arama Çubuğu + Açılır Kategoriler + Kadro Filtreleri + Sıralama) */}
      <HeroDockConsole
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        favoriteCount={favoriteCount}
        onResetFilters={resetFilters}
        onSelectToday={() => {
          resetFilters();
          setOnlyToday(true);
          setActiveTab("today");
        }}
        onSelectPersonalized={handleSelectPersonalized}
      />

      {/* 1. SEÇENEK: Sana Özel İlanlar Ekranı (Kişiselleştirilmiş İlan Radarı) */}
      {activeTab === "personalized" && (
        <div className="mt-2">
          <PersonalizedView onSwitchToAll={() => setActiveTab("all")} />
        </div>
      )}

      {/* 2. SEÇENEK: Bölümüne Göre Ara Ekranı */}
      {activeTab === "department" && (
        <div className="mt-2">
          <DepartmentSearch onSwitchToAll={() => setActiveTab("all")} />
        </div>
      )}

      {/* 2. SEÇENEK: Favorilerim Ekranı */}
      {activeTab === "favorites" && (
        <div className="mt-2">
          <FavoritesView onSwitchToAll={() => setActiveTab("all")} />
        </div>
      )}

      {/* 3. SEÇENEK: Kamu İstihdam Raporu Ekranı */}
      {activeTab === "report" && (
        <div className="mt-2">
          <EmploymentReport
            onFilterCategory={handleReportFilterCategory}
            onFilterCity={handleReportFilterCity}
            onGoToAllJobs={handleGoToAllJobs}
            onGoToUrgentJobs={handleGoToUrgentJobs}
          />
        </div>
      )}

      {/* 4. SEÇENEK: Tüm İlanlar veya Bugün Eklenenler Ekranı (Filtreli Feed) */}
      {(activeTab === "all" || activeTab === "today") && (
        <div className="flex flex-col lg:flex-row gap-8 items-start mt-4">
          {/* Sol: Filtreleme Yan Paneli (En Üstten Başlar) */}
          <div className="w-full lg:w-64 shrink-0">
            <FilterSidebar />
          </div>

          {/* Sağ: İlan Listesi */}
          <div className="flex-1 w-full space-y-5">
            <JobList />
          </div>
        </div>
      )}

      {/* Sana Özel Kriter Seçim Modalı (Ana ekranda doğrudan popup olarak açılır) */}
      <PersonalizedCriteriaModal
        isOpen={isCriteriaModalOpen}
        onClose={() => setIsCriteriaModalOpen(false)}
        initialCriteria={criteria}
        onSave={handleSaveCriteria}
      />
    </main>
  );
}
