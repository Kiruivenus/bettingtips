import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800/80 bg-zinc-950 text-zinc-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Image src="/logo.png" alt="Platinum Picks" width={24} height={24} />
              </div>
              <span className="text-sm font-semibold text-zinc-100">Platinum Picks</span>
            </div>
            <p className="text-zinc-500 leading-relaxed text-xs">
              Quantitative football analytics and prediction platform. Transparent records updated in real time.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Feed Active
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Predictions</h4>
            <ul className="space-y-2">
              <li><Link href="/free-tips" className="hover:text-zinc-200 transition-colors">Free Daily Picks</Link></li>
              <li><Link href="/buy-tips" className="hover:text-zinc-200 transition-colors">VIP Packages</Link></li>
              <li><Link href="/livescores" className="hover:text-zinc-200 transition-colors">Live Match Scores</Link></li>
              <li><Link href="/results" className="hover:text-zinc-200 transition-colors">Track Record Archive</Link></li>
            </ul>
          </div>

          {/* Account & Help */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Support & Legal</h4>
            <ul className="space-y-2">
              <li><Link href="/support" className="hover:text-zinc-200 transition-colors">FAQ & Support Desk</Link></li>
              <li><Link href="/login" className="hover:text-zinc-200 transition-colors">Account Portal</Link></li>
              <li><Link href="/support" className="hover:text-zinc-200 transition-colors">Contact Analysts</Link></li>
            </ul>
          </div>

          {/* Risk Disclaimer */}
          <div className="space-y-2.5 md:col-span-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">Responsible Gaming</h4>
            <p className="text-zinc-500 text-[11px] leading-relaxed">
              Sports betting involves financial risk. Content is strictly for informational and analytical purposes. Past performance does not guarantee future success. 18+ only.
            </p>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} Platinum Picks. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="text-zinc-600">Privacy Policy</span>
            <span className="text-zinc-600">Terms of Service</span>
            <span className="text-zinc-600 font-numeric">v1.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
