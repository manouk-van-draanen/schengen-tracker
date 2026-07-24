import { Platform } from 'react-native';
import { MONETIZATION_CONFIG } from '../config/monetization';

export interface BillingInitResult {
  isSupported: boolean;
  priceLabel: string;
}

export interface PurchaseAttemptResult {
  purchased: boolean;
  cancelled: boolean;
}

type IapModule = typeof import('expo-iap');

type ProductLike = {
  displayPrice?: string | null;
  localizedPrice?: string | null;
};

function getProProductIdForCurrentPlatform(): string {
  if (Platform.OS === 'ios') {
    return MONETIZATION_CONFIG.proProductIds.ios;
  }

  if (Platform.OS === 'android') {
    return MONETIZATION_CONFIG.proProductIds.android;
  }

  return '';
}

function isCancelablePurchaseError(error: unknown): boolean {
  const message = typeof error === 'object' && error && 'message' in error ? String((error as { message: unknown }).message) : '';
  return /cancel/i.test(message);
}

class BillingService {
  private iap: IapModule | null = null;

  private isConnected = false;

  private async loadModule(): Promise<IapModule | null> {
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      return null;
    }

    if (!this.iap) {
      this.iap = await import('expo-iap');
    }

    return this.iap;
  }

  async initialize(): Promise<BillingInitResult> {
    const sku = getProProductIdForCurrentPlatform();
    if (!sku) {
      return {
        isSupported: false,
        priceLabel: MONETIZATION_CONFIG.proPriceLabel,
      };
    }

    const iap = await this.loadModule();
    if (!iap) {
      return {
        isSupported: false,
        priceLabel: MONETIZATION_CONFIG.proPriceLabel,
      };
    }

    try {
      if (!this.isConnected) {
        await iap.initConnection();
        this.isConnected = true;
      }

      const products = await iap.fetchProducts({ skus: [sku], type: 'in-app' });
      const firstProduct = Array.isArray(products) && products.length > 0 ? (products[0] as ProductLike) : null;
      const priceLabel = firstProduct?.displayPrice || firstProduct?.localizedPrice || MONETIZATION_CONFIG.proPriceLabel;

      return {
        isSupported: true,
        priceLabel,
      };
    } catch {
      return {
        isSupported: false,
        priceLabel: MONETIZATION_CONFIG.proPriceLabel,
      };
    }
  }

  async hasProAccessFromStore(): Promise<boolean> {
    const sku = getProProductIdForCurrentPlatform();
    if (!sku) {
      return false;
    }

    const iap = await this.loadModule();
    if (!iap) {
      return false;
    }

    if (!this.isConnected) {
      const init = await this.initialize();
      if (!init.isSupported) {
        return false;
      }
    }

    const purchases = await iap.getAvailablePurchases();
    return purchases.some((purchase) => purchase.productId === sku);
  }

  async restoreProPurchase(): Promise<boolean> {
    const sku = getProProductIdForCurrentPlatform();
    if (!sku) {
      return false;
    }

    const iap = await this.loadModule();
    if (!iap) {
      return false;
    }

    if (!this.isConnected) {
      const init = await this.initialize();
      if (!init.isSupported) {
        return false;
      }
    }

    await iap.restorePurchases();
    const purchases = await iap.getAvailablePurchases();
    return purchases.some((purchase) => purchase.productId === sku);
  }

  async purchasePro(): Promise<PurchaseAttemptResult> {
    const sku = getProProductIdForCurrentPlatform();
    if (!sku) {
      throw new Error('Pro SKU is not configured.');
    }

    const iap = await this.loadModule();
    if (!iap) {
      throw new Error('In-app purchases are not available on this platform.');
    }

    if (!this.isConnected) {
      const init = await this.initialize();
      if (!init.isSupported) {
        throw new Error('Billing is currently unavailable.');
      }
    }

    return new Promise<PurchaseAttemptResult>((resolve, reject) => {
      let settled = false;

      const clear = () => {
        purchaseSub.remove();
        errorSub.remove();
      };

      const settleResolve = (value: PurchaseAttemptResult) => {
        if (settled) {
          return;
        }

        settled = true;
        clear();
        resolve(value);
      };

      const settleReject = (error: unknown) => {
        if (settled) {
          return;
        }

        settled = true;
        clear();
        reject(error instanceof Error ? error : new Error('Purchase failed.'));
      };

      const purchaseSub = iap.purchaseUpdatedListener(async (purchase) => {
        if (purchase.productId !== sku) {
          return;
        }

        try {
          await iap.finishTransaction({ purchase, isConsumable: false });
          settleResolve({ purchased: true, cancelled: false });
        } catch (error) {
          settleReject(error);
        }
      });

      const errorSub = iap.purchaseErrorListener((error) => {
        if (isCancelablePurchaseError(error)) {
          settleResolve({ purchased: false, cancelled: true });
          return;
        }

        settleReject(error);
      });

      void iap
        .requestPurchase({
          request: {
            apple: { sku },
            google: { skus: [sku] },
          },
          type: 'in-app',
        })
        .catch((error) => {
          if (isCancelablePurchaseError(error)) {
            settleResolve({ purchased: false, cancelled: true });
            return;
          }

          settleReject(error);
        });
    });
  }
}

export const billingService = new BillingService();
