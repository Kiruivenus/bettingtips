"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

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
    setTimeout(() => setToast(null), 3000);
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
    <div className="space-y-6">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded border shadow-lg text-xs font-medium ${
          toast.type === 'success' ? 'bg-emerald-950 border-emerald-800 text-emerald-300' : 'bg-rose-950 border-rose-800 text-rose-300'
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Platform Configuration</span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Global Support & Social Settings</h1>
        <p className="text-xs text-zinc-400">Set support email, Telegram channel links, and WhatsApp analyst numbers.</p>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-zinc-500">Loading platform settings...</div>
      ) : (
        <form onSubmit={handleSave} className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 space-y-4 max-w-xl text-xs">
          <div>
            <label className="block text-zinc-300 font-medium mb-1">Telegram Group Link</label>
            <input
              type="url"
              placeholder="https://t.me/yourchannel"
              value={settings.telegramGroup}
              onChange={(e) => setSettings({ ...settings, telegramGroup: e.target.value })}
              className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Telegram Support Handle</label>
            <input
              type="text"
              placeholder="@support_agent"
              value={settings.telegramAgent}
              onChange={(e) => setSettings({ ...settings, telegramAgent: e.target.value })}
              className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">WhatsApp Agent Phone Number</label>
            <input
              type="text"
              placeholder="+254712345678"
              value={settings.whatsappAgent}
              onChange={(e) => setSettings({ ...settings, whatsappAgent: e.target.value })}
              className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block text-zinc-300 font-medium mb-1">Official Support Email</label>
            <input
              type="email"
              placeholder="support@platinumpicks.com"
              value={settings.supportEmail}
              onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
            />
          </div>

          <div className="pt-4 border-t border-zinc-800 flex justify-end">
            <Button type="submit" variant="primary" size="sm" isLoading={saving}>
              Save Platform Configuration
            </Button>
          </div>
        </form>
      )}

    </div>
  );
}
