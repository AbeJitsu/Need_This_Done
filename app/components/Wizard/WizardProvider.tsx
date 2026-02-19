'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import {
  type WizardResponses,
  type WizardStepDef,
  type StepId,
  getActiveSteps,
  collectFeatures,
} from './wizard-data';
import { getRecommendation, type WizardRecommendation, type ProductCatalog, type CatalogProduct } from '@/lib/wizard-engine';

// ============================================
// WIZARD CONTEXT
// ============================================
// Central state for the sales assessment wizard.
// Manages step navigation, user selections, product catalog,
// recommendation computation, and analytics session tracking.

const STORAGE_KEY = 'wizard_state';

interface WizardContextType {
  currentStepIndex: number;
  responses: WizardResponses;
  activeSteps: WizardStepDef[];
  recommendation: WizardRecommendation | null;
  isLoading: boolean;
  isOnResults: boolean;
  goNext: () => void;
  goBack: () => void;
  goToStep: (index: number) => void;
  restart: () => void;
  selectSingle: (stepId: StepId, scenarioId: string) => void;
  toggleMulti: (stepId: StepId, scenarioId: string) => void;
  trackOutcome: (outcome: 'added_to_cart' | 'booked_consultation' | 'abandoned') => void;
}

const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within WizardProvider');
  return ctx;
}

interface WizardProviderProps {
  source: 'page' | 'overlay';
  children: ReactNode;
}

// Transform the pricing API response into the shape the engine expects
function toCatalogProduct(p: {
  handle: string;
  title: string;
  price: number;
  variantId: string;
  depositPercent: number;
  features: string[];
}): CatalogProduct {
  return {
    handle: p.handle,
    title: p.title,
    price: p.price,
    variantId: p.variantId,
    depositPercent: p.depositPercent,
    features: p.features,
  };
}

export default function WizardProvider({ source, children }: WizardProviderProps) {
  // Try to restore state from sessionStorage (overlay persistence)
  const [currentStepIndex, setCurrentStepIndex] = useState(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).stepIndex ?? 0;
    } catch { /* ignore */ }
    return 0;
  });

  const [responses, setResponses] = useState<WizardResponses>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved).responses ?? {};
    } catch { /* ignore */ }
    return {};
  });

  const [catalog, setCatalog] = useState<ProductCatalog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionIdRef = useRef<string | null>(null);

  // Persist state to sessionStorage on changes
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        stepIndex: currentStepIndex,
        responses,
      }));
    } catch { /* ignore */ }
  }, [currentStepIndex, responses]);

  // Fetch product catalog from Medusa on mount
  useEffect(() => {
    fetch('/api/pricing/products')
      .then((res) => res.json())
      .then((data) => {
        setCatalog({
          packages: (data.packages || []).map(toCatalogProduct),
          addons: (data.addons || []).map(toCatalogProduct),
          services: (data.services || []).map(toCatalogProduct),
        });
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('[Wizard] Failed to load catalog:', err);
        setIsLoading(false);
      });
  }, []);

  // Create analytics session on mount (fire-and-forget)
  useEffect(() => {
    fetch('/api/wizard/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source }),
    })
      .then((res) => res.json())
      .then((data) => { sessionIdRef.current = data.id; })
      .catch((err) => console.error('[Wizard] Failed to create session:', err));
  }, [source]);

  const activeSteps = getActiveSteps(responses);
  const isOnResults = currentStepIndex >= activeSteps.length;

  // Compute recommendation when on results step
  const recommendation = isOnResults && catalog
    ? getRecommendation(collectFeatures(responses), catalog)
    : null;

  // Navigation
  const goNext = useCallback(() => {
    setCurrentStepIndex((prev: number) => prev + 1);
  }, []);

  const goBack = useCallback(() => {
    setCurrentStepIndex((prev: number) => Math.max(0, prev - 1));
  }, []);

  // Navigate to a specific completed step (no skipping ahead)
  const goToStep = useCallback((index: number) => {
    setCurrentStepIndex((prev: number) => Math.max(0, Math.min(index, prev)));
  }, []);

  const restart = useCallback(() => {
    setCurrentStepIndex(0);
    setResponses({});
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  // Selection handlers
  const selectSingle = useCallback((stepId: StepId, scenarioId: string) => {
    setResponses((prev) => ({ ...prev, [stepId]: scenarioId }));
  }, []);

  const toggleMulti = useCallback((stepId: StepId, scenarioId: string) => {
    setResponses((prev) => {
      const current = (prev[stepId as keyof WizardResponses] as string[] | undefined) ?? [];
      const next = current.includes(scenarioId)
        ? current.filter((id) => id !== scenarioId)
        : [...current, scenarioId];
      return { ...prev, [stepId]: next };
    });
  }, []);

  // Analytics — fire-and-forget PATCH to update session
  const trackOutcome = useCallback(
    (outcome: 'added_to_cart' | 'booked_consultation' | 'abandoned') => {
      const sid = sessionIdRef.current;
      if (!sid) return;

      fetch('/api/wizard/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: sid,
          responses,
          recommended_tier: recommendation?.tier.handle,
          recommended_addons: recommendation?.addOns.map((a) => a.handle),
          estimated_total: recommendation?.totalCents,
          outcome,
          ...(outcome === 'abandoned' && {
            abandoned_at_step: activeSteps[currentStepIndex]?.id ?? 'results',
          }),
        }),
      }).catch((err) => console.error('[Wizard] Failed to track outcome:', err));

      // Clear sessionStorage on completion
      if (outcome !== 'abandoned') {
        try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      }
    },
    [responses, recommendation, activeSteps, currentStepIndex],
  );

  return (
    <WizardContext.Provider
      value={{
        currentStepIndex,
        responses,
        activeSteps,
        recommendation,
        isLoading,
        isOnResults,
        goNext,
        goBack,
        goToStep,
        restart,
        selectSingle,
        toggleMulti,
        trackOutcome,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
}
