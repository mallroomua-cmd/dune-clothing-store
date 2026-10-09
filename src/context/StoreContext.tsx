import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, AnalyticsConfig, CartItem, OrderDetails } from '../types';
import { SAMPLE_PRODUCTS } from '../lib/sample-data';
import { parseShopifyCsv } from '../lib/shopify-parser';
import { dbGet, dbSet, dbDelete } from '../lib/db';
import { newOrderId, findVariant } from '../lib/ids';
import {
  initializeTracking,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackPurchase,
  trackViewItem,
} from '../lib/analytics';
import { sendTelegramOrderNotification } from '../lib/telegram';
import { sendOrderPayload, enqueuePendingOrder, startOutboxWorker } from '../lib/outbox';


interface StoreContextType {
  products: Product[];
  analyticsConfig: AnalyticsConfig;
  cart: CartItem[];
  selectedProduct: Product | null;
  selectedVariant: string;
  isCheckoutOpen: boolean;
  checkoutProduct: Product | null;
  checkoutVariant: string;
  isAdminOpen: boolean;
  isCartDrawerOpen: boolean;
  setSelectedProduct: (p: Product | null) => void;
  setSelectedVariant: (v: string) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAdminOpen: (open: boolean) => void;
  setIsCartDrawerOpen: (open: boolean) => void;
  uploadCsv: (csvContent: string) => Promise<{ count: number }>;
  resetToDemo: () => Promise<void>;
  updateAnalyticsConfig: (config: Partial<AnalyticsConfig>) => void;
  addToCart: (product: Product, quantity?: number, variant?: string) => void;
  removeFromCart: (productId: string, variant?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, variant?: string) => void;
  clearCart: () => void;
  openQuickOrder: (product: Product, variant?: string) => void;
  openCartCheckout: () => void;
  submitOrder: (details: {
    name: string;
    phone: string;
    city: string;
    warehouse: string;
    deliveryMethod: 'nova_poshta' | 'ukrposhta' | 'courier';
    paymentMethod: 'cash_on_delivery' | 'card';
    notes?: string;
    website?: string;
    elapsedMs?: number;
  }) => Promise<{ success: boolean; orderId: string }>;
}

