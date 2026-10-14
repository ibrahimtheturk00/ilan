"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  RotateCcw,
  GraduationCap,
  MapPin,
  Briefcase,
  AlertCircle,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { usePersonalizedCriteria } from "@/hooks/usePersonalizedCriteria";
import { InteractiveDotGridBackground } from "./InteractiveDotGridBackground";
import { PersonalizedCriteriaModal } from "./PersonalizedCriteriaModal";
import { YOK_ATLAS_DEPARTMENTS } from "./DepartmentSearch";
import { JobCard } from "./JobCard";
import { JobModal } from "./JobModal";
import { JobPost } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { fetchAllActiveJobPosts } from "@/lib/supabase";

interface PersonalizedViewProps {
  onSwitchToAll?: () => void;
}

export function PersonalizedView({ onSwitchToAll }: PersonalizedViewProps) {
  const { criteria, isLoaded, isConfigured, saveCriteria, clearCriteria, setSampleCriteria } =
    usePersonalizedCriteria();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

  // Fetch all active jobs for client-side instant filtering
  const { data: allJobs = [], isLoading: isJobsLoading } = useQuery({
    queryKey: ["all-active-job-posts"],
    queryFn: fetchAllActiveJobPosts,
    staleTime: 1000 * 60 * 5,
  });

  // Filter jobs based on user criteria
  const matchedJobs = useMemo(() => {
    if (!isConfigured || !criteria || allJobs.length === 0) return [];

    return allJobs.filter((job) => {
      // 1. Kadro Türü Eşleşmesi
      if (criteria.postTypes && criteria.postTypes.length > 0) {
        if (!job.post_type || !criteria.postTypes.includes(job.post_type)) {
          return false;
        }
      }

      // 2. Şehir Eşleşmesi
      if (criteria.cities && criteria.cities.length > 0) {
        const jobCity = (job.city || "").toLocaleLowerCase("tr-TR");
        const matchesCity =
          jobCity === "" ||
          jobCity.includes("tüm türkiye") ||
          criteria.cities.some((c) => jobCity.includes(c.toLocaleLowerCase("tr-TR")));
        if (!matchesCity) return false;
      }

      // 3. Mezuniyet / Bölüm Eşleşmesi
      if (criteria.departments && criteria.departments.length > 0) {
        const selectedDepts = YOK_ATLAS_DEPARTMENTS.filter((d) =>
          criteria.departments.includes(d.id)
        );

        const searchable = `${job.title || ""} ${job.description || ""} ${job.category || ""}`.toLocaleLowerCase(
          "tr-TR"
        );

        const matchesDept = selectedDepts.some((dept) => {
          if (dept.dbCategory && job.category === dept.dbCategory) return true;
          return dept.keywords.some((kw) =>
            searchable.includes(kw.toLocaleLowerCase("tr-TR"))
          );
        });

        if (!matchesDept) return false;
      }

      return true;
    });
  }, [allJobs, criteria, isConfigured]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
        <span className="text-sm font-semibold text-zinc-500">
          Kariyer profilin hazırlanıyor...
        </span>
      </div>
    );
  }

  // ========================================================
  // DURUM A: Sitede Kayıtlı Kriter Yok (Referans Tasarım Ekranı)
  // ========================================================
  if (!isConfigured || !criteria) {
    return (
      <div className="w-full my-3 animate-fadeIn">
        <InteractiveDotGridBackground className="min-h-[580px] sm:min-h-[660px] rounded-2xl sm:rounded-3xl border border-zinc-200/90 dark:border-white/10 shadow-2xl flex flex-col items-center justify-center p-6 sm:p-14 text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            {/* Top Badge (Ref: "• Now in public beta") */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900/90 dark:bg-zinc-800/90 border border-zinc-700/60 text-white text-xs font-semibold backdrop-blur-md shadow-sm mb-6 sm:mb-8 hover:scale-105 transition-transform cursor-default">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>• Şimdi Yayında • Kişiselleştirilmiş İlan Radarı</span>
            </div>

            {/* Main Headline (Ref: "Signals, not noise.") */}
            <h1 className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.1] mb-5">
              Gürültüyü Değil, Sana Uygun İlanları Gör.
            </h1>

            {/* Subtitle (Ref: "Every ping is a real event...") */}
            <p className="font-sans text-sm sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed mb-4">
              Binlerce karmaşık sayfa ve yüzlerce başvuru şartı arasında kaybolma.
              Mezuniyetini, unvanını ve tercih ettiğin şehirleri belirle; sadece senin başvurabileceğin
              resmi kadroları tek ekranda radarımıza alalım.
            </p>

            {/* Interactive hint */}
            <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-md mx-auto mb-8 sm:mb-10">
              💡 Sayfanın herhangi bir yerine tıklayarak radarı test edebilir ve ışık dalgası gönderebilirsin.
            </p>

            {/* Action Buttons (Ref: "Start listening →" & "Read the docs") */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 font-bold text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
              >
                <span>Kriterlerini Belirle</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={setSampleCriteria}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-white/80 hover:bg-white dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 font-semibold text-sm transition-all hover:scale-105 active:scale-95 shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Örnek Profili Dene</span>
              </button>
            </div>
          </div>
        </InteractiveDotGridBackground>

        {/* Criteria Modal */}
        <PersonalizedCriteriaModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialCriteria={criteria}
          onSave={saveCriteria}
        />
      </div>
    );
  }

  // ========================================================
  // DURUM B: Kriterler Kayıtlı (Kişiselleştirilmiş İlan Feed'i)
  // ========================================================
  const activeDeptNames = YOK_ATLAS_DEPARTMENTS.filter((d) =>
    criteria.departments.includes(d.id)
  ).map((d) => d.name);

  return (
    <div className="w-full space-y-6 my-2 animate-fadeIn">
      {/* 1. Üst Kontrol Paneli */}
      <div className="bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-sm transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                Sana Özel İlan Radarı
              </h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Profilinde kayıtlı kriterlere göre anlık olarak filtrelenen kamu ilanları.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100 transition-all shadow-xs"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Kriterleri Düzenle</span>
            </button>

            <button
              type="button"
              onClick={clearCriteria}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-zinc-500 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Kriterleri sıfırla ve karşılama ekranına dön"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sıfırla</span>
            </button>
          </div>
        </div>

        {/* Aktif Kriter Etiketleri (Pills) */}
        <div className="flex flex-wrap items-center gap-2 pt-4">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            Aktif Filtrelerin:
          </span>

          {activeDeptNames.length > 0 ? (
            activeDeptNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              >
                <GraduationCap className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>{name}</span>
              </span>
            ))
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              Tüm Bölümler
            </span>
          )}

          {criteria.cities.length > 0 ? (
            criteria.cities.map((city) => (
              <span
                key={city}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
              >
                <MapPin className="w-3 h-3 text-sky-600 dark:text-sky-400" />
                <span>{city}</span>
              </span>
            ))
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
              🇹🇷 Tüm Türkiye
            </span>
          )}

          {criteria.postTypes.length > 0 &&
            criteria.postTypes.map((pt) => (
              <span
                key={pt}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 uppercase"
              >
                <Briefcase className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>{pt}</span>
              </span>
            ))}
        </div>
      </div>

      {/* 2. Eşleşme Sayacı ve Bilgilendirme */}
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>
            Kriterlerine uyan{" "}
            <span className="text-emerald-600 dark:text-emerald-400 text-base font-extrabold font-mono">
              {matchedJobs.length}
            </span>{" "}
            aktif kamu ilanı bulundu
          </span>
        </div>

        {onSwitchToAll && (
          <button
            type="button"
            onClick={onSwitchToAll}
            className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
          >
            <span>Tüm İlanlara Göz At</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 3. İlan Listesi veya Boş Durum */}
      {isJobsLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
          <span className="text-sm font-semibold text-zinc-500">
            İlanlar taranıyor...
          </span>
        </div>
      ) : matchedJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {matchedJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onSelect={(selected) => setSelectedJob(selected)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-10 text-center max-w-xl mx-auto shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mx-auto text-amber-500">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white">
              Eşleşen İlan Bulunamadı
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-md mx-auto">
              Belirlediğin şehir veya kadro kriterlerine uyan aktif ilan şu an sistemde bulunmuyor. Kriterlerini genişleterek daha fazla ilana erişebilirsin.
            </p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-xs sm:text-sm shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Kriterleri Genişlet</span>
            </button>
            <button
              type="button"
              onClick={clearCriteria}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Kriterleri Sıfırla
            </button>
          </div>
        </div>
      )}

      {/* Detay Modalı */}
      {selectedJob && (
        <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}

      {/* Kriter Düzenleme Modalı */}
      <PersonalizedCriteriaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialCriteria={criteria}
        onSave={saveCriteria}
      />
    </div>
  );
}
