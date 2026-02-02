'use client';

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
            onClick={() => onSelectAddress(address)}
            className={`w-full text-left p-3 rounded-lg border-2 transition-colors ${
              accentColors.blue.border
            } hover:${accentColors.blue.bg} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1">
                <input type="radio" name="saved-address" disabled className="cursor-pointer" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{address.label}</p>
                <p className="text-sm text-gray-600">
                  {address.street_address}
                  {address.apartment && `, ${address.apartment}`}
                </p>
                <p className="text-sm text-gray-600">
                  {address.city}, {address.state_province} {address.postal_code}
                </p>
                {address.is_default && (
                  <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
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
