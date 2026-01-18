'use client';

import { useState, useRef, useEffect } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { accentColors, cardBgColors, cardBorderColors } from '@/lib/colors';

// ============================================================================
// CurrencySelector Component
// ============================================================================
// What: Dropdown for selecting display currency
// Why: Let customers view prices in their preferred currency
// How: Uses useCurrency hook, persists selection, shows flag/symbol

type AccentColor = 'blue' | 'green' | 'purple';
type SelectorSize = 'sm' | 'md' | 'lg';

export interface CurrencySelectorProps {
  color?: AccentColor;
  size?: SelectorSize;
  showName?: boolean;
  showFlag?: boolean;
  className?: string;
}

// Currency flags (emoji flags for common currencies)
const currencyFlags: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
  JPY: '🇯🇵',
  CNY: '🇨🇳',
  INR: '🇮🇳',
  MXN: '🇲🇽',
  BRL: '🇧🇷',
};

const sizeClasses: Record<SelectorSize, { button: string; dropdown: string; text: string }> = {
  sm: {
    button: 'px-2 py-1 text-sm',
    dropdown: 'w-40',
    text: 'text-sm',
  },
  md: {
    button: 'px-3 py-2',
    dropdown: 'w-48',
    text: 'text-base',
  },
  lg: {
    button: 'px-4 py-3 text-lg',
    dropdown: 'w-56',
    text: 'text-lg',
  },
};

export default function CurrencySelector({
  color = 'blue',
  size = 'md',
  showName = false,
  showFlag = true,
  className = '',
}: CurrencySelectorProps) {
  const {
    currencies,
    currentCurrency,
    setCurrency,
    isLoading,
    getCurrency,
  } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const colors = accentColors[color];
  const sizes = sizeClasses[size];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleSelect = async (code: string) => {
    await setCurrency(code);
    setIsOpen(false);
  };

  const currentCurrencyData = getCurrency(currentCurrency);

  if (isLoading) {
    return (
      <div
        className={`
          inline-flex items-center rounded-lg border
          border-gray-400 dark:border-gray-600
          bg-white dark:bg-gray-900
          ${sizes.button}
          ${className}
        `}
        data-testid="currency-selector"
      >
        <span className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded h-4 w-12" />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-block ${className}`}
      ref={dropdownRef}
      data-testid="currency-selector"
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          inline-flex items-center gap-2 rounded-lg border
          border-gray-400 dark:border-gray-600
          bg-white dark:bg-gray-900
          text-gray-900 dark:text-gray-100
          hover:border-gray-400 dark:hover:border-gray-500
          focus:outline-none focus:ring-2 focus:ring-offset-1
          transition-colors
          ${sizes.button}
        `}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Select currency, current: ${currentCurrency}`}
      >
        {showFlag && currencyFlags[currentCurrency] && (
          <span className="text-base" aria-hidden="true">
            {currencyFlags[currentCurrency]}
          </span>
        )}
        <span className={`font-medium ${sizes.text}`}>
          {currentCurrencyData?.symbol || '$'}
          {showName && ` ${currentCurrency}`}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute z-50 mt-1 rounded-lg
            ${cardBorderColors.light}
            ${cardBgColors.base}
            shadow-lg
            ${sizes.dropdown}
          `}
          role="listbox"
          aria-label="Select currency"
        >
          <div className="max-h-60 overflow-auto py-1">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                type="button"
                onClick={() => handleSelect(currency.code)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-left
                  ${currency.code === currentCurrency
                    ? `${colors.bg} ${colors.text}`
                    : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  ${sizes.text}
                  transition-colors
                `}
                role="option"
                aria-selected={currency.code === currentCurrency}
              >
                {showFlag && currencyFlags[currency.code] && (
                  <span className="text-base" aria-hidden="true">
                    {currencyFlags[currency.code]}
                  </span>
                )}
                <span className="font-medium">{currency.symbol}</span>
                <span className="flex-1">{currency.code}</span>
                {showName && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currency.name}
                  </span>
                )}
                {currency.code === currentCurrency && (
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
