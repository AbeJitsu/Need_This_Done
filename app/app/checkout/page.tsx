'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';

// ============================================================================
// Checkout Page - /checkout
// ============================================================================
// What: Completes the purchase process
// Why: Collect shipping/payment info and create order
// How: Handles guest checkout, optional login, calls checkout API

export const metadata = {
  title: 'Checkout - NeedThisDone',
  description: 'Complete your purchase securely.',
};

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartId, itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Form state
  const [email, setEmail] = useState(user?.email || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Redirect if no cart items
  useEffect(() => {
    if (!isProcessing && itemCount === 0 && !orderPlaced) {
      router.push('/cart');
    }
  }, [itemCount, isProcessing, orderPlaced, router]);

  // ========================================================================
  // Handle checkout submission
  // ========================================================================
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!cartId) {
      setError('No cart found');
      return;
    }

    if (itemCount === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setIsProcessing(true);

      // Create order from cart
      const response = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_id: cartId,
          email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create order');
      }

      // Order created successfully
      setOrderId(data.order_id);
      setOrderPlaced(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  // Order confirmation screen
  if (orderPlaced) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Order Confirmed!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Thank you for your purchase.
          </p>
        </div>

        <Card hoverEffect="none" className="mb-6">
          <div className="p-8">
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Order Number</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 font-mono break-all">
                {orderId}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Confirmation Email</p>
              <p className="text-lg text-gray-900 dark:text-gray-100">{email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Check your inbox for a confirmation email with tracking information.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                You can track your order status using your order number and email address.
              </p>
            </div>
          </div>
        </Card>

        <div className="flex gap-3">
          <Button variant="purple" href="/shop" className="flex-1">
            Continue Shopping
          </Button>
          {isAuthenticated && (
            <Button variant="blue" href="/dashboard" className="flex-1">
              View My Orders
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Checkout form
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <PageHeader
        title="Checkout"
        description="Complete your purchase"
      />

      {itemCount === 0 ? (
        <Card hoverEffect="none">
          <div className="p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Your cart is empty.</p>
            <Button variant="purple" href="/shop">
              Back to Shop
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout form */}
          <form onSubmit={handleCheckout} className="lg:col-span-2">
            {/* Error message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Email section */}
            <Card hoverEffect="none" className="mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Contact Information
                </h2>

                {isAuthenticated ? (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Email</p>
                    <p className="text-lg text-gray-900 dark:text-gray-100 font-medium">
                      {email}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Logged in as <span className="font-semibold">{user?.email}</span>
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="your@email.com"
                    />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      We&apos;ll use this email to send your order confirmation and tracking info.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Shipping info */}
            <Card hoverEffect="none" className="mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Shipping Information
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="Doe"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="123 Main St"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                      City, State, ZIP
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      placeholder="New York, NY 10001"
                    />
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    Payment processing coming soon. This is a test checkout.
                  </p>
                </div>
              </div>
            </Card>

            {/* Submit button */}
            <Button
              variant="purple"
              type="submit"
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? 'Processing Order...' : 'Place Order'}
            </Button>

            <Button
              variant="gray"
              href="/cart"
              className="w-full mt-3"
              size="lg"
            >
              Back to Cart
            </Button>
          </form>

          {/* Order summary sidebar */}
          <div>
            <Card hoverColor="purple" hoverEffect="lift">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Items</span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">
                      {itemCount}
                    </span>
                  </div>

                  {cart && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                        <span className="text-gray-900 dark:text-gray-100 font-semibold">
                          ${((cart.subtotal || 0) / 100).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Tax</span>
                        <span className="text-gray-900 dark:text-gray-100 font-semibold">
                          ${((cart.tax_total || 0) / 100).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {cart && (
                  <div className="flex justify-between mb-6">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      ${((cart.total || 0) / 100).toFixed(2)}
                    </span>
                  </div>
                )}

                <Button
                  variant="blue"
                  href="/cart"
                  className="w-full"
                >
                  Edit Cart
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
