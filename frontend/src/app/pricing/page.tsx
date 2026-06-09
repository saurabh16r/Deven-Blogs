'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, ShieldCheck, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function PricingPage() {
  const router = useRouter();
  const { user, token, triggerMockSubscription } = useAuth();

  // Coupon management
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  
  // Checkout process overlays
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [simulatedGatewayOpen, setSimulatedGatewayOpen] = useState(false);
  
  const basePrice = 299;
  const currentPrice = basePrice - (basePrice * discount);

  const applyCoupon = () => {
    setCouponError('');
    const code = coupon.toUpperCase().trim();
    if (code === 'DEVEN50') {
      setDiscount(0.5);
      setCouponApplied(true);
    } else if (code === 'EARLYBIRD') {
      setDiscount(0.3);
      setCouponApplied(true);
    } else {
      setCouponError('Invalid or expired coupon code.');
    }
  };

  const removeCoupon = () => {
    setCoupon('');
    setDiscount(0);
    setCouponApplied(false);
    setCouponError('');
  };

  const handleCheckout = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setCheckoutLoading(true);

    try {
      // Create Razorpay Order from backend
      const res = await axios.post(`${API_URL}/payments/order`, {
        amount: Math.round(currentPrice * 100), // in paise
        couponCode: couponApplied ? coupon.toUpperCase() : undefined
      });

      const orderData = res.data;

      // Check if we run in mock connection mode
      if (orderData.isMock) {
        // Launch Simulated Razorpay Checkout Gateway overlay
        setSimulatedGatewayOpen(true);
        setCheckoutLoading(false);
        return;
      }

      // Real Razorpay SDK Integration
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Deven Blogs',
        description: 'Premium Membership Subscription',
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            await axios.post(`${API_URL}/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              isMock: false
            });
            router.push('/success');
          } catch {
            alert('Payment verification failed. Please try again.');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#FFC247',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      setCheckoutLoading(false);

    } catch (err) {
      console.warn('Backend API connection failed. Launching client-side checkout simulation.');
      setSimulatedGatewayOpen(true);
      setCheckoutLoading(false);
    }
  };

  const completeSimulatedPayment = async () => {
    setSimulatedGatewayOpen(false);
    setCheckoutLoading(true);
    
    // Simulate transaction delay
    setTimeout(async () => {
      await triggerMockSubscription();
      setCheckoutLoading(false);
      router.push('/success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-12">
        
        {/* Banner title */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-[#FFC247] font-bold text-xs uppercase tracking-widest">Pricing Plans</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold font-outfit text-white tracking-tight leading-none">
            Invest in your business.
          </h1>
          <p className="text-zinc-400 text-sm">
            Unlock step-by-step growth playbooks, Deven AI Mentor access, and 60-second founder briefs with one simple membership.
          </p>
        </div>

        {/* Pricing Layout Card */}
        <div className="max-w-md mx-auto bg-zinc-900/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between text-left">
          
          <div className="absolute top-0 right-0 bg-[#FFC247] text-black font-extrabold text-[10px] tracking-wider px-3.5 py-1.5 rounded-bl-xl uppercase">
            Best Value
          </div>

          <div>
            <h4 className="text-lg font-bold text-white font-outfit">Premium Founder Membership</h4>
            <p className="text-xs text-zinc-400 mt-1">Invest ₹299/month to access exclusive founder insights, step-by-step growth playbooks, AI mentoring, and actionable checklists.</p>
            
            {/* Price section */}
            <div className="my-6">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-white font-outfit">₹{currentPrice}</span>
                <span className="text-zinc-500 text-xs">/ month</span>
              </div>
              {couponApplied && (
                <div className="flex items-center gap-1.5 text-xs text-[#FFC247] mt-2">
                  <span>Discount applied ({(discount * 100)}% off)</span>
                  <button onClick={removeCoupon} className="text-zinc-400 underline hover:text-white ml-2 text-[10px]">Remove</button>
                </div>
              )}
            </div>

            {/* Coupons box */}
            {!couponApplied && (
              <div className="space-y-2 mb-6">
                <label className="text-[10px] font-semibold text-zinc-500 uppercase">Promo Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. DEVEN50"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-[#FFC247]"
                  />
                  <button
                    onClick={applyCoupon}
                    className="px-3 py-1.5 bg-zinc-900 text-xs border border-white/10 rounded-lg hover:bg-zinc-800 text-zinc-200"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="text-[10px] text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {couponError}
                  </p>
                )}
                <p className="text-[9px] text-zinc-500">Hint: Try using "DEVEN50" or "EARLYBIRD" for test mode discounts.</p>
              </div>
            )}

            {/* Checklist */}
            <div className="border-t border-white/5 pt-6 space-y-3.5 text-zinc-300 text-xs">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4.5 h-4.5 text-[#FFC247] shrink-0" />
                <span>Unlimited access to all growth playbooks</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4.5 h-4.5 text-[#FFC247] shrink-0" />
                <span>Full access to Deven AI Mentor & Checklists</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4.5 h-4.5 text-[#FFC247] shrink-0" />
                <span>Listen to playbook audio logs (TTS Podcast)</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4.5 h-4.5 text-[#FFC247] shrink-0" />
                <span>Watch 60-second video briefings & spotlights</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4.5 h-4.5 text-[#FFC247] shrink-0" />
                <span>Access resource databases & tool recommendations</span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="glow-button w-full py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold shadow-md disabled:opacity-50"
            >
              {checkoutLoading ? 'Initiating transaction...' : 'Get Instant Access'}
            </button>
            <p className="text-[10px] text-zinc-500 text-center mt-3">Payments secured by Razorpay. 30-day money-back assurance.</p>
          </div>
        </div>

      </main>

      {/* SIMULATED RAZORPAY GATEWAY MODAL OVERLAY */}
      <AnimatePresence>
        {simulatedGatewayOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl z-10 space-y-6 text-left"
            >
              {/* Brand Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded bg-[#FFC247] flex items-center justify-center font-extrabold text-[10px] text-black">R</span>
                  <span className="text-xs font-bold text-zinc-300">Razorpay Sandbox</span>
                </div>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Test Mode</span>
              </div>

              {/* Billing description */}
              <div className="space-y-1">
                <p className="text-[10px] text-zinc-500">PAYING DEVEN BLOGS</p>
                <p className="text-2xl font-bold text-white">₹{currentPrice}</p>
                <p className="text-[10px] text-zinc-400">Order ID: order_mock_{Date.now().toString().substring(8)}</p>
              </div>

              {/* Payment Methods Simulation */}
              <div className="space-y-2.5">
                <p className="text-[10px] font-bold text-zinc-500 uppercase">Select Payment Mode</p>
                
                <button
                  onClick={completeSimulatedPayment}
                  className="w-full p-3 bg-zinc-950 hover:bg-zinc-950/80 border border-white/5 rounded-xl text-left flex items-center justify-between transition-colors"
                >
                  <div>
                    <p className="text-xs font-bold text-white">Simulate Sandbox Success</p>
                    <p className="text-[10px] text-zinc-500">Auto-approve and authorize subscription</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-[#FFC247]" />
                </button>

                <button
                  onClick={() => setSimulatedGatewayOpen(false)}
                  className="w-full p-2 bg-zinc-900 hover:bg-zinc-800 text-center rounded-xl text-[10px] text-zinc-400"
                >
                  Cancel Transaction
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
