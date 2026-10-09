import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, AnalyticsConfig, CartItem, OrderDetails } from '../types';
import { SAMPLE_PRODUCTS } from '../lib/sample-data';
import { parseShopifyCsv } from '../lib/shopify-parser';
import { dbGet, dbSet, dbDelete } from '../lib/db';
import {
  initializeTracking,
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase,
  trackViewItem,
} from '../lib/analytics';
import { sendTelegramOrderNotification } from '../lib/telegram';

interface StoreContextType {
  products: Product[];
  analyticsConfig: AnalyticsConfig;
  cart: CartItem[];
  selectedProduct: Product | null;
  isCheckoutOpen: boolean;
  checkoutProduct: Product | null;
  isAdminOpen: boolean;
  isCartDrawerOpen: boolean;
  setSelectedProduct: (p: Product | null) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setIsAdminOpen: (open: boolean) => void;
  setIsCartDrawerOpen: (open: boolean) => void;
  uploadCsv: (csvContent: string) => Promise<{ count: number }>;
  resetToDemo: () => Promise<void>;
  updateAnalyticsConfig: (config: Partial<AnalyticsConfig>) => void;
  addToCart: (product: Product, quantity?: number, variant?: string) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openQuickOrder: (product: Product) => void;
  openCartCheckout: () => void;
  submitOrder: (details: {
    name: string;
    phone: string;
    city: string;
    warehouse: string;
    deliveryMethod: 'nova_poshta' | 'ukrposhta' | 'courier';
    paymentMethod: 'cash_on_delivery' | 'card';
    notes?: string;
  }) => Promise<{ success: boolean }>;
}

const DEFAULT_ANALYTICS: AnalyticsConfig = {
  gaMeasurementId: '',
  googleAdsId: '',
  googleAdsConversionLabel: '',
  merchantCenterTag: '',
  gtmId: '',
  telegramBotToken: '',
  telegramChatId: '',
  novaPoshtaApiKey: '',
  debugMode: true,
};

const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS);

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
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Load products asynchronously from IndexedDB
  useEffect(() => {
    dbGet<Product[]>('shopify_store_products').then((saved) => {
      if (saved && saved.length > 0) {
        setProducts(saved);
      }
    });
  }, []);

  // Save products asynchronously to IndexedDB (supports unlimited feed size)
  useEffect(() => {
    dbSet('shopify_store_products', products);
  }, [products]);

  // Sync analytics config and re-initialize tracking
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

  // Track product view when detail modal opens
  useEffect(() => {
    if (selectedProduct) {
      trackViewItem(selectedProduct, analyticsConfig);
    }
  }, [selectedProduct]);

  const uploadCsv = async (csvContent: string): Promise<{ count: number }> => {
    const parsed = await parseShopifyCsv(csvContent);
    if (!parsed || parsed.length === 0) {
      throw new Error('У файлі не знайдено валідних товарів Shopify');
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
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, selectedVariant: variantTitle }];
    });
    trackAddToCart(product, quantity, analyticsConfig);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const openQuickOrder = (product: Product) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
    trackBeginCheckout([{ product, quantity: 1 }], product.price);
  };

  const openCartCheckout = () => {
    if (cart.length === 0) return;
    setCheckoutProduct(null);
    setIsCartDrawerOpen(false);
    setIsCheckoutOpen(true);
    const total = cart.reduce((acc, i) => acc + i.product.price * i.quantity, 0);
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
  }): Promise<{ success: boolean }> => {
    const itemsToOrder: CartItem[] = checkoutProduct
      ? [{ product: checkoutProduct, quantity: 1, selectedVariant: checkoutProduct.variants[0]?.title }]
      : cart;

    const total = itemsToOrder.reduce((acc, i) => acc + i.product.price * i.quantity, 0);

    const fullOrder: OrderDetails = {
      ...details,
      items: itemsToOrder,
      total,
    };

    // 1. Google Ads Enhanced Conversions + GA4 purchase
    trackPurchase(fullOrder, analyticsConfig);

    // 2. Telegram order notification
    if (analyticsConfig.telegramBotToken && analyticsConfig.telegramChatId) {
      sendTelegramOrderNotification(
        fullOrder,
        analyticsConfig.telegramBotToken,
        analyticsConfig.telegramChatId
      ).catch((err) => console.warn('Telegram send failed', err));
    }

    // 3. Save order history in localStorage for admin
    try {
      const history = JSON.parse(localStorage.getItem('shopify_store_orders') || '[]');
      history.unshift({
        ...fullOrder,
        id: `ORD-${Date.now()}`,
        date: new Date().toLocaleString('uk-UA'),
      });
      localStorage.setItem('shopify_store_orders', JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn('Failed saving order history', e);
    }

    if (!checkoutProduct) {
      clearCart();
    }
    setCheckoutProduct(null);

    return { success: true };
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        analyticsConfig,
        cart,
        selectedProduct,
        isCheckoutOpen,
        checkoutProduct,
        isAdminOpen,
        isCartDrawerOpen,
        setSelectedProduct,
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
