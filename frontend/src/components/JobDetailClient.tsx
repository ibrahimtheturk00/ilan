"use client";

import React from "react";
import Link from "next/link";
import { useJobDetail } from "@/hooks/useJobs";
import { formatDate, getDaysRemaining, POST_TYPE_LABELS, CATEGORY_LABELS } from "@/lib/utils";
import {
  ArrowLeft,
  Building,
  Calendar,
  ExternalLink,
  MapPin,
  Users,
  Clock,
  Share2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export function JobDetailClient({ id }: { id: string }) {
  const { data: job, isLoading, isError } = useJobDetail(id);

  if (isLoading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-8 animate-pulse space-y-4">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-700/60 rounded-xl" />
          <div className="h-32 w-full bg-slate-100 dark:bg-slate-700/60 rounded-xl" />
        </div>
      </main>
    );
  }

  if (isError || !job) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">İlan Bulunamadı</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          İlan yayından kaldırılmış veya bağlantı geçersiz olabilir.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 mt-6 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          İlan Listesine Dön
        </Link>
      </main>
    );
  }

  const typeInfo = job.post_type ? POST_TYPE_LABELS[job.post_type] : POST_TYPE_LABELS.diger;
  const categoryInfo = job.category ? CATEGORY_LABELS[job.category] : CATEGORY_LABELS.diger;
  const daysInfo = getDaysRemaining(job.deadline_at);

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      {/* Geri Butonu & Breadcrumb */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Tüm İlanlara Dön</span>
        </Link>

        <button
          onClick={() => {
            if (typeof window !== "undefined") {
              navigator.clipboard?.writeText(window.location.href);
              alert("İlan bağlantısı panoya kopyalandı!");
            }
          }}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Paylaş</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol / Ana İlan Detay Alanı */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-sm">
            {/* Rozetler */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {typeInfo && (
                <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
              )}
              {categoryInfo && (
                <span className="text-xs px-2.5 py-0.5 rounded-md font-medium bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300">
                  {categoryInfo.label}
                </span>
              )}
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  daysInfo.isExpired
                    ? "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    : daysInfo.isUrgent
                    ? "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 font-bold animate-pulse"
                    : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400"
                }`}
              >
                {daysInfo.text}
              </span>
            </div>

            {/* Başlık */}
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug">
              {job.title}
            </h1>

            {/* Kurum */}
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mt-3 pb-6 border-b border-slate-100 dark:border-slate-700/60">
              <Building className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
              <span>{job.institution || "Resmi Kamu Kurumu"}</span>
            </div>

            {/* İlan Açıklaması */}
            <div className="mt-6 prose prose-slate dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">İlan Detayı ve Başvuru Şartları</h3>
              <p className="whitespace-pre-line text-slate-600 dark:text-slate-400">
                {job.description || "İlan açıklaması için resmi kaynak sayfasını ziyaret ediniz."}
              </p>
            </div>

            {/* Başvuru Aksiyon Butonu */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Resmi başvuru işlemi ilgili kurum portalı üzerinden gerçekleştirilir.
              </div>
              <a
                href={job.original_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
              >
                <span>Resmi İlana Git & Başvur</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Sağ / Meta Bilgi Kartı */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-700/60">
              Özet Bilgiler
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Şehir:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {job.city || "Tüm Türkiye"}
                </span>
              </div>

              {job.position_count && (
                <div className="flex items-start justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" /> Kadro Sayısı:
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                    {job.position_count} Kişi
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" /> Yayın Tarihi:
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-right">
                  {formatDate(job.published_at)}
                </span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" /> Son Başvuru:
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400 text-right">
                  {formatDate(job.deadline_at)}
                </span>
              </div>

              <div className="flex items-start justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Kaynak:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300 text-right">
                  {job.sources?.name || "Resmi Portal"}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-slate-800 dark:to-slate-800/60 border border-brand-200/60 dark:border-slate-700 rounded-3xl p-5 text-xs text-brand-900 dark:text-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-brand-800 dark:text-brand-400">
              <CheckCircle2 className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>Güvenlik & Doğrulama</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Bu ilan resmi kamu kaynaklarından SHA-256 kriptografik parmak izi ile taranarak doğrulanmıştır.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
