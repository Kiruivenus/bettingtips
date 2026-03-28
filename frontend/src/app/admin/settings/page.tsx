"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';

interface PlatformSettings {
  telegramGroup: string;
  telegramAgent: string;
  whatsappAgent: string;
  supportEmail: string;
}

export default function AdminSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<PlatformSettings>({
    telegramGroup: '',
    telegramAgent: '',
    whatsappAgent: '',
    supportEmail: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings/platform`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSettings({
            telegramGroup: data.telegramGroup || '',
            telegramAgent: data.telegramAgent || '',
            whatsappAgent: data.whatsappAgent || '',
            supportEmail: data.supportEmail || ''
          });
        }
      } catch (e) {
        showToast('Error loading settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (user?.token) fetchSettings();
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/settings/platform`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        showToast('Settings updated successfully', 'success');
      } else {
        throw new Error();
      }
    } catch (e) {
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-4xl">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg border shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-200 ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {toast.type === 'success'
            ? <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          }
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      <header className="sticky top-0 z-20 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 pb-6 pt-0 -mx-4 sm:-mx-6 md:-mx-8 px-4 sm:px-6 md:px-8 mb-8">
        <div className="pt-6">
          <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Platform Settings</h1>
          <p className="text-zinc-400">Configure support links, social groups, and contact information for your users.</p>
        </div>
      </header>

      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 shadow-xl">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Telegram Group */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Telegram Group Link</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-400 transition-colors group-focus-within:text-blue-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.91-1.27 4.85-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .33z"/></svg>
                  </div>
                  <input
                    type="url"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-zinc-700"
                    placeholder="https://t.me/yourgroup"
                    value={settings.telegramGroup}
                    onChange={e => setSettings({...settings, telegramGroup: e.target.value})}
                  />
                </div>
                <p className="text-[10px] text-zinc-600 font-medium ml-1 italic">The main group where you post free tips.</p>
              </div>

              {/* Telegram Agent */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Telegram Agent Username</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sky-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <input
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-all placeholder:text-zinc-700"
                    placeholder="e.g. @PlatinumSupport"
                    value={settings.telegramAgent}
                    onChange={e => setSettings({...settings, telegramAgent: e.target.value})}
                  />
                </div>
                <p className="text-[10px] text-zinc-600 font-medium ml-1 italic">Direct contact for personalized support on Telegram.</p>
              </div>

              {/* WhatsApp Agent */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">WhatsApp Agent Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-400">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72 0.94 3.674 1.436 5.662 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </div>
                  <input
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-700"
                    placeholder="e.g. +254 712 345 678"
                    value={settings.whatsappAgent}
                    onChange={e => setSettings({...settings, whatsappAgent: e.target.value})}
                  />
                </div>
                <p className="text-[10px] text-zinc-600 font-medium ml-1 italic">Include global dial code (e.g. +254 for Kenya).</p>
              </div>

              {/* Support Email */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1">Official Support Email</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <input
                    type="email"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-white/30 transition-all placeholder:text-zinc-700"
                    placeholder="support@platinumpicks.com"
                    value={settings.supportEmail}
                    onChange={e => setSettings({...settings, supportEmail: e.target.value})}
                  />
                </div>
                <p className="text-[10px] text-zinc-600 font-medium ml-1 italic">For official inquiries and account issues.</p>
              </div>
            </div>

            <div className="mt-12 flex justify-end border-t border-white/5 pt-8">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center px-10 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-sm transition-all shadow-[0_0_30px_rgba(245,158,11,0.2)] disabled:opacity-50"
              >
                {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />}
                Apply Global Settings
              </button>
            </div>
          </div>

          <div className="flex items-start gap-4 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
               <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1">User Visibility</h4>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-2xl">
                These links will be displayed on the public <span className="text-blue-400 underline cursor-help">Support</span> page accessible to both guests and registered users. Ensure all links are accessible and numbers are formatted with international codes for maximum availability.
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
