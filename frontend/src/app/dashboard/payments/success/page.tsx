"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const planId = searchParams.get('planId'); // Used by paypal fallback
  
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-700">
      <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-8 relative">
        <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/20" />
        <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] z-10">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Payment Successful!</h1>
      <p className="text-xl text-zinc-400 max-w-lg mb-10">
        Thank you for upgrading. Your account has been credited and you now have full access to premium betting tips.
      </p>
      
      <div className="flex gap-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
        >
          View Premium Tips
        </Link>
      </div>
    </div>
  );
}
