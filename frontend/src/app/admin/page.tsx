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
  ExternalLink
} from "lucide-react";
import { fetchScrapeLogs, MOCK_SOURCES, isSupabaseConfigured, supabase } from "@/lib/supabase";
import { ScrapeLog, Source } from "@/types";
import { formatDate } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [logs, setLogs] = useState<ScrapeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const logData = await fetchScrapeLogs();
    setLogs(logData);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setAuthError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailInput,
      password: passwordInput,
    });
    if (error) {
      setAuthError(error.message);
    } else if (data.session) {
      setUserEmail(data.session.user.email || null);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUserEmail(null);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Üst Başlık */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ana Sayfaya Dön</span>
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-emerald-600" />
              Sistem & Scraper Yönetim Paneli
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            GitHub Actions tarayıcı motorlarının sağlık durumu ve Supabase entegrasyon kayıtları.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-sm transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Yenile</span>
          </button>
        </div>
      </div>

      {/* Supabase Durum Rozeti */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Supabase Durumu</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isSupabaseConfigured ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
          </div>
          <div className="text-base font-bold text-slate-800">
            {isSupabaseConfigured ? "Canlı Veritabanı Bağlı" : "Geliştirme / Mock Modu"}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isSupabaseConfigured
              ? "PostgREST API & RLS aktif"
              : ".env.local dosyasına SUPABASE_URL ekleyiniz"}
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Entegre Kaynaklar</span>
            <Server className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-base font-bold text-slate-800">6 Resmi Port</div>
          <p className="text-xs text-slate-500 mt-1">Tüm kaynaklar aktif ve zamanlanmış</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Yönetici Oturumu</span>
            <KeyRound className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-base font-bold text-slate-800 truncate">
            {userEmail || "Anonim Görünüm"}
          </div>
          {userEmail ? (
            <button
              onClick={handleLogout}
              className="text-xs text-rose-600 hover:underline mt-1 font-medium block"
            >
              Çıkış Yap
            </button>
          ) : (
            <span className="text-xs text-slate-400 mt-1 block">Yetkili girişi yapılmadı</span>
          )}
        </div>
      </div>

      {/* Kaynak Durumları */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-brand-600" />
          Kaynaklar ve Tarama Sıklıkları
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MOCK_SOURCES.map((s) => (
            <div key={s.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800">{s.name}</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-brand-50 text-brand-700">
                  {s.scraper_type.toUpperCase()}
                </span>
              </div>
              <div className="text-xs text-slate-500 space-y-1">
                <div>Aralık: {s.scrape_interval_minutes} dakika</div>
                <div className="truncate">URL: {s.base_url}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Son Tarama Logları */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-brand-600" />
          Son Tarama Günlükleri (scrape_logs)
        </h2>

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700">
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
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {log.sources?.name || `Kaynak #${log.source_id}`}
                    </td>
                    <td className="py-3 px-4">{new Date(log.started_at).toLocaleTimeString("tr-TR")}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-semibold text-[10px] ${
                          log.status === "success"
                            ? "bg-emerald-100 text-emerald-800"
                            : log.status === "partial"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {log.status === "success" && <CheckCircle className="w-3 h-3" />}
                        {log.status !== "success" && <AlertTriangle className="w-3 h-3" />}
                        {log.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">{log.posts_found}</td>
                    <td className="py-3 px-4 text-emerald-700 font-medium">
                      +{log.posts_new} / ~{log.posts_updated}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {log.error_message || "-"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-600">{log.github_run_id || "-"}</span>
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
