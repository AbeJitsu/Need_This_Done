'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast, { ToastType } from '@/components/ui/Toast';

// ============================================================================
// ToastContext - Global toast notification state management
// ============================================================================
// What: Provides showToast() function throughout the app
// Why: Centralized notification system - no prop drilling needed
// How: Context provider wraps app, renders toasts in fixed container

interface ToastContextType {
  showToast: (message: string, type: ToastType) => void;
}

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// ============================================================================
// ToastProvider - Wrap your app with this
// ============================================================================
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  // ========================================================================
  // Show a new toast notification
  // ========================================================================
  const showToast = useCallback((message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  // ========================================================================
  // Dismiss a toast by ID
  // ========================================================================
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast container - fixed bottom-right */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 space-y-3">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onDismiss={() => dismissToast(toast.id)}
            />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

// ============================================================================
// useToast - Hook to access toast functionality
// ============================================================================
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
