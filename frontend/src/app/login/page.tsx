"use client";

import React, { Suspense } from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const loginStats = [
    { label: 'Active Members', value: '15.4k+' },
    { label: 'Avg. Win Rate', value: '87.2%' }
  ];

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account and get today's winning picks."
      marketingTitle="Win Smarter with Premium Tips"
      marketingDescription="Join thousands of professional bettors who use our verified predictions to beat the odds every single day."
      stats={loginStats}
    >
      <Suspense fallback={<div className="h-48 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" /></div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
