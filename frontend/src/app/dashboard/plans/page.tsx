"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Plan {
  _id: string;
  name: string;
  price: number;
  currency: string;
  durationInDays: number;
  features: string[];
}

export default function PlansPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [enabledMethods, setEnabledMethods] = useState<Record<string, boolean>>({});
  
  // M-PESA Modal State
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [selectedPlanForMpesa, setSelectedPlanForMpesa] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mpesaStatus, setMpesaStatus] = useState<{loading: boolean, error: string, success: string}>({
    loading: false, error: '', success: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch plans and enabled payment methods in parallel
        const [plansRes, methodsRes] = await Promise.all([
          fetch(`${API_URL}/api/plans`),
          fetch(`${API_URL}/api/settings/payments/enabled`),
        ]);

        if (plansRes.ok) {
          const data = await plansRes.json();
          if (Array.isArray(data)) setPlans(data);
        }

        if (methodsRes.ok) {
          const methods = await methodsRes.json();
          setEnabledMethods(methods);
        }
      } catch (error) {
        console.error('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStripeCheckout = async (planId: string) => {
    if (!user) return router.push('/login');
    setProcessingId(planId + '-stripe');
    try {
      const res = await fetch(`${API_URL}/api/payments/stripe/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ planId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Stripe checkout error", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePayPalCheckout = async (planId: string) => {
    if (!user) return router.push('/login');
    setProcessingId(planId + '-paypal');
    try {
      const res = await fetch(`${API_URL}/api/payments/paypal/create-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ planId })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("PayPal checkout error", error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleMpesaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPlanForMpesa) return;
    
    setMpesaStatus({ loading: true, error: '', success: '' });
    try {
      const res = await fetch(`${API_URL}/api/payments/mpesa/stk-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ planId: selectedPlanForMpesa, phone: phoneNumber })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'M-PESA request failed');
      
      setMpesaStatus({ 
        loading: false, 
        error: '', 
        success: 'Check your phone! An M-PESA prompt has been sent to your number. Enter your PIN to complete the payment.' 
      });
      
      // Close modal after 5 seconds success
      setTimeout(() => setShowMpesaModal(false), 5000);
    } catch (error: any) {
      setMpesaStatus({ loading: false, error: error.message, success: '' });
    }
  };

  const openMpesaModal = (planId: string) => {
    setSelectedPlanForMpesa(planId);
    setMpesaStatus({ loading: false, error: '', success: '' });
    setShowMpesaModal(true);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-x-hidden">
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-6 mb-8 text-center max-w-none">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Elite Betting Plans</h1>
        <p className="text-zinc-400 text-sm max-w-2xl mx-auto">Choose the perfect plan to elevate your betting strategy with our expert predictions and analysis.</p>
      </header>

      <div className="px-4 sm:px-6 md:px-8 pb-8 space-y-8">
      {loading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 rounded-3xl bg-white/5 border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto items-center">
          {plans.map((plan, index) => {
            const isPopular = index === 1 || plan.name.toLowerCase().includes('pro');
            
            return (
              <div 
                key={plan._id} 
                className={`relative overflow-hidden rounded-3xl border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl flex flex-col
                  ${isPopular 
                    ? 'bg-gradient-to-b from-emerald-500/20 to-black/60 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] md:-mt-8 md:mb-8' 
                    : 'bg-white/5 border-white/10 hover:border-white/20 backdrop-blur-xl'
                  }
                `}
              >
                {isPopular && (
                  <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                )}
                {isPopular && (
                  <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full border border-emerald-500/30">
                    Most Popular
                  </div>
                )}
                
                <div className="p-8 flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-4xl font-extrabold text-white">${plan.price}</span>
                    <span className="text-zinc-500 ml-2 font-medium">/{plan.durationInDays} days</span>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features?.map((feature, i) => (
                      <li key={i} className="flex items-start text-sm text-zinc-300">
                        <svg className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                    <li className="flex items-start text-sm text-zinc-300">
                      <svg className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>24/7 Dedicated Support</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-8 pt-0 mt-auto space-y-3">
                  {enabledMethods.stripe && (
                    <Button 
                      variant={isPopular ? 'primary' : 'outline'}
                      className="w-full flex justify-center items-center"
                      isLoading={processingId === `${plan._id}-stripe`}
                      onClick={() => handleStripeCheckout(plan._id)}
                      disabled={!!processingId}
                    >
                      {!processingId || processingId === `${plan._id}-stripe` ? (
                        <>
                          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M13.976 9.15c-2.172-.806-3.356-1.143-3.356-2.077 0-.741.745-1.284 1.848-1.284 1.558 0 2.879.626 3.655 1.107l1.018-3.153C16.155 3.09 14.509 2.5 12.636 2.5 8.799 2.5 6.2 4.675 6.2 7.749c0 4.14 6.264 3.737 6.264 5.568 0 .899-1.01 1.408-2.228 1.408-1.748 0-3.385-.758-4.329-1.39l-1.077 3.205c1.137.669 3.065 1.258 5.176 1.258 4.09 0 6.643-2.106 6.643-5.228 0-4.475-6.671-3.69-6.671-5.412M24 11.235c0-4.81-3.921-8.735-8.735-8.735S6.529 6.424 6.529 11.235 10.45 19.97 15.265 19.97 24 16.046 24 11.235z" opacity=".05"/><path d="M13.976 9.15c-2.172-.806-3.356-1.143-3.356-2.077 0-.741.745-1.284 1.848-1.284 1.558 0 2.879.626 3.655 1.107l1.018-3.153C16.155 3.09 14.509 2.5 12.636 2.5 8.799 2.5 6.2 4.675 6.2 7.749c0 4.14 6.264 3.737 6.264 5.568 0 .899-1.01 1.408-2.228 1.408-1.748 0-3.385-.758-4.329-1.39l-1.077 3.205c1.137.669 3.065 1.258 5.176 1.258 4.09 0 6.643-2.106 6.643-5.228 0-4.475-6.671-3.69-6.671-5.412" fill="currentColor"/></svg>
                          Pay with Card
                        </>
                      ) : ''}
                    </Button>
                  )}
                  
                  {(enabledMethods.paypal || enabledMethods.mpesa) && (
                    <div className={`grid ${enabledMethods.paypal && enabledMethods.mpesa ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                      {enabledMethods.paypal && (
                        <Button 
                          variant="secondary" 
                          className="w-full text-xs px-2"
                          isLoading={processingId === `${plan._id}-paypal`}
                          onClick={() => handlePayPalCheckout(plan._id)}
                          disabled={!!processingId}
                        >
                          {!processingId || processingId === `${plan._id}-paypal` ? 'PayPal' : ''}
                        </Button>
                      )}
                      {enabledMethods.mpesa && (
                        <Button 
                          variant="secondary" 
                          className="w-full text-xs px-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border-green-500/20 hover:border-green-500/30"
                          onClick={() => openMpesaModal(plan._id)}
                          disabled={!!processingId}
                        >
                          M-PESA
                        </Button>
                      )}
                    </div>
                  )}

                  {!enabledMethods.stripe && !enabledMethods.paypal && !enabledMethods.mpesa && (
                    <p className="text-center text-zinc-500 text-xs py-2">No payment methods available. Contact support.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* M-PESA Modal */}
      {showMpesaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowMpesaModal(false)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-white mb-2">M-PESA Payment</h3>
            <p className="text-sm text-zinc-400 mb-6">Enter your phone number to receive an STK Push prompt.</p>
            
            {mpesaStatus.error && <p className="text-red-400 text-sm mb-4 bg-red-400/10 p-2 rounded-lg">{mpesaStatus.error}</p>}
            {mpesaStatus.success && <p className="text-emerald-400 text-sm mb-4 bg-emerald-400/10 p-2 rounded-lg">{mpesaStatus.success}</p>}
            
            <form onSubmit={handleMpesaSubmit} className="space-y-4">
              <Input 
                autoFocus
                label="Phone Number" 
                placeholder="254700000000" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <div className="flex gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowMpesaModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="w-full bg-[#52B520] hover:bg-[#439c18] text-white shadow-none"
                  isLoading={mpesaStatus.loading}
                >
                  Pay Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
