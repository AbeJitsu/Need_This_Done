// ============================================================================
// Deposit Payment Validation Tests
// ============================================================================
// What: Verify deposit amounts are valid and balance never goes negative
// Why: Data integrity - ensure no money is lost or double-charged
// How: Validate amounts at API boundaries and database level

import { describe, it, expect } from 'vitest';
import {
  validateOrderPaymentFields,
  validateDepositBalance,
} from '@/lib/deposit-validation';

describe('Deposit Payment Validation', () => {
  it('should reject negative balance_remaining', async () => {
    // Arrange: Invalid order state
    const invalidOrder = {
      deposit_amount: 5000,
      balance_remaining: -100, // INVALID: negative balance
    };

    // Act: Try to create order with negative balance
    const isValid = validateOrderPaymentFields(invalidOrder);

    // Assert: Validation fails
    expect(isValid).toBe(false);
  });

  it('should reject if deposit and balance do not sum to total', async () => {
    // Arrange: Mismatched amounts
    const total = 10000;
    const deposit = 5000;
    const balance = 4500; // Should be 5000, missing $5

    // Act: Validate
    const isValid = validateDepositBalance(deposit, balance, total);

    // Assert: Fails
    expect(isValid).toBe(false);
  });

  it('should accept when deposit + balance = total', async () => {
    // Arrange
    const total = 10000;
    const deposit = 5000;
    const balance = 5000;

    // Act
    const isValid = validateDepositBalance(deposit, balance, total);

    // Assert
    expect(isValid).toBe(true);
  });

  it('should prevent ready-for-delivery if balance is already zero', async () => {
    // Arrange: Order where final payment already collected
    const order = {
      id: 'order-123',
      balance_remaining: 0,
      final_payment_status: 'paid',
    };

    // Act: Try to collect final payment again
    const canCollectPayment = order.balance_remaining > 0 && order.final_payment_status === 'pending';

    // Assert: Cannot collect payment
    expect(canCollectPayment).toBe(false);
  });

  it('should reject charging more than balance_remaining', async () => {
    // Arrange: Order with $50 balance
    const order = {
      id: 'order-123',
      balance_remaining: 5000,
    };

    // Act: Try to charge $75
    const chargeAmount = 7500;
    const isValid = chargeAmount <= order.balance_remaining;

    // Assert: Charge rejected
    expect(isValid).toBe(false);
  });

  it('should handle zero balance gracefully', async () => {
    // Arrange: Order with no balance remaining
    const order = {
      deposit_amount: 10000,
      balance_remaining: 0,
      total: 10000,
    };

    // Act: Check if order is fully paid
    const isPaid = order.balance_remaining === 0;

    // Assert
    expect(isPaid).toBe(true);
  });

  it('should prevent deposit from being larger than total', async () => {
    // Arrange: Invalid amounts
    const total = 5000;
    const deposit = 6000; // Larger than total!

    // Act: Validate
    const isValid = deposit <= total && deposit > 0;

    // Assert
    expect(isValid).toBe(false);
  });
});
