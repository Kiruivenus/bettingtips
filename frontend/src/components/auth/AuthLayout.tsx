import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  marketingTitle: string;
  marketingDescription: string;
  stats?: { label: string; value: string }[];
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
  marketingTitle,
  marketingDescription,
  stats = []
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-zinc-950 overflow-hidden relative">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full h-16 border-b border-white/5 bg-black/60 backdrop-blur-xl z-50 px-6 sm:px-12">
        <div className="h-full flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image src="/logo.png" alt="BettingPro" width={32} height={32} className="rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-105 transition-transform" />
            <span className="text-xl font-black text-white tracking-tighter italic lg:not-italic lg:font-extrabold">BettingPro</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Home</Link>
            <Link href="/free-tips" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Free Tips</Link>
            <Link href="/buy-tips" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Buy Tips</Link>
            <a href="/#faq" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">FAQ</a>
            <a href="/#contact" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Support</a>
          </nav>

          {/* Mobile Spacer (for centering if needed, but justify-between is fine) */}
          <div className="md:hidden w-8" />
        </div>
      </header>

      {/* Main Content Wrapper */}
      <div className="flex pt-16 flex-1 h-full min-h-0">
        {/* Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[20%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

        {/* Left Column: Marketing (Hidden on Mobile) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-12 border-r border-white/5 overflow-hidden">
          {/* Abstract Background Design */}
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,#10b981_0,transparent_50%)]" />
            <svg className="absolute bottom-0 left-0 w-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="url(#grad)" />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.2 }} />
                  <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.1 }} />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Marketing Content */}
          <div className="relative z-10 max-w-lg mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Verified Predictions
            </div>
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              {marketingTitle}
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed mb-10">
              {marketingDescription}
            </p>

            {/* Stats */}
            {stats.length > 0 && (
              <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-3xl font-black text-white mb-1 tracking-tight">{stat.value}</div>
                    <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="relative z-10 text-xs text-zinc-600 font-medium tracking-wide">
            © 2026 BettingPro. Secure & Verified Platform.
          </div>
        </div>

        {/* Right Column: Auth Card */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative z-10 overflow-y-auto">
          <div className="w-full max-w-md animate-slide-up">
            <div className="mb-10 lg:mb-12">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-3 tracking-tight">{title}</h2>
              <p className="text-zinc-400 font-medium">{subtitle}</p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden group hover:border-white/10 transition-all duration-500">
              {/* Subtle card glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-all duration-500 pointer-events-none" />
              
              {children}
            </div>

            {/* Additional mobile footer links / text */}
            <div className="lg:hidden mt-8 text-center px-4">
              <p className="text-zinc-600 text-[10px] uppercase tracking-widest font-bold">
                Professional Betting Analysis Since 2015
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
