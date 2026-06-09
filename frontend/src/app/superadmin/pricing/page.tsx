'use client';

import React, { useState, useEffect } from 'react';
import axios from 'react';
import { useAuth } from '@/context/AuthContext';
import { CreditCard, Tag, Plus, CheckCircle2 } from 'lucide-react';

export default function PricingPanel() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState(30);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Populate mock coupons list
    setCoupons([
      { code: 'DEVEN50', discount: 50, status: 'Active' },
      { code: 'EARLYBIRD', discount: 30, status: 'Active' }
    ]);
  }, []);

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    const newCoupon = {
      code: code.toUpperCase(),
      discount,
      status: 'Active'
    };

    setCoupons([...coupons, newCoupon]);
    setCode('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <div className="space-y-6 text-left">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold font-outfit text-white">Pricing & Coupon Management</h1>
        <p className="text-xs text-zinc-500 font-sans">Establish active discount coupons and inspect user subscription rates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Create Coupon form */}
        <div className="md:col-span-2 bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4.5 h-4.5 text-[#FFC247]" />
              Generate Coupon
            </h3>

            {success && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-[#FFC247] rounded-xl flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                Coupon code generated successfully!
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Coupon Code</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SUMMER70"
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-zinc-500 uppercase">Discount Percentage (%)</label>
              <input
                type="number"
                required
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="glow-button w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              Generate Coupon Code
            </button>
          </form>
        </div>

        {/* Coupons List */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Coupons</h3>

          <div className="space-y-3">
            {coupons.map((c, idx) => (
              <div key={idx} className="p-3 bg-zinc-950/50 border border-white/5 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-white tracking-wider">{c.code}</p>
                  <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 rounded mt-1 inline-block">{c.status}</span>
                </div>
                <p className="font-bold text-zinc-300">{(c.discount)}% OFF</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
