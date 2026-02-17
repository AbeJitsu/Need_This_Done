'use client';

import { useCallback, useState } from 'react';
import { ShoppingCart, Check, Phone, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { WizardRecommendation } from '@/lib/wizard-engine';

function fmt(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(cents / 100);
}

interface WizardResultsProps {
  recommendation: WizardRecommendation;
  onAddedToCart: () => void;
  onBookConsultation: () => void;
}

export default function WizardResults({ recommendation, onAddedToCart, onBookConsultation }: WizardResultsProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = useCallback(() => {
    if (added) return;
    addItem(recommendation.tier.variantId, 1, { title: recommendation.tier.title, unit_price: recommendation.tier.price });
    recommendation.addOns.forEach((a) => addItem(a.variantId, 1, { title: a.title, unit_price: a.price }));
    recommendation.services.forEach((s) => addItem(s.variantId, 1, { title: s.title, unit_price: s.price }));
    setAdded(true);
    onAddedToCart();
  }, [recommendation, addItem, added, onAddedToCart]);

  const hasExtras = recommendation.addOns.length > 0 || recommendation.services.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-4 py-1.5 text-sm font-medium mb-3">
          <Sparkles size={14} />Your personalized recommendation
        </div>
      </div>
      <div className="rounded-xl border-2 border-emerald-500 bg-emerald-50/50 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Recommended Plan</p>
            <h3 className="text-lg font-bold text-gray-900 mt-1">{recommendation.tier.title}</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{fmt(recommendation.tier.price)}</p>
        </div>
      </div>
      {hasExtras && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Added to your plan</p>
          {recommendation.addOns.map((a) => (
            <div key={a.handle} className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3">
              <span className="text-sm font-medium text-gray-900">{a.title}</span>
              <span className="text-sm font-semibold text-gray-700">+{fmt(a.price)}</span>
            </div>
          ))}
          {recommendation.services.map((s) => (
            <div key={s.handle} className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3">
              <span className="text-sm font-medium text-gray-900">{s.title}</span>
              <span className="text-sm font-semibold text-gray-700">+{fmt(s.price)}{s.handle === 'managed-ai' && <span className="text-xs text-gray-500">/mo</span>}</span>
            </div>
          ))}
        </div>
      )}
      <div className="rounded-xl bg-gray-50 p-4 space-y-2">
        <div className="flex justify-between text-sm"><span className="text-gray-600">Total</span><span className="font-bold text-gray-900">{fmt(recommendation.totalCents)}</span></div>
        {recommendation.depositCents > 0 && (
          <div className="flex justify-between text-sm"><span className="text-gray-500">50% deposit to start</span><span className="font-semibold text-emerald-700">{fmt(recommendation.depositCents)}</span></div>
        )}
      </div>
      <div className="space-y-3">
        <button type="button" onClick={handleAdd} disabled={added}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-semibold text-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
            ${added ? 'bg-emerald-500 text-white' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/25'}`}
        >
          {added ? <><Check size={16} strokeWidth={3} />Added to Cart</> : <><ShoppingCart size={16} />Add Everything to Cart</>}
        </button>
        <button type="button" onClick={onBookConsultation}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-semibold text-sm text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        ><Phone size={16} />Book a Free Call Instead</button>
      </div>
      <p className="text-xs text-center text-gray-400">Not sure? A free consultation helps us tailor the perfect solution.</p>
    </div>
  );
}
