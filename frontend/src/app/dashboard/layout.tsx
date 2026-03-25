"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const navLinks = [
    { name: 'Tips Feed', path: '/dashboard', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { name: 'Subscription Plans', path: '/dashboard/plans', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
    { name: 'Payment History', path: '/dashboard/payments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Free Tips', path: '/dashboard/free-tips', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { name: 'Buy Tips', path: '/dashboard/buy-tips', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z' },
    { name: 'Results Archive', path: '/dashboard/results', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { name: 'FAQ', path: '/dashboard/faq', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Contact', path: '/dashboard/contact', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/5 bg-zinc-950/95 md:bg-black/40 backdrop-blur-3xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
          <div className="flex items-center">
            <Image src="/logo.png" alt="BettingPro" width={40} height={40} className="rounded-xl mr-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]" />
            <span className="text-xl font-bold tracking-tight text-white">BettingPro</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-zinc-400 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto w-full">
          {navLinks.map((link) => {
            const isActive = pathname === link.path || (pathname.startsWith(link.path) && link.path !== '/dashboard');
            return (
              <Link key={link.path} href={link.path} className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${isActive ? 'bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100 border border-transparent'}`}>
                <svg className={`w-5 h-5 mr-3 shrink-0 transition-colors duration-300 ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                </svg>
                <span className="truncate">{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5 shrink-0">
          <div className="flex items-center mb-4 px-2 py-2 rounded-xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 flex items-center justify-center text-zinc-300 uppercase font-bold text-lg shadow-inner shrink-0">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="ml-3 overflow-hidden flex-1">
              <p className="text-sm font-medium text-white truncate">{user.name || 'User'}</p>
              <p className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-red-400 bg-red-500/5 hover:bg-red-500/15 border border-red-500/10 hover:border-red-500/30 rounded-xl transition-all duration-300">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
        
        {/* Mobile Header */}
        <div className="md:hidden h-16 shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center">
            <Image src="/logo.png" alt="BettingPro" width={32} height={32} className="rounded-lg mr-3" />
            <span className="font-bold text-white tracking-tight">BettingPro</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 relative z-10 w-full max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
