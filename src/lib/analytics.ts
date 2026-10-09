import { AnalyticsConfig, Product, OrderDetails } from '../types';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

export interface AnalyticsEventLog {
  id: string;
  timestamp: string;
  eventName: string;
  platform: 'Google Analytics' | 'Google Ads' | 'DataLayer' | 'System';
  payload: Record<string, any>;
}

// In-memory or subscriber-based debug event history
let eventListeners: ((event: AnalyticsEventLog) => void)[] = [];
export const eventHistory: AnalyticsEventLog[] = [];

export function subscribeToAnalytics(listener: (event: AnalyticsEventLog) => void) {
  eventListeners.push(listener);
  return () => {
    eventListeners = eventListeners.filter((l) => l !== listener);
  };
}

function logEvent(
  eventName: string,
  platform: 'Google Analytics' | 'Google Ads' | 'DataLayer' | 'System',
  payload: Record<string, any>
) {
  const item: AnalyticsEventLog = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toLocaleTimeString('uk-UA'),
    eventName,
    platform,
    payload,
  };
  eventHistory.unshift(item);
  if (eventHistory.length > 50) eventHistory.pop();
  eventListeners.forEach((fn) => fn(item));

  if (typeof window !== 'undefined' && (window as any).__ANALYTICS_DEBUG__) {
    console.log(`[Analytics: ${platform}] ${eventName}:`, payload);
  }
}

/**
 * Injects Google Tags (gtag.js) dynamically based on user settings
 */
export function initializeTracking(config: AnalyticsConfig) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  (window as any).__ANALYTICS_DEBUG__ = config.debugMode;

  const targetId = config.googleAdsId || config.gaMeasurementId;

  // Remove previously injected scripts if any
  const oldScript = document.getElementById('dynamic-gtag-script');
  if (oldScript) oldScript.remove();

  if (targetId) {
    const script = document.createElement('script');
    script.id = 'dynamic-gtag-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${targetId}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());

    if (config.gaMeasurementId) {
      window.gtag('config', config.gaMeasurementId, {
        send_page_view: true,
      });
      logEvent('config', 'Google Analytics', { id: config.gaMeasurementId });
    }

    if (config.googleAdsId) {
      window.gtag('config', config.googleAdsId);
      logEvent('config', 'Google Ads', { id: config.googleAdsId });
    }
  }

  // Handle Merchant Center verification tag
  if (config.merchantCenterTag) {
    const existingMeta = document.getElementById('gmc-verification-meta');
    if (existingMeta) existingMeta.remove();

    // Check if user entered full meta tag or just the verification code
    const tagMatch = config.merchantCenterTag.match(/content=["']([^"']+)["']/i);
    const content = tagMatch ? tagMatch[1] : config.merchantCenterTag.replace(/<[^>]+>/g, '').trim();

    if (content) {
      const meta = document.createElement('meta');
      meta.id = 'gmc-verification-meta';
      meta.name = 'google-site-verification';
      meta.content = content;
      document.head.appendChild(meta);
      logEvent('site_verification_added', 'System', { content });
    }
  }
}

/**
 * Track Product View (GA4 view_item)
 */
export function trackViewItem(product: Product, _config?: AnalyticsConfig) {
  const payload = {
    currency: 'UAH',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.title,
        item_category: product.productType,
        price: product.price,
        quantity: 1,
      },
    ],
  };

  if (window.gtag) {
    window.gtag('event', 'view_item', payload);
  }
  logEvent('view_item', 'Google Analytics', payload);
}

/**
 * Track Add To Cart (GA4 add_to_cart)
 */
export function trackAddToCart(product: Product, quantity = 1, _config?: AnalyticsConfig) {
  const payload = {
    currency: 'UAH',
    value: product.price * quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.title,
        item_category: product.productType,
        price: product.price,
        quantity,
      },
    ],
  };

  if (window.gtag) {
    window.gtag('event', 'add_to_cart', payload);
  }
  logEvent('add_to_cart', 'Google Analytics', payload);
}

/**
 * Track Begin Checkout (GA4 begin_checkout)
 */
export function trackBeginCheckout(items: { product: Product; quantity: number }[], total: number) {
  const payload = {
    currency: 'UAH',
    value: total,
    items: items.map((i) => ({
      item_id: i.product.id,
      item_name: i.product.title,
      price: i.product.price,
      quantity: i.quantity,
    })),
  };

  if (window.gtag) {
    window.gtag('event', 'begin_checkout', payload);
  }
  logEvent('begin_checkout', 'Google Analytics', payload);
}

/**
 * Track Purchase & Google Ads Conversion
 */
export function trackPurchase(order: OrderDetails, config: AnalyticsConfig) {
  const transactionId = `ORD-${Date.now()}`;

  // 1. GA4 Purchase
  const gaPayload = {
    transaction_id: transactionId,
    value: order.total,
    currency: 'UAH',
    tax: 0,
    shipping: 0,
    items: order.items.map((i) => ({
      item_id: i.product.id,
      item_name: i.product.title,
      price: i.product.price,
      quantity: i.quantity,
    })),
  };

  if (window.gtag) {
    window.gtag('event', 'purchase', gaPayload);
  }
  logEvent('purchase', 'Google Analytics', gaPayload);

  // 2. Google Ads Conversion
  if (config.googleAdsId && config.googleAdsConversionLabel) {
    const sendTo = `${config.googleAdsId}/${config.googleAdsConversionLabel}`;
    const gadsPayload = {
      send_to: sendTo,
      value: order.total,
      currency: 'UAH',
      transaction_id: transactionId,
    };

    if (window.gtag) {
      window.gtag('event', 'conversion', gadsPayload);
    }
    logEvent('conversion', 'Google Ads', gadsPayload);
  }

  // 3. Generic DataLayer push
  if (window.dataLayer) {
    window.dataLayer.push({
      event: 'ecommerce_purchase',
      ecommerce: gaPayload,
    });
    logEvent('ecommerce_purchase', 'DataLayer', { transactionId, total: order.total });
  }
}
