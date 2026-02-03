/**
 * Deposit Payment Validation
 *
 * Validates that deposit amounts are correct and balance never goes negative.
 * Prevents data integrity issues like double-charging or losing money.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export interface DepositValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors?: DepositValidationError[];
}

// ============================================================================
// Order Payment Field Validation
// ============================================================================

/**
 * Validate that order has required payment fields
 *
 * Ensures:
 * - Both deposit_amount and balance_remaining are present or both absent
 * - balance_remaining is never negative
 *
 * @param order - Order object to validate
 * @returns true if order payment fields are valid
 */
export function validateOrderPaymentFields(order: any): boolean {
  // Must have both or neither
  if (!order.deposit_amount && !order.balance_remaining) {
    return true; // No deposit fields is valid (full payment)
  }

  if (!order.deposit_amount || !order.balance_remaining) {
    return false; // Must have both if using deposits
  }

  // Balance must never be negative
  if (order.balance_remaining < 0) {
    return false;
  }

  return true;
}

// ============================================================================
// Deposit and Balance Validation
// ============================================================================

/**
 * Validate that deposit + balance = total
 *
 * Ensures no money is lost or overcharged due to rounding or bugs.
 *
 * @param deposit - Deposit amount in cents
 * @param balance - Remaining balance in cents
 * @param total - Total order amount in cents
 * @returns true if amounts correctly sum
 */
export function validateDepositBalance(
  deposit: number,
  balance: number,
  total: number
): boolean {
  // Must sum to total
  if (deposit + balance !== total) {
    return false;
  }

  // Deposit must be positive
  if (deposit <= 0) {
    return false;
  }

  // Balance can be zero but never negative
  if (balance < 0) {
    return false;
  }

  return true;
}

/**
 * Validate that balance is never negative
 *
 * @param balance - Balance amount to check
 * @returns true if balance is non-negative
 */
export function validateBalanceNotNegative(balance: number): boolean {
  return balance >= 0;
}

/**
 * Validate that charge amount does not exceed remaining balance
 *
 * Prevents overcharging customer.
 *
 * @param chargeAmount - Amount being charged in cents
 * @param balanceRemaining - Total balance remaining in cents
 * @returns true if charge is within balance
 */
export function validateChargeAmountNotExceedsBalance(
  chargeAmount: number,
  balanceRemaining: number
): boolean {
  return chargeAmount <= balanceRemaining;
}

/**
 * Validate that deposit is not larger than total order amount
 *
 * Prevents impossible states where deposit > total.
 *
 * @param deposit - Deposit amount in cents
 * @param total - Total order amount in cents
 * @returns true if deposit is reasonable
 */
export function validateDepositNotLargerThanTotal(
  deposit: number,
  total: number
): boolean {
  return deposit > 0 && deposit <= total;
}

/**
 * Validate payment status value
 *
 * @param status - Status to validate
 * @returns true if valid payment status
 */
export function validatePaymentStatus(
  status: string
): status is 'pending' | 'deposit_paid' | 'paid' | 'canceled' | 'failed' {
  return ['pending', 'deposit_paid', 'paid', 'canceled', 'failed'].includes(status);
}

// ============================================================================
// Ready-for-Delivery Validation
// ============================================================================

/**
 * Validate that order is ready for final payment collection
 *
 * Checks:
 * - Order has pending final payment status
 * - Balance is positive
 * - No payment was already collected
 *
 * @param order - Order object to validate
 * @returns Validation result with details
 */
export function validateReadyForDeliveryPrerequisites(order: any): ValidationResult {
  const errors: DepositValidationError[] = [];

  // Must have pending final payment
  if (order.final_payment_status !== 'pending') {
    errors.push({
      field: 'final_payment_status',
      message: `Final payment already processed (status: ${order.final_payment_status})`,
      code: 'PAYMENT_ALREADY_PROCESSED',
    });
  }

  // Must have balance remaining
  if (!order.balance_remaining || order.balance_remaining <= 0) {
    errors.push({
      field: 'balance_remaining',
      message: 'No balance remaining to collect',
      code: 'NO_BALANCE_REMAINING',
    });
  }

  // Balance should not exceed total (sanity check)
  const total = (order.deposit_amount || 0) + (order.balance_remaining || 0);
  if (order.balance_remaining > total) {
    errors.push({
      field: 'balance_remaining',
      message: 'Balance exceeds total order amount',
      code: 'BALANCE_EXCEEDS_TOTAL',
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Comprehensive validation for deposit payment fields
 *
 * @param order - Order to validate
 * @returns Validation result with all checks
 */
export function validateDepositPaymentFields(order: any): ValidationResult {
  const errors: DepositValidationError[] = [];

  // Check required fields exist
  if (!validateOrderPaymentFields(order)) {
    errors.push({
      field: 'deposit_payment_fields',
      message: 'Order missing deposit amount or balance remaining',
      code: 'MISSING_PAYMENT_FIELDS',
    });
  }

  // Check balance is not negative
  if (order.balance_remaining !== undefined && !validateBalanceNotNegative(order.balance_remaining)) {
    errors.push({
      field: 'balance_remaining',
      message: 'Balance cannot be negative',
      code: 'NEGATIVE_BALANCE',
    });
  }

  // Check deposit + balance = total
  if (
    order.deposit_amount !== undefined &&
    order.balance_remaining !== undefined &&
    order.total !== undefined
  ) {
    if (!validateDepositBalance(order.deposit_amount, order.balance_remaining, order.total)) {
      errors.push({
        field: 'amounts',
        message: `Deposit ($${order.deposit_amount / 100}) + Balance ($${order.balance_remaining / 100}) does not equal Total ($${order.total / 100})`,
        code: 'AMOUNT_MISMATCH',
      });
    }
  }

  // Check deposit is not larger than total
  if (order.deposit_amount !== undefined && order.total !== undefined) {
    if (!validateDepositNotLargerThanTotal(order.deposit_amount, order.total)) {
      errors.push({
        field: 'deposit_amount',
        message: 'Deposit cannot be larger than total order amount',
        code: 'DEPOSIT_EXCEEDS_TOTAL',
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
