'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface ComparisonProduct {
  id: string;
  title: string;
  description?: string;
  price: number;
  image?: string;
  rating?: number;
  inStock?: boolean;
}

interface ComparisonContextType {
  selectedProducts: ComparisonProduct[];
  addProduct: (product: ComparisonProduct) => void;
  removeProduct: (productId: string) => void;
  clearComparison: () => void;
  isComparing: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | null>(null);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selectedProducts, setSelectedProducts] = useState<ComparisonProduct[]>([]);

  const addProduct = (product: ComparisonProduct) => {
    if (selectedProducts.length < 4 && !selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const removeProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const clearComparison = () => {
    setSelectedProducts([]);
  };

  return (
    <ComparisonContext.Provider
      value={{
        selectedProducts,
        addProduct,
        removeProduct,
        clearComparison,
        isComparing: selectedProducts.length > 0,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return context;
}
