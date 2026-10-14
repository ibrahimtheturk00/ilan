"use client";

import { useState } from "react";
import {
  MapPin,
  Users,
  Calendar,
  ArrowRight,
  Heart,
  Share2,
  Clock,
  Sparkles,
  GraduationCap,
  Award,
  Check,
} from "lucide-react";
import { JobPost } from "@/types";
import {
  formatDate,
  getJobApplicationStatus,
  POST_TYPE_LABELS,
  CATEGORY_LABELS,
  cleanJobTitle,
  cleanInstitution,
  cleanJobDescription,
} from "@/lib/utils";
import { getJobMetaDetails } from "@/lib/jobParser";
import { useFavorites } from "@/hooks/useFavorites";
import { detectInstitutionVisual } from "@/lib/institutionIcons";

interface JobCardProps {
  job: JobPost;
  onSelect?: (job: JobPost) => void;
}

export function JobCard({ job, onSelect }: JobCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const isFav = isFavorite(job.id);
  const rawTitle = cleanJobTitle(job.title, job.city, job.original_url);
  const displayInstitution = cleanInstitution(job.institution, job.title, job.city, job.original_url);

  // Başlık ve Kurum adı birebir aynıysa (örn. Didim Belediyesi Personel Aş) tekrarı önle
  const normTitle = rawTitle.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, "");
  const normInst = displayInstitution.toLowerCase().replace(/[^a-z0-9ğüşıöç]/g, "");
  const isTitleIdenticalToInst = normTitle === normInst;

  const displayTitle = isTitleIdenticalToInst
    ? rawTitle.toLowerCase().includes("personel") || rawTitle.toLowerCase().includes("alım")
      ? rawTitle
      : `${rawTitle} Personel Alımı`
    : rawTitle;

  const typeInfo = job.post_type ? POST_TYPE_LABELS[job.post_type] : POST_TYPE_LABELS.diger;
  const categoryInfo = job.category ? CATEGORY_LABELS[job.category] : CATEGORY_LABELS.diger;
  const statusInfo = getJobApplicationStatus(job.published_at, job.deadline_at, job.title);
  const meta = getJobMetaDetails(job);
  const instVisual = detectInstitutionVisual(displayInstitution);

  // Açıklama metnini temizle; eğer kurum/başlık tekrarından ibaretse veya boşsa null döner
  const cleanedDescription = cleanJobDescription(job.description, displayTitle, displayInstitution);

  const InstIcon = instVisual.icon;

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
      const text = `${job.title}\n${displayInstitution}\n${shareUrl}`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
      setShowShareMenu(false);
    }
  };

  const handleTelegramShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const shareUrl = `${window.location.origin}${window.location.pathname}#job-${job.id}`;
      const text = `${job.title} - ${displayInstitution}`;
      window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`, "_blank");
      setShowShareMenu(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative bg-white dark:bg-[#141824] border ${
        statusInfo.isCancelled
          ? "border-red-300 dark:border-red-900/60"
          : statusInfo.type === "urgent"
          ? "border-rose-300 dark:border-rose-900/50"
          : "border-zinc-200/90 dark:border-zinc-800/90 hover:border-zinc-300 dark:hover:border-zinc-700"
      } rounded-lg p-4 card-hover-clean flex flex-col justify-between cursor-pointer transition-all`}
    >
      <div>
        {/* Üst Satır: Tek küçük kadro rozeti + İnce gri kaynak & meslek metni */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {typeInfo && (
              <span className={`text-[11px] px-2 py-0.5 rounded-md font-medium shrink-0 ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
            )}
            <span className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
              {job.sources?.name || "Resmî Gazete"} · {categoryInfo?.label || "Genel"}
            </span>
            {meta.isToday && (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-semibold border border-emerald-200/80 dark:border-emerald-800/60">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                <span>Bugün</span>
              </span>
            )}
          </div>

          {/* Sağ Üst: Favori & Paylaş Butonları */}
          <div className="flex items-center gap-1 shrink-0 -mt-0.5 -mr-1">
            <div className="relative">
              <button
                type="button"
                onClick={handleShareClick}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="İlanı Paylaş"
              >
                <Share2 className="w-3.5 h-3.5" />
              </button>

              {showShareMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-7 z-30 w-40 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-1 space-y-0.5 text-xs animate-fadeIn"
                >
                  <button
                    onClick={handleWhatsAppShare}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium transition-colors"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={handleTelegramShare}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-700 dark:text-sky-400 font-medium transition-colors"
                  >
                    Telegram
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition-colors"
                  >
                    <span>Linki Kopyala</span>
                    {copied && <Check className="w-3 h-3 text-emerald-500" />}
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleFavoriteClick}
              className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-all ${
                  isFav ? "fill-rose-500 text-rose-500" : "text-zinc-400 hover:text-rose-500"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Kurum Bilgisi & İkon */}
        <div className="flex items-center gap-2 mb-1.5">
          <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 border ${instVisual.bgColor} ${instVisual.borderColor}`}>
            <InstIcon className={`w-3.5 h-3.5 ${instVisual.iconColor}`} />
          </div>
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 truncate">
            {displayInstitution}
          </span>
        </div>

        {/* İlan Başlığı (Tekrar etmiyorsa görünür) */}
        {!isTitleIdenticalToInst && (
          <h3 className="font-heading text-sm font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug tracking-tight">
            {displayTitle}
          </h3>
        )}

        {/* Zenginleştirilmiş Meta (KPSS Şartsız, Eğitim, Yaş) - Sade ve Düzensizliği Engelleyen */}
        {(meta.kpssLabel || meta.educationLabel || meta.maxAge) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            {meta.kpssLabel && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                <Award className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                <span>{meta.kpssLabel}</span>
              </span>
            )}
            {meta.educationLabel && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                <GraduationCap className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                <span>{meta.educationLabel}</span>
              </span>
            )}
            {meta.maxAge && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                <Clock className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                <span>Maks. {meta.maxAge} Yaş</span>
              </span>
            )}
          </div>
        )}

        {/* Açıklama Satırı: YALNIZCA yeni/farklı bilgi varsa gösterilir, yoksa hiç yer kaplamaz */}
        {cleanedDescription && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 leading-relaxed">
            {cleanedDescription}
          </p>
        )}
      </div>

      {/* Alt Bilgi Çubuğu */}
      <div className="mt-3.5 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2 flex-wrap">
          {job.city && (
            <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 font-medium">
              <MapPin className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
              <span>{job.city}</span>
            </span>
          )}
          {job.position_count && (
            <span className="flex items-center gap-1 text-zinc-700 dark:text-zinc-200 font-semibold font-mono tabular-nums bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
              <Users className="w-3 h-3 text-zinc-400" />
              <span>{job.position_count} Kişi</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Süre Durum Rozeti (352 gün kaldı nötr gri, son 3 gün kırmızı, 7 gün altı turuncu) */}
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono tabular-nums ${statusInfo.badgeClass}`}>
            {statusInfo.daysText}
          </span>

          <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-100 hover:bg-zinc-900 hover:text-white dark:bg-zinc-800 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors"
          >
            <span>İncele</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
