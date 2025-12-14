'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { StripeElementsWrapper } from '@/context/StripeContext';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import PaymentForm from '@/components/PaymentForm';
import AppointmentRequestForm from '@/components/AppointmentRequestForm';
import {
  formInputColors,
  formValidationColors,
  featureCardColors,
  alertColors,
  headingColors,
  dividerColors,
} from '@/lib/colors';

// ============================================================================
// Checkout Page - /checkout
// ============================================================================
// What: Completes the purchase process with Stripe payment
// Why: Collect shipping/payment info, process payment, and create order
// How: Multi-step flow: Contact → Shipping → Payment → Confirmation

type CheckoutStep = 'info' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartId, itemCount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Step state
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('info');

  // Form state
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [cityStateZip, setCityStateZip] = useState('');

  // Payment state
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Appointment state (for consultation products)
  const [requiresAppointment, setRequiresAppointment] = useState(false);
  const [appointmentInfo, setAppointmentInfo] = useState<{
    serviceName: string;
    durationMinutes: number;
  } | null>(null);

  // Redirect if no cart items (but not during payment/confirmation)
  useEffect(() => {
    if (
      !isProcessing &&
      itemCount === 0 &&
      currentStep !== 'payment' &&
      currentStep !== 'confirmation'
    ) {
      router.push('/cart');
    }
  }, [itemCount, isProcessing, currentStep, router]);

  // Update email when user changes
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  // ========================================================================
  // Step 1: Handle info submission - proceed to payment
  // ========================================================================
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!cartId || itemCount === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setIsProcessing(true);

      // Create order first (saves order in Medusa + Supabase)
      const orderResponse = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart_id: cartId,
          email,
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to create order');
      }

      // Store the order ID for later
      setOrderId(orderData.order_id);

      // Store appointment info if order requires it
      if (orderData.requires_appointment) {
        setRequiresAppointment(true);
        setAppointmentInfo({
          serviceName: orderData.service_name || 'Consultation',
          durationMinutes: orderData.duration_minutes || 30,
        });
      }

      // Create PaymentIntent for the order total
      const paymentResponse = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cart?.total || 0,
          order_id: orderData.order_id,
          email,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || 'Failed to initialize payment');
      }

      // Store client secret and move to payment step
      setClientSecret(paymentData.clientSecret);
      setCurrentStep('payment');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to proceed');
    } finally {
      setIsProcessing(false);
    }
  };

  // ========================================================================
  // Step 2: Handle payment success
  // ========================================================================
  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment succeeded:', paymentIntentId);

    // Clear the cart
    clearCart();

    // Move to confirmation
    setCurrentStep('confirmation');
  };

  // ========================================================================
  // Handle payment error
  // ========================================================================
  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // ========================================================================
  // Order confirmation screen (Step 3)
  // ========================================================================
  if (currentStep === 'confirmation') {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-green-100 dark:bg-green-900 rounded-full mb-4">
            <svg
              className={`w-8 h-8 ${featureCardColors.success.icon}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className={`text-3xl font-bold ${headingColors.primary} mb-2`}>
            Payment Successful!
          </h1>
          <p className={formInputColors.helper}>
            Thank you for your purchase.
            {requiresAppointment && ' Now let\'s schedule your appointment.'}
          </p>
        </div>

        <Card hoverEffect="none" className="mb-6">
          <div className="p-8">
            <div className={`mb-6 pb-6 ${dividerColors.border} border-b`}>
              <p className={`text-sm ${formInputColors.helper} mb-2`}>
                Order Number
              </p>
              <p className={`text-2xl font-bold ${headingColors.primary} font-mono break-all`}>
                {orderId}
              </p>
            </div>

            <div className="mb-6">
              <p className={`text-sm ${formInputColors.helper} mb-2`}>
                Confirmation Email
              </p>
              <p className={`text-lg ${headingColors.primary} font-medium`}>{email}</p>
              <p className={`text-sm ${formInputColors.helper} mt-2`}>
                Check your inbox for a confirmation email with tracking
                information.
              </p>
            </div>

            <div className={`${alertColors.success.bg} ${alertColors.success.border} rounded-lg p-4`}>
              <p className={`text-sm ${formValidationColors.success}`}>
                Your payment has been processed securely. You&apos;ll receive a
                receipt via email shortly.
              </p>
            </div>
          </div>
        </Card>

        {/* Appointment Request Form (for consultation products) */}
        {requiresAppointment && appointmentInfo && (
          <div className="mb-6">
            <AppointmentRequestForm
              orderId={orderId}
              customerEmail={email}
              customerName={firstName && lastName ? `${firstName} ${lastName}` : undefined}
              durationMinutes={appointmentInfo.durationMinutes}
              serviceName={appointmentInfo.serviceName}
            />
          </div>
        )}

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

  // ========================================================================
  // Payment step (Step 2)
  // ========================================================================
  if (currentStep === 'payment' && clientSecret) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <PageHeader title="Payment" description="Complete your purchase" />

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Error message */}
            {error && (
              <div className={`mb-6 p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
                <p className={`text-sm ${formValidationColors.error}`}>{error}</p>
              </div>
            )}

            {/* Payment form */}
            <Card hoverEffect="none" className="mb-6">
              <div className="p-6">
                <h2 className={`text-xl font-bold ${headingColors.primary} mb-4`}>
                  Payment Details
                </h2>

                <StripeElementsWrapper clientSecret={clientSecret}>
                  <PaymentForm
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/checkout`}
                    submitText={`Pay $${((cart?.total || 0) / 100).toFixed(2)}`}
                  />
                </StripeElementsWrapper>
              </div>
            </Card>

            {/* Back button */}
            <Button
              variant="gray"
              onClick={() => setCurrentStep('info')}
              className="w-full"
              size="lg"
            >
              Back to Information
            </Button>
          </div>

          {/* Order summary sidebar */}
          <OrderSummary cart={cart} itemCount={itemCount} />
        </div>
      </div>
    );
  }

  // ========================================================================
  // Information step (Step 1)
  // ========================================================================
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <PageHeader title="Checkout" description="Complete your purchase" />

      {itemCount === 0 ? (
        <Card hoverEffect="none">
          <div className="p-8 text-center">
            <p className={`${formInputColors.helper} mb-4`}>
              Your cart is empty.
            </p>
            <Button variant="purple" href="/shop">
              Back to Shop
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout form */}
          <form onSubmit={handleProceedToPayment} className="lg:col-span-2">
            {/* Error message */}
            {error && (
              <div className={`mb-6 p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
                <p className={`text-sm ${formValidationColors.error}`}>{error}</p>
              </div>
            )}

            {/* Email section */}
            <Card hoverEffect="none" className="mb-6">
              <div className="p-6">
                <h2 className={`text-xl font-bold ${headingColors.primary} mb-4`}>
                  Contact Information
                </h2>

                {isAuthenticated ? (
                  <div>
                    <p className={`text-sm ${formInputColors.helper} mb-2`}>
                      Email
                    </p>
                    <p className={`text-lg ${headingColors.primary} font-medium`}>
                      {email}
                    </p>
                    <p className={`text-sm ${formInputColors.helper} mt-2`}>
                      Logged in as{' '}
                      <span className="font-semibold">{user?.email}</span>
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={`w-full px-4 py-2 rounded-lg ${formInputColors.base} border`}
                      placeholder="your@email.com"
                    />
                    <p className={`text-sm ${formInputColors.helper} mt-2`}>
                      We&apos;ll use this email to send your order confirmation
                      and receipt.
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Shipping info */}
            <Card hoverEffect="none" className="mb-6">
              <div className="p-6">
                <h2 className={`text-xl font-bold ${headingColors.primary} mb-4`}>
                  Shipping Information
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg ${formInputColors.base} border`}
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg ${formInputColors.base} border`}
                      placeholder="Doe"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                      Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg ${formInputColors.base} border`}
                      placeholder="123 Main St"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                      City, State, ZIP
                    </label>
                    <input
                      type="text"
                      value={cityStateZip}
                      onChange={(e) => setCityStateZip(e.target.value)}
                      className={`w-full px-4 py-2 rounded-lg ${formInputColors.base} border`}
                      placeholder="New York, NY 10001"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Continue to payment button */}
            <Button
              variant="purple"
              type="submit"
              disabled={isProcessing}
              className="w-full"
              size="lg"
            >
              {isProcessing ? 'Processing...' : 'Continue to Payment'}
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
          <OrderSummary cart={cart} itemCount={itemCount} />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Order Summary Component
// ============================================================================
// Reusable sidebar showing cart contents and total

interface OrderSummaryProps {
  cart: ReturnType<typeof useCart>['cart'];
  itemCount: number;
}

function OrderSummary({ cart, itemCount }: OrderSummaryProps) {
  return (
    <div>
      <Card hoverColor="purple" hoverEffect="lift">
        <div className="p-6">
          <h2 className={`text-xl font-bold ${headingColors.primary} mb-6`}>
            Order Summary
          </h2>

          <div className={`space-y-3 mb-6 pb-6 ${dividerColors.border} border-b`}>
            <div className="flex justify-between">
              <span className={formInputColors.helper}>Items</span>
              <span className={`${headingColors.primary} font-semibold`}>
                {itemCount}
              </span>
            </div>

            {cart && (
              <>
                <div className="flex justify-between">
                  <span className={formInputColors.helper}>
                    Subtotal
                  </span>
                  <span className={`${headingColors.primary} font-semibold`}>
                    ${((cart.subtotal || 0) / 100).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className={formInputColors.helper}>Tax</span>
                  <span className={`${headingColors.primary} font-semibold`}>
                    ${((cart.tax_total || 0) / 100).toFixed(2)}
                  </span>
                </div>
              </>
            )}
          </div>

          {cart && (
            <div className="flex justify-between mb-6">
              <span className={`text-lg font-bold ${headingColors.primary}`}>
                Total
              </span>
              <span className={`text-2xl font-bold ${headingColors.primary}`}>
                ${((cart.total || 0) / 100).toFixed(2)}
              </span>
            </div>
          )}

          <Button variant="blue" href="/cart" className="w-full">
            Edit Cart
          </Button>
        </div>
      </Card>
    </div>
  );
}
