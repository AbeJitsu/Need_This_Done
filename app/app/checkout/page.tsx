'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { StripeElementsWrapper } from '@/context/StripeContext';
import Button from '@/components/Button';
import PageHeader from '@/components/PageHeader';
import Card from '@/components/Card';
import PaymentForm from '@/components/PaymentForm';
import AppointmentStepForm, { AppointmentData } from '@/components/AppointmentStepForm';
import {
  formInputColors,
  formValidationColors,
  featureCardColors,
  alertColors,
  headingColors,
  dividerColors,
  titleColors,
  lightBgColors,
} from '@/lib/colors';

// ============================================================================
// Checkout Page - /checkout
// ============================================================================
// What: Completes the purchase process with Stripe payment
// Why: Collect shipping/payment info, process payment, and create order
// How: Multi-step flow: Contact → Appointment (if needed) → Payment → Confirmation

type CheckoutStep = 'info' | 'appointment' | 'payment' | 'confirmation';

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
  const [address2, setAddress2] = useState('');
  const [showAddress2, setShowAddress2] = useState(false);
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
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);

  // Redirect if no cart items (but not during appointment/payment/confirmation)
  useEffect(() => {
    if (
      !isProcessing &&
      itemCount === 0 &&
      currentStep !== 'appointment' &&
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
  // Step 1: Handle info submission - check for appointment requirement
  // ========================================================================
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!email) {
      setError('Email is required');
      return;
    }

    if (!firstName.trim()) {
      setError('First name is required');
      return;
    }

    if (!lastName.trim()) {
      setError('Last name is required');
      return;
    }

    if (!address.trim()) {
      setError('Address is required');
      return;
    }

    if (!cityStateZip.trim()) {
      setError('City, State, ZIP is required');
      return;
    }

    if (!cartId || itemCount === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setIsProcessing(true);

      // Check if cart requires appointment (by checking product metadata)
      const checkResponse = await fetch('/api/checkout/check-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId }),
      });

      const checkData = await checkResponse.json();

      if (checkResponse.ok && checkData.requires_appointment) {
        // Store appointment info and go to appointment step
        setRequiresAppointment(true);
        setAppointmentInfo({
          serviceName: checkData.service_name || 'Consultation',
          durationMinutes: checkData.duration_minutes || 30,
        });
        setCurrentStep('appointment');
      } else {
        // No appointment needed - proceed directly to payment
        await proceedToPayment();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to proceed');
    } finally {
      setIsProcessing(false);
    }
  };

  // ========================================================================
  // Handle appointment selection - proceed to payment
  // ========================================================================
  const handleAppointmentComplete = async (data: AppointmentData) => {
    setAppointmentData(data);
    await proceedToPayment();
  };

  // ========================================================================
  // Create order and payment intent - proceed to payment step
  // ========================================================================
  const proceedToPayment = async () => {
    try {
      setIsProcessing(true);
      setError('');

      // Create order (saves order in Medusa + Supabase)
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

      // Update appointment info from order data if not already set
      if (orderData.requires_appointment && !appointmentInfo) {
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
  // Step 3: Handle payment success - create appointment if needed
  // ========================================================================
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    console.log('Payment succeeded:', paymentIntentId);

    // If we have appointment data, create the appointment request now
    if (requiresAppointment && appointmentData && orderId) {
      try {
        const response = await fetch('/api/appointments/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderId,
            customer_email: email,
            customer_name: firstName && lastName ? `${firstName} ${lastName}` : null,
            preferred_date: appointmentData.preferredDate,
            preferred_time_start: appointmentData.preferredTimeStart,
            alternate_date: appointmentData.alternateDate || null,
            alternate_time_start: appointmentData.alternateTimeStart || null,
            duration_minutes: appointmentInfo?.durationMinutes || 30,
            notes: appointmentData.notes || null,
            service_name: appointmentInfo?.serviceName || 'Consultation',
          }),
        });

        if (!response.ok) {
          console.error('Failed to create appointment request');
        }
      } catch (err) {
        console.error('Error creating appointment request:', err);
      }
    }

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
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
            {requiresAppointment && ' We\'ll confirm your appointment shortly.'}
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
                Check your inbox for a confirmation email with your order details.
              </p>
            </div>

            {/* Appointment confirmation message */}
            {requiresAppointment && appointmentData && (
              <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  <strong>Appointment Requested:</strong>{' '}
                  {new Date(appointmentData.preferredDate + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}{' '}
                  at {appointmentData.preferredTimeStart.replace(/^(\d{2}):(\d{2})$/, (_, h, m) => {
                    const hour = parseInt(h);
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                    return `${hour12}:${m} ${ampm}`;
                  })}
                </p>
                <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                  We&apos;ll review your request and confirm within 24 hours.
                </p>
              </div>
            )}

            <div className={`${alertColors.success.bg} ${alertColors.success.border} rounded-lg p-4`}>
              <p className={`text-sm ${formValidationColors.success}`}>
                Your payment has been processed securely. You&apos;ll receive a
                receipt via email shortly.
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

  // ========================================================================
  // Appointment step (Step 2) - Only shows if cart requires appointment
  // ========================================================================
  if (currentStep === 'appointment' && appointmentInfo) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <PageHeader title="Schedule Your Consultation" description="Pick a time that works for you" />

        <Card hoverEffect="none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Left column - Appointment form */}
            <div className="w-full">
              {/* Error message */}
              {error && (
                <div className={`mb-6 p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
                  <p className={`text-sm ${formValidationColors.error}`}>{error}</p>
                </div>
              )}

              <div className={`${dividerColors.border} border rounded-lg p-8 dark:bg-gray-700/50`}>
                <AppointmentStepForm
                  durationMinutes={appointmentInfo.durationMinutes}
                  serviceName={appointmentInfo.serviceName}
                  onComplete={handleAppointmentComplete}
                  onBack={() => setCurrentStep('info')}
                  isProcessing={isProcessing}
                />
              </div>
            </div>

            {/* Right column - Order Summary */}
            <div className="w-full lg:self-start lg:sticky lg:top-20 space-y-6">
              <div className={`${dividerColors.border} border rounded-lg p-8 dark:bg-gray-800`}>
                <h2 className={`text-xl font-bold ${headingColors.primary} mb-6`}>
                  Order Summary
                </h2>

                {/* Cart items preview */}
                <div className={`space-y-4 mb-6 pb-6 border-b ${dividerColors.border}`}>
                  {cart?.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className={`font-medium ${headingColors.primary} text-sm`}>
                          {item.title || item.variant?.title || 'Consultation'}
                        </p>
                        <p className={`text-xs ${formInputColors.helper}`}>
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className={`font-semibold ${headingColors.primary} text-sm`}>
                        ${(((item.unit_price || 0) * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className={`space-y-4 mb-6 pb-6 border-b ${dividerColors.border}`}>
                  <div className="flex justify-between">
                    <span className={formInputColors.helper}>Subtotal</span>
                    <span className={`font-semibold ${headingColors.primary}`}>
                      ${((cart?.subtotal || 0) / 100).toFixed(2)}
                    </span>
                  </div>

                  {(cart?.tax_total || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className={formInputColors.helper}>Tax</span>
                      <span className={`font-semibold ${headingColors.primary}`}>
                        ${((cart?.tax_total || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mb-6">
                  <span className={`text-lg font-bold ${headingColors.primary}`}>Total</span>
                  <span className={`text-2xl font-bold ${headingColors.primary}`}>
                    ${((cart?.total || 0) / 100).toFixed(2)}
                  </span>
                </div>

                <Button variant="blue" href="/cart" className="w-full" size="lg">
                  Edit Cart
                </Button>
              </div>

              {/* What happens next */}
              <div className={`${dividerColors.border} border rounded-lg p-6 ${lightBgColors.blue}`}>
                <p className={`text-sm ${formInputColors.helper}`}>
                  <strong>What happens next?</strong> After payment, we&apos;ll confirm your appointment within 24 hours and send you calendar details.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ========================================================================
  // Payment step (Step 3)
  // ========================================================================
  if (currentStep === 'payment' && clientSecret) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <PageHeader title="Payment" description="Complete your purchase" />

        <Card hoverEffect="none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Left column - Payment form */}
            <div className="w-full space-y-6">
              {/* Error message */}
              {error && (
                <div className={`p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
                  <p className={`text-sm ${formValidationColors.error}`}>{error}</p>
                </div>
              )}

              {/* Payment form */}
              <div className={`${dividerColors.border} border rounded-lg p-8 dark:bg-gray-700/50`}>
                <h2 className={`text-xl font-bold ${headingColors.primary} mb-6`}>
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

              {/* Back button */}
              <Button
                variant="gray"
                onClick={() => setCurrentStep(requiresAppointment ? 'appointment' : 'info')}
                className="w-full"
                size="lg"
              >
                {requiresAppointment ? 'Back to Scheduling' : 'Back to Information'}
              </Button>
            </div>

            {/* Right column - Order Summary */}
            <div className="w-full lg:self-start lg:sticky lg:top-20 space-y-6">
              <div className={`${dividerColors.border} border rounded-lg p-8 dark:bg-gray-800`}>
                <h2 className={`text-xl font-bold ${headingColors.primary} mb-6`}>
                  Order Summary
                </h2>

                {/* Cart items preview */}
                <div className={`space-y-4 mb-6 pb-6 border-b ${dividerColors.border}`}>
                  {cart?.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className={`font-medium ${headingColors.primary} text-sm`}>
                          {item.title || item.variant?.title || 'Consultation'}
                        </p>
                        <p className={`text-xs ${formInputColors.helper}`}>
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className={`font-semibold ${headingColors.primary} text-sm`}>
                        ${(((item.unit_price || 0) * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className={`space-y-4 mb-6 pb-6 border-b ${dividerColors.border}`}>
                  <div className="flex justify-between">
                    <span className={formInputColors.helper}>Subtotal</span>
                    <span className={`font-semibold ${headingColors.primary}`}>
                      ${((cart?.subtotal || 0) / 100).toFixed(2)}
                    </span>
                  </div>

                  {(cart?.tax_total || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className={formInputColors.helper}>Tax</span>
                      <span className={`font-semibold ${headingColors.primary}`}>
                        ${((cart?.tax_total || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mb-6">
                  <span className={`text-lg font-bold ${headingColors.primary}`}>Total</span>
                  <span className={`text-2xl font-bold ${headingColors.primary}`}>
                    ${((cart?.total || 0) / 100).toFixed(2)}
                  </span>
                </div>

                <Button variant="blue" href="/cart" className="w-full" size="lg">
                  Edit Cart
                </Button>
              </div>

              {/* What happens next */}
              <div className={`${dividerColors.border} border rounded-lg p-6 ${lightBgColors.blue}`}>
                <p className={`text-sm ${formInputColors.helper}`}>
                  <strong>What happens next?</strong> After payment, we&apos;ll confirm your appointment within 24 hours and send you calendar details.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ========================================================================
  // Information step (Step 1)
  // ========================================================================
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8">
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
        <Card hoverEffect="none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Left column - Checkout form */}
            <form onSubmit={handleInfoSubmit} className="w-full space-y-8">
              {/* Error message */}
              {error && (
                <div className={`p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
                  <p className={`text-sm ${formValidationColors.error}`}>{error}</p>
                </div>
              )}

              {/* Contact Information - Inner rectangle 1 */}
              <div className={`${dividerColors.border} border rounded-lg p-8 dark:bg-gray-700/50`}>
                <h2 className={`text-xl font-bold ${headingColors.primary} mb-6`}>
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
                      Email Address *
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

              {/* Shipping Information - Inner rectangle 2 */}
              <div className={`${dividerColors.border} border rounded-lg p-8 dark:bg-gray-700/50`}>
                <h2 className={`text-xl font-bold ${headingColors.primary} mb-6`}>
                  Shipping Information
                </h2>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className={`w-full px-4 py-2 rounded-lg ${formInputColors.base} border`}
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className={`w-full px-4 py-2 rounded-lg ${formInputColors.base} border`}
                      placeholder="Doe"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                      Address *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      className={`w-full px-4 py-2 rounded-lg ${formInputColors.base} border`}
                      placeholder="123 Main St"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    {showAddress2 ? (
                      <>
                        <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                          Apt, Suite, etc. (optional)
                        </label>
                        <input
                          type="text"
                          value={address2}
                          onChange={(e) => setAddress2(e.target.value)}
                          className={`w-full px-4 py-2 rounded-lg ${formInputColors.base} border`}
                          placeholder="Apt 4B, Suite 100, etc."
                          autoFocus
                        />
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowAddress2(true)}
                        className={`text-sm ${titleColors.blue} hover:underline`}
                      >
                        + Add apartment, suite, etc.
                      </button>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                      City, State, ZIP *
                    </label>
                    <input
                      type="text"
                      value={cityStateZip}
                      onChange={(e) => setCityStateZip(e.target.value)}
                      required
                      className={`w-full px-4 py-2 rounded-lg ${formInputColors.base} border`}
                      placeholder="New York, NY 10001"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="space-y-3">
                <Button
                  variant="purple"
                  type="submit"
                  disabled={isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? 'Processing...' : 'Continue'}
                </Button>

                <Button
                  variant="gray"
                  href="/cart"
                  className="w-full"
                  size="lg"
                >
                  Back to Cart
                </Button>
              </div>
            </form>

            {/* Right column - Order Summary */}
            <div className="w-full lg:self-start lg:sticky lg:top-20 space-y-6">
              <div className={`${dividerColors.border} border rounded-lg p-8 dark:bg-gray-800`}>
                <h2 className={`text-xl font-bold ${headingColors.primary} mb-6`}>
                  Order Summary
                </h2>

                {/* Cart items preview */}
                <div className={`space-y-4 mb-6 pb-6 border-b ${dividerColors.border}`}>
                  {cart?.items?.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className={`font-medium ${headingColors.primary} text-sm`}>
                          {item.title || item.variant?.title || 'Consultation'}
                        </p>
                        <p className={`text-xs ${formInputColors.helper}`}>
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className={`font-semibold ${headingColors.primary} text-sm`}>
                        ${(((item.unit_price || 0) * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className={`space-y-4 mb-6 pb-6 border-b ${dividerColors.border}`}>
                  <div className="flex justify-between">
                    <span className={formInputColors.helper}>Subtotal</span>
                    <span className={`font-semibold ${headingColors.primary}`}>
                      ${((cart?.subtotal || 0) / 100).toFixed(2)}
                    </span>
                  </div>

                  {(cart?.tax_total || 0) > 0 && (
                    <div className="flex justify-between">
                      <span className={formInputColors.helper}>Tax</span>
                      <span className={`font-semibold ${headingColors.primary}`}>
                        ${((cart?.tax_total || 0) / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mb-6">
                  <span className={`text-lg font-bold ${headingColors.primary}`}>Total</span>
                  <span className={`text-2xl font-bold ${headingColors.primary}`}>
                    ${((cart?.total || 0) / 100).toFixed(2)}
                  </span>
                </div>

                <Button variant="blue" href="/cart" className="w-full" size="lg">
                  Edit Cart
                </Button>
              </div>

              {/* What happens next */}
              <div className={`${dividerColors.border} border rounded-lg p-6 ${lightBgColors.blue}`}>
                <p className={`text-sm ${formInputColors.helper}`}>
                  <strong>What happens next?</strong> After payment, we&apos;ll confirm your appointment within 24 hours and send you calendar details.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

