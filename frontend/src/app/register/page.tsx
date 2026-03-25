"use client";

import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const registerStats = [
    { label: 'Verified Tips', value: '50,000+' },
    { label: 'Global Rank', value: '#1 Tipster' }
  ];

  return (
    <AuthLayout
      title="Start Winning"
      subtitle="Create your account to access our high-confidence predictions."
      marketingTitle="The Ultimate Edge in Betting"
      marketingDescription="Experience professional-grade analysis and real-time updates that turn sports knowledge into consistent profit."
      stats={registerStats}
    >
      <RegisterForm />
    </AuthLayout>
  );
}
