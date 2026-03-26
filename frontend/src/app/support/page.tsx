"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { API_URL } from '@/lib/constants';

interface PlatformSettings {
  telegramGroup: string;
  telegramAgent: string;
  whatsappAgent: string;
  supportEmail: string;
}

export default function SupportPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const Skeleton = () => (
    <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8 animate-pulse flex items-center gap-6">
      <div className="w-16 h-16 bg-white/10 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-6 w-48 bg-white/10 rounded" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-emerald-500/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 w-full z-[100] border-b border-white/5 bg-black/60 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Platinum Picks" width={36} height={36} className="rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
            <span className="text-xl font-extrabold text-white">Platinum Picks</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/free-tips" className="hover:text-white transition-colors">Free Tips</Link>
            <Link href="/buy-tips" className="hover:text-white transition-colors">Buy Tips</Link>
            <Link href="/results" className="hover:text-white transition-colors">Results</Link>
            <Link href="/support" className="text-emerald-400">Support</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-zinc-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 hidden md:block">Sign In</Link>
            <Link href="/register" className="text-sm font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-5 py-2 rounded-xl transition-colors">Join Free</Link>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-zinc-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-[100%] left-0 w-full bg-black/95 border-b border-white/5 px-4 py-4 space-y-2 text-sm font-medium shadow-2xl">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Home</Link>
            <Link href="/free-tips" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Free Tips</Link>
            <Link href="/buy-tips" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Buy Tips</Link>
            <Link href="/results" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Results</Link>
            <Link href="/support" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-emerald-400 hover:bg-white/5">Support</Link>
            <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 px-3 rounded-lg text-zinc-300 hover:bg-white/5">Sign In</Link>
          </div>
        )}
      </nav>

      <main className="max-w-5xl mx-auto px-4 pt-32 pb-24 relative">
        <div className="absolute top-0 right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-[-10%] w-[30%] h-[40%] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />

        <header className="text-center mb-16 relative z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest mb-4">
            🎧 24/7 Assistance
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">Help & Support</h1>
          <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Need help with your subscription or have questions about our tips? Our experts and support agents are ready to assist you.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 relative z-10">
          {loading ? (
            <>
              <Skeleton />
              <Skeleton />
              <Skeleton />
              <Skeleton />
            </>
          ) : (
            <>
              {/* Telegram Group */}
              {settings?.telegramGroup && (
                <a 
                  href={settings.telegramGroup} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:border-blue-500/30 transition-all duration-300 flex items-center gap-6 shadow-xl"
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.91-1.27 4.85-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .33z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Join Community</h3>
                    <p className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">Telegram Channel</p>
                    <p className="text-sm text-zinc-500 mt-1">Get daily free tips and announcements.</p>
                  </div>
                </a>
              )}

              {/* Telegram Agent */}
              {settings?.telegramAgent && (
                <a 
                  href={`https://t.me/${settings.telegramAgent.replace('@', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:border-sky-500/30 transition-all duration-300 flex items-center gap-6 shadow-xl"
                >
                  <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Direct Chat</h3>
                    <p className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">Telegram Support</p>
                    <p className="text-sm text-zinc-500 mt-1">Personalized help and VIP inquiries.</p>
                  </div>
                </a>
              )}

              {/* WhatsApp Agent */}
              {settings?.whatsappAgent && (
                <a 
                  href={`https://wa.me/${settings.whatsappAgent.replace(/\s+/g, '').replace('+', '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:border-emerald-500/30 transition-all duration-300 flex items-center gap-6 shadow-xl"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-emerald-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72 0.94 3.674 1.436 5.662 1.437h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Instant Help</h3>
                    <p className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">WhatsApp Agent</p>
                    <p className="text-sm text-zinc-500 mt-1">Chat directly with our team on WhatsApp.</p>
                  </div>
                </a>
              )}

              {/* Support Email */}
              {settings?.supportEmail && (
                <a 
                  href={`mailto:${settings.supportEmail}`}
                  className="group bg-zinc-900/50 border border-white/10 rounded-3xl p-8 hover:border-zinc-500/30 transition-all duration-300 flex items-center gap-6 shadow-xl"
                >
                  <div className="w-16 h-16 rounded-2xl bg-zinc-500/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Email Us</h3>
                    <p className="text-xl font-bold text-white group-hover:text-zinc-300 transition-colors">Official Inquiries</p>
                    <p className="text-sm text-zinc-500 mt-1">{settings.supportEmail}</p>
                  </div>
                </a>
              )}
            </>
          )}
        </div>

        <section className="mt-24 border-t border-white/5 pt-16">
          <div className="bg-gradient-to-br from-emerald-500/10 to-blue-600/10 rounded-[3rem] p-12 text-center border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all" />
            
            <h2 className="text-3xl font-black text-white mb-4">Gamble Responsibly</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
              Betting involves financial risk. We encourage all our members to bet only what they can afford to lose. If you feel you need help, please contact the relevant support organizations in your region.
            </p>
            <div className="flex justify-center gap-4">
               <span className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400">Must be 18+</span>
               <span className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400">Play Fair</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt="Platinum Picks" width={24} height={24} className="rounded opacity-50" />
            <span className="text-sm font-black text-zinc-600 uppercase tracking-widest">Platinum Picks Support Center</span>
          </div>
          <p className="text-zinc-600 text-[10px] font-medium text-center md:text-right">
            © 2026 Platinum Picks. All Rights Reserved. For account deletion or data privacy requests, please contact us via email.
          </p>
        </div>
      </footer>
    </div>
  );
}
