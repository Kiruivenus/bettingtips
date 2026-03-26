"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

function PlansPageContent() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const planIdParam = searchParams.get('planId') || searchParams.get('plan');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [enabledMethods, setEnabledMethods] = useState<Record<string, { isEnabled: boolean; details?: Record<string, string> }>>({});
  
  // M-PESA Modal State
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [selectedPlanForMpesa, setSelectedPlanForMpesa] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mpesaStatus, setMpesaStatus] = useState<{loading: boolean, error: string, success: string}>({
    loading: false, error: '', success: ''
  });

  // Manual Payment Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedManualMethod, setSelectedManualMethod] = useState<string>('');
  const [selectedPlanForManual, setSelectedPlanForManual] = useState<string | null>(null);
  const [manualTxId, setManualTxId] = useState('');
  const [manualStatus, setManualStatus] = useState<{loading: boolean, error: string, success: string}>({
    loading: false, error: '', success: ''
  });

  const isMethodEnabled = (method: string) => enabledMethods[method]?.isEnabled === true;
  const getMethodDetails = (method: string) => enabledMethods[method]?.details;

  useEffect(() => {
    refreshUser();
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

  const getExchangeRate = () => {
    return parseFloat(enabledMethods['mpesa']?.details?.exchangeRate || '125');
  };

  const calculateConvertedAmount = (usdAmount: number) => {
    const rate = getExchangeRate();
    return Math.round(usdAmount * rate);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Silent copy is fine, but we could add a temporary state for feedback if needed
  };

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('+')) phone = phone.substring(1);
    return phone;
  };

  const mpesaPlan = plans.find(p => p._id === selectedPlanForMpesa);
  const mpesaAmountKes = mpesaPlan ? calculateConvertedAmount(mpesaPlan.price) : 0;
  
  const filteredPlans = planIdParam ? plans.filter(p => p._id === planIdParam) : plans;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-x-hidden">
      <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur-xl border-b border-white/5 px-4 sm:px-6 md:px-8 py-6 mb-8 text-center max-w-none">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          {planIdParam ? 'Complete Your Subscription' : 'Elite Betting Plans'}
        </h1>
        <p className="text-zinc-400 text-sm max-w-2xl mx-auto">
          {planIdParam 
            ? 'Selected plan details and secure payment options.' 
            : 'Choose the perfect plan to elevate your betting strategy with our expert predictions and analysis.'}
        </p>
        {planIdParam && (
          <button 
            onClick={() => router.push('/dashboard/plans')}
            className="mt-4 text-emerald-400 hover:text-emerald-300 group inline-flex items-center gap-2 text-sm font-bold"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            View All Plans
          </button>
        )}
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
          {filteredPlans.map((plan, index) => {
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
                  {isMethodEnabled('stripe') && (
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
                  
                  {(isMethodEnabled('paypal') || isMethodEnabled('mpesa')) && (
                    <div className={`grid ${isMethodEnabled('paypal') && isMethodEnabled('mpesa') ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
                      {isMethodEnabled('paypal') && (
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
                      {isMethodEnabled('mpesa') && (
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

                  {/* Manual Payment Methods */}
                  {(() => {
                    const manualMethods = [
                      { id: 'manual', label: '🏦 Bank Transfer', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20' },
                      { id: 'mpesa_manual', label: '📲 M-Pesa Send', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20' },
                      { id: 'till', label: '🏪 M-Pesa Till', color: 'bg-green-600/10 text-green-500 border-green-600/20 hover:bg-green-600/20' },
                      { id: 'airtel', label: '🔴 Airtel Money', color: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' },
                      { id: 'paypal_ff', label: '🤝 PayPal F&F', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20 hover:bg-sky-500/20' },
                      { id: 'skrill', label: '💰 Skrill', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20' },
                      { id: 'neteller', label: '💵 Neteller', color: 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' },
                      { id: 'crypto', label: '₿ Crypto', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20' },
                      { id: 'revolut', label: '🔄 Revolut', color: 'bg-blue-400/10 text-blue-300 border-blue-400/20 hover:bg-blue-400/20' },
                      { id: 'wise', label: '🌍 Wise', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20 hover:bg-teal-500/20' },
                    ];
                    const enabled = manualMethods.filter(m => isMethodEnabled(m.id));
                    if (enabled.length === 0) return null;
                    return (
                      <div className="grid grid-cols-2 gap-2">
                        {enabled.map(m => (
                          <button
                            key={m.id}
                            onClick={() => { setSelectedManualMethod(m.id); setSelectedPlanForManual(plan._id); setManualTxId(''); setManualStatus({ loading: false, error: '', success: '' }); setShowManualModal(true); }}
                            className={`text-xs font-bold py-2 px-3 rounded-xl border transition-all ${m.color}`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    );
                  })()}

                  {!isMethodEnabled('stripe') && !isMethodEnabled('paypal') && !isMethodEnabled('mpesa') && !isMethodEnabled('manual') && !isMethodEnabled('skrill') && !isMethodEnabled('neteller') && !isMethodEnabled('crypto') && !isMethodEnabled('revolut') && !isMethodEnabled('wise') && (
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
            <p className="text-sm text-zinc-400 mb-6">Enter your M-PESA phone number to receive a payment prompt.</p>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 flex items-center justify-between">
              <span className="text-zinc-400 text-sm font-medium">Total Amount:</span>
              <div className="text-right">
                <div className="text-white font-extrabold text-lg">KES {mpesaAmountKes.toLocaleString()}</div>
                <div className="text-zinc-500 text-[10px] uppercase tracking-tighter">Converted from {mpesaPlan?.currency} {mpesaPlan?.price}</div>
              </div>
            </div>
            
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
                <Button type="button" variant="outline" className="w-full" onClick={() => setShowMpesaModal(false)}>Cancel</Button>
                <Button type="submit" className="w-full bg-[#52B520] hover:bg-[#439c18] text-white shadow-none" isLoading={mpesaStatus.loading}>Pay Now</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Payment Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowManualModal(false)} />
          <div className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-1">
              {selectedManualMethod === 'manual' ? 'Bank Transfer' : 
               selectedManualMethod === 'crypto' ? 'Cryptocurrency' : 
               selectedManualMethod === 'mpesa_manual' ? 'M-Pesa Send Money' :
               selectedManualMethod === 'paypal_ff' ? 'PayPal Friends & Family' :
               selectedManualMethod === 'till' ? 'Lipa Na M-Pesa Till' :
               selectedManualMethod === 'airtel' ? 'Airtel Money' :
               selectedManualMethod.charAt(0).toUpperCase() + selectedManualMethod.slice(1)} Payment
            </h3>
            <p className="text-sm text-zinc-400 mb-5">Send payment using the details below, then submit your transaction ID.</p>
            
            {/* Payment Details */}
            {(() => {
              const details = getMethodDetails(selectedManualMethod);
              if (!details) return <p className="text-zinc-500 text-sm mb-4">Payment details not configured. Contact support.</p>;
              
              const plan = plans.find(p => p._id === selectedPlanForManual);
              const isMpesaRelated = ['till', 'mpesa_manual', 'airtel'].includes(selectedManualMethod);
              const displayAmount = isMpesaRelated && plan 
                ? `KES ${calculateConvertedAmount(plan.price).toLocaleString()}` 
                : `${plan?.currency} ${plan?.price}`;

              const DetailRow = ({ label, value, isMono = false }: { label: string, value: string, isMono?: boolean }) => (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">{label}:</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-white ${isMono ? 'font-mono text-xs break-all bg-black/30 px-2 py-0.5 rounded' : ''}`}>{value}</span>
                    <button 
                      onClick={() => copyToClipboard(value)}
                      className="text-zinc-500 hover:text-white transition-colors p-1"
                      title="Copy to clipboard"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    </button>
                  </div>
                </div>
              );

              return (
                <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-5 space-y-3">
                  <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2 mb-2">
                    <span className="text-zinc-500 font-bold">Amount to Pay:</span>
                    <span className="text-amber-400 font-extrabold text-base">{displayAmount}</span>
                  </div>
                  {details.email && <DetailRow label="Email" value={details.email} isMono />}
                  {details.username && <DetailRow label="Username" value={details.username} isMono />}
                  {details.walletAddress && (
                    <div className="text-sm">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-zinc-500">Wallet Address:</span>
                        <button onClick={() => copyToClipboard(details.walletAddress)} className="text-zinc-500 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg></button>
                      </div>
                      <span className="text-white font-mono text-xs break-all bg-black/40 p-2 rounded-lg block">{details.walletAddress}</span>
                    </div>
                  )}
                  {details.network && <DetailRow label="Network" value={details.network} />}
                  {details.acceptedCoins && <DetailRow label="Accepted" value={details.acceptedCoins} />}
                  {details.accountHolder && <DetailRow label="Name" value={details.accountHolder} />}
                  {details.bankName && <DetailRow label="Bank" value={details.bankName} />}
                  {details.accountName && <DetailRow label="Account Name" value={details.accountName} />}
                  {details.accountNumber && <DetailRow label="Account No" value={details.accountNumber} isMono />}
                  {details.mpesaNumber && <DetailRow label="M-Pesa Number" value={details.mpesaNumber} isMono />}
                  {details.phoneNumber && (
                    <DetailRow 
                      label={
                        selectedManualMethod === 'airtel' ? 'Airtel Number' : 
                        selectedManualMethod === 'mpesa_manual' ? 'M-Pesa Number' : 
                        'Phone Number'
                      } 
                      value={details.phoneNumber} 
                      isMono 
                    />
                  )}
                  {details.tillNumber && <DetailRow label="Till Number" value={details.tillNumber} isMono />}
                  {details.tillName && <DetailRow label="Till Name" value={details.tillName} />}
                  {details.instructions && <div className="mt-3 pt-3 border-t border-white/10"><p className="text-zinc-400 text-xs italic">{details.instructions}</p></div>}
                </div>
              );
            })()}

            {manualStatus.error && <p className="text-red-400 text-sm mb-4 bg-red-400/10 p-2 rounded-lg">{manualStatus.error}</p>}
            {manualStatus.success && <p className="text-emerald-400 text-sm mb-4 bg-emerald-400/10 p-2 rounded-lg">{manualStatus.success}</p>}
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!selectedPlanForManual || !manualTxId.trim()) return;
              setManualStatus({ loading: true, error: '', success: '' });
              try {
                const plan = plans.find(p => p._id === selectedPlanForManual);
                const res = await fetch(`${API_URL}/api/payments/manual`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user?.token}` },
                  body: JSON.stringify({ planId: selectedPlanForManual, amount: plan?.price || 0, transactionId: manualTxId, method: selectedManualMethod }),
                });
                if (!res.ok) throw new Error();
                setManualStatus({ loading: false, error: '', success: 'Payment submitted! It will be reviewed and activated shortly.' });
                setManualTxId('');
                refreshUser();
              } catch {
                setManualStatus({ loading: false, error: 'Failed to submit payment. Try again.', success: '' });
              }
            }} className="space-y-4">
              <Input 
                autoFocus
                label="Transaction ID / Reference" 
                placeholder="Enter your payment reference or transaction ID" 
                value={manualTxId}
                onChange={(e) => setManualTxId(e.target.value)}
                required
              />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="w-full" onClick={() => setShowManualModal(false)}>Cancel</Button>
                <Button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white shadow-none" isLoading={manualStatus.loading}>Submit Payment</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin shadow-[0_0_20px_rgba(16,185,129,0.2)]" />
      </div>
    }>
      <PlansPageContent />
    </Suspense>
  );
}
