/**
 * Deposit Payment Utilities
 *
 * Handles calculation and management of 50/50 deposit payment split
 */

/**
 * Calculate 50% deposit amount from total
 * Rounds up to nearest cent to avoid fractional pennies
 *
 * @param totalCents Total amount in cents
 * @returns Deposit amount in cents (50% of total)
 */
export function calculateDeposit(totalCents: number): number {
  if (totalCents === 0) return 0;
  // Round up to nearest cent (Math.ceil ensures we never charge less than 50%)
  return Math.ceil(totalCents / 2);
}

/**
 * Calculate remaining balance after deposit
 *
 * @param totalCents Total amount in cents
 * @returns Remaining balance in cents
 */
export function calculateBalanceRemaining(totalCents: number): number {
  const deposit = calculateDeposit(totalCents);
  return totalCents - deposit;
}

/**
 * Determine if order is paying full amount upfront
 * (vs split deposit + final payment)
 */
export function isFullPayment(payInFull: boolean): boolean {
  return payInFull === true;
}

/**
 * Format payment display text for checkout
 */
export function formatDepositDisplay(
  totalCents: number
): { depositAmount: string; balanceAmount: string; totalAmount: string } {
  const deposit = calculateDeposit(totalCents);
  const balance = calculateBalanceRemaining(totalCents);

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  return {
    depositAmount: formatCurrency(deposit),
    balanceAmount: formatCurrency(balance),
    totalAmount: formatCurrency(totalCents),
  };
}

/**
 * Validate payment method value
 * @param method - Payment method to validate
 * @returns True if valid payment method
 */
export function validatePaymentMethod(
  method: string | null | undefined
): method is 'card' | 'cash' | 'check' | 'other' {
  return ['card', 'cash', 'check', 'other'].includes(method as string);
}

/**
 * Get human-readable label for payment method
 * @param method - Payment method code
 * @returns Human-readable label
 */
export function getPaymentMethodLabel(
  method: 'card' | 'cash' | 'check' | 'other'
): string {
  const labels: Record<string, string> = {
    card: 'Credit/Debit Card',
    cash: 'Cash',
    check: 'Check',
    other: 'Other Payment Method',
  };

  return labels[method] || method;
}

/**
 * Format payment details for email or receipt
 * @param depositCents - Deposit amount in cents
 * @param balanceCents - Balance remaining in cents
 * @param paymentMethod - How balance will be/was paid
 * @returns Formatted payment details object
 */
export function formatPaymentDetails(
  depositCents: number,
  balanceCents: number,
  paymentMethod?: 'card' | 'cash' | 'check' | 'other'
): {
  depositAmount: string;
  balanceAmount: string;
  totalAmount: string;
  paymentMethodLabel: string;
} {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return {
    depositAmount: formatCurrency(depositCents),
    balanceAmount: formatCurrency(balanceCents),
    totalAmount: formatCurrency(depositCents + balanceCents),
    paymentMethodLabel: paymentMethod
      ? getPaymentMethodLabel(paymentMethod)
      : 'Pending',
  };
}

/**
 * Get payment status display text
 * @param status - Internal payment status
 * @returns Human-readable status text
 */
export function getPaymentStatusLabel(
  status: 'pending' | 'paid' | 'failed' | 'waived'
): string {
  const labels: Record<string, string> = {
    pending: 'Awaiting Payment',
    paid: 'Paid',
    failed: 'Payment Failed',
    waived: 'Received',
  };

  return labels[status] || status;
}
