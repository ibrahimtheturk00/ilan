"use client";

import React, { useEffect } from "react";
import { JobPost } from "@/types";
import { formatDate, getJobApplicationStatus, resolveApplicationUrl, POST_TYPE_LABELS, CATEGORY_LABELS } from "@/lib/utils";
import {
  X,
  Building,
  Calendar,
  ExternalLink,
  MapPin,
  Users,
  Clock,
  Share2,
  CheckCircle2,
} from "lucide-react";

interface JobModalProps {
  job: JobPost | null;
  onClose: () => void;
}

export function JobModal({ job, onClose }: JobModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (job) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [job, onClose]);

  if (!job) return null;

  const typeInfo = job.post_type ? POST_TYPE_LABELS[job.post_type] : POST_TYPE_LABELS.diger;
  const categoryInfo = job.category ? CATEGORY_LABELS[job.category] : CATEGORY_LABELS.diger;
  const statusInfo = getJobApplicationStatus(job.published_at, job.deadline_at, job.title);
  const applicationUrl = resolveApplicationUrl(job.institution, job.original_url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-fadeIn">
      {/* Arka plan tıklama */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Kartı */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 max-h-[90vh] flex flex-col z-10 overflow-hidden transition-colors">
        {/* Modal Üst Başlık */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            {statusInfo.isCancelled ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded font-bold bg-red-600 text-white uppercase tracking-wider">
                {statusInfo.statusTitle}
              </span>
            ) : (
              typeInfo && (
                <span className={`text-[11px] px-2.5 py-0.5 rounded font-semibold border ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
              )
            )}
            {categoryInfo && (
              <span className="text-[11px] px-2.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {categoryInfo.label}
              </span>
            )}
            {!statusInfo.isCancelled && (
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded ${statusInfo.badgeClass}`}
              >
                {statusInfo.fullBadgeText}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal İçerik (Scroll edilebilir) */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
              {job.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mt-2">
              <Building className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
              <span>{job.institution || "Resmi Kamu Kurumu"}</span>
            </div>
          </div>

          {/* Meta Detay Kutusu */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                <MapPin className="w-3.5 h-3.5" /> Şehir
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {job.city || "Tüm Türkiye"}
              </span>
            </div>

            {job.position_count && (
              <div>
                <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                  <Users className="w-3.5 h-3.5" /> Kadro
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {job.position_count} Kişi
                </span>
              </div>
            )}

            {!statusInfo.isCancelled && (
              <div>
                <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                  <Calendar className="w-3.5 h-3.5" /> Başvuru Başlangıç
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(job.published_at)}
                </span>
              </div>
            )}

            {!statusInfo.isCancelled && (
              <div>
                <span className="text-slate-400 flex items-center gap-1 mb-0.5">
                  <Clock className="w-3.5 h-3.5" /> Son Gün
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {formatDate(job.deadline_at)}
                </span>
              </div>
            )}
          </div>

          {/* İlan Detay Metni */}
          <div className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm">İlan Açıklaması</h3>
            <p className="whitespace-pre-line text-slate-600 dark:text-slate-400">
              {job.description || "İlan açıklaması için resmi kaynak sayfasını ziyaret ediniz."}
            </p>
          </div>

          {/* Doğrulama Bilgisi */}
          <div className="flex items-center gap-2 p-3.5 rounded-xl bg-brand-50 dark:bg-slate-900/40 border border-brand-200/60 dark:border-slate-700/60 text-xs text-brand-900 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
            <span>Bu ilan resmi kamu portalı üzerinden taranmış ve doğrulanmıştır.</span>
          </div>
        </div>

        {/* Modal Alt Aksiyon Butonları */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => {
              if (typeof window !== "undefined") {
                navigator.clipboard?.writeText(applicationUrl);
                alert("İlan bağlantısı panoya kopyalandı!");
              }
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span>Bağlantıyı Kopyala</span>
          </button>

          <a
            href={applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
          >
            <span>Resmi İlana Git & Başvur</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
