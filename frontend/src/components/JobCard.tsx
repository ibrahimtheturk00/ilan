import Link from "next/link";
import { MapPin, Users, Calendar, ArrowRight, Building, ExternalLink } from "lucide-react";
import { JobPost } from "@/types";
import { formatDate, getDaysRemaining, POST_TYPE_LABELS, CATEGORY_LABELS } from "@/lib/utils";

interface JobCardProps {
  job: JobPost;
}

export function JobCard({ job }: JobCardProps) {
  const typeInfo = job.post_type ? POST_TYPE_LABELS[job.post_type] : POST_TYPE_LABELS.diger;
  const categoryInfo = job.category ? CATEGORY_LABELS[job.category] : CATEGORY_LABELS.diger;
  const daysInfo = getDaysRemaining(job.deadline_at);

  return (
    <div className="group bg-white border border-slate-200 hover:border-brand-300 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Üst Rozetler */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {typeInfo && (
            <span className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
          )}
          {categoryInfo && (
            <span className="text-xs px-2.5 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700">
              {categoryInfo.label}
            </span>
          )}
          {job.sources?.name && (
            <span className="text-xs px-2 py-0.5 rounded font-normal text-slate-500 bg-slate-50 border border-slate-200">
              {job.sources.name}
            </span>
          )}

          {/* Kalan Gün Rozeti */}
          <span
            className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              daysInfo.isExpired
                ? "bg-slate-100 text-slate-500"
                : daysInfo.isUrgent
                ? "bg-rose-100 text-rose-700 font-bold animate-pulse"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {daysInfo.text}
          </span>
        </div>

        {/* İlan Başlığı */}
        <Link href={`/jobs/${job.id}/`} className="block">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
            {job.title}
          </h3>
        </Link>

        {/* Kurum Adı */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 mt-2">
          <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{job.institution || "Resmi Kamu Kurumu"}</span>
        </div>

        {/* Açıklama Özeti */}
        {job.description && (
          <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
            {job.description}
          </p>
        )}
      </div>

      {/* Alt Bilgi Çubuğu */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          {job.city && (
            <span className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {job.city}
            </span>
          )}
          {job.position_count && (
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {job.position_count} Kişi
            </span>
          )}
          <span className="hidden sm:flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {formatDate(job.published_at)}
          </span>
        </div>

        <Link
          href={`/jobs/${job.id}/`}
          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800 transition-colors group-hover:translate-x-0.5 duration-150"
        >
          İncele
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
