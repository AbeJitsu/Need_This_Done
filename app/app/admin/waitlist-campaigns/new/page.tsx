'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Card from '@/components/Card';
import PageHeader from '@/components/PageHeader';
import { useToast } from '@/context/ToastContext';

interface Product {
  id: string;
  title: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    campaign_name: '',
    campaign_type: 'targeted_offer',
    title: '',
    message: '',
    discount_code: '',
    discount_percent: '',
    call_to_action_text: 'Shop Now',
    product_ids: [] as string[],
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductToggle = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter((id) => id !== productId)
        : [...prev.product_ids, productId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.campaign_name.trim()) {
      showToast('Campaign name is required', 'error');
      return;
    }

    if (!formData.title.trim()) {
      showToast('Campaign title is required', 'error');
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        discount_percent: formData.discount_percent ? parseInt(formData.discount_percent) : null,
      };

      const response = await fetch('/api/admin/waitlist-campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create campaign');
      }

      const newCampaign = await response.json();
      showToast('Campaign created successfully', 'success');

      router.push(`/admin/waitlist-campaigns/${newCampaign.id}`);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Failed to create campaign',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Create Campaign" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Campaign Details</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="campaign_name" className="mb-2 block text-sm font-medium text-gray-700">
                Campaign Name
              </label>
              <input
                type="text"
                id="campaign_name"
                name="campaign_name"
                value={formData.campaign_name}
                onChange={handleInputChange}
                placeholder="e.g., Spring Sale Kickoff"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="campaign_type" className="mb-2 block text-sm font-medium text-gray-700">
                Campaign Type
              </label>
              <select
                id="campaign_type"
                name="campaign_type"
                value={formData.campaign_type}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
              >
                <option value="targeted_offer">Targeted Offer</option>
                <option value="restock_alert">Restock Alert</option>
                <option value="exclusive_discount">Exclusive Discount</option>
              </select>
            </div>

            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-gray-700">
                Email Subject Line
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Your favorite item is back in stock!"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
                Message (optional)
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Additional message for the email"
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Offer Details */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Offer Details</h3>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="discount_percent" className="mb-2 block text-sm font-medium text-gray-700">
                  Discount % (optional)
                </label>
                <input
                  type="number"
                  id="discount_percent"
                  name="discount_percent"
                  value={formData.discount_percent}
                  onChange={handleInputChange}
                  placeholder="e.g., 15"
                  min="0"
                  max="100"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="discount_code" className="mb-2 block text-sm font-medium text-gray-700">
                  Discount Code (optional)
                </label>
                <input
                  type="text"
                  id="discount_code"
                  name="discount_code"
                  value={formData.discount_code}
                  onChange={handleInputChange}
                  placeholder="e.g., SPRING15"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="call_to_action_text" className="mb-2 block text-sm font-medium text-gray-700">
                Call-to-Action Text
              </label>
              <input
                type="text"
                id="call_to_action_text"
                name="call_to_action_text"
                value={formData.call_to_action_text}
                onChange={handleInputChange}
                placeholder="e.g., Shop Now"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </Card>

        {/* Product Selection */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">Target Products</h3>
          <p className="mb-4 text-sm text-gray-600">
            Leave empty to send to all waitlist members. Select specific products to target only those interested in them.
          </p>

          {loading ? (
            <p className="text-gray-600">Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-gray-600">No products available</p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {products.map((product) => (
                <label key={product.id} className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={formData.product_ids.includes(product.id)}
                    onChange={() => handleProductToggle(product.id)}
                    className="h-4 w-4 rounded border-gray-300 accent-emerald-600"
                  />
                  <span className="text-gray-700">{product.title}</span>
                </label>
              ))}
            </div>
          )}
        </Card>

        {/* Submit Button */}
        <div className="flex gap-2">
          <Button
            type="submit"
            variant="green"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Campaign'}
          </Button>
          <Button
            type="button"
            variant="gray"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
