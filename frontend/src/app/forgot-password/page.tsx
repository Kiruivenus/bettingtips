"use client";

import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  const stats = [
    { label: 'Security', value: 'Verified' },
    { label: 'Recovery', value: 'Instant' }
  ];

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your email and we'll send you a secure link to create a new password."
      marketingTitle="Securing Your Account"
      marketingDescription="We use industry-standard encryption and secure tokenization to ensure your account details remain private and protected at all times."
      stats={stats}
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
