import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, AnalyticsConfig, CartItem, OrderDetails, StoredOrder, OrderStatus } from '../types';
import { PolicyTabKey } from '../components/PolicyModal';

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
import {
  sendOrderPayload,
  enqueuePendingOrder,
  startOutboxWorker,
  subscribeToOutbox,
  flushOutboxWithReport,
} from '../lib/outbox';

interface StoreContextType {
  products: Product[];
  analyticsConfig: AnalyticsConfig;
  cart: CartItem[];
  orders: StoredOrder[];
  outboxCount: number;
  selectedProduct: Product | null;
  selectedVariant: string;
  isCheckoutOpen: boolean;
  checkoutProduct: Product | null;
  checkoutVariant: string;
  isAdminOpen: boolean;
  isCartDrawerOpen: boolean;
  isPolicyModalOpen: boolean;
  policyModalTab: PolicyTabKey;
  openPolicyModal: (tab?: PolicyTabKey) => void;
  closePolicyModal: () => void;
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
  updateProduct: (product: Product) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  clearOrders: () => Promise<void>;
  retryTelegramNotification: (orderId: string) => Promise<{ success: boolean; error?: string }>;
  flushPendingOutbox: () => Promise<{ total: number; sent: number; remaining: number }>;
}

// Fallback to environment variables if provided (critical for production visitors!)
const DEFAULT_ANALYTICS: AnalyticsConfig = {
  gaMeasurementId: (import.meta.env.VITE_GA_ID as string) || '',
  googleAdsId: (import.meta.env.VITE_ADS_ID as string) || '',
  googleAdsConversionLabel: (import.meta.env.VITE_ADS_LABEL as string) || '',
  merchantCenterTag: (import.meta.env.VITE_GMC_TAG as string) || '',
  gtmId: (import.meta.env.VITE_GTM_ID as string) || '',
  fbPixelId: (import.meta.env.VITE_FB_PIXEL_ID as string) || '',
  telegramBotToken: '', // Token is strictly kept on server to prevent leakage; set in Admin UI only for local sandbox testing
  telegramChatId: (import.meta.env.VITE_TG_CHAT_ID as string) || '',
  novaPoshtaApiKey: (import.meta.env.VITE_NP_KEY as string) || '',
  debugMode: import.meta.env.DEV,
};


