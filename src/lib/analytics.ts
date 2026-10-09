import { AnalyticsConfig, Product, OrderDetails, CartItem } from '../types';
import { getItemId, findVariant } from './ids';
import { normalizeUaPhoneForAnalytics } from './formatters';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    __tagsInit?: boolean;
    __ANALYTICS_DEBUG__?: boolean;
  }
}

export interface AnalyticsEventLog {
  id: string;
  timestamp: string;
  eventName: string;
  platform: 'Google Analytics' | 'Google Ads' | 'DataLayer' | 'System';
  payload: Record<string, any>;
}

let eventListeners: ((event: AnalyticsEventLog) => void)[] = [];
export const eventHistory: AnalyticsEventLog[] = [];

export function subscribeToAnalytics(listener: (event: AnalyticsEventLog) => void) {
  eventListeners.push(listener);
  return () => {
    eventListeners = eventListeners.filter((l) => l !== listener);
  };
}

export function logEvent(
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

  if (typeof window !== 'undefined' && window.__ANALYTICS_DEBUG__) {
    console.log(`[Analytics: ${platform}] ${eventName}:`, payload);
  }
}

/**
 * Maps a product or cart line to GA4 E-commerce Item specification
 * Guarantees that item_id strictly matches <g:id> in Google Merchant Center!
 */
export function toGaItem(
  line: { product: Product; quantity?: number; selectedVariant?: string },
  index = 0
) {
  const p = line.product;
  const v = findVariant(p, line.selectedVariant);
  const price = v?.price ?? p.price;
  const qty = line.quantity ?? 1;

  return {
    item_id: getItemId(p, line.selectedVariant),
    item_name: p.title,
    item_brand: p.vendor || 'ШопінгМаркет',
    item_category: p.productType || 'Товари',
    item_variant: v && v.title !== 'Default Title' ? v.title : undefined,
    price,
    quantity: qty,
    index,
    discount:
      v?.compareAtPrice && v.compareAtPrice > price
        ? parseFloat((v.compareAtPrice - price).toFixed(2))
        : undefined,
    google_business_vertical: 'retail', // Google Ads Dynamic Remarketing
  };
}

/**
 * SHA-256 hasher for Google Ads Enhanced Conversions
 */
async function sha256(value: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    return value;
  }
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function setEnhancedUserData(phone?: string, city?: string) {
  if (!window.gtag) return;
  const normalizedPhone = phone ? normalizeUaPhoneForAnalytics(phone) : '';
  const userData: Record<string, any> = {
    address: {
      city: city || 'Київ',
      country: 'UA',
    },
  };

  if (normalizedPhone) {
    userData.sha256_phone_number = await sha256(normalizedPhone);
    userData.phone_number = normalizedPhone;
  }

  window.gtag('set', 'user_data', userData);
  logEvent('set_user_data (Enhanced Conversions)', 'Google Ads', userData);
}

/**
 * Initializes Google Analytics / Google Ads tags once without duplicate pageviews
 */
export function initializeTracking(config: AnalyticsConfig) {
  if (typeof window === 'undefined') return;

  const targetId = config.googleAdsId || config.gaMeasurementId;
  window.__ANALYTICS_DEBUG__ = config.debugMode;

  if (window.__tagsInit) return;
  window.__tagsInit = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  // Google Consent Mode v2 setup
  window.gtag('consent', 'default', {
    ad_storage: 'granted',
    ad_user_data: 'granted',
    ad_personalization: 'granted',
    analytics_storage: 'granted',
  });

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
      window.gtag('config', config.googleAdsId, {
        allow_enhanced_conversions: true,
      });
      logEvent('config', 'Google Ads', { id: config.googleAdsId, allow_enhanced_conversions: true });
    }
  }

  // Google Merchant Center verification tag
  if (config.merchantCenterTag) {
    const existingMeta = document.getElementById('gmc-verification-meta');
    if (existingMeta) existingMeta.remove();

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

export function trackViewItem(product: Product, selectedVariant?: string) {
  const item = toGaItem({ product, selectedVariant });
  const payload = {
    currency: 'UAH',
    value: item.price,
    items: [item],
  };

  if (window.gtag) {
    window.gtag('event', 'view_item', payload);
  }
  logEvent('view_item', 'Google Analytics', payload);
}

export function trackAddToCart(product: Product, quantity = 1, selectedVariant?: string) {
  const item = toGaItem({ product, quantity, selectedVariant });
  const payload = {
    currency: 'UAH',
    value: item.price * quantity,
    items: [item],
  };

  if (window.gtag) {
    window.gtag('event', 'add_to_cart', payload);
  }
  logEvent('add_to_cart', 'Google Analytics', payload);
}

export function trackRemoveFromCart(product: Product, quantity = 1, selectedVariant?: string) {
  const item = toGaItem({ product, quantity, selectedVariant });
  const payload = {
    currency: 'UAH',
    value: item.price * quantity,
    items: [item],
  };

  if (window.gtag) {
    window.gtag('event', 'remove_from_cart', payload);
  }
  logEvent('remove_from_cart', 'Google Analytics', payload);
}

export function trackBeginCheckout(items: CartItem[], total: number) {
  const payload = {
    currency: 'UAH',
    value: total,
    items: items.map((i, idx) => toGaItem(i, idx)),
  };

  if (window.gtag) {
    window.gtag('event', 'begin_checkout', payload);
  }
  logEvent('begin_checkout', 'Google Analytics', payload);
}

/**
 * Purchases tracking with deduplication, Enhanced Conversions, and single Order ID
 */
export async function trackPurchase(
  order: OrderDetails & { orderId: string },
  config: AnalyticsConfig
) {
  const transactionId = order.orderId;

  // Deduplication check
  try {
    const sent: string[] = JSON.parse(sessionStorage.getItem('ga_sent_tx') || '[]');
    if (sent.includes(transactionId)) return;
    sessionStorage.setItem('ga_sent_tx', JSON.stringify([...sent, transactionId].slice(-25)));
  } catch {
    // sessionStorage not available
  }

  // 1. Google Ads Enhanced Conversions
  if (config.googleAdsId) {
    await setEnhancedUserData(order.phone, order.city);
  }

  // 2. GA4 Purchase event
  const gaPayload = {
    transaction_id: transactionId,
    value: order.total,
    currency: 'UAH',
    tax: 0,
    shipping: 0,
    items: order.items.map((i, idx) => toGaItem(i, idx)),
  };

  if (window.gtag) {
    window.gtag('event', 'purchase', gaPayload);
  }
  logEvent('purchase', 'Google Analytics', gaPayload);

  // 3. Google Ads Conversion event
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
}
