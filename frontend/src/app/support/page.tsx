"use client";

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { API_URL } from '@/lib/constants';

interface PlatformSettings {
  telegramGroup?: string;
  telegramAgent?: string;
  whatsappAgent?: string;
  supportEmail?: string;
}

export default function SupportPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/settings/platform`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (e) {
        console.error("Error loading support settings", e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      if (!res.ok) throw new Error();
      setContactStatus('sent');
      setContactForm({ name: '', email: '', message: '' });
    } catch {
      setContactStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Header */}
          <div className="border-b border-zinc-800 pb-6 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">Help & Communications Desk</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Customer Support & Inquiries</h1>
            <p className="text-xs text-zinc-400">Direct operational communication channels for membership and technical help.</p>
          </div>

          {/* Channels Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400 text-xs font-bold">
                  TG
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">Telegram Channel</h2>
                  <span className="text-[11px] text-zinc-500">Official Announcements</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Join our verified Telegram group for daily match notifications and instant prediction updates.
              </p>
              {settings?.telegramGroup ? (
                <a
                  href={settings.telegramGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center py-2 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700 transition-colors"
                >
                  Join Telegram Channel →
                </a>
              ) : (
                <span className="block text-center py-2 px-3 rounded bg-zinc-950 text-zinc-600 text-xs">Available via VIP dashboard</span>
              )}
            </div>

            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400 text-xs font-bold">
                  WA
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">WhatsApp Analyst Desk</h2>
                  <span className="text-[11px] text-zinc-500">Direct Support Agent</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Reach out to our customer service desk directly for manual payment review or account inquiries.
              </p>
              {settings?.whatsappAgent ? (
                <a
                  href={`https://wa.me/${settings.whatsappAgent.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full text-center py-2 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700 transition-colors"
                >
                  Contact on WhatsApp →
                </a>
              ) : (
                <span className="block text-center py-2 px-3 rounded bg-zinc-950 text-zinc-600 text-xs">Direct desk available 24/7</span>
              )}
            </div>

            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center text-emerald-400 text-xs font-bold">
                  @
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">Official Support Email</h2>
                  <span className="text-[11px] text-zinc-500">Billing & Enterprise</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Send formal billing inquiries, subscription verification proofs, or general feedback via email.
              </p>
              <a
                href={`mailto:${settings?.supportEmail || 'support@platinumpicks.com'}`}
                className="inline-block w-full text-center py-2 px-3 rounded bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-200 border border-zinc-700 transition-colors truncate"
              >
                {settings?.supportEmail || 'support@platinumpicks.com'}
              </a>
            </div>
          </div>

          {/* Form & Info Section */}
          <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Send a Support Message</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Submissions are reviewed directly by our support desk staff.</p>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Morgan Davis"
                      className="w-full h-9 rounded-md bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="morgan@example.com"
                      className="w-full h-9 rounded-md bg-zinc-950 border border-zinc-800 px-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Inquiry Message *</label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Provide details about your query or transaction reference..."
                    className="w-full rounded-md bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {contactStatus === 'sent' && (
                  <div className="p-3 rounded bg-emerald-950 border border-emerald-800/60 text-emerald-400 text-xs font-medium">
                    Your inquiry has been submitted. Response will be delivered to your email.
                  </div>
                )}

                {contactStatus === 'error' && (
                  <div className="p-3 rounded bg-rose-950 border border-rose-800/60 text-rose-400 text-xs font-medium">
                    An error occurred while transmitting your request. Please try again.
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={contactStatus === 'sending'}
                >
                  Send Inquiry Message
                </Button>
              </form>
            </div>

            <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-zinc-800 pt-6 lg:pt-0 lg:pl-8 space-y-4">
              <h3 className="text-sm font-bold text-white">Verification Guidelines</h3>
              <ul className="space-y-3 text-xs text-zinc-400 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>Payments completed via Credit/Debit card or PayPal are unlocked automatically within 1 minute.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>Manual or mobile money transactions require administrative receipt verification before subscription activation.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                  <span>Ensure all communication contains your registered account email for faster resolution.</span>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
