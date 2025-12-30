'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

// ============================================================================
// useCurrency Hook
// ============================================================================
// What: Client-side currency management with conversion and formatting
// Why: Provide consistent currency handling across the app
// How: Fetches rates, caches them, converts amounts, formats prices

// ============================================================================
// Types
// ============================================================================

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  symbol_position: 'before' | 'after';
  decimal_places: number;
  thousand_separator: string;
  decimal_separator: string;
  is_active: boolean;
  is_default: boolean;
}

export interface CurrencyState {
  currencies: Currency[];
  currentCurrency: string;
  baseCurrency: string;
  rates: Record<string, number>;
  isLoading: boolean;
  error: string | null;
}

export interface UseCurrencyReturn extends CurrencyState {
  setCurrency: (code: string) => Promise<void>;
  convert: (amount: number, from?: string, to?: string) => number;
  format: (amount: number, currencyCode?: string) => string;
  formatConverted: (amount: number, fromCurrency?: string) => string;
  getCurrency: (code: string) => Currency | undefined;
  refresh: () => Promise<void>;
}

// ============================================================================
// Local Storage Key
// ============================================================================

const STORAGE_KEY = 'preferred_currency';
const SESSION_ID_KEY = 'currency_session_id';

// ============================================================================
// Generate Session ID
// ============================================================================

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';

  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

// ============================================================================
// Hook
// ============================================================================

export function useCurrency(): UseCurrencyReturn {
  const [state, setState] = useState<CurrencyState>({
    currencies: [],
    currentCurrency: 'USD',
    baseCurrency: 'USD',
    rates: { USD: 1 },
    isLoading: true,
    error: null,
  });

  // Load currencies and rates on mount
  const loadCurrencies = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Fetch currencies and rates in parallel
      const [currenciesRes, ratesRes] = await Promise.all([
        fetch('/api/currencies?action=list'),
        fetch('/api/currencies?action=rates&base=USD'),
      ]);

      if (!currenciesRes.ok || !ratesRes.ok) {
        throw new Error('Failed to fetch currency data');
      }

      const [currenciesData, ratesData] = await Promise.all([
        currenciesRes.json(),
        ratesRes.json(),
      ]);

      // Get stored preference
      const storedCurrency = typeof window !== 'undefined'
        ? localStorage.getItem(STORAGE_KEY)
        : null;

      // Validate stored currency is still active
      const validCurrency = currenciesData.currencies?.find(
        (c: Currency) => c.code === storedCurrency && c.is_active
      );

      setState({
        currencies: currenciesData.currencies || [],
        currentCurrency: validCurrency?.code || currenciesData.default || 'USD',
        baseCurrency: 'USD',
        rates: ratesData.rates || { USD: 1 },
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error('Failed to load currencies:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load currencies',
      }));
    }
  }, []);

  useEffect(() => {
    loadCurrencies();
  }, [loadCurrencies]);

  // Set current currency
  const setCurrency = useCallback(async (code: string) => {
    const currency = state.currencies.find(c => c.code === code);
    if (!currency || !currency.is_active) {
      console.error('Invalid currency:', code);
      return;
    }

    // Update local state immediately
    setState(prev => ({ ...prev, currentCurrency: code }));

    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, code);
    }

    // Save preference to server
    try {
      const sessionId = getOrCreateSessionId();
      await fetch('/api/currencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency_code: code,
          session_id: sessionId,
        }),
      });
    } catch (error) {
      console.error('Failed to save currency preference:', error);
      // Don't revert - local storage is good enough
    }
  }, [state.currencies]);

  // Convert amount between currencies
  const convert = useCallback((
    amount: number,
    from?: string,
    to?: string
  ): number => {
    const fromCurrency = from || state.baseCurrency;
    const toCurrency = to || state.currentCurrency;

    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Get rates
    const fromRate = state.rates[fromCurrency];
    const toRate = state.rates[toCurrency];

    if (!fromRate || !toRate) {
      console.warn(`Missing exchange rate for ${fromCurrency} or ${toCurrency}`);
      return amount;
    }

    // Convert: amount in FROM → amount in BASE → amount in TO
    const amountInBase = amount / fromRate;
    const amountInTo = amountInBase * toRate;

    return amountInTo;
  }, [state.baseCurrency, state.currentCurrency, state.rates]);

  // Format amount in a specific currency
  const format = useCallback((
    amount: number,
    currencyCode?: string
  ): string => {
    const code = currencyCode || state.currentCurrency;
    const currency = state.currencies.find(c => c.code === code);

    if (!currency) {
      return `$${amount.toFixed(2)}`;
    }

    // Round to correct decimal places
    const rounded = amount.toFixed(currency.decimal_places);
    const [integerPart, decimalPart] = rounded.split('.');

    // Add thousand separators
    const withSeparators = integerPart.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      currency.thousand_separator
    );

    // Combine parts
    let formatted = currency.decimal_places > 0
      ? `${withSeparators}${currency.decimal_separator}${decimalPart}`
      : withSeparators;

    // Add symbol
    if (currency.symbol_position === 'before') {
      formatted = `${currency.symbol}${formatted}`;
    } else {
      formatted = `${formatted} ${currency.symbol}`;
    }

    return formatted;
  }, [state.currencies, state.currentCurrency]);

  // Convert and format in one step
  const formatConverted = useCallback((
    amount: number,
    fromCurrency?: string
  ): string => {
    const convertedAmount = convert(amount, fromCurrency);
    return format(convertedAmount);
  }, [convert, format]);

  // Get currency by code
  const getCurrency = useCallback((code: string): Currency | undefined => {
    return state.currencies.find(c => c.code === code);
  }, [state.currencies]);

  // Memoize return value
  return useMemo(() => ({
    ...state,
    setCurrency,
    convert,
    format,
    formatConverted,
    getCurrency,
    refresh: loadCurrencies,
  }), [state, setCurrency, convert, format, formatConverted, getCurrency, loadCurrencies]);
}
