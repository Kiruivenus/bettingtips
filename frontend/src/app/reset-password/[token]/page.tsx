"use client";

import React from 'react';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';

export default function ResetPasswordPage() {
  const stats = [
    { label: 'Security', value: 'Verified' },
    { label: 'Updated', value: 'Instant' }
  ];

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Your identity has been verified. Please enter a strong new password for your account."
      marketingTitle="Account Recovery Successful"
      marketingDescription="We've confirmed your request. Once you update your password, you'll be able to sign in immediately and access your tips."
      stats={stats}
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
}
