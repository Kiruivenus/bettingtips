"use client";

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { API_URL } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const ResetPasswordForm: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  const router = useRouter();
  const params = useParams();
  const token = params?.token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error updating password.');
      }

      setStatus('success');
      setMessage(data.message);
      
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message);
    }
  };

  if (status === 'success') {
    return (
      <div className="p-4 rounded bg-emerald-950/80 border border-emerald-800/60 text-xs text-emerald-300 space-y-2 text-center">
        <p className="font-semibold text-sm">Password Updated Successfully</p>
        <p className="text-zinc-400">Redirecting to sign in page...</p>
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
          label="New Password"
          type="password"
          placeholder="Min 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Repeat new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button 
          type="submit" 
          variant="primary"
          size="md"
          className="w-full" 
          isLoading={status === 'loading'}
        >
          Update Password
        </Button>
      </form>
    </div>
  );
};
