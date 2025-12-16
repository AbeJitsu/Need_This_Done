'use client';

import { useState } from 'react';
import Card from '@/components/Card';
import Button from '@/components/Button';
import { formInputColors, headingColors, alertColors, formValidationColors } from '@/lib/colors';
import type { Product } from '@/lib/medusa-client';

// ============================================================================
// Admin Products Client Component
// ============================================================================
// What: Interactive admin interface for managing product images
// Why: Allows admins to upload/update images without Medusa admin panel
// How: File upload to Supabase Storage, then update product via Medusa API

interface AdminProductsClientProps {
  products: Product[];
}

export default function AdminProductsClient({ products }: AdminProductsClientProps) {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ========================================================================
  // Handle image URL update
  // ========================================================================
  const handleUpdateImage = async (productId: string) => {
    if (!imageUrl.trim()) {
      setError('Please enter an image URL');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const response = await fetch('/api/admin/products/update-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, imageUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update image');
      }

      setSuccess('Image updated successfully! Refresh the page to see changes.');
      setImageUrl('');
      setSelectedProduct(null);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update image');
    } finally {
      setUploading(false);
    }
  };

  // ========================================================================
  // Handle file upload
  // ========================================================================
  const handleFileUpload = async (productId: string, file: File) => {
    try {
      setUploading(true);
      setError('');

      // Upload to Supabase Storage
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', productId);

      const uploadResponse = await fetch('/api/admin/products/upload-image', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.error || 'Failed to upload image');
      }

      // Update product with new image URL
      const updateResponse = await fetch('/api/admin/products/update-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, imageUrl: uploadData.url }),
      });

      const updateData = await updateResponse.json();

      if (!updateResponse.ok) {
        throw new Error(updateData.error || 'Failed to update product');
      }

      setSuccess('Image uploaded and updated successfully! Refresh the page to see changes.');
      setSelectedProduct(null);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Success/Error messages */}
      {success && (
        <div className={`mb-6 p-4 ${alertColors.success.bg} ${alertColors.success.border} rounded-lg`}>
          <p className={`text-sm ${formValidationColors.success}`}>{success}</p>
        </div>
      )}

      {error && (
        <div className={`mb-6 p-4 ${alertColors.error.bg} ${alertColors.error.border} rounded-lg`}>
          <p className={`text-sm ${formValidationColors.error}`}>{error}</p>
        </div>
      )}

      {/* Products grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const price = product.variants?.[0]?.prices?.[0]?.amount ?? 0;
          const image = product.images?.[0]?.url;
          const isSelected = selectedProduct === product.id;

          return (
            <Card key={product.id} hoverEffect="lift">
              <div className="flex flex-col h-full">
                {/* Product image */}
                {image && (
                  <div className="relative w-full h-40 bg-gray-200 dark:bg-gray-700 rounded-t-lg overflow-hidden">
                    <img
                      src={image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 flex flex-col flex-grow">
                  {/* Title and price */}
                  <h3 className={`text-lg font-semibold ${headingColors.primary} mb-2`}>
                    {product.title}
                  </h3>

                  <p className={`text-xl font-bold ${headingColors.primary} mb-4`}>
                    ${(price / 100).toFixed(2)}
                  </p>

                  {/* Current image URL */}
                  {image && (
                    <p className={`text-xs ${formInputColors.helper} mb-4 truncate`} title={image}>
                      {image}
                    </p>
                  )}

                  {/* Update interface */}
                  {isSelected ? (
                    <div className="space-y-3 mt-auto">
                      {/* URL input */}
                      <div>
                        <label className={`block text-sm font-medium ${headingColors.primary} mb-2`}>
                          Image URL
                        </label>
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          placeholder="https://..."
                          className={`w-full px-3 py-2 border ${formInputColors.border} rounded-lg ${formInputColors.bg} ${formInputColors.text}`}
                          disabled={uploading}
                        />
                      </div>

                      {/* File upload */}
                      <div>
                        <label className={`block text-sm font-medium ${headingColors.primary} mb-2`}>
                          Or upload file
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(product.id, file);
                          }}
                          className={`w-full text-sm ${formInputColors.text}`}
                          disabled={uploading}
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="purple"
                          size="sm"
                          onClick={() => handleUpdateImage(product.id)}
                          disabled={uploading || !imageUrl.trim()}
                          className="flex-1"
                        >
                          {uploading ? 'Updating...' : 'Update URL'}
                        </Button>
                        <Button
                          variant="gray"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(null);
                            setImageUrl('');
                            setError('');
                          }}
                          disabled={uploading}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="purple"
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product.id);
                        setImageUrl(image || '');
                        setError('');
                      }}
                      className="mt-auto"
                    >
                      Update Image
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}