const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);
  const [hydrated, setHydrated] = useState(false);

  const [orders, setOrders] = useState<StoredOrder[]>([]);
  const [ordersHydrated, setOrdersHydrated] = useState(false);
  const [outboxCount, setOutboxCount] = useState(0);

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
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        window.location.hash === '#admin' ||
        window.location.search.includes('admin')
      );
    }
    return false;
  });
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Policy Modal state (Privacy, Refund, Shipping, Terms, About, Contacts)
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hash.toLowerCase();
      return (
        h.includes('privacy') ||
        h.includes('refund') ||
        h.includes('shipping') ||
        h.includes('terms') ||
        h.includes('about') ||
        h.includes('contact')
      );
    }
    return false;
  });

  const [policyModalTab, setPolicyModalTab] = useState<PolicyTabKey>(() => {
    if (typeof window !== 'undefined') {
      const h = window.location.hash.toLowerCase();
      if (h.includes('privacy')) return 'privacy';
      if (h.includes('refund')) return 'refund';
      if (h.includes('terms')) return 'terms';
      if (h.includes('about')) return 'about';
      if (h.includes('contact')) return 'contacts';
    }
    return 'shipping';
  });

  const openPolicyModal = (tab: PolicyTabKey = 'shipping') => {
    setPolicyModalTab(tab);
    setIsPolicyModalOpen(true);
    if (typeof window !== 'undefined') {
      window.location.hash = `#${tab}`;
    }
  };

  const closePolicyModal = () => {
    setIsPolicyModalOpen(false);
  };

  // Background retry worker for offline/failed orders & outbox listener
  useEffect(() => {
    const cleanupWorker = startOutboxWorker();
    const cleanupSub = subscribeToOutbox((count) => setOutboxCount(count));
    return () => {
      cleanupWorker();
      cleanupSub();
    };
  }, []);

  // Auto-open on #admin hash, query param, policy hashes, or Ctrl+Shift+A / Cmd+Shift+A shortcut
  useEffect(() => {
    const getPolicyTabFromHash = (hash: string): PolicyTabKey | null => {
      const clean = hash.toLowerCase();
      if (clean === '#privacy' || clean === '#privacy-policy' || clean.includes('privacy')) return 'privacy';
      if (clean === '#refund' || clean === '#refund-policy' || clean.includes('refund')) return 'refund';
      if (clean === '#shipping' || clean === '#shipping-policy' || clean.includes('shipping')) return 'shipping';
      if (clean === '#terms' || clean === '#terms-of-service' || clean.includes('terms') || clean.includes('offer')) return 'terms';
      if (clean === '#about' || clean === '#about-us' || clean.includes('about')) return 'about';
      if (clean === '#contacts' || clean === '#contact-information' || clean.includes('contact')) return 'contacts';
      return null;
    };

    const checkHash = () => {
      if (
        window.location.hash === '#admin' ||
        window.location.search.includes('admin')
      ) {
        setIsAdminOpen(true);
        return;
      }

      const policyTab = getPolicyTabFromHash(window.location.hash);
      if (policyTab) {
        setPolicyModalTab(policyTab);
        setIsPolicyModalOpen(true);
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('keydown', handleKey);
    };
  }, []);

  // Load products asynchronously from IndexedDB with cosmetics catalog migration
  useEffect(() => {
    dbGet<Product[]>('shopify_store_products')
      .then((saved) => {
        const hasLegacy = saved && saved.some((p) => p.vendor === 'TechPro' || p.handle.includes('smart-watch'));
        const nicheVersion = localStorage.getItem('mallroom_catalog_niche');

        if (!saved || saved.length === 0 || hasLegacy || nicheVersion !== 'cosmetics_v2') {
          setProducts(SAMPLE_PRODUCTS);
          void dbSet('shopify_store_products', SAMPLE_PRODUCTS);
          localStorage.setItem('mallroom_catalog_niche', 'cosmetics_v2');
        } else {
          setProducts(saved);
        }
      })
      .catch((e) => {
        console.warn('Failed to load products from IndexedDB', e);
        setProducts(SAMPLE_PRODUCTS);
      })
      .finally(() => {
        setHydrated(true);
      });
  }, []);

  // Load orders asynchronously from IndexedDB with localStorage fallback
  useEffect(() => {
    dbGet<StoredOrder[]>('shopify_store_orders')
      .then((saved) => {
        if (saved && saved.length > 0) {
          setOrders(saved);
        } else {
          try {
            const localSaved = localStorage.getItem('shopify_store_orders');
            if (localSaved) {
              setOrders(JSON.parse(localSaved));
            }
          } catch {
            // ignore
          }
        }
      })
      .catch((e) => console.warn('Failed to load orders from IndexedDB', e))
      .finally(() => {
        setOrdersHydrated(true);
      });
  }, []);

  // Save products asynchronously to IndexedDB ONLY after initial hydration
  useEffect(() => {
    if (!hydrated) return;
    dbSet('shopify_store_products', products).catch((e) =>
      console.warn('Failed to save products to IndexedDB', e)
    );
  }, [products, hydrated]);

  // Save orders asynchronously to IndexedDB & localStorage ONLY after initial orders hydration
  useEffect(() => {
    if (!ordersHydrated) return;
    dbSet('shopify_store_orders', orders).catch((e) =>
      console.warn('Failed to save orders to IndexedDB', e)
    );
    try {
      localStorage.setItem('shopify_store_orders', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders, ordersHydrated]);

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

  const updateProduct = async (updated: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      void dbSet('shopify_store_products', next);
      return next;
    });
  };

  const addProduct = async (newProduct: Product) => {
    setProducts((prev) => {
      const next = [newProduct, ...prev];
      void dbSet('shopify_store_products', next);
      return next;
    });
  };

  const deleteProduct = async (productId: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      void dbSet('shopify_store_products', next);
      return next;
    });
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.orderId === orderId ? { ...o, status } : o));
      void dbSet('shopify_store_orders', next);
      try {
        localStorage.setItem('shopify_store_orders', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const deleteOrder = async (orderId: string) => {
    setOrders((prev) => {
      const next = prev.filter((o) => o.orderId !== orderId);
      void dbSet('shopify_store_orders', next);
      try {
        localStorage.setItem('shopify_store_orders', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const clearOrders = async () => {
    setOrders([]);
    await dbDelete('shopify_store_orders');
    localStorage.removeItem('shopify_store_orders');
  };

  const retryTelegramNotification = async (
    orderId: string
  ): Promise<{ success: boolean; error?: string }> => {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return { success: false, error: 'Замовлення не знайдено' };
    if (!analyticsConfig.telegramBotToken || !analyticsConfig.telegramChatId) {
      return { success: false, error: 'Telegram Bot Token або Chat ID не налаштовані' };
    }

    const res = await sendTelegramOrderNotification(
      order,
      analyticsConfig.telegramBotToken,
      analyticsConfig.telegramChatId
    );

    if (res.success) {
      setOrders((prev) => {
        const next = prev.map((o) => (o.orderId === orderId ? { ...o, syncedToTelegram: true } : o));
        void dbSet('shopify_store_orders', next);
        try {
          localStorage.setItem('shopify_store_orders', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    }

    return res;
  };

  const flushPendingOutbox = async () => {
    return await flushOutboxWithReport();
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

    // 1. Direct Telegram dispatch if merchant set token
    let directTelegramSuccess = false;
    if (analyticsConfig.telegramBotToken && analyticsConfig.telegramChatId) {
      try {
        const tgRes = await sendTelegramOrderNotification(
          fullOrder,
          analyticsConfig.telegramBotToken,
          analyticsConfig.telegramChatId
        );
        directTelegramSuccess = tgRes.success;
      } catch (err) {
        console.warn('Direct Telegram notification failed:', err);
      }
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
      await enqueuePendingOrder(payload);
    }

    // 3. Save order history in StoredOrder format
    const storedOrder: StoredOrder = {
      ...fullOrder,
      id: orderId,
      orderId,
      createdAt: Date.now(),
      date: new Date().toLocaleString('uk-UA'),
      status: 'new',
      syncedToTelegram: directTelegramSuccess || sent,
    };

    setOrders((prev) => {
      const next = [storedOrder, ...prev].slice(0, 150);
      void dbSet('shopify_store_orders', next);
      try {
        localStorage.setItem('shopify_store_orders', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed saving order history', e);
      }
      return next;
    });

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
        orders,
        outboxCount,
        selectedProduct,
        selectedVariant,
        isCheckoutOpen,
        checkoutProduct,
        checkoutVariant,
        isAdminOpen,
        isCartDrawerOpen,
        isPolicyModalOpen,
        policyModalTab,
        openPolicyModal,
        closePolicyModal,
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
        updateProduct,
        addProduct,
        deleteProduct,
        updateOrderStatus,
        deleteOrder,
        clearOrders,
        retryTelegramNotification,
        flushPendingOutbox,
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
