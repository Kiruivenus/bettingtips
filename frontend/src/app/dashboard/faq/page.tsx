"use client";

import React, { useEffect, useState } from 'react';
import { API_URL } from '@/lib/constants';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
}

export default function DashboardFaqPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await fetch(`${API_URL}/api/faqs`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setFaqs(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const Skeleton = () => (
    <div className="h-16 bg-white/5 animate-pulse rounded-2xl" />
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="md:sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-6 mb-8">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">❓ FAQ</div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Frequently Asked Questions</h1>
        <p className="text-zinc-400 text-lg">Everything you need to know about Platinum Picks.</p>
      </header>

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-12">
      <section className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 sm:p-8">
        {loading ? (
          <div className="space-y-4">{[1, 2, 3, 4, 5].map(i => <Skeleton key={i} />)}</div>
        ) : faqs.length > 0 ? (
          <div className="space-y-3">
            {faqs.map(faq => (
              <div key={faq._id} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === faq._id ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-zinc-900/60 hover:border-white/20'}`}>
                <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === faq._id ? null : faq._id)}>
                  <span className="font-semibold text-white text-sm pr-4">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${openFaq === faq._id ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10'}`}>
                    <svg className={`w-4 h-4 transition-transform duration-300 text-zinc-400 ${openFaq === faq._id ? 'rotate-180 text-emerald-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>
                {openFaq === faq._id && (
                  <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {[
              { q: 'Which payment methods do you accept?', a: 'We accept Credit/Debit Card, PayPal, M-Pesa, and manual bank transfer. Contact us via the form below for other payment options like Skrill, Neteller or Crypto.' },
              { q: 'How will I receive the tips after paying?', a: 'Tips are instantly unlocked in your account dashboard after your payment is verified. You\'ll also receive an email confirmation with instructions.' },
              { q: 'If I buy more than one tip, will I get a discount?', a: 'Yes! Our monthly and weekly plans offer significant savings compared to single-tip purchases. Check our plans section for the best deals.' },
              { q: 'What is your refund policy?', a: 'We don\'t offer refunds once tips have been delivered, however, please contact us if you have any issues and we\'ll work to resolve them.' },
              { q: 'How do I know the tips are genuine?', a: 'All our tips are logged publicly with full transparency. You can view our complete tips archive including wins and losses — we never hide our record.' },
            ].map((item, i) => (
              <div key={i} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${openFaq === String(i) ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10 bg-zinc-900/60'}`}>
                <button className="w-full flex items-center justify-between p-5 text-left" onClick={() => setOpenFaq(openFaq === String(i) ? null : String(i))}>
                  <span className="font-semibold text-white text-sm pr-4">{item.q}</span>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${openFaq === String(i) ? 'border-emerald-500/40 bg-emerald-500/10' : 'border-white/10'}`}>
                    <svg className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${openFaq === String(i) ? 'rotate-180 text-emerald-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </button>
                {openFaq === String(i) && (
                  <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed border-t border-white/5 pt-4">{item.a}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
