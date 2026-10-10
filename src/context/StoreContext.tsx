import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  AnalyticsConfig,
  CartItem,
  OrderDetails,
  StoredOrder,
  OrderStatus,
  StoreSettings,
  PromoCode,
  ToastMessage,
  ProductReview,
} from '../types';
import { PolicyTabKey } from '../components/PolicyModal';

import { SAMPLE_PRODUCTS } from '../lib/sample-data';
import { parseUniversalCsvFeed, mergeProducts } from '../lib/universal-csv';
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
import {
  isSupabaseConfigured,
  fetchProductsFromSupabase,
  saveProductToSupabase,
  deleteProductFromSupabase,
  bulkSyncProductsToSupabase,
  fetchOrdersFromSupabase,
  saveOrderToSupabase,
  updateOrderStatusInSupabase,
  updateOrderTtnInSupabase,
  bulkSyncOrdersToSupabase,
  STORE_ID,
} from '../lib/supabase';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'MOLAND',
  phone: '+38 (093) 345-68-10',
  telegramUsername: 'moland_ua',
  viberNumber: '+380933456810',
  workingHours: 'Пн–Нд: 10:00 — 21:00',
  freeShippingThreshold: 3000,
  contactWidgetEnabled: true,
  socialProofEnabled: true,
  instagramUsername: 'moland.ua',
};

export const DEFAULT_PROMO_CODES: PromoCode[] = [
  { id: 'promo-1', code: 'MOLAND10', discountType: 'percent', discountValue: 10, minOrderAmount: 1000, isActive: true },
  { id: 'promo-2', code: 'ROOMS10', discountType: 'percent', discountValue: 10, minOrderAmount: 1000, isActive: true },
  { id: 'promo-3', code: 'DUNE10', discountType: 'percent', discountValue: 10, minOrderAmount: 1000, isActive: true },
  { id: 'promo-4', code: 'DROP100', discountType: 'fixed', discountValue: 100, minOrderAmount: 1500, isActive: true },
  { id: 'promo-5', code: 'VIP15', discountType: 'percent', discountValue: 15, minOrderAmount: 1500, isActive: true },
];

export const DEFAULT_REVIEWS: ProductReview[] = [
  {
    id: 'rev-1',
    productId: 'all',
    author: 'Владислав К.',
    rating: 5,
    text: 'Замовляв світшот AMI Paris та кросівки New Balance 1906R — 100% оригінальні речі, фірмове пакування. Огляд та примірка у відділенні Нової Пошти зняли всі сумніви. Респект команді MOLAND!',
    date: '09.10.2026',
    verified: true,
  },
  {
    id: 'rev-2',
    productId: 'all',
    author: 'Артем Д.',
    rating: 5,
    text: 'Худі Stüssy та штани Carhartt Double Knee сіли ідеально. Консультант у Telegram підказав за розмірною сіткою протягом 5 хвилин. Швидка відправка в той же день.',
    date: '07.10.2026',
    verified: true,
  },
  {
    id: 'rev-3',
    productId: 'all',
    author: 'Дар’я М.',
    rating: 5,
    text: 'Купила сумочку Ganni Bou Bag та годинник Breda. Дуже естетичне пакування, речі бездоганної якості. Дякую MOLAND за класний сервіс і швидку доставку по Києву!',
    date: '04.10.2026',
    verified: true,
  },
  {
    id: 'rev-4',
    productId: 'all',
    author: 'Михайло С.',
    rating: 5,
    text: 'Куртка Stone Island Soft Shell та трейлові Salomon XT-6. Certilogo б’ється офіційно. MOLAND тепер мій улюблений концепт-стор у Києві.',
    date: '01.10.2026',
    verified: true,
  },
];

