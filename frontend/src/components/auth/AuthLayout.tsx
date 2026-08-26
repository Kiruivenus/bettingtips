import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 pt-20 pb-16 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Product Context */}
            <div className="hidden lg:flex lg:col-span-7 flex-col justify-center space-y-6 pr-8">
              <span className="inline-block px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-semibold text-emerald-400 w-max">
                Verified Analytics Platform
              </span>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
                {marketingTitle}
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-xl">
                {marketingDescription}
              </p>

              {stats.length > 0 && (
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-zinc-800/80 max-w-md font-numeric">
                  {stats.map((stat, i) => (
                    <div key={i}>
                      <span className="text-2xl font-bold text-white block">{stat.value}</span>
                      <span className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Form Panel */}
            <div className="lg:col-span-5 w-full max-w-md mx-auto">
              <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6 sm:p-8 space-y-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
                  <p className="text-xs text-zinc-400">{subtitle}</p>
                </div>

                {children}
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
