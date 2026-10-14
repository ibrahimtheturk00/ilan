"use client";

import React, { useEffect, useState } from "react";
import { JobPost } from "@/types";
import { formatDate, getJobApplicationStatus, resolveApplicationUrl, POST_TYPE_LABELS, CATEGORY_LABELS, cleanJobTitle, cleanInstitution } from "@/lib/utils";
import { getJobMetaDetails } from "@/lib/jobParser";
import { detectInstitutionVisual } from "@/lib/institutionIcons";
import { useFavorites } from "@/hooks/useFavorites";
import {
  X,
  Calendar,
  ExternalLink,
  MapPin,
  Users,
  Clock,
  Share2,
  CheckCircle2,
  Heart,
  Award,
  GraduationCap,
  Check,
  Send,
} from "lucide-react";

interface JobModalProps {
  job: JobPost | null;
  onClose: () => void;
}

export function JobModal({ job, onClose }: JobModalProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [copied, setCopied] = useState(false);

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

  const isFav = isFavorite(job.id);
  const displayTitle = cleanJobTitle(job.title, job.city, job.original_url);
  const displayInstitution = cleanInstitution(job.institution, job.title, job.city, job.original_url);
  const typeInfo = job.post_type ? POST_TYPE_LABELS[job.post_type] : POST_TYPE_LABELS.diger;
  const categoryInfo = job.category ? CATEGORY_LABELS[job.category] : CATEGORY_LABELS.diger;
  const statusInfo = getJobApplicationStatus(job.published_at, job.deadline_at, job.title);
  const applicationUrl = resolveApplicationUrl(displayInstitution, job.original_url);
  const meta = getJobMetaDetails(job);
  const institutionVisual = detectInstitutionVisual(displayInstitution);
  const InstIcon = institutionVisual.icon;

  const shareText = `Kamu İlanı: ${displayTitle}\n${displayInstitution}\n${applicationUrl}`;

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(applicationUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const handleTelegram = () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(applicationUrl)}&text=${encodeURIComponent(job.title)}`, "_blank");
  };

  const handleTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Arka plan tıklama */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Kartı */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-xl shadow-2xl border border-zinc-200 dark:border-zinc-800 max-h-[90vh] flex flex-col z-10 overflow-hidden transition-colors">
        {/* Modal Üst Başlık */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex flex-wrap items-center gap-1.5 flex-1 pr-3">
            {typeInfo && (
              <span className={`text-[11px] px-2.5 py-0.5 rounded-lg ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
            )}
            {categoryInfo && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-lg font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {categoryInfo.label}
              </span>
            )}
            {statusInfo.isCancelled ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-lg font-bold bg-red-600 text-white uppercase tracking-wider shadow-sm">
                {statusInfo.statusTitle}
              </span>
            ) : (
              <span
                className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg ${statusInfo.badgeClass}`}
              >
                {statusInfo.fullBadgeText}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Favori Butonu */}
            <button
              onClick={() => toggleFavorite(job.id)}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
            >
              <Heart
                className={`w-5 h-5 ${
                  isFav
                    ? "fill-rose-500 text-rose-500 scale-110"
                    : "text-slate-400 hover:text-rose-500"
                } transition-all`}
              />
            </button>

            {/* Kapat Butonu */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal İçerik (Scroll edilebilir) */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Kurum Görseli ve Başlık */}
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${institutionVisual.bgColor} ${institutionVisual.iconColor} ${institutionVisual.borderColor} shadow-sm`}>
              <InstIcon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {displayInstitution}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${institutionVisual.bgColor} ${institutionVisual.iconColor}`}>
                  {institutionVisual.categoryLabel}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight">
                {displayTitle}
              </h2>
            </div>
          </div>

          {/* Zenginleştirilmiş Rozetler: KPSS, Eğitim, Yaş Sınırı */}
          <div className="flex flex-wrap items-center gap-2">
            {meta.kpssLabel && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
                <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>{meta.kpssLabel}</span>
              </span>
            )}
            {meta.educationLabel && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
                <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Eğitim: {meta.educationLabel}</span>
              </span>
            )}
            {meta.maxAge && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Yaş Sınırı: Maks. {meta.maxAge}</span>
              </span>
            )}
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

          {/* Hızlı Paylaşım Butonları */}
          <div className="pt-2">
            <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Bu İlanı Paylaş:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleWhatsApp}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-xs font-semibold hover:bg-emerald-100 transition-colors"
              >
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleTelegram}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/60 text-xs font-semibold hover:bg-sky-100 transition-colors"
              >
                <Send className="w-3 h-3" />
                <span>Telegram</span>
              </button>
              <button
                onClick={handleTwitter}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                <span>X (Twitter)</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? "Kopyalandı!" : "Linki Kopyala"}</span>
              </button>
            </div>
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
            onClick={() => toggleFavorite(job.id)}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
              isFav
                ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{isFav ? "Favorilerden Kaldır" : "Favorilere Ekle"}</span>
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
