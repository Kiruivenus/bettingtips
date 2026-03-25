"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';

type MethodKey = 'manual' | 'stripe' | 'paypal' | 'mpesa' | 'skrill' | 'neteller' | 'crypto' | 'revolut' | 'wise' | 'mpesa_manual' | 'paypal_ff' | 'till' | 'airtel';

interface MethodConfig {
  id: MethodKey;
  label: string;
  description: string;
  icon: string;
  color: string;
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
    description: 'Customers pay via bank transfer or mobile money and upload proof. You approve manually.',
    icon: '🏦',
    color: 'border-blue-500/30 bg-blue-500/5',
    fields: [
      { key: 'bankName', label: 'Bank Name', type: 'text', placeholder: 'e.g. Equity Bank Kenya' },
      { key: 'accountName', label: 'Account Name', type: 'text', placeholder: 'e.g. John Doe' },
      { key: 'accountNumber', label: 'Account Number', type: 'text', placeholder: 'e.g. 0123456789' },
      { key: 'mpesaNumber', label: 'M-Pesa Till/Paybill (Manual)', type: 'text', placeholder: 'e.g. 522533' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Pay to the above details and click Submit Payment after uploading proof of payment.' },
    ],
  },
  {
    id: 'stripe',
    label: 'Stripe (Credit/Debit Card)',
    description: 'Automatically process card payments worldwide. Requires a Stripe account.',
    icon: '💳',
    color: 'border-indigo-500/30 bg-indigo-500/5',
    fields: [
      { key: 'publishableKey', label: 'Publishable Key', type: 'text', placeholder: 'pk_live_...', hint: 'Your public Stripe key (starts with pk_live_ or pk_test_)' },
      { key: 'secretKey', label: 'Secret Key', type: 'password', placeholder: 'sk_live_...', hint: 'Your secret Stripe key. Never share this publicly.' },
      { key: 'webhookSecret', label: 'Webhook Signing Secret', type: 'password', placeholder: 'whsec_...', hint: 'Found in Stripe Dashboard → Webhooks.' },
    ],
  },
  {
    id: 'paypal',
    label: 'PayPal',
    description: 'Accept PayPal payments globally. Requires a PayPal Business account.',
    icon: '🅿️',
    color: 'border-sky-500/30 bg-sky-500/5',
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'text', placeholder: 'AXxx...', hint: 'From PayPal Developer Dashboard' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', placeholder: 'EXxx...', hint: 'Your PayPal app secret key.' },
      { key: 'mode', label: 'Environment', type: 'select', options: ['sandbox', 'live'], hint: 'Use sandbox for testing, live for production.' },
    ],
  },
  {
    id: 'mpesa',
    label: 'M-Pesa STK Push (Automatic)',
    description: 'Accept M-Pesa payments automatically via Safaricom Daraja API.',
    icon: '📱',
    color: 'border-emerald-500/30 bg-emerald-500/5',
    fields: [
      { key: 'consumerKey', label: 'Consumer Key', type: 'text', placeholder: 'xxxx...', hint: 'From Safaricom Daraja Portal' },
      { key: 'consumerSecret', label: 'Consumer Secret', type: 'password', placeholder: 'xxxx...' },
      { key: 'passkey', label: 'Lipa Na M-Pesa Passkey', type: 'password', placeholder: 'bfb279...' },
      { key: 'shortcode', label: 'Shortcode / Paybill', type: 'text', placeholder: '174379', hint: 'Use 174379 for sandbox.' },
    ],
  },
  {
    id: 'skrill',
    label: 'Skrill',
    description: 'Accept Skrill e-wallet payments. Users send to your Skrill email and submit proof.',
    icon: '💰',
    color: 'border-purple-500/30 bg-purple-500/5',
    fields: [
      { key: 'email', label: 'Skrill Email', type: 'text', placeholder: 'your@skrill.com' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Send payment to the Skrill email above and submit your transaction ID.' },
    ],
  },
  {
    id: 'neteller',
    label: 'Neteller',
    description: 'Accept Neteller e-wallet payments. Users send to your Neteller account and submit proof.',
    icon: '💵',
    color: 'border-green-500/30 bg-green-500/5',
    fields: [
      { key: 'email', label: 'Neteller Email / Account ID', type: 'text', placeholder: 'your@neteller.com' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Send payment to the Neteller account above and submit your transaction ID.' },
    ],
  },
  {
    id: 'crypto',
    label: 'Cryptocurrency',
    description: 'Accept crypto payments (BTC, ETH, USDT, etc). Users send to your wallet address.',
    icon: '₿',
    color: 'border-orange-500/30 bg-orange-500/5',
    fields: [
      { key: 'walletAddress', label: 'Wallet Address', type: 'text', placeholder: '0x... or bc1...' },
      { key: 'network', label: 'Network / Chain', type: 'text', placeholder: 'e.g. BTC, ETH (ERC-20), TRC-20' },
      { key: 'acceptedCoins', label: 'Accepted Coins', type: 'text', placeholder: 'e.g. BTC, ETH, USDT' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Send payment to the wallet address above. Include the transaction hash when submitting.' },
    ],
  },
  {
    id: 'revolut',
    label: 'Revolut',
    description: 'Accept Revolut payments. Users send via Revolut and submit proof.',
    icon: '🔄',
    color: 'border-blue-400/30 bg-blue-400/5',
    fields: [
      { key: 'username', label: 'Revolut Username / Tag', type: 'text', placeholder: '@yourtag' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Send payment to the Revolut tag above and submit a screenshot.' },
    ],
  },
  {
    id: 'wise',
    label: 'Wise (TransferWise)',
    description: 'Accept Wise international transfers. Users send to your Wise account.',
    icon: '🌍',
    color: 'border-teal-500/30 bg-teal-500/5',
    fields: [
      { key: 'email', label: 'Wise Email', type: 'text', placeholder: 'your@email.com' },
      { key: 'accountHolder', label: 'Account Holder Name', type: 'text', placeholder: 'John Doe' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Send payment via Wise to the email above and submit your transaction reference.' },
    ],
  },
  {
    id: 'mpesa_manual',
    label: 'M-Pesa Send Money (Manual)',
    description: 'Accept manual M-Pesa transfers to your phone number. Users send money and submit M-Pesa reference.',
    icon: '📲',
    color: 'border-emerald-400/30 bg-emerald-400/5',
    fields: [
      { key: 'phoneNumber', label: 'M-Pesa Number', type: 'text', placeholder: 'e.g. 0712345678' },
      { key: 'accountName', label: 'Name on M-Pesa', type: 'text', placeholder: 'e.g. John Doe' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Send money to the number above and enter your M-Pesa transaction code below.' },
    ],
  },
  {
    id: 'paypal_ff',
    label: 'PayPal Friends & Family',
    description: 'Accept PayPal payments via Friends & Family mode. Avoids automatic gateway fees.',
    icon: '🤝',
    color: 'border-sky-400/30 bg-sky-400/5',
    fields: [
      { key: 'email', label: 'PayPal Email', type: 'text', placeholder: 'your@email.com' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Send via Friends & Family to the email above and submit your PayPal transaction ID.' },
    ],
  },
  {
    id: 'till',
    label: 'Lipa Na M-Pesa Till',
    description: 'Accept payments via your M-Pesa Buy Goods/Services Till number.',
    icon: '🏪',
    color: 'border-green-600/30 bg-green-600/5',
    fields: [
      { key: 'tillNumber', label: 'Till Number', type: 'text', placeholder: 'e.g. 123456' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Go to Lipa Na M-Pesa -> Buy Goods -> Enter Till below. Submit your M-Pesa message reference.' },
    ],
  },
  {
    id: 'airtel',
    label: 'Airtel Money',
    description: 'Accept manual Airtel Money transfers to your phone number.',
    icon: '🔴',
    color: 'border-red-500/30 bg-red-500/5',
    fields: [
      { key: 'phoneNumber', label: 'Airtel Number', type: 'text', placeholder: 'e.g. 0733123456' },
      { key: 'accountName', label: 'Name on Airtel Money', type: 'text', placeholder: 'e.g. Jane Doe' },
      { key: 'instructions', label: 'Payment Instructions', type: 'textarea', placeholder: 'Send money to the Airtel number above and submit your transaction ID.' },
    ],
  },
];

export default function AdminPaymentSettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<MethodKey>('manual');
  const [enabling, setEnabling] = useState<Record<string, boolean>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, string>>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch current settings from backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/settings/payments`, {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const newEnabling: Record<string, boolean> = {};
          const newValues: Record<string, Record<string, string>> = {};
          METHODS.forEach(m => {
            newEnabling[m.id] = data[m.id]?.isEnabled || false;
            newValues[m.id] = data[m.id]?.settings || {};
          });
          setEnabling(newEnabling);
          setFieldValues(newValues);
        }
      } catch (e) {
        showToast('Error loading settings', 'error');
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'admin') fetchSettings();
  }, [user]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleToggle = async (methodId: MethodKey) => {
    const newVal = !enabling[methodId];
    setEnabling(prev => ({ ...prev, [methodId]: newVal }));
    try {
      await fetch(`${API_URL}/api/settings/payments/${methodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify({ isEnabled: newVal, settings: fieldValues[methodId] || {} })
      });
    } catch {
      setEnabling(prev => ({ ...prev, [methodId]: !newVal }));
      showToast('Failed to toggle payment method', 'error');
    }
  };

  const handleSave = async (methodId: MethodKey) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/settings/payments/${methodId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
        body: JSON.stringify({
          isEnabled: enabling[methodId] || false,
          settings: fieldValues[methodId] || {}
        })
      });
      if (!res.ok) throw new Error();
      showToast(`${METHODS.find(m => m.id === methodId)?.label} settings saved!`, 'success');
    } catch {
      showToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleField = (methodId: MethodKey, key: string, value: string) => {
    setFieldValues(prev => ({
      ...prev,
      [methodId]: { ...(prev[methodId] || {}), [key]: value }
    }));
  };

  const activeMethod = METHODS.find(m => m.id === activeTab)!;
  const activeValues = fieldValues[activeTab] || {};

  return (
    <div className="animate-in fade-in duration-500 relative">
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

      <header className="mb-8 border-b border-white/5 pb-6">
        <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Payment Settings</h1>
        <p className="text-zinc-400">Enable or disable payment gateways and configure API credentials. Changes take effect immediately.</p>
      </header>

      {loading ? (
        <div className="space-y-4">{[1,2,3,4].map(i => <div key={i} className="h-20 bg-white/5 animate-pulse rounded-2xl" />)}</div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Method Selection Panel */}
          <div className="lg:w-72 shrink-0 space-y-3">
            {METHODS.map(method => (
              <div
                key={method.id}
                onClick={() => setActiveTab(method.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${
                  activeTab === method.id
                    ? 'bg-white/8 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.06)]'
                    : 'bg-white/3 border-white/5 hover:border-white/10 hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-white">{method.label}</div>
                      <div className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${enabling[method.id] ? 'text-emerald-400' : 'text-zinc-600'}`}>
                        {enabling[method.id] ? '● Active' : '○ Disabled'}
                      </div>
                    </div>
                  </div>
                  {/* Toggle switch */}
                  <button
                    onClick={e => { e.stopPropagation(); handleToggle(method.id); }}
                    className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${enabling[method.id] ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabling[method.id] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Settings Panel */}
          <div className="flex-1 min-w-0">
            <div className={`rounded-2xl border p-6 ${activeMethod.color}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">{activeMethod.icon}</span>
                  <div>
                    <h2 className="text-xl font-extrabold text-white">{activeMethod.label}</h2>
                    <p className="text-zinc-400 text-sm mt-1">{activeMethod.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-zinc-500 font-medium">{enabling[activeTab] ? 'Enabled' : 'Disabled'}</span>
                  <button
                    onClick={() => handleToggle(activeTab)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${enabling[activeTab] ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${enabling[activeTab] ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Warning banner for automatic methods */}
              {activeTab !== 'manual' && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <div>
                    <p className="text-amber-400 text-sm font-bold">Security Notice</p>
                    <p className="text-amber-400/70 text-xs mt-1">API credentials are encrypted and stored securely. They are also written to the backend environment file and take effect immediately without restarting the server.</p>
                  </div>
                </div>
              )}

              {/* Fields */}
              <div className="space-y-5">
                {activeMethod.fields.map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-bold text-zinc-300 mb-1.5 uppercase tracking-wider">{field.label}</label>

                    {field.type === 'textarea' ? (
                      <textarea
                        rows={3}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 resize-none placeholder-zinc-600"
                        placeholder={field.placeholder}
                        value={activeValues[field.key] && !activeValues[field.key].includes('••••') ? activeValues[field.key] : ''}
                        onChange={e => handleField(activeTab, field.key, e.target.value)}
                      />
                    ) : field.type === 'select' ? (
                      <select
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 cursor-pointer"
                        value={activeValues[field.key] || field.options?.[0] || ''}
                        onChange={e => handleField(activeTab, field.key, e.target.value)}
                      >
                        {field.options?.map(o => (
                          <option key={o} value={o} className="bg-zinc-900">{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="relative">
                        <input
                          type={field.type === 'password' && !showPasswords[`${activeTab}-${field.key}`] ? 'password' : 'text'}
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-amber-500/50 placeholder-zinc-600 pr-12"
                          placeholder={activeValues[field.key] || field.placeholder}
                          value={activeValues[field.key] && !activeValues[field.key].includes('••••') ? activeValues[field.key] : ''}
                          onChange={e => handleField(activeTab, field.key, e.target.value)}
                        />
                        {field.type === 'password' && (
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, [`${activeTab}-${field.key}`]: !prev[`${activeTab}-${field.key}`] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                          >
                            {showPasswords[`${activeTab}-${field.key}`] ? (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {field.hint && (
                      <p className="text-zinc-600 text-xs mt-1.5 flex items-start gap-1.5">
                        <svg className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {field.hint}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick links for getting credentials */}
              {activeTab !== 'manual' && (
                <div className="mt-6 p-4 bg-white/3 border border-white/8 rounded-xl">
                  <p className="text-xs font-bold text-zinc-400 mb-3 uppercase tracking-wider">🔗 Where to get credentials</p>
                  {activeTab === 'stripe' && (
                    <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 underline">
                      Stripe Dashboard → API Keys →
                    </a>
                  )}
                  {activeTab === 'paypal' && (
                    <a href="https://developer.paypal.com/dashboard/applications/live" target="_blank" rel="noopener noreferrer" className="text-xs text-sky-400 hover:text-sky-300 underline">
                      PayPal Developer Dashboard → Apps & Credentials →
                    </a>
                  )}
                  {activeTab === 'mpesa' && (
                    <a href="https://developer.safaricom.co.ke/MyApps" target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-400 hover:text-emerald-300 underline">
                      Safaricom Daraja Portal → My Apps →
                    </a>
                  )}
                </div>
              )}

              {/* Save Button */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => handleSave(activeTab)}
                  disabled={saving}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />}
                  Save {activeMethod.label} Settings
                </button>
              </div>
            </div>

            {/* Overview cards */}
            <div className="mt-6 grid grid-cols-3 sm:grid-cols-5 gap-3">
              {METHODS.map(m => (
                <div key={m.id} className={`p-4 rounded-xl border text-center ${enabling[m.id] ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/5 bg-white/3'}`}>
                  <div className="text-2xl mb-2">{m.icon}</div>
                  <div className={`text-xs font-bold uppercase tracking-wider ${enabling[m.id] ? 'text-emerald-400' : 'text-zinc-600'}`}>
                    {enabling[m.id] ? 'Active' : 'Off'}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-1 leading-tight">{m.label.split('(')[0].trim()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
