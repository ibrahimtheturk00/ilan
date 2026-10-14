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
  cleanTitleWithoutInstitution,
} from "@/lib/utils";
import { getJobMetaDetails } from "@/lib/jobParser";
import { useFavorites } from "@/hooks/useFavorites";
import { detectInstitutionVisual } from "@/lib/institutionIcons";
import { InstitutionLogo } from "@/components/InstitutionLogo";

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

  // Kurum adı zaten üstte logo ile birlikte gösterildiği için başlıkta mükerrer kurum adını temizle
  const displayTitle = cleanTitleWithoutInstitution(rawTitle, displayInstitution);

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
      className={`group relative bg-white/85 dark:bg-[#121624]/85 backdrop-blur-xl border ${
        statusInfo.isCancelled
          ? "border-red-300/80 dark:border-red-900/60"
          : statusInfo.type === "urgent"
          ? "border-rose-300/80 dark:border-rose-900/60"
          : "border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
      } rounded-2xl p-5 sm:p-6 card-hover-clean flex flex-col justify-between h-full cursor-pointer transition-all shadow-sm`}
    >
      <div className="relative z-10">
        {/* Üst Satır: Tek küçük kadro rozeti + İnce kaynak & meslek metni */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {typeInfo && (
              <span className={`text-xs px-2.5 py-1 rounded-full font-semibold shrink-0 border ${typeInfo.color}`}>
                {typeInfo.label}
              </span>
            )}
            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate font-medium">
              {job.sources?.name || "Resmî Gazete"} · {categoryInfo?.label || "Genel"}
            </span>
            {meta.isToday && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30">
                <Sparkles className="w-3 h-3 text-emerald-700 dark:text-sky-400" />
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
                className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="İlanı Paylaş"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {showShareMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-8 z-30 w-44 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-1.5 space-y-0.5 text-xs animate-fadeIn"
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
                    {copied && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleFavoriteClick}
              className="p-1.5 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title={isFav ? "Favorilerden Çıkar" : "Favorilere Ekle"}
            >
              <Heart
                className={`w-4 h-4 transition-all ${
                  isFav ? "fill-rose-500 text-rose-500" : "text-zinc-400 hover:text-rose-500"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Kurum Bilgisi & Gerçek Kurum Logosu (Birebir Eşit Ebatta) */}
        <div className="flex items-center gap-2.5 mb-2.5">
          <InstitutionLogo institution={displayInstitution} size="md" />
          <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 truncate">
            {displayInstitution}
          </span>
        </div>

        {/* İlan Başlığı (Punto 2 birim artırıldı: text-base sm:text-lg) */}
        <h3 className="font-heading text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug tracking-tight">
          {displayTitle}
        </h3>

        {/* Zenginleştirilmiş Meta (KPSS Şartsız, Eğitim, Yaş) - Puntolar text-xs yapıldı */}
        {/* Zenginleştirilmiş Meta (KPSS Şartsız, Eğitim, Yaş) - İki temada optimize edilmiş modern renkler */}
        {(meta.kpssLabel || meta.educationLabel || meta.maxAge) && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            {meta.kpssLabel && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-950 border border-emerald-300/80 dark:bg-sky-500/15 dark:text-sky-300 dark:border-sky-400/30">
                <Award className="w-3 h-3 text-emerald-700 dark:text-sky-400" />
                <span>{meta.kpssLabel}</span>
              </span>
            )}
            {meta.educationLabel && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-950 border border-teal-300/80 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-400/30">
                <GraduationCap className="w-3 h-3 text-teal-700 dark:text-indigo-400" />
                <span>{meta.educationLabel}</span>
              </span>
            )}
            {meta.maxAge && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-950 border border-amber-300/80 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-400/30">
                <Clock className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                <span>Maks. {meta.maxAge} Yaş</span>
              </span>
            )}
          </div>
        )}

        {/* Açıklama Satırı */}
        {cleanedDescription && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2.5 line-clamp-2 leading-relaxed">
            {cleanedDescription}
          </p>
        )}
      </div>

      {/* Alt Bilgi Çubuğu */}
      <div className="relative z-10 mt-5 pt-3.5 border-t border-zinc-200/80 dark:border-white/10 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <div className="flex items-center gap-2.5 flex-wrap">
          {job.city && (
            <span className="flex items-center gap-1.5 text-zinc-800 dark:text-zinc-200 font-semibold text-sm">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-sky-400" />
              <span>{job.city}</span>
            </span>
          )}
          {job.position_count && (
            <span className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-200 font-bold font-mono tabular-nums bg-emerald-50/80 text-emerald-950 border border-emerald-200/90 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-500/25 px-2.5 py-0.5 rounded-full text-xs">
              <Users className="w-3.5 h-3.5 text-emerald-700 dark:text-sky-400" />
              <span>{job.position_count} Kişi</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Süre Durum Rozeti */}
          <span className={`text-xs px-2.5 py-1 rounded-full font-mono tabular-nums font-semibold ${statusInfo.badgeClass}`}>
            {statusInfo.daysText}
          </span>

          <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-zinc-900 text-white hover:bg-emerald-700 dark:bg-white dark:text-zinc-950 dark:hover:bg-sky-400 dark:hover:text-zinc-950 text-xs sm:text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] shadow-sm"
          >
            <span>İncele</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
