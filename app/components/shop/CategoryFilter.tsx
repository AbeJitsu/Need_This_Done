'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Category {
  name: string;
  handle: string;
  productCount: number;
}

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({
  selectedCategory,
  onCategoryChange,
}: CategoryFilterProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/products/categories');
        if (response.ok) {
          const data = await response.json();
          setCategories(data.categories || []);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const selectedCategoryName = categories.find(c => c.handle === selectedCategory)?.name || 'All Categories';

  if (loading) {
    return null;
  }

  // Don't show category filter if no categories available
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full md:w-auto flex items-center justify-between gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:border-emerald-500 transition-colors"
      >
        <span className="text-sm font-medium text-gray-700">{selectedCategoryName}</span>
        <ChevronDown size={18} className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
          {/* All Categories option */}
          <button
            onClick={() => {
              onCategoryChange('');
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
              !selectedCategory ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
            }`}
          >
            <div className="flex justify-between items-center">
              <span>All Categories</span>
              <span className="text-xs text-gray-500">
                {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
              </span>
            </div>
          </button>

          {/* Category options */}
          {categories.map((category) => (
            <button
              key={category.handle}
              onClick={() => {
                onCategoryChange(category.handle);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 border-t border-gray-100 hover:bg-gray-50 transition-colors ${
                selectedCategory === category.handle
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-gray-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{category.name}</span>
                <span className="text-xs text-gray-500">{category.productCount}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
