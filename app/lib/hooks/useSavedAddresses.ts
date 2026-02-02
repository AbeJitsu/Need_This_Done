'use client';

import { useState, useEffect } from 'react';

export interface SavedAddress {
  id: string;
  label: string;
  first_name: string;
  last_name: string;
  street_address: string;
  apartment?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  phone?: string;
  is_default: boolean;
  address_type: 'shipping' | 'billing' | 'both';
  created_at: string;
}

/**
 * Hook to load and manage saved addresses
 * Used in checkout and account settings
 */
export function useSavedAddresses() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/account/saved-addresses');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load addresses');
      }

      setAddresses(data.addresses || []);
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  return { addresses, loading, error, refetch: loadAddresses };
}
