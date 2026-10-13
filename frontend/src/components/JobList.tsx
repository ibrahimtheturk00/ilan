"use client";

import { useJobs } from "@/hooks/useJobs";
import { useFilters } from "@/hooks/useFilters";
import { JobCard } from "./JobCard";
import { AlertCircle, ChevronLeft, ChevronRight, Inbox } from "lucide-react";

export function JobList() {
  const filters = useFilters();
  const { data, isLoading, isError, error } = useJobs(filters);

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
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* Sayfalama Kontrolleri */}
      {totalCount > 12 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => filters.setPage(Math.max(1, filters.page - 1))}
            disabled={filters.page === 1}
            className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-3">
            Sayfa {filters.page}
          </span>
          <button
            onClick={() => filters.setPage(filters.page + 1)}
            disabled={filters.page * 12 >= totalCount}
            className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
