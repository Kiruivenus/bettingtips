"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';

type MethodKey = 'manual' | 'mpesa_manual' | 'till' | 'airtel' | 'paypal_ff' | 'skrill' | 'neteller' | 'crypto' | 'revolut' | 'wise' | 'stripe' | 'paypal' | 'mpesa';

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
    label: '🏦 Bank Transfer',
    description: 'Direct bank account transfer authorization.',
    fields: [
      { key: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'e.g. Chase Bank' },
      { key: 'accountName', label: 'Account Name', type: 'text', placeholder: 'e.g. Platinum Picks LLC' },
      { key: 'accountNumber', label: 'Account Number', type: 'text', placeholder: 'e.g. 0123456789' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Transfer to above account details and submit transaction reference.' },
    ],
  },
  {
    id: 'mpesa_manual',
    label: '📲 M-Pesa Send Money',
    description: 'Manual M-Pesa phone number transfer.',
    fields: [
      { key: 'phoneNumber', label: 'M-Pesa Phone Number', type: 'text', placeholder: 'e.g. 254700000000' },
      { key: 'accountName', label: 'Account Name', type: 'text', placeholder: 'e.g. Platinum Picks Admin' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Send money to above M-Pesa number and enter transaction code.' },
    ],
  },
  {
    id: 'till',
    label: '🏪 Lipa Na M-Pesa Till',
    description: 'Buy Goods & Services M-Pesa Till Number.',
    fields: [
      { key: 'tillNumber', label: 'Till Number', type: 'text', placeholder: 'e.g. 174379' },
      { key: 'tillName', label: 'Till Store Name', type: 'text', placeholder: 'e.g. Platinum Picks VIP' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Pay to Till Number above and submit M-Pesa transaction code.' },
    ],
  },
  {
    id: 'airtel',
    label: '🔴 Airtel Money',
    description: 'Airtel Money transfer authorization.',
    fields: [
      { key: 'phoneNumber', label: 'Airtel Phone Number', type: 'text', placeholder: 'e.g. 254733000000' },
      { key: 'accountName', label: 'Account Name', type: 'text', placeholder: 'e.g. Platinum Picks Admin' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Send money via Airtel Money to number above and submit reference.' },
    ],
  },
  {
    id: 'paypal_ff',
    label: '🤝 PayPal Friends & Family',
    description: 'Manual PayPal transfer via Friends & Family.',
    fields: [
      { key: 'email', label: 'PayPal Email', type: 'text', placeholder: 'payments@elitetipspro.com' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Send via Friends & Family to email above and submit transaction ID.' },
    ],
  },
  {
    id: 'skrill',
    label: '💰 Skrill E-Wallet',
    description: 'Skrill transfer authorization.',
    fields: [
      { key: 'email', label: 'Skrill Email', type: 'text', placeholder: 'payments@elitetipspro.com' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Transfer to Skrill email above and submit reference ID.' },
    ],
  },
  {
    id: 'neteller',
    label: '💵 Neteller',
    description: 'Neteller payment authorization.',
    fields: [
      { key: 'email', label: 'Neteller Email', type: 'text', placeholder: 'payments@elitetipspro.com' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Send Neteller payment to email above and submit reference.' },
    ],
  },
  {
    id: 'crypto',
    label: '₿ Cryptocurrency',
    description: 'Crypto wallet transfer (USDT / BTC / ETH).',
    fields: [
      { key: 'walletAddress', label: 'Wallet Address', type: 'text', placeholder: '0x1234... or Txxxx...' },
      { key: 'network', label: 'Network Protocol', type: 'text', placeholder: 'e.g. USDT (TRC20) / ERC20' },
      { key: 'acceptedCoins', label: 'Accepted Coins', type: 'text', placeholder: 'USDT, BTC, ETH' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Send payment to crypto wallet above and submit TX Hash.' },
    ],
  },
  {
    id: 'revolut',
    label: '🔄 Revolut',
    description: 'Revolut tag or IBAN transfer.',
    fields: [
      { key: 'username', label: 'Revolut Revtag / IBAN', type: 'text', placeholder: '@username or IBAN' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Transfer to Revolut tag above and submit confirmation ID.' },
    ],
  },
  {
    id: 'wise',
    label: '🌍 Wise (TransferWise)',
    description: 'Wise email or account details.',
    fields: [
      { key: 'email', label: 'Wise Account Email', type: 'text', placeholder: 'payments@elitetipspro.com' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Send Wise transfer to email above and submit transfer reference.' },
    ],
  },
  {
    id: 'stripe',
    label: '💳 Stripe API Gateway',
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
    label: '🅿️ PayPal API Integration',
    description: 'Automated international PayPal gateway.',
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'AXxx...' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'EXxx...' },
      { key: 'mode', label: 'Environment', type: 'select', options: ['sandbox', 'live'] },
    ],
  },
  {
    id: 'mpesa',
    label: '📱 M-Pesa Express STK Push API',
    description: 'Automated mobile money STK push gateway.',
    fields: [
      { key: 'consumerKey', label: 'Consumer Key', type: 'text', placeholder: 'xxxx...' },
      { key: 'consumerSecret', label: 'Consumer Secret', type: 'password', placeholder: 'xxxx...' },
      { key: 'passkey', label: 'Lipa Na M-Pesa Passkey', type: 'password', placeholder: 'bfb279...' },
      { key: 'shortcode', label: 'Shortcode / Paybill Number', type: 'text', placeholder: '174379' },
      { key: 'partyB', label: 'Party B (Till Number / Shortcode / Paybill)', type: 'text', placeholder: 'e.g. 174379 or Till Number' },
      { key: 'exchangeRate', label: 'USD to KES Exchange Rate', type: 'text', placeholder: '130' },
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
        const res = await fetch(`${API_URL}/api/settings/payments`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const enMap: Record<string, boolean> = {};
          const fMap: Record<string, Record<string, string>> = {};

          if (data && typeof data === 'object') {
            Object.entries(data).forEach(([method, item]: [string, any]) => {
              enMap[method] = item?.isEnabled ?? true;
              fMap[method] = item?.settings || {};
            });
          }

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
      [method]: prev[method] !== undefined ? !prev[method] : false
    }));
  };

  const handleSave = async (method: MethodKey) => {
    setSaving(true);
    try {
      const isEnabledValue = enabling[method] !== undefined ? enabling[method] : true;
      const res = await fetch(`${API_URL}/api/settings/payments/${method}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          method,
          isEnabled: isEnabledValue,
          settings: fieldValues[method] || {}
        })
      });

      if (!res.ok) throw new Error('Failed to update');
      showToast(`${METHODS.find(m => m.id === method)?.label || method} settings saved successfully`, 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const currentMethodConfig = METHODS.find(m => m.id === activeTab) || METHODS[0];

  return (
    <div className="space-y-6 font-sans">
      
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
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Gateway & Payment Configuration</span>
        <h1 className="text-2xl font-bold text-white tracking-tight">All Payment Gateways & Methods</h1>
        <p className="text-xs text-zinc-400">Configure API keys, webhooks, and manual transfer details for member checkouts across all 13 supported payment gateways.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-zinc-800">
        {METHODS.map((m) => {
          const isEnabled = enabling[m.id] !== false;
          return (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeTab === m.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Configuration Card */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-white">{currentMethodConfig.label}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{currentMethodConfig.description}</p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800">
            <input
              type="checkbox"
              checked={enabling[activeTab] !== false}
              onChange={() => handleToggle(activeTab)}
              className="rounded border-zinc-800 bg-zinc-950 text-emerald-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <span className="text-xs font-semibold text-zinc-200">Enable Method</span>
          </label>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-zinc-500">Loading payment credentials...</div>
        ) : (
          <div className="space-y-4 max-w-xl">
            {currentMethodConfig.fields.map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="block text-xs font-medium text-zinc-300">{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    value={fieldValues[activeTab]?.[f.key] || f.options?.[0] || 'sandbox'}
                    onChange={(e) => handleFieldChange(activeTab, f.key, e.target.value)}
                    className="w-full h-9 rounded-lg bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500"
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
                    className="w-full rounded-lg bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                ) : (
                  <input
                    type={f.type}
                    value={fieldValues[activeTab]?.[f.key] || ''}
                    onChange={(e) => handleFieldChange(activeTab, f.key, e.target.value)}
                    placeholder={f.placeholder}
                    className="w-full h-9 rounded-lg bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
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
                Save Payment Settings
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
