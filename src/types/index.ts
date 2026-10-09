export interface Product {
  id: string;
  handle: string;
  title: string;
  bodyHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  price: number;
  compareAtPrice?: number;
  images: string[];
  featuredImage: string;
  available: boolean;
  sku?: string;
  barcode?: string;
  variants: {
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    sku?: string;
  }[];
}

export interface AnalyticsConfig {
  gaMeasurementId: string; // e.g. G-XXXXXXXXXX
  googleAdsId: string; // e.g. AW-XXXXXXXXX
  googleAdsConversionLabel: string; // e.g. AbC123XyZ
  merchantCenterTag: string; // e.g. <meta name="google-site-verification" content="..." />
  gtmId: string; // e.g. GTM-XXXXXXX
  fbPixelId: string; // e.g. 123456789012345
  telegramBotToken: string; // Telegram bot token for instant order leads
  telegramChatId: string; // Telegram chat ID
  novaPoshtaApiKey: string; // Optional Nova Poshta API key
  debugMode: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export interface OrderDetails {
  orderId?: string;
  name: string;
  phone: string;
  city: string;
  warehouse: string;
  deliveryMethod: 'nova_poshta' | 'ukrposhta' | 'courier';
  paymentMethod: 'cash_on_delivery' | 'card';
  notes?: string;
  items: CartItem[];
  total: number;
  website?: string;
  elapsedMs?: number;
}

export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';

export interface StoredOrder extends OrderDetails {
  id: string;
  orderId: string;
  date: string;
  createdAt: number;
  status: OrderStatus;
  syncedToTelegram?: boolean;
}

export interface CsvPreviewResult {
  totalRows: number;
  validProducts: Product[];
  invalidPriceCount: number;
  missingImageCount: number;
  categories: string[];
  filename?: string;
  fileSizeBytes?: number;
}


