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

  // Otomatik olarak kriter formu popup'ını aç
  React.useEffect(() => {
    if (!isConfigured || !criteria) {
      setIsModalOpen(true);
    }
  }, [isConfigured, criteria]);

  // ========================================================
  // DURUM A: Sitede Kayıtlı Kriter Yok (Sadece Form Popup'ı Açılır)
  // ========================================================
  if (!isConfigured || !criteria) {
    return (
      <div className="w-full my-6 flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
        <div className="bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-8 max-w-md mx-auto shadow-sm space-y-4">
          <SlidersHorizontal className="w-8 h-8 text-emerald-500 mx-auto" />
          <h3 className="font-heading text-lg font-bold text-zinc-900 dark:text-white">
            Kriter Belirlenmedi
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Sana özel kamu ilanlarını listelemek için kriter belirleyebilirsin.
          </p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold text-xs shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <span>Kriter Belirle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {onSwitchToAll && (
              <button
                type="button"
                onClick={onSwitchToAll}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Tüm İlanlar
              </button>
            )}
          </div>
        </div>

        {/* Form Modalı */}
        <PersonalizedCriteriaModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            if (onSwitchToAll) onSwitchToAll();
          }}
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 dark:bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600 dark:bg-sky-400" />
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
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-emerald-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-sky-400 dark:hover:text-zinc-950 transition-all shadow-xs"
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
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-950 border border-emerald-300/80 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30"
              >
                <GraduationCap className="w-3 h-3 text-emerald-700 dark:text-sky-400" />
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
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-950 border border-emerald-300/80 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30"
              >
                <MapPin className="w-3 h-3 text-emerald-700 dark:text-sky-400" />
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
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-950 border border-amber-300/80 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30 uppercase"
              >
                <Briefcase className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                <span>{pt}</span>
              </span>
            ))}
        </div>
      </div>

      {/* 2. Eşleşme Sayacı ve Bilgilendirme */}
      <div className="flex items-center justify-between px-1">
        <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-sky-400" />
          <span>
            Kriterlerine uyan{" "}
            <span className="text-emerald-700 dark:text-sky-400 text-base font-extrabold font-mono">
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
