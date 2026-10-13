"use client";

import { useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useFilters } from "@/hooks/useFilters";
import { JobCard } from "./JobCard";
import { JobModal } from "./JobModal";
import { AlertCircle, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import { JobPost } from "@/types";

export function JobList() {
  const filters = useFilters();
  const { data, isLoading, isError, error } = useJobs(filters);
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 shadow-sm animate-pulse space-y-3"
          >
            <div className="flex gap-2">
              <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-5 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-700/60 rounded" />
            <div className="h-12 w-full bg-slate-100 dark:bg-slate-700/60 rounded" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded pt-3" />
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onSelect={(j) => setSelectedJob(j)} />
        ))}
      </div>

      {/* Sayfalama Kontrolleri (Fotoğraftaki gibi: 1 2 3 ... sonraki) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-8">
          {filters.page > 1 && (
            <button
              onClick={() => {
                filters.setPage(filters.page - 1);
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 px-3 py-2 transition-colors mr-1"
            >
              önceki
            </button>
          )}

          {/* Sayfa Numaraları */}
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => {
              // 1, son sayfa ve aktif sayfanın etrafındaki 2 sayfayı göster
              return p === 1 || p === totalPages || Math.abs(p - filters.page) <= 2;
            })
            .map((p, index, arr) => {
              const prev = arr[index - 1];
              const showEllipsis = prev && p - prev > 1;

              return (
                <div key={p} className="flex items-center gap-1.5">
                  {showEllipsis && (
                    <span className="text-xs text-slate-400 px-1 select-none">...</span>
                  )}
                  <button
                    onClick={() => {
                      filters.setPage(p);
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }}
                    className={`w-9 h-9 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                      filters.page === p
                        ? "bg-slate-100 dark:bg-slate-700 text-brand-600 dark:text-brand-400 font-bold shadow-sm ring-1 ring-slate-200 dark:ring-slate-600"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
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
                window.scrollTo({ top: 300, behavior: "smooth" });
              }}
              className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 px-3 py-2 transition-colors ml-1"
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
