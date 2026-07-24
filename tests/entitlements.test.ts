import { afterEach, describe, expect, it, vi } from 'vitest';

const loadEntitlementsModule = async (override?: 'free' | 'pro') => {
  vi.resetModules();

  if (override) {
    process.env.EXPO_PUBLIC_PLAN_TIER_OVERRIDE = override;
  } else {
    delete process.env.EXPO_PUBLIC_PLAN_TIER_OVERRIDE;
  }

  return import('../src/utils/entitlements');
};

afterEach(() => {
  delete process.env.EXPO_PUBLIC_PLAN_TIER_OVERRIDE;
  vi.resetModules();
});

describe('entitlements', () => {
  it('defaults to free entitlements', async () => {
    const { getDefaultEntitlements } = await loadEntitlementsModule();

    expect(getDefaultEntitlements()).toEqual({
      planTier: 'free',
      unlockedAt: null,
    });
  });

  it('sanitizes invalid raw entitlements to free', async () => {
    const { sanitizeEntitlements } = await loadEntitlementsModule();

    expect(sanitizeEntitlements({ planTier: 'enterprise' })).toEqual({
      planTier: 'free',
      unlockedAt: null,
    });
  });

  it('enables pro-only features for pro users', async () => {
    const { createProEntitlements, isFeatureEnabled } = await loadEntitlementsModule();

    const pro = createProEntitlements('2026-07-24T10:00:00.000Z');
    expect(isFeatureEnabled('unlimitedTrips', pro)).toBe(true);
  });

  it('blocks unlimited trips for free users after 3 trips', async () => {
    const { canCreateTrip, getDefaultEntitlements } = await loadEntitlementsModule();

    const free = getDefaultEntitlements();

    expect(canCreateTrip(0, free)).toBe(true);
    expect(canCreateTrip(2, free)).toBe(true);
    expect(canCreateTrip(3, free)).toBe(false);
  });

  it('allows unlimited trips for pro users', async () => {
    const { canCreateTrip, createProEntitlements } = await loadEntitlementsModule();

    const pro = createProEntitlements('2026-07-24T10:00:00.000Z');

    expect(canCreateTrip(3, pro)).toBe(true);
    expect(canCreateTrip(40, pro)).toBe(true);
  });

  it('forces pro mode with env override', async () => {
    const { canCreateTrip, getDefaultEntitlements, getPlanTierOverride } = await loadEntitlementsModule('pro');
    const entitlements = getDefaultEntitlements();

    expect(getPlanTierOverride()).toBe('pro');
    expect(entitlements.planTier).toBe('pro');
    expect(canCreateTrip(999, entitlements)).toBe(true);
  });

  it('forces free mode with env override', async () => {
    const { canCreateTrip, createProEntitlements, getPlanTierOverride, sanitizeEntitlements } = await loadEntitlementsModule('free');
    const sanitized = sanitizeEntitlements(createProEntitlements('2026-07-24T10:00:00.000Z'));

    expect(getPlanTierOverride()).toBe('free');
    expect(sanitized.planTier).toBe('free');
    expect(canCreateTrip(3, sanitized)).toBe(false);
  });
});
