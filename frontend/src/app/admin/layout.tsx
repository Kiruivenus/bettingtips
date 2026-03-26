"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [pendingPaymentsCount, setPendingPaymentsCount] = useState(0);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'admin') {
        router.push('/dashboard');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    if (user?.role === 'admin') {
      fetchPendingCount();
    }
  }, [pathname, user]);

  const fetchPendingCount = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch(`${API_URL}/api/payments/pending-count`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingPaymentsCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching pending count", error);
    }
  };

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const navLinks = [
    { name: 'Dashboard Overview', path: '/admin/dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { name: 'Manage Tips', path: '/admin/tips', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Manage Plans', path: '/admin/plans', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Manage Users', path: '/admin/users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
    { name: 'Manage Payments', path: '/admin/payments', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { name: 'Manage FAQs', path: '/admin/faqs', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Contact Messages', path: '/admin/messages', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { name: 'Payment Settings', path: '/admin/payment-settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { name: 'Platform Settings', path: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
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
            <Image src="/logo.png" alt="Admin" width={40} height={40} className="rounded-xl mr-4 shadow-[0_0_20px_rgba(245,158,11,0.3)]" />
            <span className="text-xl font-bold tracking-tight text-white">Admin Hub</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-zinc-400 hover:text-white p-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.path || (pathname.startsWith(link.path) && link.path !== '/admin');
            return (
              <Link key={link.path} href={link.path} className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 group ${isActive ? 'bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100 border border-transparent'}`}>
                <svg className={`w-5 h-5 mr-3 shrink-0 transition-colors duration-300 ${isActive ? 'text-amber-400' : 'text-zinc-500 group-hover:text-zinc-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                </svg>
                <div className="flex-1 flex justify-between items-center">
                  <span>{link.name}</span>
                  {link.path === '/admin/payments' && pendingPaymentsCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-pulse ring-2 ring-red-500/20">
                      {pendingPaymentsCount}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-white/5 shrink-0">
          <div className="flex items-center mb-4 px-2 py-2 rounded-xl bg-white/5 border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-800 to-amber-700 flex items-center justify-center text-zinc-300 uppercase font-bold text-lg shadow-inner shrink-0">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="ml-3 overflow-hidden flex-1">
              <p className="text-sm font-medium text-white truncate">{user.name || 'Admin User'}</p>
              <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">Administrator</p>
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
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] rounded-full bg-orange-500/5 blur-[120px] pointer-events-none" />
        
        {/* Mobile Header */}
        <div className="md:hidden h-16 shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-20">
          <div className="flex items-center">
            <Image src="/logo.png" alt="Admin" width={32} height={32} className="rounded-lg mr-3" />
            <span className="font-bold text-white tracking-tight">Admin Hub</span>
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
