"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { API_URL } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error sending password reset email.');
      }

      setStatus('success');
      setMessage(data.message);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  if (status === 'success') {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded bg-emerald-950/80 border border-emerald-800/60 text-xs text-emerald-300 space-y-1">
          <p className="font-semibold">Reset Link Transmitted</p>
          <p className="text-emerald-400/90 leading-relaxed">
            If an account exists for <span className="font-bold">{email}</span>, a password reset link has been dispatched to your inbox.
          </p>
        </div>
        <div className="pt-2 text-center">
          <Link href="/login" className="text-xs font-semibold text-emerald-400 hover:underline">
            Return to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {status === 'error' && (
          <div className="p-3 rounded bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs font-medium">
            {message}
          </div>
        )}

        <Input
          label="Registered Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button 
          type="submit" 
          variant="primary"
          size="md"
          className="w-full" 
          isLoading={status === 'loading'}
        >
          Send Password Reset Instructions
        </Button>
      </form>

      <div className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
        Remember your credentials?{' '}
        <Link href="/login" className="text-emerald-400 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
};
