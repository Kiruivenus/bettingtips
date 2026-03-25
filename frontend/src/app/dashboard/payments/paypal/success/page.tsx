"use client";

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function PayPalSuccessContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const paymentId = searchParams.get('paymentId');
  const PayerID = searchParams.get('PayerID');
  const planId = searchParams.get('planId');
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMsg, setErrorMsg] = useState('');
  
  const hasExecuted = useRef(false);

  useEffect(() => {
    // We only want to execute once
    if (!user || !paymentId || !PayerID || !planId || hasExecuted.current) return;
    hasExecuted.current = true;

    const executePayment = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/payments/paypal/execute-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ paymentId, PayerID, planId })
        });
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || 'Execution failed');
        }
        
        setStatus('success');
      } catch (error: any) {
        console.error("PayPal execution error:", error);
        setStatus('error');
        setErrorMsg(error.message);
      }
    };

    executePayment();
  }, [user, paymentId, PayerID, planId]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-700">
      {status === 'processing' && (
        <>
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
          <h1 className="text-3xl font-extrabold text-white mb-2">Processing Payment...</h1>
          <p className="text-zinc-400 max-w-md">Please wait while we confirm your transaction with PayPal. Do not close this page.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-8 relative">
            <div className="absolute inset-0 rounded-full animate-ping bg-emerald-500/20" />
            <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.5)] z-10">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Payment Successful!</h1>
          <p className="text-xl text-zinc-400 max-w-lg mb-10">Your account has been credited. Enjoy your premium tips!</p>
          <Link href="/dashboard" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-emerald-500 text-white font-medium hover:bg-emerald-600 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            View Premium Tips
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-8">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Payment Failed</h1>
          <p className="text-xl text-zinc-400 max-w-lg mb-8">{errorMsg || "We couldn't verify your transaction."}</p>
          <Link href="/dashboard/plans" className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-white/10 text-white hover:bg-white/20 border border-white/10 uppercase font-bold text-sm tracking-widest transition-colors tracking-wide">
            Try Again
          </Link>
        </>
      )}
    </div>
  );
}

export default function PayPalSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <PayPalSuccessContent />
    </Suspense>
  )
}
