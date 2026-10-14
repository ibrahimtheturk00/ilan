"use client";

import { useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useFilters } from "@/hooks/useFilters";
import { JobCard } from "./JobCard";
import { JobModal } from "./JobModal";
import { AlertCircle, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { JobPost, FilterState } from "@/types";

export function JobList() {
  const filters = useFilters();
  const filterState: FilterState = {
    searchQuery: filters.searchQuery,
    city: filters.city,
    postType: filters.postType,
    category: filters.category,
    sourceSlug: filters.sourceSlug,
    onlyActive: filters.onlyActive,
    page: filters.page,
    sortBy: filters.sortBy,
    kpssType: filters.kpssType,
    educationLevel: filters.educationLevel,
    onlyUrgent: filters.onlyUrgent,
  };
  const { data, isLoading, isError, error } = useJobs(filterState);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 shadow-sm shimmer-skeleton space-y-3.5"
          >
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                <div className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-full" />
                <div className="h-5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-7 w-7 bg-slate-100 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
                <div className="h-3.5 w-36 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
            <div className="h-5 w-5/6 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="h-10 w-full bg-slate-100 dark:bg-slate-800/80 rounded-md" />
            <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded pt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-6 text-center text-rose-700 dark:text-rose-300">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
        <h4 className="font-semibold text-sm">İlanlar yüklenirken bir sorun oluştu</h4>
        <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
          {error instanceof Error ? error.message : "Bilinmeyen hata"}
        </p>
      </div>
    );
  }

  const jobs = data?.data || [];
  const totalCount = data?.count || 0;
  const pageSize = 12;
  const totalPages = Math.ceil(totalCount / pageSize);

  if (jobs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-12 text-center text-slate-500 dark:text-slate-400 shadow-sm">
        <Inbox className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-base">Aradığınız kriterlere uygun ilan bulunamadı</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Filtreleri sıfırlayarak veya arama kelimenizi genişleterek tekrar deneyebilirsiniz.
        </p>
        <button
          onClick={filters.resetFilters}
          className="mt-4 px-4 py-2 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 text-xs font-semibold rounded-xl hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
        >
          Tüm Filtreleri Temizle
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>
          Toplam <strong className="text-slate-800 dark:text-slate-200">{totalCount}</strong> güncel ilan listeleniyor
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onSelect={(j) => setSelectedJob(j)} />
        ))}
      </div>

      {/* Sayfalama Kontrolleri */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-6 pb-2">
          {filters.page > 1 && (
            <button
              onClick={() => {
                filters.setPage(filters.page - 1);
                window.scrollTo({ top: 200, behavior: "smooth" });
              }}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 px-2.5 py-1.5 transition-colors mr-1"
            >
              önceki
            </button>
          )}

          {/* Sayfa Numaraları */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              return p === 1 || p === totalPages || Math.abs(p - filters.page) <= 4;
            })
            .map((p, index, arr) => {
              const prev = arr[index - 1];
              const showEllipsis = prev && p - prev > 1;

              return (
                <div key={p} className="flex items-center gap-1">
                  {showEllipsis && (
                    <span className="text-xs text-zinc-400 px-1 select-none">...</span>
                  )}
                  <button
                    onClick={() => {
                      filters.setPage(p);
                      window.scrollTo({ top: 200, behavior: "smooth" });
                    }}
                    className={`w-8 h-8 rounded-md text-xs font-mono tabular-nums font-semibold flex items-center justify-center transition-colors ${
                      filters.page === p
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {p}
                  </button>
                </div>
              );
            })}

          {filters.page < totalPages && (
            <button
              onClick={() => {
                filters.setPage(filters.page + 1);
                window.scrollTo({ top: 200, behavior: "smooth" });
              }}
              className="text-xs font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100 px-2.5 py-1.5 transition-colors ml-1"
            >
              sonraki
            </button>
          )}
        </div>
      )}

      {/* Detay Modalı */}
      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
}
