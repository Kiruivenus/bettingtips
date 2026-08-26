"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Free Tips', href: '/free-tips' },
    { name: 'VIP Packages', href: '/buy-tips' },
    { name: 'Live Scores', href: '/livescores' },
    { name: 'Track Record', href: '/results' },
    { name: 'Support', href: '/support' },
  ];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all border-b ${
      scrolled ? 'bg-zinc-950/90 backdrop-blur-md border-zinc-800/80 shadow-sm' : 'bg-zinc-950 border-zinc-800/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 flex items-center justify-center bg-transparent border-0">
            <Image 
              src="/logo.png" 
              alt="Platinum Picks" 
              width={32} 
              height={32} 
              className="object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-zinc-100 group-hover:text-emerald-400 transition-colors">
              Platinum Picks
            </span>
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
              Verified Analytics
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  active
                    ? 'text-zinc-100 bg-zinc-800/80 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Actions & User State */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-600/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="max-w-[100px] truncate font-medium">{user.name || user.email}</span>
                <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-md shadow-lg py-1 z-50">
                  <div className="px-3 py-2 border-b border-zinc-800">
                    <p className="text-xs font-medium text-zinc-200 truncate">{user.name}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                  </div>
                  <Link
                    href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                    className="block px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                  >
                    {user.role === 'admin' ? 'Admin Control Center' : 'User Dashboard'}
                  </Link>
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-zinc-800 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-xs font-medium text-zinc-300 hover:text-zinc-100 px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/buy-tips"
                className="text-xs font-medium text-zinc-950 bg-emerald-500 hover:bg-emerald-400 px-3.5 py-1.5 rounded-md transition-colors shadow-sm"
              >
                Get VIP Access
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-zinc-800/60"
            aria-label="Toggle Navigation Menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  active
                    ? 'text-zinc-100 bg-zinc-900 border border-zinc-800'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <div className="pt-3 mt-2 border-t border-zinc-800/80 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                  className="w-full text-center px-3 py-2 text-xs font-medium text-zinc-200 bg-zinc-900 border border-zinc-800 rounded-md"
                >
                  {user.role === 'admin' ? 'Admin Dashboard' : 'User Dashboard'}
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-center px-3 py-2 text-xs font-medium text-rose-400 bg-rose-950/20 border border-rose-900/30 rounded-md"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  className="text-center px-3 py-2 text-xs font-medium text-zinc-300 bg-zinc-900 border border-zinc-800 rounded-md"
                >
                  Sign In
                </Link>
                <Link
                  href="/buy-tips"
                  className="text-center px-3 py-2 text-xs font-semibold text-zinc-950 bg-emerald-500 rounded-md"
                >
                  VIP Access
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
