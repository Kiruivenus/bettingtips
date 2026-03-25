"use client";

import React, { useState } from 'react';
import { API_URL } from '@/lib/constants';

export default function DashboardContactPage() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      if (!res.ok) throw new Error('API Error');
      setContactStatus('sent');
      setContactForm({ name: '', email: '', message: '' });
    } catch {
      setContactStatus('error');
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-2xl mx-auto">
      <header className="text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider mb-4">✉️ Get In Touch</div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Contact Us</h1>
        <p className="text-zinc-400 text-lg">Have a question about our tips or payment? We typically reply within a few hours.</p>
      </header>

      <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-8 shadow-xl">
        {contactStatus === 'sent' ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Message Sent!</h3>
            <p className="text-zinc-400">We'll get back to you as soon as possible.</p>
            <button 
              onClick={() => setContactStatus('idle')} 
              className="mt-6 text-sm text-emerald-400 hover:text-emerald-300 font-medium px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Your Name</label>
                <input 
                  required 
                  type="text" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 placeholder-zinc-600 transition-all" 
                  placeholder="John Smith" 
                  value={contactForm.name} 
                  onChange={e => setContactForm({...contactForm, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Your Email</label>
                <input 
                  required 
                  type="email" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 placeholder-zinc-600 transition-all" 
                  placeholder="john@example.com" 
                  value={contactForm.email} 
                  onChange={e => setContactForm({...contactForm, email: e.target.value})} 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Your Message</label>
              <textarea 
                required 
                rows={5} 
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 placeholder-zinc-600 resize-none transition-all" 
                placeholder="How do I pay with MPESA?" 
                value={contactForm.message} 
                onChange={e => setContactForm({...contactForm, message: e.target.value})} 
              />
            </div>
            {contactStatus === 'error' && (
              <p className="text-red-400 text-sm font-medium bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
                Failed to send message. Please try again.
              </p>
            )}
            <button 
              type="submit" 
              disabled={contactStatus === 'sending'} 
              className="w-full h-12 rounded-xl font-bold text-black bg-emerald-400 hover:bg-emerald-300 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(52,211,153,0.2)]"
            >
              {contactStatus === 'sending' ? (
                <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />Sending...</>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
