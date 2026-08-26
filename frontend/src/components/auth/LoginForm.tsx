"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  const redirect = searchParams.get('redirect');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed. Check your credentials.');
      }

      login({ ...data, token: data.token });
      
      if (data.role === 'admin') {
        router.push(redirect || '/admin/dashboard');
      } else {
        router.push(redirect || '/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs font-medium">
            {error}
          </div>
        )}
        
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <div className="space-y-1.5">
          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isLoading}>
          Sign In to Account
        </Button>
      </form>

      <div className="pt-4 border-t border-zinc-800 text-center text-xs text-zinc-400">
        Don't have an account?{' '}
        <Link href="/register" className="text-emerald-400 font-semibold hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
};
