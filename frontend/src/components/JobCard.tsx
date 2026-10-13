"use client";

import { useState } from "react";
import {
  MapPin,
  Users,
  Calendar,
  ArrowRight,
  Building,
  Heart,
  Share2,
  Clock,
  Sparkles,
  GraduationCap,
  Award,
  Check,
} from "lucide-react";
import { JobPost } from "@/types";
import { formatDate, getJobApplicationStatus, POST_TYPE_LABELS, CATEGORY_LABELS } from "@/lib/utils";
import { getJobMetaDetails } from "@/lib/jobParser";
import { useFavorites } from "@/hooks/useFavorites";

interface JobCardProps {
  job: JobPost;
  onSelect?: (job: JobPost) => void;
}

export function JobCard({ job, onSelect }: JobCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const isFav = isFavorite(job.id);
  const typeInfo = job.post_type ? POST_TYPE_LABELS[job.post_type] : POST_TYPE_LABELS.diger;
  const categoryInfo = job.category ? CATEGORY_LABELS[job.category] : CATEGORY_LABELS.diger;
  const statusInfo = getJobApplicationStatus(job.published_at, job.deadline_at, job.title);
  const meta = getJobMetaDetails(job);

  const handleClick = (e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault();
      onSelect(job);
    }
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(job.id);
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareMenu(!showShareMenu);
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}${window.location.pathname}#job-${job.id}`;
      navigator.clipboard?.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setShowShareMenu(false);
      }, 1500);
    }
  };

  const handleWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}${window.location.pathname}#job-${job.id}`;
      const text = `📢 ${job.title}\n🏛️ ${job.institution || "Kamu İlanı"}\n🔗 ${shareUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
      setShowShareMenu(false);
    }
  };

  const handleTelegramShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}${window.location.pathname}#job-${job.id}`;
      const text = `${job.title} - ${job.institution || "Kamu İlanı"}`;
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, "_blank");
      setShowShareMenu(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative bg-white dark:bg-slate-900 border ${
        statusInfo.isCancelled
          ? "border-red-200 dark:border-red-900/50 hover:border-red-400"
          : statusInfo.type === "urgent"
          ? "border-rose-200 dark:border-rose-900/60 shadow-sm shadow-rose-500/5 hover:border-rose-300"
          : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
      } rounded-2xl p-5 transition-all duration-150 hover:shadow-md flex flex-col justify-between cursor-pointer`}
    >
      <div>
        {/* Üst Rozetler ve Aksiyon Butonları */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 flex-1">
            {/* Bugün Eklendi Rozeti */}
            {meta.isToday && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700">
                <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Bugün Eklendi</span>
              </span>
            )}

            {/* Kadro Türü Rozeti */}
            {typeInfo && (
              <span className={`text-[11px] px-2.5 py-0.5 rounded-md ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
            )}

            {categoryInfo && (
              <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {categoryInfo.label}
              </span>
            )}

            {/* Kaynak Rozeti */}
            {job.sources?.name && (
              <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                {job.sources.name}
              </span>
            )}
          </div>

          {/* Sağ Üst: Favori & Paylaş Butonları */}
          <div className="flex items-center gap-1 shrink-0 -mt-1 -mr-1">
            {/* Paylaş Menüsü */}
            <div className="relative">
              <button
                type="button"
                onClick={handleShareClick}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="İlanı Paylaş"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {showShareMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-1.5 space-y-1 animate-fadeIn text-xs"
                >
                  <button
                    onClick={handleWhatsAppShare}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium transition-colors"
                  >
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={handleTelegramShare}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-700 dark:text-sky-400 font-medium transition-colors"
                  >
                    <span>Telegram</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors"
                  >
                    <span>Bağlantıyı Kopyala</span>
                    {copied && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                </div>
              )}
            </div>

            {/* Favori Kalp Butonu */}
            <button
              type="button"
              onClick={handleFavoriteClick}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors group/heart"
              title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
            >
              <Heart
                className={`w-4 h-4 transition-all ${
                  isFav
                    ? "fill-rose-500 text-rose-500 scale-110"
                    : "text-slate-400 group-hover/heart:text-rose-500"
                }`}
              />
            </button>
          </div>
        </div>

        {/* İlan Başlığı */}
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2 leading-snug tracking-tight">
          {job.title}
        </h3>

        {/* Kurum Adı */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
          <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span className="truncate font-medium">{job.institution || "Resmi Kamu Kurumu"}</span>
        </div>

        {/* Zenginleştirilmiş Meta Rozetleri: KPSS, Eğitim, Yaş Sınırı */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 pt-1">
          {/* KPSS Rozeti */}
          {meta.kpssLabel && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60">
              <Award className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>{meta.kpssLabel}</span>
            </span>
          )}

          {/* Eğitim Düzeyi Rozeti */}
          {meta.educationLabel && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60">
              <GraduationCap className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              <span>{meta.educationLabel}</span>
            </span>
          )}

          {/* Yaş Sınırı Rozeti */}
          {meta.maxAge && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
              <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Maks. {meta.maxAge} Yaş</span>
            </span>
          )}
        </div>

        {/* Açıklama Özeti */}
        {job.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}
      </div>

      {/* Alt Bilgi Çubuğu */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2.5">
          {job.city && (
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {job.city}
            </span>
          )}
          {job.position_count && (
            <span className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {job.position_count} Kişi
            </span>
          )}
          {!statusInfo.isCancelled && job.published_at && (
            <span className="hidden sm:flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {formatDate(job.published_at)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Durum Rozeti */}
          {statusInfo.isCancelled ? (
            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-red-600 text-white tracking-wide uppercase">
              {statusInfo.statusTitle}
            </span>
          ) : (
            <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${statusInfo.badgeClass}`}>
              {statusInfo.fullBadgeText}
            </span>
          )}

          <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors ml-1"
          >
            <span>İncele</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