// Fallback to environment variables if provided (critical for production visitors!)
const DEFAULT_ANALYTICS: AnalyticsConfig = {
  gaMeasurementId: (import.meta.env.VITE_GA_ID as string) || '',
  googleAdsId: (import.meta.env.VITE_ADS_ID as string) || '',
  googleAdsConversionLabel: (import.meta.env.VITE_ADS_LABEL as string) || '',
  merchantCenterTag: (import.meta.env.VITE_GMC_TAG as string) || '',
  gtmId: (import.meta.env.VITE_GTM_ID as string) || '',
  telegramBotToken: '', // Token is strictly kept on server to prevent leakage; set in Admin UI only for local sandbox testing
  telegramChatId: (import.meta.env.VITE_TG_CHAT_ID as string) || '',
  novaPoshtaApiKey: (import.meta.env.VITE_NP_KEY as string) || '',
  debugMode: import.meta.env.DEV,
};

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [hydrated, setHydrated] = useState(false);

  const [analyticsConfig, setAnalyticsConfig] = useState<AnalyticsConfig>(() => {
    try {
      const saved = localStorage.getItem('shopify_store_analytics');
      return saved ? { ...DEFAULT_ANALYTICS, ...JSON.parse(saved) } : DEFAULT_ANALYTICS;
    } catch {
      return DEFAULT_ANALYTICS;
    }
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('shopify_store_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [checkoutVariant, setCheckoutVariant] = useState<string>('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Background retry worker for offline/failed orders
  useEffect(() => {
    const cleanup = startOutboxWorker();
    return cleanup;
  }, []);

  // Load products asynchronously from IndexedDB
  useEffect(() => {
    dbGet<Product[]>('shopify_store_products')
      .then((saved) => {
        if (saved && saved.length > 0) {
          setProducts(saved);
        }
      })
      .catch((e) => console.warn('Failed to load products from IndexedDB', e))
      .finally(() => {
        setHydrated(true);
      });
  }, []);

  // Save products asynchronously to IndexedDB ONLY after initial hydration
  useEffect(() => {
    if (!hydrated) return;
    dbSet('shopify_store_products', products).catch((e) =>
      console.warn('Failed to save products to IndexedDB', e)
    );
  }, [products, hydrated]);

  // Sync analytics config and initialize tracking once
  useEffect(() => {
    try {
      localStorage.setItem('shopify_store_analytics', JSON.stringify(analyticsConfig));
    } catch (e) {
      console.warn('Error saving analytics config', e);
    }
    initializeTracking(analyticsConfig);
  }, [analyticsConfig]);

  // Sync cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('shopify_store_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Error saving cart', e);
    }
  }, [cart]);

  // Track product view only when selected product changes (not on every variant switch)
  useEffect(() => {
    if (selectedProduct) {
      trackViewItem(selectedProduct, selectedVariant);
    }
  }, [selectedProduct?.id]);

  const uploadCsv = async (csvContent: string): Promise<{ count: number }> => {
    const parsed = await parseShopifyCsv(csvContent);
    if (!parsed || parsed.length === 0) {
      throw new Error('У файлі не знайдено валідних активних товарів Shopify');
    }
    setProducts(parsed);
    await dbSet('shopify_store_products', parsed);
    return { count: parsed.length };
  };

  const resetToDemo = async () => {
    setProducts(SAMPLE_PRODUCTS);
    await dbDelete('shopify_store_products');
  };

  const updateAnalyticsConfig = (newConfig: Partial<AnalyticsConfig>) => {
    setAnalyticsConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const addToCart = (product: Product, quantity = 1, variantTitle?: string) => {
    const v = findVariant(product, variantTitle);
    const chosenVariant = v?.title !== 'Default Title' ? v.title : undefined;

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant === chosenVariant
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity,
        };
        return next;
      }
      return [...prev, { product, quantity, selectedVariant: chosenVariant }];
    });

    trackAddToCart(product, quantity, chosenVariant);
  };

  const removeFromCart = (productId: string, variantTitle?: string) => {
    setCart((prev) => {
      const item = prev.find(
        (i) => i.product.id === productId && i.selectedVariant === variantTitle
      );
      if (item) {
        trackRemoveFromCart(item.product, item.quantity, item.selectedVariant);
      }
      return prev.filter(
        (i) => !(i.product.id === productId && i.selectedVariant === variantTitle)
      );
    });
  };

  const updateCartQuantity = (productId: string, quantity: number, variantTitle?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantTitle);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.selectedVariant === variantTitle
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const openQuickOrder = (product: Product, variantTitle?: string) => {
    const v = findVariant(product, variantTitle);
    const chosenVariant = v?.title !== 'Default Title' ? v.title : '';
    setCheckoutProduct(product);
    setCheckoutVariant(chosenVariant);
    setIsCheckoutOpen(true);
    trackBeginCheckout([{ product, quantity: 1, selectedVariant: chosenVariant }], v.price);
  };

  const openCartCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutProduct(null);
    setCheckoutVariant('');
    setIsCartDrawerOpen(false);
    setIsCheckoutOpen(true);
    const total = cart.reduce((acc, i) => {
      const v = findVariant(i.product, i.selectedVariant);
      return acc + (v?.price || i.product.price) * i.quantity;
    }, 0);
    trackBeginCheckout(cart, total);
  };

  const submitOrder = async (details: {
    name: string;
    phone: string;
    city: string;
    warehouse: string;
    deliveryMethod: 'nova_poshta' | 'ukrposhta' | 'courier';
    paymentMethod: 'cash_on_delivery' | 'card';
    notes?: string;
    website?: string;
    elapsedMs?: number;
  }): Promise<{ success: boolean; orderId: string }> => {
    // Generate unified Order ID
    const orderId = newOrderId();

    const itemsToOrder: CartItem[] = checkoutProduct
      ? [
          {
            product: checkoutProduct,
            quantity: 1,
            selectedVariant: checkoutVariant || undefined,
          },
        ]
      : cart;

    const total = itemsToOrder.reduce((acc, i) => {
      const v = findVariant(i.product, i.selectedVariant);
      return acc + (v?.price || i.product.price) * i.quantity;
    }, 0);

    const fullOrder: OrderDetails = {
      ...details,
      orderId,
      items: itemsToOrder,
      total,
    };

    // 1. Direct Telegram dispatch ONLY if merchant explicitly set token in admin drawer
    if (analyticsConfig.telegramBotToken && analyticsConfig.telegramChatId) {
      sendTelegramOrderNotification(
        fullOrder,
        analyticsConfig.telegramBotToken,
        analyticsConfig.telegramChatId
      ).catch((err) => console.warn('Direct Telegram notification failed:', err));
    }

    // 2. Dispatch to Serverless API with Outbox fallback
    const payload = {
      ...fullOrder,
      orderId,
      website: details.website || '',
      elapsedMs: details.elapsedMs,
    };

    const sent = await sendOrderPayload(payload);
    if (!sent) {
      // Offline fallback: enqueue to IndexedDB outbox for automatic background retry
      await enqueuePendingOrder(payload);
    }

    // 3. Save order history
    try {
      const history = JSON.parse(localStorage.getItem('shopify_store_orders') || '[]');
      history.unshift({
        ...fullOrder,
        id: orderId,
        date: new Date().toLocaleString('uk-UA'),
      });
      localStorage.setItem('shopify_store_orders', JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn('Failed saving order history', e);
    }

    // 4. Track Purchase & Google Ads Enhanced Conversion AFTER order is successfully recorded!
    void trackPurchase({ ...fullOrder, orderId }, analyticsConfig);

    if (!checkoutProduct) {
      clearCart();
    }
    setCheckoutProduct(null);
    setCheckoutVariant('');

    return { success: true, orderId };
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        analyticsConfig,
        cart,
        selectedProduct,
        selectedVariant,
        isCheckoutOpen,
        checkoutProduct,
        checkoutVariant,
        isAdminOpen,
        isCartDrawerOpen,
        setSelectedProduct,
        setSelectedVariant,
        setIsCheckoutOpen,
        setIsAdminOpen,
        setIsCartDrawerOpen,
        uploadCsv,
        resetToDemo,
        updateAnalyticsConfig,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        openQuickOrder,
        openCartCheckout,
        submitOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};
