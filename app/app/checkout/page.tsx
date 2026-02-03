'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { StripeElementsWrapper } from '@/context/StripeContext';
import Button from '@/components/Button';
import PaymentForm from '@/components/PaymentForm';
import AppointmentStepForm, { AppointmentData } from '@/components/AppointmentStepForm';
import AddressSelector from '@/components/AddressSelector';
import { SavedAddress } from '@/lib/hooks/useSavedAddresses';
import { calculateDeposit, calculateBalanceRemaining } from '@/lib/deposit-utils';
import {
  formInputColors,
  formValidationColors,
  alertColors,
  headingColors,
  accentColors,
} from '@/lib/colors';
import { COPY_FEEDBACK_DELAY } from '@/lib/timing';
import { CheckIcon } from '@/components/ui/icons';
import { convertTo12HourFormat } from '@/lib/time-utils';
import { FadeIn } from '@/components/motion';

// ============================================================================
// Checkout Page - /checkout
// ============================================================================
// What: Completes the purchase process with Stripe payment
// Why: Collect shipping/payment info, process payment, and create order
// How: Multi-step flow: Contact → Appointment (if needed) → Payment → Confirmation

type CheckoutStep = 'info' | 'appointment' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartId, itemCount, clearCart, isSyncing, isCartReady } = useCart();
  const { user, isAuthenticated } = useAuth();

  // Form field references for focus management
  const emailRef = useRef<HTMLInputElement>(null);
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const cityStateZipRef = useRef<HTMLInputElement>(null);

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
  const [orderNotes, setOrderNotes] = useState('');

  // Payment state
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  // Deposit payment state
  const [payInFull, setPayInFull] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // Appointment state (for consultation products)
  const [requiresAppointment, setRequiresAppointment] = useState(false);
  const [appointmentInfo, setAppointmentInfo] = useState<{
    serviceName: string;
    durationMinutes: number;
  } | null>(null);
  const [appointmentData, setAppointmentData] = useState<AppointmentData | null>(null);
  const [appointmentCreationError, setAppointmentCreationError] = useState('');

  // Total from Medusa cart (all in cents)
  const total = cart?.total || 0;
  const hasItems = (cart?.items?.length || 0) > 0;

  // Helper: Get display label for product type
  const getItemTypeLabel = (item: { product?: { metadata?: Record<string, unknown> } }): string => {
    const productType = item.product?.metadata?.type as string | undefined;
    if (productType === 'package') return 'Website Package';
    if (productType === 'addon') return 'Add-on';
    if (productType === 'service') return 'Service';
    if (productType === 'subscription') return 'Subscription';
    return 'Product';
  };

  // Reusable order summary for all checkout steps - Dark Glass Treatment
  const renderOrderSummary = () => (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8">
      {/* Accent glows */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/15 rounded-full blur-2xl" />

      <div className="relative z-10">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-1 rounded-full bg-gradient-to-r from-purple-400 to-emerald-400" />
          <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Order Summary</span>
        </div>

        {/* All cart items from Medusa */}
        {hasItems && (
          <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
            {cart?.items?.map((item) => {
              const isSubscription = item.product?.metadata?.type === 'subscription';
              return (
                <div key={item.id} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-white text-sm">
                      {item.title || item.variant?.title || item.product?.title || 'Item'}
                    </p>
                    <p className="text-xs text-slate-400">
                      {getItemTypeLabel(item)} &middot; Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-white text-sm">
                    ${(((item.unit_price || 0) * item.quantity) / 100).toFixed(2)}
                    {isSubscription && <span className="text-xs font-normal text-slate-400">/mo</span>}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Totals */}
        <div className="space-y-4 mb-6 pb-6 border-b border-white/10">
          <div className="flex justify-between">
            <span className="text-slate-400">Subtotal</span>
            <span className="font-semibold text-white">
              ${((cart?.subtotal || 0) / 100).toFixed(2)}
            </span>
          </div>
          {(cart?.tax_total || 0) > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-400">Tax</span>
              <span className="font-semibold text-white">
                ${((cart?.tax_total || 0) / 100).toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-baseline mb-8">
          <span className="text-lg font-bold text-white">Total</span>
          <span className="text-3xl font-black text-white">
            ${(total / 100).toFixed(2)}
          </span>
        </div>

        <Button variant="gray" href="/cart" className="w-full bg-white/10 hover:bg-white/15 border-white/10 text-white" size="lg">
          Edit Cart
        </Button>
      </div>
    </div>
  );

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
  // Handle saved address selection
  // ========================================================================
  const handleAddressSelect = (address: SavedAddress) => {
    setFirstName(address.first_name);
    setLastName(address.last_name);
    setAddress(address.street_address);
    setAddress2(address.apartment || '');
    setCityStateZip(`${address.city}, ${address.state_province} ${address.postal_code}`);
    // Clear any field errors when user selects an address
    setFieldErrors({});
  };

  // ========================================================================
  // Step 1: Handle info submission - check for appointment requirement
  // ========================================================================
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const newFieldErrors: Record<string, string> = {};

    // Validate required fields
    if (!email) {
      newFieldErrors.email = 'Email is required';
    }

    if (!firstName.trim()) {
      newFieldErrors.firstName = 'First name is required';
    }

    if (!lastName.trim()) {
      newFieldErrors.lastName = 'Last name is required';
    }

    if (!address.trim()) {
      newFieldErrors.address = 'Address is required';
    }

    if (!cityStateZip.trim()) {
      newFieldErrors.cityStateZip = 'City, State, ZIP is required';
    }

    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      setError('Please fill in all required fields');

      // Focus on the first field with an error for better UX
      // This helps keyboard and screen reader users understand what needs to be fixed
      if (newFieldErrors.email && emailRef.current) {
        emailRef.current.focus();
      } else if (newFieldErrors.firstName && firstNameRef.current) {
        firstNameRef.current.focus();
      } else if (newFieldErrors.lastName && lastNameRef.current) {
        lastNameRef.current.focus();
      } else if (newFieldErrors.address && addressRef.current) {
        addressRef.current.focus();
      } else if (newFieldErrors.cityStateZip && cityStateZipRef.current) {
        cityStateZipRef.current.focus();
      }
      return;
    }

    setFieldErrors({});

    if (itemCount === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setIsProcessing(true);

      // Skip appointment check if no cart
      if (!cartId) {
        await proceedToPayment();
        return;
      }

      // Check if cart requires appointment (by checking product metadata)
      const checkResponse = await fetch('/api/checkout/check-appointment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart_id: cartId }),
      });

      // Handle non-OK responses
      if (!checkResponse.ok) {
        const checkData = await checkResponse.json();
        const errorMsg = checkData.error || 'Failed to check appointment requirement';

        // If retryable (e.g., service temporarily down), show user a recoverable error
        if (checkData.retryable) {
          throw new Error(errorMsg + ' (Please try again in a moment)');
        }

        // Otherwise, it's a client error
        throw new Error(errorMsg);
      }

      const checkData = await checkResponse.json();

      // Validate response structure before using it
      if (!checkData || typeof checkData.requires_appointment !== 'boolean') {
        throw new Error('Invalid appointment check response');
      }

      if (checkData.requires_appointment) {
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
      setError(err instanceof Error ? err.message : 'Hmm, something went wrong. Please try again or contact us - we\'re here to help.');
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
    // Guard: Ensure cart is fully synced before proceeding
    if (isSyncing) {
      setError('Just a moment - finishing up your cart changes...');
      return;
    }

    if (!isCartReady) {
      setError('Hmm, something went wrong with your cart. Please go back and try adding your items again.');
      return;
    }

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
          order_notes: orderNotes.trim() || null,
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

      // Create PaymentIntent - calculate deposit or full amount
      const chargeAmount = payInFull ? total : calculateDeposit(total);
      const isDeposit = !payInFull;

      const paymentResponse = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: chargeAmount,
          order_id: orderData.order_id,
          email,
          is_deposit: isDeposit,
          save_payment_method: isDeposit, // Save card for final payment if doing deposits
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
      setError(err instanceof Error ? err.message : 'Hmm, something went wrong. Please try again or contact us - we\'re here to help.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ========================================================================
  // Step 3: Handle payment success - create appointment if needed
  // ========================================================================
  const handlePaymentSuccess = async (_paymentIntentId: string) => {

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
          const errorData = await response.json();
          const errorMessage = errorData.error || 'Failed to create appointment request';
          console.error('Failed to create appointment request:', errorMessage);
          setAppointmentCreationError(errorMessage);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error creating appointment request';
        console.error('Error creating appointment request:', errorMessage);
        setAppointmentCreationError(errorMessage);
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
  // Order confirmation screen (Step 3) - Editorial Treatment
  // ========================================================================
  if (currentStep === 'confirmation') {
    return (
      <div className="min-h-screen">
        {/* Hero Header */}
        <section className="pt-8 md:pt-12 pb-4">
          <div className="relative overflow-hidden py-12 md:py-16 md:max-w-6xl md:mx-auto md:rounded-3xl">
            {/* Dark gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950" />
            {/* Accent glows */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
            {/* Success check watermark */}
            <div className="absolute -bottom-8 -right-4 text-[10rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">✓</div>

            <div className="relative z-10 px-6 sm:px-8 md:px-12 text-center">
              <FadeIn direction="up" triggerOnScroll={false}>
                {/* Success icon */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
                  <svg className="w-8 h-8 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[0.95] mb-4">
                  You&apos;re all set!
                </h1>
                <p className="text-xl text-slate-400 max-w-xl mx-auto leading-relaxed">
                  Thanks so much for your order - we&apos;re excited to get started!
                  {requiresAppointment && ' We\'ll confirm your appointment shortly.'}
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Order Details */}
        <section className="py-8 md:py-12">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
            <FadeIn direction="up" delay={0.1}>
              {/* Order card - Dark Glass Treatment */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/15 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />

                <div className="relative z-10">
                  {/* Order Number */}
                  <div className="mb-6 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-6 h-1 rounded-full bg-gradient-to-r from-emerald-400 to-purple-400" />
                      <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Order Number</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-xl sm:text-2xl font-bold text-white font-mono">
                        {orderId.length > 16
                          ? `${orderId.slice(0, 10)}...${orderId.slice(-6)}`
                          : orderId}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(orderId);
                          setCopied(true);
                          setTimeout(() => setCopied(false), COPY_FEEDBACK_DELAY);
                        }}
                        className={`flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                          copied
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-white/10 text-white hover:bg-white/15'
                        }`}
                        title="Copy full order number"
                      >
                        {copied ? (
                          <>
                            <CheckIcon size="sm" />
                            Copied
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirmation Email */}
                  <div className="mb-6">
                    <p className="text-sm text-slate-400 mb-2">Confirmation Email</p>
                    <p className="text-lg text-white font-medium">{email}</p>
                    <p className="text-sm text-slate-400 mt-2">
                      Check your inbox for a confirmation email with your order details.
                    </p>
                  </div>

                  {/* Appointment confirmation message or error */}
                  {requiresAppointment && appointmentData && (
                    <>
                      {appointmentCreationError && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                          <p className="text-sm font-semibold text-red-400">
                            ⚠️ Appointment Request Failed
                          </p>
                          <p className="text-sm text-red-300 mt-2">
                            {appointmentCreationError}
                          </p>
                          <p className="text-sm text-red-300/80 mt-2">
                            Your payment was processed successfully, but we couldn&apos;t register your appointment request.
                            Please contact us at <a href="mailto:admin@needthisdone.com" className="underline font-medium text-red-400">admin@needthisdone.com</a> with your order number to schedule your consultation.
                          </p>
                        </div>
                      )}
                      {!appointmentCreationError && (
                        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                          <p className="text-sm text-blue-300">
                            <strong className="text-blue-400">Appointment Requested:</strong>{' '}
                            {new Date(appointmentData.preferredDate + 'T12:00:00').toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric',
                            })}{' '}
                            at {appointmentData.preferredTimeStart.replace(/^(\d{2}):(\d{2})$/, (_, h, m) => {
                              const hour = parseInt(h);
                              const ampm = hour >= 12 ? 'PM' : 'AM';
                              const hour12 = convertTo12HourFormat(hour);
                              return `${hour12}:${m} ${ampm}`;
                            })}
                          </p>
                          <p className="text-sm text-blue-300/80 mt-1">
                            We&apos;ll review your request and confirm within 24 hours.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Success message */}
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <p className="text-sm text-emerald-300">
                      Your payment has been processed securely. You&apos;ll receive a
                      receipt via email shortly.
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn direction="up" delay={0.2}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="purple" href="/pricing" className="flex-1 shadow-lg shadow-purple-500/25" size="lg">
                  Continue Shopping
                </Button>
                {isAuthenticated && (
                  <Button variant="blue" href="/dashboard" className="flex-1 shadow-lg shadow-blue-500/25" size="lg">
                    View My Orders
                  </Button>
                )}
              </div>
            </FadeIn>
          </div>
        </section>
      </div>
    );
  }

  // ========================================================================
  // Appointment step (Step 2) - Only shows if cart requires appointment
  // ========================================================================
  if (currentStep === 'appointment' && appointmentInfo) {
    return (
      <div className="min-h-screen">
        {/* Hero Header */}
        <section className="pt-8 md:pt-12 pb-4">
          <div className="relative overflow-hidden py-12 md:py-16 md:max-w-6xl md:mx-auto md:rounded-3xl">
            {/* Dark gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950" />
            {/* Accent glows */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
            {/* Calendar watermark */}
            <div className="absolute -bottom-8 -right-4 text-[10rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">📅</div>

            <div className="relative z-10 px-6 sm:px-8 md:px-12">
              <FadeIn direction="up" triggerOnScroll={false}>
                {/* Editorial header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-1 rounded-full bg-gradient-to-r from-blue-400 to-purple-400" />
                  <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Step 2 of 3</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[0.95] mb-4">
                  Pick your time.
                </h1>
                <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                  Choose a time that works best for your {appointmentInfo.serviceName}.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 lg:gap-10">
              {/* Left column - Appointment form */}
              <div className="w-full">
                {/* Error message */}
                {error && (
                  <FadeIn direction="up">
                    <div className={`mb-6 p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-xl`}>
                      <p className={`text-sm ${formValidationColors.error}`}>{error}</p>
                    </div>
                  </FadeIn>
                )}

                <FadeIn direction="up" delay={0.1}>
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/50">
                    <AppointmentStepForm
                      durationMinutes={appointmentInfo.durationMinutes}
                      serviceName={appointmentInfo.serviceName}
                      onComplete={handleAppointmentComplete}
                      onBack={() => setCurrentStep('info')}
                      isProcessing={isProcessing}
                    />
                  </div>
                </FadeIn>
              </div>

              {/* Right column - Order Summary */}
              <div className="w-full lg:self-start lg:sticky lg:top-20 space-y-6">
                <FadeIn direction="up" delay={0.2}>
                  {renderOrderSummary()}
                </FadeIn>

                <FadeIn direction="up" delay={0.3}>
                  {/* What happens next - Dark Glass Card */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 sm:p-6">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl" />

                    <div className="relative z-10">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-blue-400 text-sm">💡</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white mb-1">What happens next?</p>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            After payment, we&apos;ll confirm your appointment within 24 hours and send you calendar details.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ========================================================================
  // Payment step (Step 3) - Editorial Treatment
  // ========================================================================
  if (currentStep === 'payment' && clientSecret) {
    return (
      <div className="min-h-screen">
        {/* Hero Header */}
        <section className="pt-8 md:pt-12 pb-4">
          <div className="relative overflow-hidden py-12 md:py-16 md:max-w-6xl md:mx-auto md:rounded-3xl">
            {/* Dark gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950" />
            {/* Accent glows */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
            {/* Payment watermark */}
            <div className="absolute -bottom-8 -right-4 text-[10rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">💳</div>

            <div className="relative z-10 px-6 sm:px-8 md:px-12">
              <FadeIn direction="up" triggerOnScroll={false}>
                {/* Editorial header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-1 rounded-full bg-gradient-to-r from-purple-400 to-emerald-400" />
                  <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Step 3 of 3</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[0.95] mb-4">
                  Secure payment.
                </h1>
                <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                  Complete your purchase with our secure payment system.
                </p>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
              {/* Left column - Payment form */}
              <div className="w-full space-y-6">
                {/* Error message */}
                {error && (
                  <FadeIn direction="up">
                    <div className={`p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-xl`}>
                      <p className={`text-sm ${formValidationColors.error}`}>{error}</p>
                    </div>
                  </FadeIn>
                )}

                {/* Deposit Payment Notice */}
                <FadeIn direction="up" delay={0.1}>
                  {!payInFull && (
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-900/50 to-blue-950/50 border border-blue-500/20 p-5">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl" />
                      <div className="relative z-10 flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-blue-400">💰</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white mb-1">Deposit Payment</h3>
                          <p className="text-sm text-blue-200">
                            Pay <strong className="text-white">${(calculateDeposit(cart?.total || 0) / 100).toFixed(2)}</strong> today to secure your order.
                            The remaining <strong className="text-white">${(calculateBalanceRemaining(cart?.total || 0) / 100).toFixed(2)}</strong> will be charged
                            when your order is ready for delivery.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </FadeIn>

                {/* Payment options card */}
                <FadeIn direction="up" delay={0.15}>
                  <div className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 space-y-4">
                    {/* Full Payment Option */}
                    <label className="flex items-center gap-3 text-sm p-4 border-2 border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={payInFull}
                        onChange={(e) => {
                          setPayInFull(e.target.checked);
                          setConsentChecked(false);
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-700 font-medium">
                        Pay in full now (${((cart?.total || 0) / 100).toFixed(2)}) instead of deposit
                      </span>
                    </label>

                    {/* Consent Checkbox */}
                    <label className="flex items-start gap-3 text-sm p-4 border-2 border-gray-100 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/50 cursor-pointer transition-all">
                      <input
                        type="checkbox"
                        checked={consentChecked}
                        onChange={(e) => setConsentChecked(e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        required
                      />
                      <span className="text-gray-700">
                        {payInFull ? (
                          <>I understand I&apos;m paying the full amount now.</>
                        ) : (
                          <>I authorize charging the remaining balance when my order is ready. I can update my payment method or pay with an alternative method if needed.</>
                        )}
                      </span>
                    </label>
                  </div>
                </FadeIn>

                {/* Payment form */}
                <FadeIn direction="up" delay={0.2}>
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-6 h-1 rounded-full bg-gradient-to-r from-purple-500 to-emerald-500" />
                      <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">Payment Details</span>
                    </div>

                    {!consentChecked && (
                      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-sm text-amber-800 font-medium">
                          ⚠️ Please check the consent box above to continue
                        </p>
                      </div>
                    )}

                    <StripeElementsWrapper clientSecret={clientSecret}>
                      <PaymentForm
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                        returnUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/checkout`}
                        submitText={payInFull
                          ? `Pay in Full $${(total / 100).toFixed(2)}`
                          : `Pay Deposit $${(calculateDeposit(total) / 100).toFixed(2)}`
                        }
                      />
                    </StripeElementsWrapper>
                  </div>
                </FadeIn>

                {/* Back button */}
                <FadeIn direction="up" delay={0.25}>
                  <Button
                    variant="gray"
                    onClick={() => setCurrentStep(requiresAppointment ? 'appointment' : 'info')}
                    className="w-full"
                    size="lg"
                  >
                    {requiresAppointment ? 'Back to Scheduling' : 'Back to Information'}
                  </Button>
                </FadeIn>
              </div>

              {/* Right column - Order Summary */}
              <div className="w-full lg:self-start lg:sticky lg:top-20 space-y-6">
                <FadeIn direction="up" delay={0.2}>
                  {renderOrderSummary()}
                </FadeIn>

                <FadeIn direction="up" delay={0.3}>
                  {/* What happens next - Dark Glass Card */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 sm:p-6">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl" />

                    <div className="relative z-10">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <span className="text-emerald-400 text-sm">🔒</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white mb-1">Secure & Protected</p>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            Your payment is encrypted and processed securely through Stripe.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ========================================================================
  // Information step (Step 1) - Editorial Treatment
  // ========================================================================
  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <section className="pt-8 md:pt-12 pb-4">
        <div className="relative overflow-hidden py-12 md:py-16 md:max-w-6xl md:mx-auto md:rounded-3xl">
          {/* Dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950" />
          {/* Accent glows */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
          {/* Checkout watermark */}
          <div className="absolute -bottom-8 -right-4 text-[10rem] font-black text-white/[0.03] leading-none select-none pointer-events-none">✨</div>

          <div className="relative z-10 px-6 sm:px-8 md:px-12">
            <FadeIn direction="up" triggerOnScroll={false}>
              {/* Editorial header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-1 rounded-full bg-gradient-to-r from-purple-400 to-blue-400" />
                <span className="text-sm font-semibold tracking-widest uppercase text-slate-400">Checkout</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[0.95] mb-4">
                Let&apos;s finalize.
              </h1>
              <p className="text-xl text-slate-400 max-w-xl leading-relaxed">
                Just a few details and you&apos;re all set.
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          {itemCount === 0 ? (
            <FadeIn direction="up">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-12 text-center">
                <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <p className="text-slate-400 mb-6 text-lg">Your cart is empty.</p>
                  <Button variant="purple" href="/pricing" className="shadow-lg shadow-purple-500/25">
                    Browse Services
                  </Button>
                </div>
              </div>
            </FadeIn>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
              {/* Left column - Checkout form */}
              <form onSubmit={handleInfoSubmit} className="w-full space-y-6">
                {/* Error message */}
                {error && (
                  <FadeIn direction="up">
                    <div className={`p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-xl`}>
                      <p className={`text-sm ${formValidationColors.error}`}>{error}</p>
                    </div>
                  </FadeIn>
                )}

                {/* Contact Information */}
                <FadeIn direction="up" delay={0.1}>
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-6 h-1 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                      <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">Contact Information</span>
                    </div>

                    {isAuthenticated ? (
                      <div>
                        <p className={`text-sm ${formInputColors.helper} mb-2`}>Email</p>
                        <p className={`text-lg ${headingColors.primary} font-medium`}>{email}</p>
                        <p className={`text-sm ${formInputColors.helper} mt-2`}>
                          Logged in as <span className="font-semibold">{user?.email}</span>
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label htmlFor="checkout-email" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="checkout-email"
                          ref={emailRef}
                          autoComplete="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (fieldErrors.email) {
                              setFieldErrors(prev => ({ ...prev, email: '' }));
                            }
                          }}
                          required
                          aria-required="true"
                          aria-invalid={!!fieldErrors.email}
                          aria-describedby={fieldErrors.email ? 'checkout-email-error' : 'checkout-email-help'}
                          className={`w-full px-4 py-3 rounded-xl ${formInputColors.base} ${formInputColors.placeholder} border-2 transition-colors ${fieldErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'} ${formInputColors.focus}`}
                          placeholder="your@email.com"
                        />
                        {fieldErrors.email ? (
                          <p id="checkout-email-error" className={`text-sm ${formValidationColors.error} mt-2`}>
                            {fieldErrors.email}
                          </p>
                        ) : (
                          <p id="checkout-email-help" className={`text-sm ${formInputColors.helper} mt-2`}>
                            We&apos;ll use this email to send your order confirmation and receipt.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </FadeIn>

                {/* Saved Addresses Selector */}
                {isAuthenticated && (
                  <FadeIn direction="up" delay={0.15}>
                    <AddressSelector onSelectAddress={handleAddressSelect} isAuthenticated={isAuthenticated} />
                  </FadeIn>
                )}

                {/* Shipping Information */}
                <FadeIn direction="up" delay={0.2}>
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-6 h-1 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500" />
                      <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">Shipping Information</span>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="firstName" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          ref={firstNameRef}
                          autoComplete="given-name"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (fieldErrors.firstName) {
                              setFieldErrors(prev => ({ ...prev, firstName: '' }));
                            }
                          }}
                          required
                          aria-required="true"
                          aria-invalid={!!fieldErrors.firstName}
                          className={`w-full px-4 py-3 rounded-xl ${formInputColors.base} ${formInputColors.placeholder} border-2 transition-colors ${fieldErrors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-200'} ${formInputColors.focus}`}
                          placeholder="John"
                        />
                        {fieldErrors.firstName && (
                          <p className={`text-sm ${formValidationColors.error} mt-1`}>{fieldErrors.firstName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="lastName" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          ref={lastNameRef}
                          autoComplete="family-name"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            if (fieldErrors.lastName) {
                              setFieldErrors(prev => ({ ...prev, lastName: '' }));
                            }
                          }}
                          required
                          aria-required="true"
                          aria-invalid={!!fieldErrors.lastName}
                          className={`w-full px-4 py-3 rounded-xl ${formInputColors.base} ${formInputColors.placeholder} border-2 transition-colors ${fieldErrors.lastName ? 'border-red-500 bg-red-50' : 'border-gray-200'} ${formInputColors.focus}`}
                          placeholder="Doe"
                        />
                        {fieldErrors.lastName && (
                          <p className={`text-sm ${formValidationColors.error} mt-1`}>{fieldErrors.lastName}</p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="address" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                          Address *
                        </label>
                        <input
                          type="text"
                          id="address"
                          ref={addressRef}
                          autoComplete="street-address"
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            if (fieldErrors.address) {
                              setFieldErrors(prev => ({ ...prev, address: '' }));
                            }
                          }}
                          required
                          aria-required="true"
                          aria-invalid={!!fieldErrors.address}
                          className={`w-full px-4 py-3 rounded-xl ${formInputColors.base} ${formInputColors.placeholder} border-2 transition-colors ${fieldErrors.address ? 'border-red-500 bg-red-50' : 'border-gray-200'} ${formInputColors.focus}`}
                          placeholder="123 Main St"
                        />
                        {fieldErrors.address && (
                          <p className={`text-sm ${formValidationColors.error} mt-1`}>{fieldErrors.address}</p>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        {showAddress2 ? (
                          <>
                            <label htmlFor="address2" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                              Apt, Suite, etc. (optional)
                            </label>
                            <input
                              type="text"
                              id="address2"
                              autoComplete="address-line2"
                              value={address2}
                              onChange={(e) => setAddress2(e.target.value)}
                              className={`w-full px-4 py-3 rounded-xl ${formInputColors.base} ${formInputColors.placeholder} border-2 border-gray-200 transition-colors ${formInputColors.focus}`}
                              placeholder="Apt 4B, Suite 100, etc."
                              autoFocus
                            />
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowAddress2(true)}
                            className={`text-sm ${accentColors.blue.titleText} font-medium hover:underline`}
                          >
                            + Add apartment, suite, etc.
                          </button>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <label htmlFor="cityStateZip" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                          City, State, ZIP *
                        </label>
                        <input
                          type="text"
                          id="cityStateZip"
                          ref={cityStateZipRef}
                          autoComplete="address-level2"
                          value={cityStateZip}
                          onChange={(e) => {
                            setCityStateZip(e.target.value);
                            if (fieldErrors.cityStateZip) {
                              setFieldErrors(prev => ({ ...prev, cityStateZip: '' }));
                            }
                          }}
                          required
                          aria-required="true"
                          aria-invalid={!!fieldErrors.cityStateZip}
                          className={`w-full px-4 py-3 rounded-xl ${formInputColors.base} ${formInputColors.placeholder} border-2 transition-colors ${fieldErrors.cityStateZip ? 'border-red-500 bg-red-50' : 'border-gray-200'} ${formInputColors.focus}`}
                          placeholder="New York, NY 10001"
                        />
                        {fieldErrors.cityStateZip && (
                          <p className={`text-sm ${formValidationColors.error} mt-1`}>{fieldErrors.cityStateZip}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </FadeIn>

                {/* Order Notes */}
                <FadeIn direction="up" delay={0.25}>
                  <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg shadow-slate-200/50">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-6 h-1 rounded-full bg-gradient-to-r from-emerald-500 to-purple-500" />
                      <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">Special Requests (Optional)</span>
                    </div>

                    <div>
                      <label htmlFor="orderNotes" className={`block text-sm font-medium ${formInputColors.label} mb-2`}>
                        Add any special requests or delivery instructions
                      </label>
                      <textarea
                        id="orderNotes"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="e.g., Leave at front door, fragile items, custom color request..."
                        maxLength={500}
                        rows={4}
                        className={`w-full px-4 py-3 rounded-xl ${formInputColors.base} ${formInputColors.placeholder} border-2 border-gray-200 transition-colors ${formInputColors.focus} resize-none`}
                      />
                      <p className={`text-sm ${formInputColors.helper} mt-2`}>
                        {orderNotes.length}/500 characters
                      </p>
                    </div>
                  </div>
                </FadeIn>

                {/* Action buttons */}
                <FadeIn direction="up" delay={0.3}>
                  <div className="space-y-3">
                    <Button
                      variant="green"
                      type="submit"
                      disabled={isProcessing}
                      className="w-full shadow-lg shadow-emerald-500/25"
                      size="lg"
                    >
                      {isProcessing ? 'Processing...' : 'Continue to Payment'}
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
                </FadeIn>
              </form>

              {/* Right column - Order Summary */}
              <div className="w-full lg:self-start lg:sticky lg:top-20 space-y-6">
                <FadeIn direction="up" delay={0.2}>
                  {renderOrderSummary()}
                </FadeIn>

                <FadeIn direction="up" delay={0.3}>
                  {/* What happens next - Dark Glass Card */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-5 sm:p-6">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-2xl" />

                    <div className="relative z-10">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-blue-400 text-sm">💡</span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white mb-1">What happens next?</p>
                          <p className="text-sm text-slate-400 leading-relaxed">
                            After payment, we&apos;ll confirm your order and send you next steps by email.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

