import { FEATURE_MAP, TIER_ORDER, type FeatureKey, type TierHandle } from '@/components/Wizard/wizard-data';

export interface CatalogProduct {
  handle: string;
  title: string;
  price: number;
  variantId: string;
  depositPercent: number;
  features: string[];
}

export interface ProductCatalog {
  packages: CatalogProduct[];
  addons: CatalogProduct[];
  services: CatalogProduct[];
}

export interface RecommendedProduct {
  handle: string;
  title: string;
  price: number;
  variantId: string;
  depositPercent: number;
}

export interface WizardRecommendation {
  tier: RecommendedProduct;
  addOns: RecommendedProduct[];
  services: RecommendedProduct[];
  totalCents: number;
  depositCents: number;
}

export function getRecommendation(
  features: FeatureKey[],
  catalog: ProductCatalog
): WizardRecommendation {
  const packageMap = new Map(catalog.packages.map((p) => [p.handle, p]));
  const addonMap = new Map(catalog.addons.map((a) => [a.handle, a]));
  const serviceMap = new Map(catalog.services.map((s) => [s.handle, s]));

  const serviceHandles = new Set<string>();
  const tierFeatures: FeatureKey[] = [];

  for (const feature of features) {
    const mapping = FEATURE_MAP[feature];
    if (mapping.isService && mapping.addonHandle) {
      serviceHandles.add(mapping.addonHandle);
    } else {
      tierFeatures.push(feature);
    }
  }

  let bestOption: { tier: CatalogProduct; addOns: CatalogProduct[]; total: number } | null = null;

  for (const tierHandle of TIER_ORDER) {
    const tierProduct = packageMap.get(tierHandle);
    if (!tierProduct) continue;

    let viable = true;
    const neededAddOns: CatalogProduct[] = [];
    let addonTotal = 0;

    for (const feature of tierFeatures) {
      const mapping = FEATURE_MAP[feature];
      if (mapping.includedInTiers.includes(tierHandle as TierHandle)) continue;
      if (mapping.addonHandle) {
        const addon = addonMap.get(mapping.addonHandle);
        if (addon && !neededAddOns.some((a) => a.handle === addon.handle)) {
          neededAddOns.push(addon);
          addonTotal += addon.price;
        }
      } else {
        viable = false;
        break;
      }
    }

    if (!viable) continue;
    const total = tierProduct.price + addonTotal;
    if (!bestOption || total < bestOption.total) {
      bestOption = { tier: tierProduct, addOns: neededAddOns, total };
    }
  }

  if (!bestOption) {
    const fallback = packageMap.get('pro-site') || catalog.packages[catalog.packages.length - 1];
    bestOption = { tier: fallback, addOns: [], total: fallback.price };
  }

  const resolvedServices = Array.from(serviceHandles)
    .map((h) => serviceMap.get(h))
    .filter((s): s is CatalogProduct => !!s);

  const totalCents = bestOption.total + resolvedServices.reduce((s, svc) => s + svc.price, 0);

  const depositCents =
    Math.round((bestOption.tier.price * bestOption.tier.depositPercent) / 100) +
    bestOption.addOns.reduce((sum, a) => sum + Math.round((a.price * a.depositPercent) / 100), 0) +
    resolvedServices.reduce((sum, s) => sum + Math.round((s.price * s.depositPercent) / 100), 0);

  return {
    tier: toRecommended(bestOption.tier),
    addOns: bestOption.addOns.map(toRecommended),
    services: resolvedServices.map(toRecommended),
    totalCents,
    depositCents,
  };
}

function toRecommended(p: CatalogProduct): RecommendedProduct {
  return { handle: p.handle, title: p.title, price: p.price, variantId: p.variantId, depositPercent: p.depositPercent };
}
