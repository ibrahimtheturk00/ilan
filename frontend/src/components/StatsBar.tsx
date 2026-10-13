import { Database, Clock, Sparkles, Server } from "lucide-react";

export function StatsBar({ totalCount = 0 }: { totalCount?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 my-6">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600">
          <Database className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">{totalCount || "10+"}</div>
          <div className="text-xs text-slate-500 font-medium">Toplam Aktif İlan</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600">
          <Server className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">6 Kaynak</div>
          <div className="text-xs text-slate-500 font-medium">Resmi Entegrasyon</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-purple-50 text-purple-600">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">Saatlik Cron</div>
          <div className="text-xs text-slate-500 font-medium">GitHub Actions Motoru</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xl font-bold text-slate-800">0 ₺ Maliyet</div>
          <div className="text-xs text-slate-500 font-medium">Statik Serverless Altyapı</div>
        </div>
      </div>
    </div>
  );
}
