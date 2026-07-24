import { MONETIZATION_CONFIG, FeatureKey } from '../config/monetization';

export type PlanTier = 'free' | 'pro';

export interface EntitlementState {
  planTier: PlanTier;
  unlockedAt: string | null;
}

export const ENTITLEMENT_STORAGE_KEY = 'schengen_entitlements';

function normalizePlanTierOverride(value: string | undefined): PlanTier | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replace(/^['"]|['"]$/g, '').toLowerCase();
  if (normalized === 'free' || normalized === 'pro') {
    return normalized;
  }

  return null;
}

const PLAN_TIER_OVERRIDE = normalizePlanTierOverride(process.env.EXPO_PUBLIC_PLAN_TIER_OVERRIDE);

const DEFAULT_ENTITLEMENTS: EntitlementState = {
  planTier: 'free',
  unlockedAt: null,
};

export function getDefaultEntitlements(): EntitlementState {
  if (PLAN_TIER_OVERRIDE === 'pro') {
    return {
      planTier: 'pro',
      unlockedAt: 'env-override',
    };
  }

  return { ...DEFAULT_ENTITLEMENTS };
}

export function sanitizeEntitlements(rawEntitlements: unknown): EntitlementState {
  if (PLAN_TIER_OVERRIDE === 'pro') {
    return {
      planTier: 'pro',
      unlockedAt: 'env-override',
    };
  }

  if (PLAN_TIER_OVERRIDE === 'free') {
    return { ...DEFAULT_ENTITLEMENTS };
  }

  if (!rawEntitlements || typeof rawEntitlements !== 'object') {
    return getDefaultEntitlements();
  }

  const entitlements = rawEntitlements as Partial<EntitlementState>;
  const isPro = entitlements.planTier === 'pro';

  return {
    planTier: isPro ? 'pro' : 'free',
    unlockedAt: isPro && typeof entitlements.unlockedAt === 'string' ? entitlements.unlockedAt : null,
  };
}

export function isFeatureEnabled(featureKey: FeatureKey, entitlements: EntitlementState): boolean {
  const requiredTier = MONETIZATION_CONFIG.featureAccess[featureKey];
  if (requiredTier === 'pro') {
    return entitlements.planTier === 'pro';
  }

  return true;
}

export function canCreateTrip(tripCount: number, entitlements: EntitlementState): boolean {
  if (isFeatureEnabled('unlimitedTrips', entitlements)) {
    return true;
  }

  return tripCount < MONETIZATION_CONFIG.freeTripLimit;
}

export function createProEntitlements(timestampIso: string): EntitlementState {
  if (PLAN_TIER_OVERRIDE === 'free') {
    return { ...DEFAULT_ENTITLEMENTS };
  }

  if (PLAN_TIER_OVERRIDE === 'pro') {
    return {
      planTier: 'pro',
      unlockedAt: 'env-override',
    };
  }

  return {
    planTier: 'pro',
    unlockedAt: timestampIso,
  };
}

export function getPlanTierOverride(): PlanTier | null {
  return PLAN_TIER_OVERRIDE;
}
