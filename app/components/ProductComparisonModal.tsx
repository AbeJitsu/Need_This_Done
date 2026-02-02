'use client';

import { X, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Button from './Button';
import { useComparison } from '@/context/ComparisonContext';
import { accentColors, headingColors, mutedTextColors } from '@/lib/colors';

export default function ProductComparisonModal() {
  const { selectedProducts, removeProduct, clearComparison, isComparing } = useComparison();

  if (!isComparing || selectedProducts.length === 0) {
    return null;
  }

  const formatPrice = (cents: number): string => {
    const dollars = cents / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(dollars);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-auto">
      <div className="min-h-screen flex items-start pt-8 justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-2xl">
            <div>
              <h2 className={`text-2xl font-bold ${headingColors.primary}`}>
                Compare Products
              </h2>
              <p className={`text-sm ${mutedTextColors.normal} mt-1`}>
                {selectedProducts.length} of 4 products selected
              </p>
            </div>
            <button
              onClick={clearComparison}
              className={`p-2 hover:bg-gray-100 rounded-lg transition ${accentColors.green.text}`}
              aria-label="Close comparison"
            >
              <X size={24} />
            </button>
          </div>

          {/* Comparison Table */}
          <div className="overflow-x-auto p-6">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left font-semibold p-3 bg-gray-50">Feature</th>
                  {selectedProducts.map((product) => (
                    <th key={product.id} className="text-center p-3 min-w-48">
                      <div className="relative">
                        {/* Remove Button */}
                        <button
                          onClick={() => removeProduct(product.id)}
                          className={`absolute -top-2 -right-2 rounded-full p-1 transition ${accentColors.red.bg} text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2`}
                          aria-label={`Remove ${product.title} from comparison`}
                        >
                          <X size={16} />
                        </button>

                        {/* Product Image */}
                        {product.image && (
                          <div className="relative w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                            <Image
                              src={product.image}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}

                        {/* Product Title */}
                        <Link href={`/shop/${product.id}`}>
                          <h3 className={`font-semibold ${headingColors.primary} hover:${accentColors.blue.text} transition line-clamp-2 cursor-pointer`}>
                            {product.title}
                          </h3>
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="font-semibold p-3 bg-gray-50">Price</td>
                  {selectedProducts.map((product) => (
                    <td key={`price-${product.id}`} className="text-center p-3">
                      <p className={`text-xl font-bold ${accentColors.blue.titleText}`}>
                        {formatPrice(product.price)}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Rating Row */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="font-semibold p-3 bg-gray-50">Rating</td>
                  {selectedProducts.map((product) => (
                    <td key={`rating-${product.id}`} className="text-center p-3">
                      {product.rating !== undefined ? (
                        <p className={`text-lg font-semibold ${accentColors.blue.text}`}>
                          ⭐ {product.rating.toFixed(1)}
                        </p>
                      ) : (
                        <p className={mutedTextColors.normal}>Not rated</p>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Stock Status Row */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="font-semibold p-3 bg-gray-50">Availability</td>
                  {selectedProducts.map((product) => (
                    <td key={`stock-${product.id}`} className="text-center p-3">
                      {product.inStock !== undefined ? (
                        <div className="flex items-center justify-center gap-2">
                          {product.inStock ? (
                            <>
                              <Check size={20} className={accentColors.green.text} />
                              <span className={`font-medium ${accentColors.green.text}`}>In Stock</span>
                            </>
                          ) : (
                            <span className={`font-medium ${accentColors.red.text}`}>Out of Stock</span>
                          )}
                        </div>
                      ) : (
                        <p className={mutedTextColors.normal}>—</p>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Description Row */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="font-semibold p-3 bg-gray-50">Description</td>
                  {selectedProducts.map((product) => (
                    <td key={`desc-${product.id}`} className="text-center p-3">
                      <p className={`text-sm ${mutedTextColors.normal} line-clamp-3`}>
                        {product.description || 'No description available'}
                      </p>
                    </td>
                  ))}
                </tr>

                {/* Action Row */}
                <tr>
                  <td className="p-3 bg-gray-50"></td>
                  {selectedProducts.map((product) => (
                    <td key={`action-${product.id}`} className="text-center p-3">
                      <Link href={`/shop/${product.id}`}>
                        <Button variant="green" size="sm" className="w-full">
                          View Details
                        </Button>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl flex justify-between items-center">
            <p className={`text-sm ${mutedTextColors.normal}`}>
              {selectedProducts.length < 4 && `Add up to ${4 - selectedProducts.length} more product(s) to compare`}
            </p>
            <Button variant="gray" onClick={clearComparison}>
              Clear All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
