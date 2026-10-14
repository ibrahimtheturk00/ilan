"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { fetchEmploymentStats, EmploymentReportData } from "@/lib/supabase";
import { JobCard } from "./JobCard";
import { JobModal } from "./JobModal";
import { JobPost } from "@/types";
import { cleanInstitution } from "@/lib/utils";
import { normalizeTurkish } from "@/lib/jobParser";
import { detectInstitutionVisual } from "@/lib/institutionIcons";
import {
  TrendingUp,
  Users,
  Building2,
  Clock,
  Briefcase,
  GraduationCap,
  MapPin,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Search,
  X,
} from "lucide-react";

interface EmploymentReportProps {
  onFilterCategory?: (category: string) => void;
  onFilterCity?: (city: string) => void;
  onGoToAllJobs?: () => void;
  onGoToUrgentJobs?: () => void;
}

export function EmploymentReport({
  onFilterCategory,
  onFilterCity,
  onGoToAllJobs,
  onGoToUrgentJobs,
}: EmploymentReportProps) {
  const [stats, setStats] = useState<EmploymentReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"overview" | "institutions">("overview");
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklandığında öneri kutusunu kapat
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsAutocompleteOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchEmploymentStats()
      .then((data) => {
        setStats(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Kurumlara göre ilanları grupla
  const groupedByInstitution = useMemo(() => {
    if (!stats?.allJobs) return [];

    const map: Record<string, JobPost[]> = {};
    for (const job of stats.allJobs) {
      const inst = cleanInstitution(job.institution, job.title, job.city, job.original_url).trim();
      if (!map[inst]) map[inst] = [];
      map[inst].push(job);
    }

    // İlan sayısına göre çoktan aza sırala
    return Object.entries(map)
      .map(([institution, jobs]) => ({
        institution,
        jobs,
        count: jobs.length,
      }))
      .sort((a, b) => b.count - a.count || a.institution.localeCompare(b.institution, "tr-TR"));
  }, [stats?.allJobs]);

  // Arama filtresi uygulanan kurumlar (Türkçe toleranslı & akıllı kelime bazlı)
  const filteredInstitutions = useMemo(() => {
    if (!institutionSearch.trim()) return groupedByInstitution;
    const qNorm = normalizeTurkish(institutionSearch);
    const qTokens = qNorm.split(/\s+/).filter((t) => t.length >= 2);

    return groupedByInstitution.filter((item) => {
      const instNorm = normalizeTurkish(item.institution);
      // Kurum adında doğrudan veya parça eşleşme
      if (instNorm.includes(qNorm)) return true;

      // Kelime bazlı eşleşme (örn: "marmara uni" -> "marmara universitesi")
      if (qTokens.length > 0 && qTokens.every((token) => instNorm.includes(token))) {
        return true;
      }

      // Kurumun ilan başlıklarında arama
      return item.jobs.some((j) => {
        const titleNorm = normalizeTurkish(j.title);
        if (titleNorm.includes(qNorm)) return true;
        return qTokens.length > 0 && qTokens.every((token) => titleNorm.includes(token));
      });
    });
  }, [groupedByInstitution, institutionSearch]);

  // Autocomplete için önerilen kurumlar listesi
  const autocompleteSuggestions = useMemo(() => {
    if (!institutionSearch.trim()) {
      return groupedByInstitution.slice(0, 6);
    }
    const qNorm = normalizeTurkish(institutionSearch);
    const qTokens = qNorm.split(/\s+/).filter((t) => t.length >= 2);

    return groupedByInstitution
      .filter((item) => {
        const instNorm = normalizeTurkish(item.institution);
        if (instNorm.includes(qNorm)) return true;
        return qTokens.length > 0 && qTokens.every((token) => instNorm.includes(token));
      })
      .slice(0, 8);
  }, [groupedByInstitution, institutionSearch]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
        <span className="text-sm font-semibold text-slate-500">
          İstihdam raporu ve analizler yükleniyor...
        </span>
      </div>
    );
  }

  if (!stats) return null;

  // -------------------------------------------------------------
  // 2. GÖRÜNÜM: KURUMLARA GÖRE GRUPLANMIŞ İLANLAR EKRANI
  // -------------------------------------------------------------
  if (viewMode === "institutions") {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* Üst Bar: Geri Dönüş ve Başlık */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <button
              onClick={() => {
                setViewMode("overview");
                window.scrollTo({ top: 100, behavior: "smooth" });
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors mb-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>← Rapor Özetine Geri Dön</span>
            </button>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Building2 className="w-6 h-6 text-indigo-600" />
              <span>Kurumlara Göre Aktif İlanlar</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {stats.totalInstitutions} Kurum
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tüm resmi kurumlar başlıklar halinde ayrılmış olup altlarında o kuruma ait aktif ilanlar listelenmektedir.
            </p>
          </div>

          {/* Kurum Arama Çubuğu & Autocomplete */}
          <div className="relative w-full sm:w-80" ref={searchContainerRef}>
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
            <input
              type="text"
              value={institutionSearch}
              onChange={(e) => {
                setInstitutionSearch(e.target.value);
                setIsAutocompleteOpen(true);
                setActiveIndex(-1);
              }}
              onFocus={() => setIsAutocompleteOpen(true)}
              onKeyDown={(e) => {
                if (!isAutocompleteOpen) {
                  if (e.key === "ArrowDown") setIsAutocompleteOpen(true);
                  return;
                }
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActiveIndex((prev) => (prev < autocompleteSuggestions.length - 1 ? prev + 1 : 0));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveIndex((prev) => (prev > 0 ? prev - 1 : autocompleteSuggestions.length - 1));
                } else if (e.key === "Enter") {
                  if (activeIndex >= 0 && activeIndex < autocompleteSuggestions.length) {
                    e.preventDefault();
                    setInstitutionSearch(autocompleteSuggestions[activeIndex].institution);
                    setIsAutocompleteOpen(false);
                  }
                } else if (e.key === "Escape") {
                  setIsAutocompleteOpen(false);
                }
              }}
              placeholder="Kurum ara (örn: Marmara, Sağlık, Rize)..."
              className="w-full pl-9 pr-8 py-2.5 text-xs bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 dark:text-slate-100"
            />
            {institutionSearch && (
              <button
                type="button"
                onClick={() => {
                  setInstitutionSearch("");
                  setIsAutocompleteOpen(false);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 z-10 p-1"
                title="Aramayı Temizle"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Autocomplete Açılır Kutusu */}
            {isAutocompleteOpen && autocompleteSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 animate-fadeIn">
                <div className="px-3 py-1.5 bg-slate-50/70 dark:bg-slate-800/50 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>{institutionSearch.trim() ? "Önerilen Kurumlar" : "Popüler Kurumlar"}</span>
                  <span>{autocompleteSuggestions.length} Kurum</span>
                </div>
                <div className="max-h-64 overflow-y-auto py-1">
                  {autocompleteSuggestions.map((item, idx) => {
                    const instVisual = detectInstitutionVisual(item.institution);
                    const InstIcon = instVisual.icon;
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={item.institution}
                        type="button"
                        onClick={() => {
                          setInstitutionSearch(item.institution);
                          setIsAutocompleteOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2.5 text-xs transition-colors ${
                          isActive
                            ? "bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 font-semibold"
                            : "hover:bg-slate-100/70 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${instVisual.bgColor} ${instVisual.iconColor}`}>
                            <InstIcon className="w-3 h-3" />
                          </div>
                          <span className="truncate">{item.institution}</span>
                        </div>
                        <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                          {item.count} İlan
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kurumlar ve İlan Kartları Listesi */}
        {filteredInstitutions.length === 0 ? (
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-sm space-y-2">
            <Building2 className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Aradığınız isimde kurum veya ilan bulunamadı
            </h4>
            <p className="text-xs">Arama teriminizi değiştirerek tekrar deneyebilirsiniz.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {filteredInstitutions.map((group) => (
              <div key={group.institution} className="space-y-4">
                {/* Kurum Başlık Şeridi */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                      {group.institution}
                    </h3>
                  </div>

                  <span className="text-xs px-2.5 py-1 rounded-lg font-bold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                    {group.count} İlan
                  </span>
                </div>

                {/* Kuruma Ait İlan Kartları Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onSelect={(j) => setSelectedJob(j)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detay Modalı */}
        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      </div>
    );
  }

  // -------------------------------------------------------------
  // 1. GÖRÜNÜM: RAPOR GENEL BAKIŞ VE İSTATİSTİKLER EKRANI
  // -------------------------------------------------------------
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Rapor Başlığı */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-950 border border-emerald-300/80 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-sky-400" />
          <span>Haftalık Resmi İstatistikler</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Kamu İstihdam ve Kadro Raporu
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Türkiye genelindeki tüm resmi kamu ilanlarının kurum, branş ve kontenjan dağılımı.
        </p>
      </div>

      {/* 4 Önemli Metrik Kartı (Tıklanabilir İyileştirmeler) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. KART: Aktif İlan Sayısı (Tıklanabilir -> Tüm İlanlara Geçer) */}
        <div
          onClick={onGoToAllJobs}
          role="button"
          tabIndex={0}
          className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500/80 dark:hover:border-sky-500 rounded-2xl p-4 sm:p-5 shadow-sm cursor-pointer flex flex-col justify-between transition-all"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Aktif İlan Sayısı</span>
              <Briefcase className="w-4 h-4 text-emerald-600 dark:text-sky-400 group-hover:scale-105 transition-transform duration-200" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1 group-hover:text-emerald-700 dark:group-hover:text-sky-400 transition-colors">
              {stats.totalActiveJobs.toLocaleString("tr-TR")}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Resmi portallardan güncel</span>
          </div>
          <span className="text-xs text-emerald-700 dark:text-sky-400 font-bold flex items-center gap-1 pt-2 group-hover:translate-x-1 transition-transform">
            <span>İlanları Gör</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* 2. KART: Toplam Kadro Kontenjanı */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between transition-all">
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Toplam Kadro Kontenjanı</span>
              <Users className="w-4 h-4 text-emerald-600 dark:text-sky-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-sky-400 mt-1">
              {stats.totalPositions.toLocaleString("tr-TR")}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">İstihdam edilecek kişi sayısı</span>
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500 block pt-2">Toplam kontenjan</span>
        </div>

        {/* 3. KART: Acil Başvurular */}
        <div
          onClick={onGoToUrgentJobs}
          role="button"
          tabIndex={0}
          className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-rose-500/80 dark:hover:border-rose-500 rounded-2xl p-4 sm:p-5 shadow-sm cursor-pointer flex flex-col justify-between transition-all"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">Acil Başvurular</span>
              <Clock className="w-4 h-4 text-rose-500 group-hover:scale-105 transition-transform duration-200" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-1 group-hover:text-rose-700 dark:group-hover:text-rose-300 transition-colors">
              {stats.urgentJobsCount}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Son 3 gün içinde bitenler</span>
          </div>
          <span className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 pt-2 group-hover:translate-x-1 transition-transform">
            <span>Acil İlanları Listele</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>

        {/* 4. KART: İlan Veren Kurumlar */}
        <div
          onClick={() => {
            setViewMode("institutions");
            window.scrollTo({ top: 100, behavior: "smooth" });
          }}
          role="button"
          tabIndex={0}
          className="group bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-500/80 dark:hover:border-indigo-500 rounded-2xl p-4 sm:p-5 shadow-sm cursor-pointer flex flex-col justify-between transition-all"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold">İlan Veren Kurumlar</span>
              <Building2 className="w-4 h-4 text-indigo-600 group-hover:scale-105 transition-transform duration-200" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
              {stats.totalInstitutions}+
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 block">Bakanlık, üniversite, belediye</span>
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 pt-2 group-hover:translate-x-1 transition-transform">
            <span>Kurumları İncele</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* İki Kolonlu Detay Kartları */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Sol Kolon: En Çok Alım Yapan Kurumlar */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <Building2 className="w-4 h-4 text-brand-600" />
              <span>En Çok Kadro Açan İlk 5 Kurum</span>
            </div>
            <button
              onClick={() => {
                setViewMode("institutions");
                window.scrollTo({ top: 100, behavior: "smooth" });
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Tümünü Gör →
            </button>
          </div>

          <div className="space-y-4 pt-1">
            {stats.topInstitutions.map((inst, index) => {
              const maxPositions = stats.topInstitutions[0]?.positions || 1;
              const barPercent = Math.min(100, Math.round((inst.positions / maxPositions) * 100));

              return (
                <div key={inst.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate pr-2 max-w-[260px] sm:max-w-[340px]">
                      {index + 1}. {inst.name}
                    </span>
                    <span className="text-emerald-700 dark:text-sky-400 font-bold shrink-0">
                      {inst.positions.toLocaleString("tr-TR")} Kadro
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 dark:bg-sky-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${barPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sağ Kolon: Meslek & Branş Dağılımı */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
              <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Sektörel / Branş Dağılımı</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Toplam İlan İçi Pay</span>
          </div>

          <div className="space-y-3.5 pt-1">
            {stats.categoryDistribution.map((cat) => (
              <div
                key={cat.key}
                onClick={() => onFilterCategory?.(cat.key)}
                className="group cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-sky-400 transition-colors">
                    {cat.label}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {cat.count} İlan (%{cat.percentage})
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700/60 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kadro Statüsü ve Popüler İller */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Kadro Türü Oranları */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3 font-bold text-slate-900 dark:text-white text-sm">
            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-sky-400" />
            <span>Kadro Statüsü Dağılımı</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            {stats.postTypeDistribution.map((t) => (
              <div
                key={t.key}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700/60 space-y-1"
              >
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block">
                  {t.label}
                </span>
                <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                  {t.count} İlan
                </div>
                <span className="text-xs text-emerald-700 dark:text-sky-400 font-bold block">
                  %{t.percentage} Pay
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* En Çok İlan Bulunan Şehirler */}
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700/60 pb-3 font-bold text-slate-900 dark:text-white text-sm">
            <MapPin className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>En Çok İlan Alan Şehirler</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {stats.topCities.map((item) => (
              <button
                key={item.city}
                onClick={() => onFilterCity?.(item.city)}
                className="text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-500 hover:bg-emerald-50/40 dark:hover:border-sky-500 dark:hover:bg-slate-800 transition-all group"
              >
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-sky-400 block">
                  {item.city}
                </span>
                <span className="text-xs text-emerald-700 dark:text-sky-400 font-bold mt-0.5 block">
                  {item.count} İlan
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bilgi Kutusu */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50/70 dark:bg-sky-950/30 border border-emerald-200/80 dark:border-sky-500/25 text-xs text-emerald-950 dark:text-sky-200">
        <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-sky-400 shrink-0" />
        <span>
          Bu rapordaki veriler Kamu İlan Merkezi robotları tarafından her 60 dakikada bir taranan resmi kaynaklardan çekilerek anlık üretilmektedir.
        </span>
      </div>
    </div>
  );
}
