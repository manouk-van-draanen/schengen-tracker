export const MONETIZATION_CONFIG = {
  freeTripLimit: 3,
  proPriceLabel: '€2,99',
  proProductIds: {
    ios: process.env.EXPO_PUBLIC_PRO_PRODUCT_ID_IOS ?? '',
    android: process.env.EXPO_PUBLIC_PRO_PRODUCT_ID_ANDROID ?? '',
  },
  featureAccess: {
    unlimitedTrips: 'pro',
  },
} as const;

export type FeatureKey = keyof typeof MONETIZATION_CONFIG.featureAccess;
export type FeatureTier = (typeof MONETIZATION_CONFIG.featureAccess)[FeatureKey];