interface StoreContextType {
  products: Product[];
  analyticsConfig: AnalyticsConfig;
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  promoCodes: PromoCode[];
  addPromoCode: (promo: PromoCode) => void;
  deletePromoCode: (id: string) => void;
  togglePromoCode: (id: string) => void;
  appliedPromo: PromoCode | null;
  applyPromoCode: (code: string, currentTotal: number) => { success: boolean; message: string };
  removePromoCode: () => void;
  reviews: ProductReview[];
  addReview: (review: Omit<ProductReview, 'id' | 'date'>) => void;
  getProductReviews: (productId: string) => ProductReview[];
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  recentlyViewed: string[];
  addRecentlyViewed: (productId: string) => void;
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type'], title?: string) => void;
  removeToast: (id: string) => void;
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
  isMobileFiltersOpen: boolean;
  setIsMobileFiltersOpen: (open: boolean) => void;
  isQuizOpen: boolean;
  setIsQuizOpen: (open: boolean) => void;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;
  isPolicyModalOpen: boolean;
  policyModalTab: PolicyTabKey;
  openPolicyModal: (tab?: PolicyTabKey) => void;
  closePolicyModal: () => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  filterByBrand: (brand: string) => void;
  filterByCategory: (category: string) => void;
  setSelectedProduct: (p: Product | null) => void;
  setSelectedVariant: (v: string) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAdminOpen: (open: boolean) => void;
  setIsCartDrawerOpen: (open: boolean) => void;
  uploadCsv: (
    csvContent: string,
    options?: { syncToSupabase?: boolean; mode?: 'replace' | 'upsert' }
  ) => Promise<{ count: number; syncedToCloud?: number; cloudError?: string }>;
  syncCatalogWithCloud: (direction: 'push' | 'pull') => Promise<{ success: boolean; count: number; message: string }>;
  syncOrdersWithCloud: (direction: 'push' | 'pull') => Promise<{ success: boolean; count: number; message: string }>;
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
    promoCode?: string;
    discountAmount?: number;
  }) => Promise<{ success: boolean; orderId: string }>;
  updateProduct: (product: Product) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  setAllProducts: (products: Product[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderTtn: (orderId: string, ttn: string) => Promise<void>;
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
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Store Settings (phone, messengers, widget toggles, schedule, free shipping)
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('shopify_store_settings');
      return saved ? { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(saved) } : DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  const updateStoreSettings = (newSettings: Partial<StoreSettings>) => {
    setStoreSettings((prev) => {
      const next = { ...prev, ...newSettings };
      try {
        localStorage.setItem('shopify_store_settings', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Promo Codes
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem('shopify_store_promos');
      return saved ? JSON.parse(saved) : DEFAULT_PROMO_CODES;
    } catch {
      return DEFAULT_PROMO_CODES;
    }
  });

  const addPromoCode = (promo: PromoCode) => {
    setPromoCodes((prev) => {
      const next = [promo, ...prev];
      try {
        localStorage.setItem('shopify_store_promos', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const deletePromoCode = (id: string) => {
    setPromoCodes((prev) => {
      const next = prev.filter((p) => p.id !== id);
      try {
        localStorage.setItem('shopify_store_promos', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const togglePromoCode = (id: string) => {
    setPromoCodes((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p));
      try {
        localStorage.setItem('shopify_store_promos', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);

  const applyPromoCode = (code: string, currentTotal: number) => {
    const clean = code.trim().toUpperCase();
    const found = promoCodes.find((p) => p.code.toUpperCase() === clean && p.isActive);
    if (!found) {
      return { success: false, message: 'Промокод не знайдено або термін його дії минув' };
    }
    if (found.minOrderAmount && currentTotal < found.minOrderAmount) {
      return {
        success: false,
        message: `Мінімальна сума замовлення для промокоду ${found.code}: ${found.minOrderAmount.toLocaleString('uk-UA')} ₴`,
      };
    }
    setAppliedPromo(found);
    return { success: true, message: `Промокод ${found.code} активовано!` };
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastMessage['type'] = 'info', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  // Wishlist
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shopify_store_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('shopify_store_wishlist', JSON.stringify(next));
      } catch {
        // ignore
      }
      if (!exists) {
        addToast('Додано до списку бажань', 'success');
      } else {
        addToast('Вилучено зі списку бажань', 'info');
      }
      return next;
    });
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');

  const filterByBrand = (brand: string) => {
    setSelectedBrand(brand);
    setSelectedCategory('all');
    if (typeof document !== 'undefined') {
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const filterByCategory = (category: string) => {
    setSelectedCategory(category);
    setSelectedBrand('all');
    if (typeof document !== 'undefined') {
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Product Reviews system
  const [reviews, setReviews] = useState<ProductReview[]>(() => {
    try {
      const saved = localStorage.getItem('shopify_store_reviews');
      return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    } catch {
      return DEFAULT_REVIEWS;
    }
  });

  const addReview = (review: Omit<ProductReview, 'id' | 'date'>) => {
    const newRev: ProductReview = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('uk-UA'),
    };
    setReviews((prev) => {
      const next = [newRev, ...prev];
      try {
        localStorage.setItem('shopify_store_reviews', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    addToast('Дякуємо! Ваш відгук успішно опубліковано.', 'success');
  };

  const getProductReviews = useCallback((productId: string) => {
    return reviews.filter((r) => r.productId === productId || r.productId === 'all');
  }, [reviews]);

  // Recently Viewed
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('shopify_store_recent');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addRecentlyViewed = (productId: string) => {
    setRecentlyViewed((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, 8);
      try {
        localStorage.setItem('shopify_store_recent', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

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

  // Load products asynchronously from IndexedDB with streetwear catalog migration
  // Load products asynchronously with Supabase cloud-first check & IndexedDB fallback
  useEffect(() => {
    async function loadProducts() {
      // 1. Try Supabase cloud products if configured
      if (isSupabaseConfigured()) {
        try {
          const cloudProducts = await fetchProductsFromSupabase(STORE_ID);
          if (cloudProducts && cloudProducts.length > 0) {
            setProducts(cloudProducts);
            void dbSet('shopify_store_products', cloudProducts);
            setHydrated(true);
            return;
          }
        } catch (err) {
          console.warn('[Supabase] Failed to fetch products from cloud, falling back to local cache', err);
        }
      }

      // 2. Fallback to IndexedDB with DUNE catalog migration
      try {
        const saved = await dbGet<Product[]>('shopify_store_products');
        const hasLegacy = saved && saved.some((p) =>
          p.vendor === 'TechPro' ||
          p.vendor === 'COSRX' ||
          p.vendor === 'Beauty of Joseon' ||
          p.handle.includes('smart-watch') ||
          p.handle.includes('snail')
        );
        const nicheVersion = localStorage.getItem('moland_catalog_niche');

        if (!saved || saved.length === 0 || hasLegacy || nicheVersion !== 'moland_fashion_v1') {
          setProducts(SAMPLE_PRODUCTS);
          void dbSet('shopify_store_products', SAMPLE_PRODUCTS);
          localStorage.setItem('moland_catalog_niche', 'moland_fashion_v1');
        } else {
          setProducts(saved);
        }
      } catch (e) {
        console.warn('Failed to load products from IndexedDB', e);
        setProducts(SAMPLE_PRODUCTS);
      } finally {
        setHydrated(true);
      }
    }

    void loadProducts();
  }, []);

  // Load orders asynchronously from IndexedDB with localStorage fallback and optional Supabase pull
  useEffect(() => {
    async function loadOrders() {
      let initialOrders: StoredOrder[] = [];
      try {
        const saved = await dbGet<StoredOrder[]>('shopify_store_orders');
        if (saved && saved.length > 0) {
          initialOrders = saved;
        } else {
          try {
            const localSaved = localStorage.getItem('shopify_store_orders');
            if (localSaved) {
              initialOrders = JSON.parse(localSaved);
            }
          } catch {
            // ignore
          }
        }
      } catch (e) {
        console.warn('Failed to load orders from IndexedDB', e);
      }

      if (isSupabaseConfigured()) {
        try {
          const cloudOrders = await fetchOrdersFromSupabase(STORE_ID);
          if (cloudOrders && cloudOrders.length > 0) {
            const seen = new Set<string>();
            const merged: StoredOrder[] = [];
            for (const o of cloudOrders) {
              const key = o.orderId || o.id;
              if (!seen.has(key)) {
                seen.add(key);
                merged.push(o);
              }
            }
            for (const o of initialOrders) {
              const key = o.orderId || o.id;
              if (!seen.has(key)) {
                seen.add(key);
                merged.push(o);
              }
            }
            merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            initialOrders = merged;
          }
        } catch (err) {
          console.warn('Cloud orders bootstrap fetch failed (using local):', err);
        }
      }

      setOrders(initialOrders);
      setOrdersHydrated(true);
    }

    void loadOrders();
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

  const uploadCsv = async (
    csvContent: string,
    options?: { syncToSupabase?: boolean; mode?: 'replace' | 'upsert' }
  ): Promise<{ count: number; syncedToCloud?: number; cloudError?: string }> => {
    const parsed = await parseUniversalCsvFeed(csvContent);
    if (!parsed || parsed.length === 0) {
      throw new Error('У файлі не знайдено валідних активних товарів (перевірте формат колонок)');
    }
    const mode = options?.mode || 'replace';
    const merged = mergeProducts(products, parsed, mode);
    setProducts(merged);
    await dbSet('shopify_store_products', merged);

    let syncedCount = 0;
    let cloudErr: string | undefined;

    const shouldSync = options?.syncToSupabase ?? isSupabaseConfigured();
    if (shouldSync && isSupabaseConfigured()) {
      try {
        const syncRes = await bulkSyncProductsToSupabase(merged, STORE_ID);
        syncedCount = syncRes.success;
      } catch (err: unknown) {
        cloudErr = err instanceof Error ? err.message : String(err);
        console.error('[Supabase] Bulk sync failed during CSV import:', err);
      }
    }

    return { count: merged.length, syncedToCloud: syncedCount, cloudError: cloudErr };
  };

  const syncCatalogWithCloud = async (
    direction: 'push' | 'pull'
  ): Promise<{ success: boolean; count: number; message: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, count: 0, message: 'Supabase не налаштовано. Перевірте URL та ключ у налаштуваннях.' };
    }

    if (direction === 'push') {
      try {
        const res = await bulkSyncProductsToSupabase(products, STORE_ID);
        return {
          success: res.failed === 0,
          count: res.success,
          message: `Вивантажено в Supabase: ${res.success} товарів${res.failed > 0 ? ` (помилок: ${res.failed})` : ''}`,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, count: 0, message: `Помилка вивантаження в Supabase: ${msg}` };
      }
    } else {
      try {
        const cloudProducts = await fetchProductsFromSupabase(STORE_ID);
        if (!cloudProducts || cloudProducts.length === 0) {
          return { success: false, count: 0, message: 'У хмарі Supabase ще немає збережених товарів для цього магазину.' };
        }
        setProducts(cloudProducts);
        await dbSet('shopify_store_products', cloudProducts);
        return {
          success: true,
          count: cloudProducts.length,
          message: `Успішно завантажено з Supabase: ${cloudProducts.length} товарів!`,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, count: 0, message: `Помилка завантаження з Supabase: ${msg}` };
      }
    }
  };

  const syncOrdersWithCloud = async (
    direction: 'push' | 'pull'
  ): Promise<{ success: boolean; count: number; message: string }> => {
    if (!isSupabaseConfigured()) {
      return { success: false, count: 0, message: 'Supabase не налаштовано. Перевірте URL та ключ у налаштуваннях.' };
    }

    if (direction === 'push') {
      try {
        const res = await bulkSyncOrdersToSupabase(orders, STORE_ID);
        return {
          success: res.failed === 0,
          count: res.success,
          message: `Вивантажено в Supabase: ${res.success} замовлень${res.failed > 0 ? ` (помилок: ${res.failed})` : ''}`,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, count: 0, message: `Помилка вивантаження замовлень в Supabase: ${msg}` };
      }
    } else {
      try {
        const cloudOrders = await fetchOrdersFromSupabase(STORE_ID);
        if (!cloudOrders || cloudOrders.length === 0) {
          return { success: false, count: 0, message: 'У хмарі Supabase ще немає збережених замовлень для цього магазину.' };
        }

        const seen = new Set<string>();
        const merged: StoredOrder[] = [];
        for (const o of cloudOrders) {
          const key = o.orderId || o.id;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(o);
          }
        }
        for (const o of orders) {
          const key = o.orderId || o.id;
          if (!seen.has(key)) {
            seen.add(key);
            merged.push(o);
          }
        }
        merged.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

        setOrders(merged);
        await dbSet('shopify_store_orders', merged);
        try {
          localStorage.setItem('shopify_store_orders', JSON.stringify(merged));
        } catch {
          // ignore
        }

        return {
          success: true,
          count: cloudOrders.length,
          message: `Успішно завантажено з Supabase: ${cloudOrders.length} замовлень!`,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, count: 0, message: `Помилка завантаження замовлень з Supabase: ${msg}` };
      }
    }
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
    if (isSupabaseConfigured()) {
      saveProductToSupabase(updated, STORE_ID).catch((e) =>
        console.error('Failed to sync updated product to Supabase', e)
      );
    }
  };

  const addProduct = async (newProduct: Product) => {
    setProducts((prev) => {
      const next = [newProduct, ...prev];
      void dbSet('shopify_store_products', next);
      return next;
    });
    if (isSupabaseConfigured()) {
      saveProductToSupabase(newProduct, STORE_ID).catch((e) =>
        console.error('Failed to sync new product to Supabase', e)
      );
    }
  };

  const deleteProduct = async (productId: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      void dbSet('shopify_store_products', next);
      return next;
    });
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
    if (isSupabaseConfigured()) {
      deleteProductFromSupabase(productId, STORE_ID).catch((e) =>
        console.error('Failed to delete product from Supabase', e)
      );
    }
  };

  const setAllProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    void dbSet('shopify_store_products', newProducts);
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

    if (isSupabaseConfigured()) {
      updateOrderStatusInSupabase(orderId, status, STORE_ID).catch((err) => {
        console.warn('Failed to update order status in Supabase:', err);
      });
    }
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

  const updateOrderTtn = async (orderId: string, ttn: string) => {
    const cleanTtn = ttn.trim();
    setOrders((prev) => {
      const next = prev.map((o) => (o.orderId === orderId ? { ...o, ttn: cleanTtn } : o));
      void dbSet('shopify_store_orders', next);
      try {
        localStorage.setItem('shopify_store_orders', JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });

    if (isSupabaseConfigured()) {
      updateOrderTtnInSupabase(orderId, cleanTtn, STORE_ID).catch((err) => {
        console.warn('Failed to update order TTN in Supabase:', err);
      });
    }
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
    addToast('Товар успішно додано до кошика', 'success');
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
    promoCode?: string;
    discountAmount?: number;
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

    const rawTotal = itemsToOrder.reduce((acc, i) => {
      const v = findVariant(i.product, i.selectedVariant);
      return acc + (v?.price || i.product.price) * i.quantity;
    }, 0);

    const discountAmount = details.discountAmount || 0;
    const finalTotal = Math.max(rawTotal - discountAmount, 0);

    const fullOrder: OrderDetails = {
      ...details,
      orderId,
      items: itemsToOrder,
      total: finalTotal,
      promoCode: details.promoCode,
      discountAmount,
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

    // If Supabase is configured, also persist order to Supabase cloud
    if (isSupabaseConfigured()) {
      saveOrderToSupabase(storedOrder, STORE_ID).catch((err) => {
        console.warn('Failed to save order to Supabase:', err);
      });
    }

    // 4. Track Purchase & Google Ads Enhanced Conversion AFTER order is successfully recorded!
    void trackPurchase({ ...fullOrder, orderId }, analyticsConfig);

    if (!checkoutProduct) {
      clearCart();
    }
    setCheckoutProduct(null);
    setCheckoutVariant('');
    setAppliedPromo(null);

    return { success: true, orderId };
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        analyticsConfig,
        storeSettings,
        updateStoreSettings,
        promoCodes,
        addPromoCode,
        deletePromoCode,
        togglePromoCode,
        appliedPromo,
        applyPromoCode,
        removePromoCode,
        wishlist,
        toggleWishlist,
        isInWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        isSearchOpen,
        setIsSearchOpen,
        recentlyViewed,
        addRecentlyViewed,
        toasts,
        addToast,
        removeToast,
        cart,
        orders,
        outboxCount,
        selectedProduct,
        setSelectedProduct,
        selectedVariant,
        setSelectedVariant,
        isCheckoutOpen,
        setIsCheckoutOpen,
        checkoutProduct,
        checkoutVariant,
        isAdminOpen,
        setIsAdminOpen,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isQuizOpen,
        setIsQuizOpen,
        isTrackingOpen,
        setIsTrackingOpen,
        isPolicyModalOpen,
        policyModalTab,
        openPolicyModal,
        closePolicyModal,
        selectedCategory,
        setSelectedCategory,
        selectedBrand,
        setSelectedBrand,
        filterByBrand,
        filterByCategory,
        isMobileFiltersOpen,
        setIsMobileFiltersOpen,
        uploadCsv,
        syncCatalogWithCloud,
        syncOrdersWithCloud,
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
        setAllProducts,
        updateOrderStatus,
        updateOrderTtn,
        deleteOrder,
        clearOrders,
        retryTelegramNotification,
        flushPendingOutbox,
        reviews,
        addReview,
        getProductReviews,
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
