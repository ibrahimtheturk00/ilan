"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Activity,
  Server,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import { fetchScrapeLogs, fetchSources, MOCK_SOURCES, isSupabaseConfigured, supabase } from "@/lib/supabase";
import { ScrapeLog, Source } from "@/types";

export default function AdminDashboardPage() {
  const [sources, setSources] = useState<Source[]>(MOCK_SOURCES);
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [logData, sourceData] = await Promise.all([
      fetchScrapeLogs(),
      fetchSources(),
    ]);
    setLogs(logData);
    setSources(sourceData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    if (supabase) {
      supabase.auth.getSession().then(({ data }) => {
        setUserEmail(data.session?.user?.email || null);
      });
    }
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUserEmail(null);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors">
      {/* Üst Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ana Sayfaya Dön</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              Sistem & Scraper Yönetim Paneli
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            GitHub Actions tarayıcı motorlarının sağlık durumu ve Supabase entegrasyon kayıtları.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* Supabase Durum Rozeti */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span>Supabase Durumu</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSupabaseConfigured ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100">
            {isSupabaseConfigured ? "Canlı Veritabanı Bağlı" : "Geliştirme / Mock Modu"}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isSupabaseConfigured
              ? "PostgREST API & RLS aktif"
              : ".env.local dosyasına SUPABASE_URL ekleyiniz"}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span>Entegre Kaynaklar</span>
            <Server className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100">{sources.length} Resmî Kaynak & Port</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Tüm kaynaklar aktif ve zamanlanmış</p>
        </div>

        <div className="bg-white dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
            <span>Yönetici Oturumu</span>
            <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
            {userEmail || "Anonim Görünüm"}
          </div>
          {userEmail ? (
            <button
              onClick={handleLogout}
              className="text-xs text-rose-600 dark:text-rose-400 hover:underline mt-1 font-medium block"
            >
              Çıkış Yap
            </button>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">Yetkili girişi yapılmadı</span>
          )}
        </div>
      </div>

      {/* Kaynak Durumları */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          Kaynaklar ve Tarama Sıklıkları
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sources.map((s) => (
            <div key={s.id} className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{s.name}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-400">
                  {s.scraper_type.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div>Aralık: {s.scrape_interval_minutes} dakika</div>
                <div className="truncate">URL: {s.base_url}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Son Tarama Logları */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          Son Tarama Günlükleri (scrape_logs)
        </h2>

        <div className="bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="py-3 px-4">Kaynak</th>
                  <th className="py-3 px-4">Başlangıç</th>
                  <th className="py-3 px-4">Durum</th>
                  <th className="py-3 px-4">Bulunan</th>
                  <th className="py-3 px-4">Yeni / Güncel</th>
                  <th className="py-3 px-4">Hata / Not</th>
                  <th className="py-3 px-4">GitHub Run</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-200">
                      {log.sources?.name || `Kaynak #${log.source_id}`}
                    </td>
                    <td className="py-3 px-4">{new Date(log.started_at).toLocaleTimeString("tr-TR")}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-xs ${
                          log.status === "success"
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : log.status === "partial"
                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                            : "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300"
                        }`}
                      >
                        {log.status === "success" && <CheckCircle className="w-3 h-3" />}
                        {log.status !== "success" && <AlertTriangle className="w-3 h-3" />}
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">{log.posts_found}</td>
                    <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-medium">
                      +{log.posts_new} / ~{log.posts_updated}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {log.error_message || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-600 dark:text-slate-400">{log.github_run_id || "-"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
