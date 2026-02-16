'use client';

import { useState, useCallback } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';

// ============================================================================
// AddToCartButton — Reusable cart button for pricing page products
// ============================================================================
// Shows: idle → success (checkmark) → idle
// Uses optimistic addItem from CartContext (synchronous, instant UI update)

interface AddToCartButtonProps {
  variantId: string;
  title: string;
  price: number; // in cents
  thumbnail?: string;
  /** Visual variant: 'primary' for packages, 'secondary' for add-ons */
  variant?: 'primary' | 'secondary';
  className?: string;
}

export default function AddToCartButton({
  variantId,
  title,
  price,
  thumbnail,
  variant = 'primary',
  className = '',
}: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAdd = useCallback(() => {
    if (showSuccess) return; // Prevent double-clicks during success animation

    addItem(variantId, 1, {
      title,
      unit_price: price,
      thumbnail,
    });

    // Show checkmark briefly
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 1500);
  }, [addItem, variantId, title, price, thumbnail, showSuccess]);

  const baseStyles = 'flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-300 rounded-xl';

  const variantStyles = {
    primary: showSuccess
      ? 'w-full py-3 px-6 bg-emerald-500 text-white'
      : 'w-full py-3 px-6 bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/25',
    secondary: showSuccess
      ? 'py-2 px-4 bg-emerald-500 text-white'
      : 'py-2 px-4 bg-gray-900 text-white hover:bg-gray-800',
  };

  return (
    <button
      onClick={handleAdd}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-label={showSuccess ? `${title} added to cart` : `Add ${title} to cart`}
    >
      {showSuccess ? (
        <>
          <Check size={16} strokeWidth={3} />
          Added
        </>
      ) : (
        <>
          <ShoppingCart size={16} />
          Add to Cart
        </>
      )}
    </button>
  );
}
