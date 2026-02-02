'use client';

import { useState } from 'react';
import { useSavedAddresses, SavedAddress } from '@/lib/hooks/useSavedAddresses';
import { accentColors } from '@/lib/colors';

interface AddressSelectorProps {
  onSelectAddress: (address: SavedAddress) => void;
  isAuthenticated: boolean;
}

/**
 * AddressSelector - Display saved addresses for quick checkout
 * Only shown when user is authenticated and has saved addresses
 */
export default function AddressSelector({ onSelectAddress, isAuthenticated }: AddressSelectorProps) {
  const { addresses, loading } = useSavedAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Don't show selector if not authenticated or no addresses
  if (!isAuthenticated || loading || addresses.length === 0) {
    return null;
  }

  const displayAddresses = addresses.filter(a => a.address_type === 'shipping' || a.address_type === 'both');

  if (displayAddresses.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm font-medium text-gray-700 mb-3">Use a saved address</p>
      <div className="space-y-2">
        {displayAddresses.map((address) => (
          <button
            key={address.id}
            onClick={() => {
              setSelectedAddressId(address.id);
              onSelectAddress(address);
            }}
            aria-pressed={selectedAddressId === address.id}
            className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
              selectedAddressId === address.id
                ? `${accentColors.blue.bg} border-blue-500 shadow-md`
                : 'border-blue-200 hover:border-blue-300 hover:bg-blue-100'
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selectedAddressId === address.id
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-400'
                }`}>
                  {selectedAddressId === address.id && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className={`font-medium ${selectedAddressId === address.id ? 'text-blue-900' : 'text-gray-900'}`}>
                  {address.label}
                </p>
                <p className={`text-sm ${selectedAddressId === address.id ? 'text-blue-800' : 'text-gray-600'}`}>
                  {address.street_address}
                  {address.apartment && `, ${address.apartment}`}
                </p>
                <p className={`text-sm ${selectedAddressId === address.id ? 'text-blue-800' : 'text-gray-600'}`}>
                  {address.city}, {address.state_province} {address.postal_code}
                </p>
                {address.is_default && (
                  <span className={`inline-block mt-1 text-xs px-2 py-1 rounded ${
                    selectedAddressId === address.id
                      ? 'bg-blue-200 text-blue-900'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    Default
                  </span>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
