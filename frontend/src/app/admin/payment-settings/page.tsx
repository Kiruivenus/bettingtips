"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

type MethodKey = 'manual' | 'stripe' | 'paypal' | 'mpesa' | 'skrill' | 'neteller' | 'crypto' | 'revolut' | 'wise' | 'mpesa_manual' | 'paypal_ff' | 'till' | 'airtel';

interface MethodConfig {
  id: MethodKey;
  label: string;
  description: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'password' | 'select' | 'textarea';
    placeholder?: string;
    options?: string[];
    hint?: string;
  }[];
}

const METHODS: MethodConfig[] = [
  {
    id: 'manual',
    label: 'Manual Bank Transfer',
    description: 'Direct bank account transfer authorization.',
    fields: [
      { key: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'e.g. Chase Bank' },
      { key: 'accountName', label: 'Account Name', type: 'text', placeholder: 'e.g. Platinum Picks LLC' },
      { key: 'accountNumber', label: 'Account Number', type: 'text', placeholder: 'e.g. 0123456789' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Transfer to above account details and submit transaction reference.' },
    ],
  },
  {
    id: 'stripe',
    label: 'Stripe API Gateway',
    description: 'Automated credit/debit card processing via Stripe API.',
    fields: [
      { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...' },
      { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...' },
      { key: 'webhookSecret', label: 'Webhook Signing Secret', type: 'password', placeholder: 'whsec_...' },
      { key: 'environment', label: 'Environment', type: 'select', options: ['sandbox', 'live'] },
    ],
  },
  {
    id: 'paypal',
    label: 'PayPal API Integration',
    description: 'International PayPal gateway authorization.',
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'AXxx...' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'EXxx...' },
      { key: 'mode', label: 'Environment', type: 'select', options: ['sandbox', 'live'] },
    ],
  },
  {
    id: 'mpesa',
    label: 'M-Pesa Express API',
    description: 'Automated mobile money STK push gateway.',
    fields: [
      { key: 'consumerKey', label: 'Consumer Key', type: 'text', placeholder: 'xxxx...' },
      { key: 'consumerSecret', label: 'Consumer Secret', type: 'password', placeholder: 'xxxx...' },
      { key: 'passkey', label: 'Lipa Na M-Pesa Passkey', type: 'password', placeholder: 'bfb279...' },
      { key: 'shortcode', label: 'Shortcode / Store Number', type: 'text', placeholder: '174379' },
      { key: 'environment', label: 'Environment', type: 'select', options: ['sandbox', 'live'] },
    ],
  },
];

export default function AdminPaymentSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<MethodKey>('manual');
  const [enabling, setEnabling] = useState<Record<string, boolean>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, string>>>({});
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings/payment`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const enMap: Record<string, boolean> = {};
          const fMap: Record<string, Record<string, string>> = {};

          data.forEach((item: any) => {
            enMap[item.method] = item.isEnabled;
            fMap[item.method] = item.settings || {};
          });

          setEnabling(enMap);
          setFieldValues(fMap);
        }
      } catch (err) {
        showToast('Error loading payment settings', 'error');
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

  const handleFieldChange = (method: string, key: string, val: string) => {
    setFieldValues(prev => ({
      ...prev,
      [method]: {
        ...(prev[method] || {}),
        [key]: val
      }
    }));
  };

  const handleToggle = (method: string) => {
    setEnabling(prev => ({
      ...prev,
      [method]: !prev[method]
    }));
  };

  const handleSave = async (method: MethodKey) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/settings/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          method,
          isEnabled: !!enabling[method],
          settings: fieldValues[method] || {}
        })
      });

      if (!res.ok) throw new Error('Failed to update');
      showToast('Settings saved successfully', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentMethodConfig = METHODS.find(m => m.id === activeTab) || METHODS[0];

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
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Gateway API Configuration</span>
        <h1 className="text-2xl font-bold text-white tracking-tight">Payment Gateways & Credentials</h1>
        <p className="text-xs text-zinc-400">Configure API keys, webhooks, and manual transfer details for member checkouts.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-zinc-800">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveTab(m.id)}
            className={`px-3 py-1.5 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === m.id
                ? 'bg-zinc-800 text-zinc-100 border border-zinc-700'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Configuration Card */}
      <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-sm font-bold text-white">{currentMethodConfig.label}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{currentMethodConfig.description}</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={!!enabling[activeTab]}
              onChange={() => handleToggle(activeTab)}
              className="rounded border-zinc-800 bg-zinc-950 text-emerald-500 focus:ring-0"
            />
            <span className="text-xs font-semibold text-zinc-200">Enable Gateway</span>
          </label>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-zinc-500">Loading gateway credentials...</div>
        ) : (
          <div className="space-y-4 max-w-xl">
            {currentMethodConfig.fields.map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="block text-xs font-medium text-zinc-300">{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    value={fieldValues[activeTab]?.[f.key] || f.options?.[0] || 'sandbox'}
                    onChange={(e) => handleFieldChange(activeTab, f.key, e.target.value)}
                    className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
                  >
                    {f.options?.map(opt => (
                      <option key={opt} value={opt}>{opt.toUpperCase()}</option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={fieldValues[activeTab]?.[f.key] || ''}
                    onChange={(e) => handleFieldChange(activeTab, f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full rounded bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                ) : (
                  <input
                    type={f.type}
                    value={fieldValues[activeTab]?.[f.key] || ''}
                    onChange={(e) => handleFieldChange(activeTab, f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full h-9 rounded bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                )}
              </div>
            ))}

            <div className="pt-4">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSave(activeTab)}
                isLoading={saving}
              >
                Save Gateway Credentials
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
