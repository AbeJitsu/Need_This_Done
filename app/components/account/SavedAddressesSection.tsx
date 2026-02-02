'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import { accentColors } from '@/lib/colors';

// ============================================================================
// Types
// ============================================================================

interface SavedAddress {
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

// ============================================================================
// Saved Addresses Section Component
// ============================================================================

export default function SavedAddressesSection() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // ============================================================================
  // Form State
  // ============================================================================

  const [formData, setFormData] = useState({
    label: '',
    first_name: '',
    last_name: '',
    street_address: '',
    apartment: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: 'US',
    phone: '',
    is_default: false,
    address_type: 'shipping' as const,
  });

  // ============================================================================
  // Load Addresses
  // ============================================================================

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/account/saved-addresses');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load addresses');
      }

      setAddresses(data.addresses || []);
      setError(null);
    } catch (err) {
      console.error('Error loading addresses:', err);
      setError(err instanceof Error ? err.message : 'Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // Form Handlers
  // ============================================================================

  const handleAddressClick = (address: SavedAddress) => {
    setEditingId(address.id);
    setFormData({
      label: address.label,
      first_name: address.first_name,
      last_name: address.last_name,
      street_address: address.street_address,
      apartment: address.apartment || '',
      city: address.city,
      state_province: address.state_province,
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone || '',
      is_default: address.is_default,
      address_type: address.address_type as typeof formData.address_type,
    });
    setShowForm(true);
  };

  const handleNewAddress = () => {
    setEditingId(null);
    setFormData({
      label: '',
      first_name: '',
      last_name: '',
      street_address: '',
      apartment: '',
      city: '',
      state_province: '',
      postal_code: '',
      country: 'US',
      phone: '',
      is_default: addresses.length === 0,
      address_type: 'shipping',
    });
    setShowForm(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `/api/account/saved-addresses?id=${editingId}`
        : '/api/account/saved-addresses';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save address');
      }

      await loadAddresses();
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      console.error('Error saving address:', err);
      setError(err instanceof Error ? err.message : 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/account/saved-addresses?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete address');
      }

      await loadAddresses();
    } catch (err) {
      console.error('Error deleting address:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete address');
    } finally {
      setDeleting(null);
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${accentColors.blue.text}`}>
          Saved Addresses
        </h2>
        {!showForm && (
          <Button variant="green" size="sm" onClick={handleNewAddress}>
            + Add Address
          </Button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 mb-4">
          {error}
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSaveAddress} className="border-t border-gray-200 pt-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label (e.g., Home, Work)
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                placeholder="Home"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Address Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address Type
              </label>
              <select
                value={formData.address_type}
                onChange={(e) => setFormData({ ...formData, address_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="shipping">Shipping</option>
                <option value="billing">Billing</option>
                <option value="both">Both</option>
              </select>
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Street Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={formData.street_address}
                onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Apartment */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apartment, Suite, etc. (optional)
              </label>
              <input
                type="text"
                value={formData.apartment}
                onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* State/Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State / Province
              </label>
              <input
                type="text"
                value={formData.state_province}
                onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Default Address Checkbox */}
          <label className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Set as default {formData.address_type} address</span>
          </label>

          {/* Form Actions */}
          <div className="flex gap-2">
            <Button variant="green" type="submit">
              {editingId ? 'Update Address' : 'Save Address'}
            </Button>
            <Button
              variant="gray"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No saved addresses yet</p>
          <Button variant="blue" onClick={handleNewAddress}>
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {address.label}
                    {address.is_default && (
                      <span className="ml-2 inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                        Default
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">{address.address_type}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="blue"
                    size="sm"
                    onClick={() => handleAddressClick(address)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="gray"
                    size="sm"
                    onClick={() => handleDeleteAddress(address.id)}
                    disabled={deleting === address.id}
                  >
                    {deleting === address.id ? 'Deleting...' : 'Delete'}
                  </Button>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  {address.first_name} {address.last_name}
                </p>
                <p>{address.street_address}</p>
                {address.apartment && <p>{address.apartment}</p>}
                <p>
                  {address.city}, {address.state_province} {address.postal_code}
                </p>
                <p>{address.country}</p>
                {address.phone && <p>{address.phone}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
