import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// ============================================================================
// Currencies API - /api/currencies
// ============================================================================
// What: Multi-currency support endpoints
// Why: Enable international customers to shop in their preferred currency
// How: Fetch currencies, exchange rates, convert amounts, manage preferences

export const dynamic = 'force-dynamic';

// ============================================================================
// Types
// ============================================================================

interface Currency {
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

interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number;
  source: string;
  fetched_at: string;
  expires_at: string | null;
}

// ============================================================================
// GET - Fetch currencies, rates, or convert amount
// ============================================================================
// ?action=list - List all active currencies
// ?action=rates&base=USD - Get exchange rates from base currency
// ?action=convert&amount=100&from=USD&to=EUR - Convert amount
// ?action=preference - Get user's preferred currency

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'list';

    switch (action) {
      case 'list': {
        // Fetch all active currencies
        const { data: currencies, error } = await supabase
          .from('currencies')
          .select('*')
          .eq('is_active', true)
          .order('code');

        if (error) {
          console.error('Failed to fetch currencies:', error);
          return NextResponse.json(
            { error: 'Failed to fetch currencies' },
            { status: 500 }
          );
        }

        // Find default currency
        const defaultCurrency = currencies?.find((c: Currency) => c.is_default) || currencies?.[0];

        return NextResponse.json({
          currencies: currencies || [],
          default: defaultCurrency?.code || 'USD',
          count: currencies?.length || 0,
        });
      }

      case 'rates': {
        const baseCurrency = searchParams.get('base') || 'USD';

        // Fetch exchange rates from base currency
        const { data: rates, error } = await supabase
          .from('exchange_rates')
          .select('*')
          .eq('from_currency', baseCurrency)
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);

        if (error) {
          console.error('Failed to fetch exchange rates:', error);
          return NextResponse.json(
            { error: 'Failed to fetch exchange rates' },
            { status: 500 }
          );
        }

        // Transform to simple rate map
        const rateMap: Record<string, number> = { [baseCurrency]: 1 };
        rates?.forEach((r: ExchangeRate) => {
          rateMap[r.to_currency] = r.rate;
        });

        return NextResponse.json({
          base: baseCurrency,
          rates: rateMap,
          fetched_at: new Date().toISOString(),
        });
      }

      case 'convert': {
        const amount = parseFloat(searchParams.get('amount') || '0');
        const fromCurrency = searchParams.get('from') || 'USD';
        const toCurrency = searchParams.get('to');

        if (!toCurrency) {
          return NextResponse.json(
            { error: 'Missing required parameter: to' },
            { status: 400 }
          );
        }

        if (isNaN(amount) || amount < 0) {
          return NextResponse.json(
            { error: 'Invalid amount' },
            { status: 400 }
          );
        }

        // Use database function for conversion
        const { data, error } = await supabase
          .rpc('convert_currency', {
            p_amount: amount,
            p_from_currency: fromCurrency,
            p_to_currency: toCurrency,
          });

        if (error) {
          console.error('Conversion error:', error);
          return NextResponse.json(
            { error: 'Conversion failed' },
            { status: 500 }
          );
        }

        if (data === null) {
          return NextResponse.json(
            { error: 'Exchange rate not available' },
            { status: 404 }
          );
        }

        // Get currency formatting info
        const { data: currency } = await supabase
          .from('currencies')
          .select('*')
          .eq('code', toCurrency)
          .single();

        return NextResponse.json({
          original: {
            amount,
            currency: fromCurrency,
          },
          converted: {
            amount: data,
            currency: toCurrency,
            formatted: formatAmount(data, currency),
          },
        });
      }

      case 'preference': {
        // Get user's currency preference
        const { data: { user } } = await supabase.auth.getUser();
        const sessionId = searchParams.get('session_id');

        if (!user && !sessionId) {
          return NextResponse.json({
            currency: 'USD',
            source: 'default',
          });
        }

        const query = supabase
          .from('user_currency_preferences')
          .select('currency_code, detected_from');

        if (user) {
          query.eq('user_id', user.id);
        } else if (sessionId) {
          query.eq('session_id', sessionId);
        }

        const { data: preference } = await query.single();

        return NextResponse.json({
          currency: preference?.currency_code || 'USD',
          source: preference?.detected_from || 'default',
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Currency API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST - Set currency preference
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const body = await request.json();
    const { currency_code, session_id } = body;

    if (!currency_code) {
      return NextResponse.json(
        { error: 'Missing required field: currency_code' },
        { status: 400 }
      );
    }

    // Verify currency exists and is active
    const { data: currency, error: currencyError } = await supabase
      .from('currencies')
      .select('code')
      .eq('code', currency_code)
      .eq('is_active', true)
      .single();

    if (currencyError || !currency) {
      return NextResponse.json(
        { error: 'Invalid or inactive currency code' },
        { status: 400 }
      );
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user && !session_id) {
      return NextResponse.json(
        { error: 'Must provide session_id for anonymous users' },
        { status: 400 }
      );
    }

    // Upsert preference
    const preferenceData: Record<string, unknown> = {
      currency_code,
      detected_from: 'selection',
      updated_at: new Date().toISOString(),
    };

    if (user) {
      preferenceData.user_id = user.id;
    } else {
      preferenceData.session_id = session_id;
    }

    const { error } = await supabase
      .from('user_currency_preferences')
      .upsert(preferenceData, {
        onConflict: user ? 'user_id' : 'session_id',
      });

    if (error) {
      console.error('Failed to save preference:', error);
      return NextResponse.json(
        { error: 'Failed to save preference' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      currency: currency_code,
    }, { status: 201 });
  } catch (error) {
    console.error('Currency preference error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper: Format amount with currency settings
// ============================================================================

function formatAmount(amount: number, currency: Currency | null): string {
  if (!currency) {
    return amount.toFixed(2);
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
}
