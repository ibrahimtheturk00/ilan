import { SearchBar } from "@/components/SearchBar";
import { FilterSidebar } from "@/components/FilterSidebar";
import { JobList } from "@/components/JobList";
import { StatsBar } from "@/components/StatsBar";
import { Sparkles } from "lucide-react";

export default function HomePage() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Başlık */}
      <div className="text-center max-w-3xl mx-auto mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Tüm Resmi Kamu İlanları Tek Ekranda</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Kamu Personeli ve Memur Alım İlanları
        </h1>
        <p className="text-sm text-slate-600 mt-2">
          Kariyer Kapısı, İlan.gov.tr, SBB, İŞKUR ve Resmî Gazete ilanlarını saatlik otomatik tarıyor, temizliyor ve size sunuyoruz.
        </p>
      </div>

      {/* Arama Çubuğu */}
      <div className="max-w-2xl mx-auto mb-2">
        <SearchBar />
      </div>

      {/* İstatistikler */}
      <StatsBar />

      {/* Ana İçerik Grid */}
      <div className="flex flex-col lg:flex-row gap-6 items-start mt-6">
        <FilterSidebar />
        <div className="flex-1 w-full">
          <JobList />
        </div>
      </div>
    </main>
  );
}
