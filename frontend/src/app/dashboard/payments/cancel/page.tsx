"use client";

import React from 'react';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-700">
      <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-8">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Payment Cancelled</h1>
      <p className="text-xl text-zinc-400 max-w-lg mb-8">
        Your transaction was not completed. No charges were made to your account.
      </p>
      
      <div className="flex gap-4">
        <Link 
          href="/dashboard/plans" 
          className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/10"
        >
          Return to Plans
        </Link>
      </div>
    </div>
  );
}
