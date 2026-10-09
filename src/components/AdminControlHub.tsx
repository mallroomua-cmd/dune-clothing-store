import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

import {
  X,
  Upload,
  Settings2,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RotateCcw,
  Download,
  Terminal,
  ShoppingBag,
  ShieldCheck,
  Play,
  Send,
  FileCode,
  FileJson,
  Package,
  Search,
  Plus,
  Trash2,
  Edit3,
  Phone,
  MessageSquare,
  RefreshCw,
  Eye,
  Check,
  AlertTriangle,
  Database,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, OrderStatus, StoredOrder, CsvPreviewResult } from '../types';
import { SAMPLE_SHOPIFY_CSV } from '../lib/sample-data';
import {
  eventHistory,
  subscribeToAnalytics,
  AnalyticsEventLog,
  trackPurchase,
  trackAddToCart,
  trackBeginCheckout,
} from '../lib/analytics';
import { downloadGoogleMerchantXml } from '../lib/merchant-xml';
import { sendTelegramOrderNotification } from '../lib/telegram';
import {
  readCsvFileWithEncoding,
  validateCsvPreview,
  downloadShopifyCsv,
} from '../lib/shopify-parser';
import { normalizeUaPhoneForAnalytics } from '../lib/formatters';
import { useModal } from '../hooks/useModal';


export const AdminControlHub: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    products,
    uploadCsv,
    resetToDemo,
    updateProduct,
    addProduct,
    deleteProduct,
    orders,
    outboxCount,
    updateOrderStatus,
    deleteOrder,
    clearOrders,
    retryTelegramNotification,
    flushPendingOutbox,
    analyticsConfig,
    updateAnalyticsConfig,
  } = useStore();

  const handleClose = useCallback(() => {
    setIsAdminOpen(false);
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [setIsAdminOpen]);
  useModal(isAdminOpen, handleClose);

  // Active Hub Tab
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'settings' | 'feed' | 'marketing'>('products');

  // PIN Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('shopify_admin_authed') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [storedPin, setStoredPin] = useState(() => {
    return localStorage.getItem('shopify_admin_pin') || (import.meta.env.VITE_ADMIN_PIN as string) || '1234';
  });
  const [newPin, setNewPin] = useState('');
  const [pinNotice, setPinNotice] = useState(false);

  // Module 1: Feed state
  const [dragActive, setDragActive] = useState(false);
  const [csvPreview, setCsvPreview] = useState<CsvPreviewResult | null>(null);
  const [pendingCsvString, setPendingCsvString] = useState<string | null>(null);
  const [isApplyingFeed, setIsApplyingFeed] = useState(false);
  const [feedSuccess, setFeedSuccess] = useState<string | null>(null);
  const [feedError, setFeedError] = useState<string | null>(null);

  // Module 2: Products Manager state
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK'>('ALL');
  const [sortBy, setSortBy] = useState<'DEFAULT' | 'PRICE_ASC' | 'PRICE_DESC' | 'TITLE_ASC'>('DEFAULT');

  // Inline edit state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState<number>(0);
  const [comparePriceInput, setComparePriceInput] = useState<number | undefined>(undefined);

  // Add / Edit Product Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<{
    title: string;
    handle: string;
    price: number;
    compareAtPrice: number | undefined;
    productType: string;
    vendor: string;
    available: boolean;
    featuredImage: string;
    images: string;
    tags: string;
    bodyHtml: string;
    sku: string;
  }>({
    title: '',
    handle: '',
    price: 0,
    compareAtPrice: undefined,
    productType: 'Загальне',
    vendor: 'ШопінгМаркет',
    available: true,
    featuredImage: '',
    images: '',
    tags: '',
    bodyHtml: '',
    sku: '',
  });

  // Tag Quick Adder Popover
  const [quickTagProductId, setQuickTagProductId] = useState<string | null>(null);
  const [newTagInput, setNewTagInput] = useState('');

  // Module 3: Orders Manager state
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<StoredOrder | null>(null);
  const [isFlushingOutbox, setIsFlushingOutbox] = useState(false);
  const [outboxFeedback, setOutboxFeedback] = useState<string | null>(null);

  // Module 4: Marketing & Integrations state
  const [gaId, setGaId] = useState(analyticsConfig.gaMeasurementId);
  const [gadsId, setGadsId] = useState(analyticsConfig.googleAdsId);
  const [gadsLabel, setGadsLabel] = useState(analyticsConfig.googleAdsConversionLabel);
  const [fbPixelId, setFbPixelId] = useState(analyticsConfig.fbPixelId || '');
  const [gmcTag, setGmcTag] = useState(analyticsConfig.merchantCenterTag);
  const [gtmId, setGtmId] = useState(analyticsConfig.gtmId);
  const [tgToken, setTgToken] = useState(analyticsConfig.telegramBotToken);
  const [tgChatId, setTgChatId] = useState(analyticsConfig.telegramChatId);
  const [npKey, setNpKey] = useState(analyticsConfig.novaPoshtaApiKey);
  const [marketingSavedNotice, setMarketingSavedNotice] = useState(false);
  const [tgTestResult, setTgTestResult] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });

  // Live Debugger logs
  const [logs, setLogs] = useState<AnalyticsEventLog[]>([]);
  const [logFilterPlatform, setLogFilterPlatform] = useState<string>('ALL');

  // Search input ref for keyboard shortcut
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setGaId(analyticsConfig.gaMeasurementId);
    setGadsId(analyticsConfig.googleAdsId);
    setGadsLabel(analyticsConfig.googleAdsConversionLabel);
    setFbPixelId(analyticsConfig.fbPixelId || '');
    setGmcTag(analyticsConfig.merchantCenterTag);
    setGtmId(analyticsConfig.gtmId);
    setTgToken(analyticsConfig.telegramBotToken);
    setTgChatId(analyticsConfig.telegramChatId);
    setNpKey(analyticsConfig.novaPoshtaApiKey);
  }, [analyticsConfig]);

  useEffect(() => {
    setLogs([...eventHistory]);
    const unsub = subscribeToAnalytics((newEvent) => {
      setLogs((prev) => [newEvent, ...prev.slice(0, 70)]);
    });
    return unsub;
  }, []);

  // Keyboard shortcut: Press '/' to focus product search when in products tab
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isAdminOpen) return;
      if (e.key === '/' && activeTab === 'products' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAdminOpen, activeTab]);

  // --- Auth Handlers ---
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === storedPin.trim()) {
      setIsAuthenticated(true);
      sessionStorage.setItem('shopify_admin_authed', 'true');
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
    }
  };

  const handleUpdatePin = () => {
    if (newPin.trim().length >= 4) {
      localStorage.setItem('shopify_admin_pin', newPin.trim());
      setStoredPin(newPin.trim());
      setNewPin('');
      setPinNotice(true);
      setTimeout(() => setPinNotice(false), 2500);
    }
  };

  // --- Module 1: Feed Handlers ---
  const handleFileProcess = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setFeedError('Будь ласка, оберіть файл у форматі .csv');
      return;
    }

    setFeedError(null);
    setFeedSuccess(null);
    try {
      const text = await readCsvFileWithEncoding(file);
      const preview = await validateCsvPreview(text, file.name, file.size);
      if (preview.validProducts.length === 0) {
        throw new Error('У файлі не знайдено валідних активних товарів Shopify');
      }
      setPendingCsvString(text);
      setCsvPreview(preview);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Помилка зчитування CSV файлу';
      setFeedError(msg);
    }
  };

  const handleApplyCsvFeed = async () => {
    if (!pendingCsvString) return;
    setIsApplyingFeed(true);
    setFeedError(null);
    try {
      const res = await uploadCsv(pendingCsvString);
      setFeedSuccess(`Успішно імпортовано та збережено в IndexedDB: ${res.count} товарів!`);
      setCsvPreview(null);
      setPendingCsvString(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Помилка імпорту каталогу';
      setFeedError(msg);
    } finally {
      setIsApplyingFeed(false);
    }
  };

  const handleCancelPreview = () => {
    setCsvPreview(null);
    setPendingCsvString(null);
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_SHOPIFY_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'shopify_products_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(products, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'catalog.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Module 2: Product Management Handlers ---
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.productType) set.add(p.productType);
    });
    return Array.from(set);
  }, [products]);

  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (productSearch.trim()) {
      const query = productSearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.vendor.toLowerCase().includes(query) ||
          (p.sku && p.sku.toLowerCase().includes(query)) ||
          p.tags.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (categoryFilter !== 'ALL') {
      list = list.filter((p) => p.productType === categoryFilter);
    }

    if (stockFilter === 'IN_STOCK') {
      list = list.filter((p) => p.available);
    } else if (stockFilter === 'OUT_OF_STOCK') {
      list = list.filter((p) => !p.available);
    }

    if (sortBy === 'PRICE_ASC') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PRICE_DESC') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'TITLE_ASC') {
      list.sort((a, b) => a.title.localeCompare(b.title, 'uk'));
    }

    return list;
  }, [products, productSearch, categoryFilter, stockFilter, sortBy]);

  const handleStartInlineEdit = (p: Product) => {
    setEditingPriceId(p.id);
    setPriceInput(p.price);
    setComparePriceInput(p.compareAtPrice);
  };

  const handleSaveInlineEdit = async (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    if (priceInput <= 0) return;

    const updated: Product = {
      ...target,
      price: priceInput,
      compareAtPrice: comparePriceInput && comparePriceInput > priceInput ? comparePriceInput : undefined,
      variants: target.variants.map((v) => ({
        ...v,
        price: priceInput,
        compareAtPrice: comparePriceInput && comparePriceInput > priceInput ? comparePriceInput : undefined,
      })),
    };

    await updateProduct(updated);
    setEditingPriceId(null);
  };

  const handleToggleStock = async (product: Product) => {
    const updated: Product = {
      ...product,
      available: !product.available,
    };
    await updateProduct(updated);
  };

  const handleRemoveTag = async (product: Product, tagToRemove: string) => {
    const updated: Product = {
      ...product,
      tags: product.tags.filter((t) => t !== tagToRemove),
    };
    await updateProduct(updated);
  };

  const handleAddTag = async (product: Product, tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed || product.tags.includes(trimmed)) return;
    const updated: Product = {
      ...product,
      tags: [...product.tags, trimmed],
    };
    await updateProduct(updated);
    setNewTagInput('');
    setQuickTagProductId(null);
  };

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProductFormData({
      title: '',
      handle: '',
      price: 990,
      compareAtPrice: undefined,
      productType: allCategories[0] || 'Товари',
      vendor: 'ШопінгМаркет',
      available: true,
      featuredImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      images: '',
      tags: 'Новинка',
      bodyHtml: '<p>Опис товару</p>',
      sku: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (p: Product) => {
    setEditingProduct(p);
    setProductFormData({
      title: p.title,
      handle: p.handle,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      productType: p.productType,
      vendor: p.vendor,
      available: p.available,
      featuredImage: p.featuredImage,
      images: p.images.join(', '),
      tags: p.tags.join(', '),
      bodyHtml: p.bodyHtml,
      sku: p.sku || '',
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProductModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.title.trim() || productFormData.price <= 0) return;

    const extraImages = productFormData.images
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const allImages = Array.from(new Set([productFormData.featuredImage.trim(), ...extraImages].filter(Boolean)));
    const tagsArray = productFormData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const handle =
      productFormData.handle.trim() ||
      productFormData.title
        .toLowerCase()
        .replace(/[^a-z0-9а-яіїєґ]+/g, '-')
        .replace(/^-+|-+$/g, '') ||
      `prod-${Date.now()}`;

    if (editingProduct) {
      const updated: Product = {
        ...editingProduct,
        title: productFormData.title.trim(),
        handle,
        price: productFormData.price,
        compareAtPrice:
          productFormData.compareAtPrice && productFormData.compareAtPrice > productFormData.price
            ? productFormData.compareAtPrice
            : undefined,
        productType: productFormData.productType.trim() || 'Загальне',
        vendor: productFormData.vendor.trim() || 'ШопінгМаркет',
        available: productFormData.available,
        featuredImage: productFormData.featuredImage.trim() || allImages[0] || '',
        images: allImages.length > 0 ? allImages : [productFormData.featuredImage.trim()],
        tags: tagsArray,
        bodyHtml: productFormData.bodyHtml,
        sku: productFormData.sku.trim(),
        variants: editingProduct.variants.length > 0
          ? editingProduct.variants.map((v) => ({ ...v, price: productFormData.price }))
          : [{ id: `var-${handle}-0`, title: 'Default Title', price: productFormData.price }],
      };
      await updateProduct(updated);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        handle,
        title: productFormData.title.trim(),
        price: productFormData.price,
        compareAtPrice:
          productFormData.compareAtPrice && productFormData.compareAtPrice > productFormData.price
            ? productFormData.compareAtPrice
            : undefined,
        productType: productFormData.productType.trim() || 'Загальне',
        vendor: productFormData.vendor.trim() || 'ШопінгМаркет',
        available: productFormData.available,
        featuredImage: productFormData.featuredImage.trim() || allImages[0] || '',
        images: allImages.length > 0 ? allImages : [productFormData.featuredImage.trim()],
        tags: tagsArray,
        bodyHtml: productFormData.bodyHtml,
        sku: productFormData.sku.trim(),
        variants: [{ id: `var-${handle}-0`, title: 'Default Title', price: productFormData.price }],
      };
      await addProduct(newProd);
    }

    setIsProductModalOpen(false);
  };

  // --- Module 3: Orders Handlers ---
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.orderId.toLowerCase().includes(q) ||
          o.name.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          o.city.toLowerCase().includes(q) ||
          o.warehouse.toLowerCase().includes(q)
      );
    }

    if (orderStatusFilter !== 'ALL') {
      list = list.filter((o) => o.status === orderStatusFilter);
    }

    return list;
  }, [orders, orderSearch, orderStatusFilter]);

  const ordersKpi = useMemo(() => {
    const totalCount = orders.length;
    const newCount = orders.filter((o) => o.status === 'new').length;
    const totalSum = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    return { totalCount, newCount, totalSum };
  }, [orders]);

  const handleFlushOutboxClick = async () => {
    setIsFlushingOutbox(true);
    setOutboxFeedback(null);
    try {
      const res = await flushPendingOutbox();
      setOutboxFeedback(`Синхронізація завершена: надіслано ${res.sent}, залишилось ${res.remaining}`);
    } catch {
      setOutboxFeedback('Помилка синхронізації з чергою');
    } finally {
      setIsFlushingOutbox(false);
      setTimeout(() => setOutboxFeedback(null), 4000);
    }
  };

  const handleRetryTelegramForOrder = async (orderId: string) => {
    const res = await retryTelegramNotification(orderId);
    if (res.success) {
      if (selectedOrderDetails && selectedOrderDetails.orderId === orderId) {
        setSelectedOrderDetails({ ...selectedOrderDetails, syncedToTelegram: true });
      }
      alert('✅ Замовлення успішно надіслано в Telegram!');
    } else {
      alert(`❌ Помилка: ${res.error || 'Не вдалося надіслати'}`);
    }
  };

  // --- Module 4: Marketing Handlers ---
  const handleSaveMarketing = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnalyticsConfig({
      gaMeasurementId: gaId.trim(),
      googleAdsId: gadsId.trim(),
      googleAdsConversionLabel: gadsLabel.trim(),
      fbPixelId: fbPixelId.trim(),
      merchantCenterTag: gmcTag.trim(),
      gtmId: gtmId.trim(),
      telegramBotToken: tgToken.trim(),
      telegramChatId: tgChatId.trim(),
      novaPoshtaApiKey: npKey.trim(),
    });
    setMarketingSavedNotice(true);
    setTimeout(() => setMarketingSavedNotice(false), 2500);
  };

  const handleTestTelegramOrder = async () => {
    setTgTestResult({ status: 'loading', message: 'Відправка тестового замовлення в Telegram...' });
    const dummyProduct = products[0] || {
      id: 'demo-1',
      title: 'Смарт-годинник Titanium',
      price: 1899,
      productType: 'Тест',
      tags: [],
      images: [],
      featuredImage: '',
      handle: 'demo-1',
      bodyHtml: '',
      vendor: 'Shopify',
      available: true,
      variants: [],
    };

    const res = await sendTelegramOrderNotification(
      {
        orderId: `TEST-${Date.now().toString().slice(-4)}`,
        name: 'Олександр Тестовий',
        phone: '+380991234567',
        city: 'Київ',
        warehouse: 'Відділення №1 (Тестове)',
        deliveryMethod: 'nova_poshta',
        paymentMethod: 'cash_on_delivery',
        notes: 'Тестове повідомлення з Admin Control Hub',
        items: [{ product: dummyProduct, quantity: 1 }],
        total: dummyProduct.price,
      },
      tgToken,
      tgChatId
    );

    if (res.success) {
      setTgTestResult({ status: 'success', message: '✅ Тестове замовлення успішно надіслано в Telegram!' });
    } else {
      setTgTestResult({ status: 'error', message: `❌ Помилка Telegram: ${res.error}` });
    }
  };

  const handleTestConversionEvent = () => {
    const dummyProduct = products[0] || {
      id: 'demo-1',
      title: 'Тестовий товар',
      price: 1500,
      productType: 'Тест',
      tags: [],
      images: [],
      featuredImage: '',
      handle: 'test',
      bodyHtml: '',
      vendor: 'Shop',
      available: true,
      variants: [],
    };

    void trackPurchase(
      {
        orderId: `EV-${Date.now().toString().slice(-5)}`,
        name: 'Тест Покупець',
        phone: '+380991234567',
        city: 'Київ',
        warehouse: 'Відділення 1',
        deliveryMethod: 'nova_poshta',
        paymentMethod: 'cash_on_delivery',
        items: [{ product: dummyProduct, quantity: 1 }],
        total: dummyProduct.price,
      },
      analyticsConfig
    );
  };

  const handleTestAddToCartEvent = () => {
    if (products[0]) {
      trackAddToCart(products[0], 1);
    }
  };

  const handleTestBeginCheckoutEvent = () => {
    if (products[0]) {
      trackBeginCheckout([{ product: products[0], quantity: 1 }], products[0].price);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'new':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Нове</span>;
      case 'confirmed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Підтверджено</span>;
      case 'shipped':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">Відправлено</span>;
      case 'completed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Виконано</span>;
      case 'cancelled':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">Скасовано</span>;
    }
  };

  if (!isAdminOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-md flex justify-center items-center p-2 sm:p-4 md:p-6 animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-7xl h-full max-h-[96dvh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/80 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP BAR / CONTROL HUB HEADER */}
        <header className="px-5 py-3.5 sm:px-7 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-900/30">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black font-heading tracking-tight text-white flex items-center gap-2">
                  Admin Control Hub
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    Plus Pro
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Feed Engine · Product Manager · Orders CRM · Analytics Hub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Outbox Badge Indicator */}
            {outboxCount > 0 && (
              <div
                onClick={() => setActiveTab('orders')}
                className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono animate-pulse"
                title="Очікують відправки у черзі Outbox"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Outbox: {outboxCount}</span>
              </div>
            )}

            {isAuthenticated && (
              <button
                onClick={() => {
                  sessionStorage.removeItem('shopify_admin_authed');
                  setIsAuthenticated(false);
                }}
                className="text-xs text-slate-400 hover:text-rose-400 font-semibold px-2.5 py-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Вийти
              </button>
            )}

            <button
              onClick={handleClose}
              aria-label="Закрити панель керування"
              className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* AUTHENTICATION GATE */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-4 shadow-xl">
              <ShieldCheck className="w-8 h-8 text-brand-400" />
            </div>
            <h2 className="text-xl font-black font-heading text-slate-900 mb-1">
              Вхід до Admin Control Hub
            </h2>
            <p className="text-xs text-slate-500 max-w-sm mb-6">
              Введіть PIN-код адміністратора для доступу до керування товарами, фідом та базою замовлень (за замовчуванням: 1234).
            </p>

            <form onSubmit={handlePinSubmit} className="w-full max-w-xs space-y-4">
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={10}
                  autoFocus
                  placeholder="Введіть PIN"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className={`w-full px-4 py-3 rounded-xl border text-center text-lg font-mono tracking-widest focus:outline-none transition-all ${
                    pinError
                      ? 'border-rose-400 bg-rose-50 text-rose-700 focus:ring-2 focus:ring-rose-400'
                      : 'border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 bg-white shadow-sm'
                  }`}
                />
                {pinError && (
                  <p className="text-xs text-rose-600 font-semibold mt-2">
                    Невірний PIN-код. Спробуйте ще раз (демо: 1234).
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                Увійти до панелі
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* NAVIGATION TABS (Shopify/Linear style) */}
            <nav className="flex border-b border-slate-200 px-4 sm:px-6 bg-slate-50/70 gap-1 overflow-x-auto scrollbar-none shrink-0">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'products'
                    ? 'border-brand-600 text-brand-600 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Товари ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('feed')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'feed'
                    ? 'border-brand-600 text-brand-600 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Фід & Імпорт/Експорт</span>
              </button>

              <button
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'orders'
                    ? 'border-brand-600 text-brand-600 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Замовлення ({orders.length})</span>
                {ordersKpi.newCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                )}
              </button>

              <button
                onClick={() => setActiveTab('marketing')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === 'marketing'
                    ? 'border-brand-600 text-brand-600 bg-white shadow-xs'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings2 className="w-4 h-4" />
                <span>Маркетинг & Інтеграції</span>
                {(analyticsConfig.telegramBotToken || analyticsConfig.gaMeasurementId) && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>
            </nav>

            {/* TAB CONTENT CONTAINER */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/40">
              {/* ======================================================== */}
              {/* MODULE 1: FEED ENGINE (CSV IMPORT / EXPORT / MERCHANT)    */}
              {/* ======================================================== */}
              {activeTab === 'feed' && (
                <div className="max-w-5xl mx-auto space-y-6">
                  {/* Status Banner */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm">Сховище каталогу: IndexedDB Active</h3>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <p className="text-xs text-slate-500">
                          Товари зберігаються у локальній базі браузера IndexedDB без обмежень розміру.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      <span>Товарів у базі: <strong className="text-slate-900 font-bold">{products.length}</strong></span>
                      <span>·</span>
                      <span>Категорій: <strong className="text-slate-900 font-bold">{allCategories.length}</strong></span>
                    </div>
                  </div>

                  {/* Feedback notices */}
                  {feedSuccess && (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{feedSuccess}</span>
                    </div>
                  )}

                  {feedError && (
                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{feedError}</span>
                    </div>
                  )}

                  {/* Pre-import CSV Preview Modal / Card */}
                  {csvPreview && (
                    <div className="bg-white rounded-2xl border-2 border-brand-500/60 p-5 shadow-lg space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Eye className="w-5 h-5 text-brand-600" />
                          <h3 className="font-heading font-black text-slate-900 text-base">
                            Попередній перегляд імпорту ({csvPreview.filename || 'Shopify CSV'})
                          </h3>
                        </div>
                        <button
                          onClick={handleCancelPreview}
                          className="text-xs text-slate-400 hover:text-slate-700"
                        >
                          Скасувати
                        </button>
                      </div>

                      {/* Preview Stats Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                          <span className="text-[11px] text-slate-500 uppercase block font-mono">Знайдено товарів</span>
                          <strong className="text-lg font-black text-slate-900">{csvPreview.validProducts.length}</strong>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                          <span className="text-[11px] text-slate-500 uppercase block font-mono">Валідація цін</span>
                          <strong className={`text-lg font-black ${csvPreview.invalidPriceCount === 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {csvPreview.invalidPriceCount === 0 ? '✓ Всі коректні' : `${csvPreview.invalidPriceCount} без ціни`}
                          </strong>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                          <span className="text-[11px] text-slate-500 uppercase block font-mono">Фотографії</span>
                          <strong className="text-lg font-black text-slate-900">
                            {csvPreview.validProducts.length - csvPreview.missingImageCount}/{csvPreview.validProducts.length}
                          </strong>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                          <span className="text-[11px] text-slate-500 uppercase block font-mono">Категорій</span>
                          <strong className="text-lg font-black text-slate-900">{csvPreview.categories.length}</strong>
                        </div>
                      </div>

                      {/* Sample Products Table Preview */}
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">
                          Зразок розпізнаних товарів (перші 3 з {csvPreview.validProducts.length}):
                        </h4>
                        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50 text-slate-500 font-mono border-b border-slate-200">
                              <tr>
                                <th className="p-2.5">Фото</th>
                                <th className="p-2.5">Назва товару</th>
                                <th className="p-2.5">Категорія</th>
                                <th className="p-2.5">Ціна</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {csvPreview.validProducts.slice(0, 3).map((p, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="p-2.5">
                                    <img
                                      src={p.featuredImage}
                                      alt=""
                                      className="w-8 h-8 rounded object-cover border border-slate-200"
                                    />
                                  </td>
                                  <td className="p-2.5 font-bold text-slate-900">{p.title}</td>
                                  <td className="p-2.5 text-slate-600">{p.productType}</td>
                                  <td className="p-2.5 font-bold text-brand-600">{p.price.toLocaleString('uk-UA')} ₴</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Confirm & Apply Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleCancelPreview}
                          className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          Скасувати
                        </button>
                        <button
                          type="button"
                          disabled={isApplyingFeed}
                          onClick={handleApplyCsvFeed}
                          className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                        >
                          {isApplyingFeed ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Застосувати та зберегти в IndexedDB ({csvPreview.validProducts.length} тов.)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Drag-and-Drop Area */}
                  {!csvPreview && (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileProcess(e.dataTransfer.files[0]);
                        }
                      }}
                      className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
                        dragActive
                          ? 'border-brand-600 bg-brand-50/70 scale-[0.99]'
                          : 'border-slate-300 hover:border-brand-500 bg-white'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-4 border border-brand-100 shadow-sm">
                        <Upload className="w-8 h-8" />
                      </div>

                      <h3 className="font-heading font-black text-slate-900 text-lg mb-1">
                        Перетягніть CSV файл Shopify сюди
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
                        Підтримуються будь-які експорти Shopify (UTF-8 або Windows-1251 з комами). Перед заміною каталогу ви побачите картку валідації цін та картинок.
                      </p>

                      <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95">
                        <FileSpreadsheet className="w-4 h-4 text-brand-400" />
                        <span>Обрати CSV файл з диска</span>
                        <input
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileProcess(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                    </div>
                  )}

                  {/* 1-Click Export Actions Toolbar */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Швидкий експорт та інструменти каталогу</h4>
                        <p className="text-xs text-slate-500">
                          Експорт актуальних товарів з урахуванням ваших правок ціни, наявності та тегів.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* Google Merchant XML */}
                      <button
                        onClick={() => downloadGoogleMerchantXml(products)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                      >
                        <FileCode className="w-4 h-4" />
                        <span>Експорт Google Merchant XML (1 клік)</span>
                      </button>

                      {/* Export back to CSV */}
                      <button
                        onClick={() => downloadShopifyCsv(products)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-brand-400" />
                        <span>Експорт каталогу в Shopify CSV (1 клік)</span>
                      </button>

                      {/* Export JSON */}
                      <button
                        onClick={handleExportJson}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors shadow-xs"
                      >
                        <FileJson className="w-4 h-4 text-blue-600" />
                        <span>Експорт catalog.json</span>
                      </button>

                      {/* Download sample */}
                      <button
                        onClick={handleDownloadSample}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors shadow-xs"
                      >
                        <Download className="w-4 h-4 text-slate-600" />
                        <span>Зразок Shopify CSV</span>
                      </button>

                      {/* Reset to Demo */}
                      <button
                        onClick={async () => {
                          if (confirm('Скинути всі товари до початкових демо-даних? Усі ваші зміни буде скинуто.')) {
                            await resetToDemo();
                            setFeedSuccess('Каталог успішно повернуто до початкових демо-товарів.');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 text-xs font-bold transition-colors shadow-xs ml-auto"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Скинути до демо-каталогу</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* MODULE 2: PRODUCT MANAGER (SEARCH, INLINE EDIT, ADD)      */}
              {/* ======================================================== */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {/* Toolbar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-md">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Пошук за назвою, артикулом (SKU), брендом чи тегами... (натисніть '/')"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                      />
                      {productSearch && (
                        <button
                          onClick={() => setProductSearch('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Filter & Sort Controls */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Category filter */}
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-500 text-slate-700"
                      >
                        <option value="ALL">Всі категорії ({allCategories.length})</option>
                        {allCategories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>

                      {/* Stock filter */}
                      <select
                        value={stockFilter}
                        onChange={(e) => setStockFilter(e.target.value as any)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-500 text-slate-700"
                      >
                        <option value="ALL">Вся наявність</option>
                        <option value="IN_STOCK">В наявності</option>
                        <option value="OUT_OF_STOCK">Немає в наявності</option>
                      </select>

                      {/* Sort */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-500 text-slate-700"
                      >
                        <option value="DEFAULT">Сортування: За замовчуванням</option>
                        <option value="PRICE_ASC">Ціна: від низької</option>
                        <option value="PRICE_DESC">Ціна: від високої</option>
                        <option value="TITLE_ASC">Назва: А-Я</option>
                      </select>

                      {/* Add Product Button */}
                      <button
                        type="button"
                        onClick={handleOpenAddProduct}
                        className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Додати товар</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary row */}
                  <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-mono">
                    <span>
                      Знайдено товарів: <strong className="text-slate-800">{filteredProducts.length}</strong> з {products.length}
                    </span>
                    <span>Підказка: натисніть на ціну для швидкого редагування (Inline Edit)</span>
                  </div>

                  {/* Products Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono">
                          <tr>
                            <th className="py-3 px-4 w-14">Фото</th>
                            <th className="py-3 px-4">Товар & SKU</th>
                            <th className="py-3 px-4">Категорія</th>
                            <th className="py-3 px-4 w-44">Ціна (₴)</th>
                            <th className="py-3 px-4 w-36">Наявність</th>
                            <th className="py-3 px-4">Теги / Бейджі</th>
                            <th className="py-3 px-4 text-right w-24">Дії</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map((p) => {
                              const isEditingPrice = editingPriceId === p.id;
                              return (
                                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors group">
                                  {/* Thumbnail */}
                                  <td className="py-2.5 px-4">
                                    <img
                                      src={p.featuredImage}
                                      alt={p.title}
                                      className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                                      loading="lazy"
                                    />
                                  </td>

                                  {/* Title & SKU */}
                                  <td className="py-2.5 px-4">
                                    <div className="font-bold text-slate-900 line-clamp-1 max-w-xs sm:max-w-md">
                                      {p.title}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                                      <span>SKU: {p.sku || '—'}</span>
                                      <span>·</span>
                                      <span>{p.vendor}</span>
                                    </div>
                                  </td>

                                  {/* Category */}
                                  <td className="py-2.5 px-4 whitespace-nowrap">
                                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/60">
                                      {p.productType || 'Загальне'}
                                    </span>
                                  </td>

                                  {/* Inline Price Edit */}
                                  <td className="py-2.5 px-4 whitespace-nowrap">
                                    {isEditingPrice ? (
                                      <div className="flex items-center gap-1.5">
                                        <div className="space-y-1">
                                          <input
                                            type="number"
                                            autoFocus
                                            value={priceInput}
                                            onChange={(e) => setPriceInput(parseFloat(e.target.value) || 0)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleSaveInlineEdit(p.id);
                                              if (e.key === 'Escape') setEditingPriceId(null);
                                            }}
                                            placeholder="Ціна"
                                            className="w-20 px-2 py-1 rounded border border-brand-500 font-mono text-xs focus:outline-none"
                                          />
                                          <input
                                            type="number"
                                            value={comparePriceInput || ''}
                                            onChange={(e) =>
                                              setComparePriceInput(
                                                e.target.value ? parseFloat(e.target.value) : undefined
                                              )
                                            }
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleSaveInlineEdit(p.id);
                                              if (e.key === 'Escape') setEditingPriceId(null);
                                            }}
                                            placeholder="Стара ціна"
                                            className="w-20 px-2 py-0.5 rounded border border-slate-200 font-mono text-[10px] text-slate-400 focus:outline-none block"
                                          />
                                        </div>
                                        <button
                                          onClick={() => handleSaveInlineEdit(p.id)}
                                          className="p-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white shadow-xs"
                                          title="Зберегти ціну"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => setEditingPriceId(null)}
                                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500"
                                          title="Скасувати"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <div
                                        onClick={() => handleStartInlineEdit(p)}
                                        className="cursor-pointer group-hover:bg-brand-50/50 p-1.5 rounded-lg transition-colors inline-block"
                                        title="Натисніть для редагування ціни"
                                      >
                                        <div className="flex items-center gap-1.5 font-bold font-mono text-slate-900">
                                          <span>{p.price.toLocaleString('uk-UA')} ₴</span>
                                          <Edit3 className="w-3 h-3 text-slate-300 group-hover:text-brand-600" />
                                        </div>
                                        {p.compareAtPrice && p.compareAtPrice > p.price && (
                                          <div className="text-[10px] text-slate-400 font-mono line-through">
                                            {p.compareAtPrice.toLocaleString('uk-UA')} ₴
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </td>

                                  {/* Availability toggle */}
                                  <td className="py-2.5 px-4 whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleStock(p)}
                                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border ${
                                        p.available
                                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          p.available ? 'bg-emerald-500' : 'bg-slate-400'
                                        }`}
                                      />
                                      <span>{p.available ? 'В наявності' : 'Немає'}</span>
                                    </button>
                                  </td>

                                  {/* Tags with remove & quick add */}
                                  <td className="py-2.5 px-4">
                                    <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
                                      {p.tags.map((tag) => (
                                        <span
                                          key={tag}
                                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 text-[10px] font-semibold"
                                        >
                                          <span>{tag}</span>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoveTag(p, tag)}
                                            className="text-amber-500 hover:text-rose-600"
                                            title="Видалити тег"
                                          >
                                            ✕
                                          </button>
                                        </span>
                                      ))}

                                      {/* Quick Tag Adder Popover Button */}
                                      {quickTagProductId === p.id ? (
                                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-brand-500 shadow-sm animate-fade-in">
                                          <input
                                            type="text"
                                            autoFocus
                                            placeholder="Тег..."
                                            value={newTagInput}
                                            onChange={(e) => setNewTagInput(e.target.value)}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleAddTag(p, newTagInput);
                                              if (e.key === 'Escape') setQuickTagProductId(null);
                                            }}
                                            className="w-16 text-[10px] px-1 py-0.5 border-none focus:outline-none"
                                          />
                                          <button
                                            type="button"
                                            onClick={() => handleAddTag(p, newTagInput)}
                                            className="text-brand-600 hover:text-brand-700 font-bold text-[10px]"
                                          >
                                            +
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setQuickTagProductId(null)}
                                            className="text-slate-400 hover:text-slate-600 text-[10px]"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setQuickTagProductId(p.id);
                                            setNewTagInput('');
                                          }}
                                          className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-brand-600 hover:bg-slate-100 border border-dashed border-slate-200"
                                          title="Додати тег"
                                        >
                                          + Тег
                                        </button>
                                      )}
                                    </div>
                                  </td>

                                  {/* Actions */}
                                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleOpenEditProduct(p)}
                                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                                        title="Повне редагування товару"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (confirm(`Видалити товар "${p.title}"?`)) {
                                            await deleteProduct(p.id);
                                          }
                                        }}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                        title="Видалити товар"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={7} className="py-12 text-center text-slate-400">
                                Товарів за даними фільтрами не знайдено.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Add / Edit Product Modal */}
                  {isProductModalOpen && (
                    <div
                      className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
                      onClick={() => setIsProductModalOpen(false)}
                    >
                      <div
                        className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <h3 className="font-heading font-black text-slate-900 text-base">
                            {editingProduct ? 'Редагування товару' : 'Створення нового товару'}
                          </h3>
                          <button
                            onClick={() => setIsProductModalOpen(false)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            ✕
                          </button>
                        </div>

                        <form onSubmit={handleSaveProductModal} className="space-y-4 text-xs">
                          {/* Title */}
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">Назва товару *</label>
                            <input
                              type="text"
                              required
                              value={productFormData.title}
                              onChange={(e) => setProductFormData({ ...productFormData, title: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-medium"
                              placeholder="Наприклад: Смарт-годинник Titanium Pro"
                            />
                          </div>

                          {/* Prices */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Ціна (₴) *</label>
                              <input
                                type="number"
                                required
                                min={1}
                                value={productFormData.price}
                                onChange={(e) =>
                                  setProductFormData({ ...productFormData, price: parseFloat(e.target.value) || 0 })
                                }
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Стара акційна ціна (₴)</label>
                              <input
                                type="number"
                                min={0}
                                value={productFormData.compareAtPrice || ''}
                                onChange={(e) =>
                                  setProductFormData({
                                    ...productFormData,
                                    compareAtPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                                  })
                                }
                                placeholder="Залиште порожнім, якщо немає знижки"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                              />
                            </div>
                          </div>

                          {/* Category & Vendor */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Категорія (Type)</label>
                              <input
                                type="text"
                                list="categories-datalist"
                                value={productFormData.productType}
                                onChange={(e) => setProductFormData({ ...productFormData, productType: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                              />
                              <datalist id="categories-datalist">
                                {allCategories.map((c) => (
                                  <option key={c} value={c} />
                                ))}
                              </datalist>
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Бренд / Постачальник (Vendor)</label>
                              <input
                                type="text"
                                value={productFormData.vendor}
                                onChange={(e) => setProductFormData({ ...productFormData, vendor: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                              />
                            </div>
                          </div>

                          {/* Image & Preview */}
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">Головне фото (URL)</label>
                            <div className="flex items-center gap-3">
                              <input
                                type="text"
                                required
                                value={productFormData.featuredImage}
                                onChange={(e) =>
                                  setProductFormData({ ...productFormData, featuredImage: e.target.value })
                                }
                                placeholder="https://..."
                                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                              />
                              {productFormData.featuredImage && (
                                <img
                                  src={productFormData.featuredImage}
                                  alt="Preview"
                                  className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                                />
                              )}
                            </div>
                          </div>

                          {/* Extra Images */}
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">Додаткові фото (URL через кому)</label>
                            <input
                              type="text"
                              value={productFormData.images}
                              onChange={(e) => setProductFormData({ ...productFormData, images: e.target.value })}
                              placeholder="https://image1.jpg, https://image2.jpg"
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                            />
                          </div>

                          {/* SKU & Tags */}
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Артикул (SKU)</label>
                              <input
                                type="text"
                                value={productFormData.sku}
                                onChange={(e) => setProductFormData({ ...productFormData, sku: e.target.value })}
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-bold text-slate-700">Теги (через кому)</label>
                              <input
                                type="text"
                                value={productFormData.tags}
                                onChange={(e) => setProductFormData({ ...productFormData, tags: e.target.value })}
                                placeholder="Хіт, Знижка, ТОП"
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                              />
                            </div>
                          </div>

                          {/* Stock switch */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="checkbox"
                              id="modal-available"
                              checked={productFormData.available}
                              onChange={(e) =>
                                setProductFormData({ ...productFormData, available: e.target.checked })
                              }
                              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                            />
                            <label htmlFor="modal-available" className="font-bold text-slate-700 cursor-pointer">
                              Товар є в наявності (In Stock)
                            </label>
                          </div>

                          {/* Description */}
                          <div className="space-y-1">
                            <label className="font-bold text-slate-700">Опис товару (HTML або текст)</label>
                            <textarea
                              rows={3}
                              value={productFormData.bodyHtml}
                              onChange={(e) => setProductFormData({ ...productFormData, bodyHtml: e.target.value })}
                              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500 font-mono"
                            />
                          </div>

                          {/* Modal Actions */}
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => setIsProductModalOpen(false)}
                              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >
                              Скасувати
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                            >
                              {editingProduct ? 'Зберегти зміни' : 'Створити товар'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* MODULE 3: ORDER MANAGEMENT & OUTBOX MONITOR              */}
              {/* ======================================================== */}
              {activeTab === 'orders' && (
                <div className="space-y-5">
                  {/* KPI Summary Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] text-slate-500 font-mono uppercase block">Всього замовлень</span>
                      <strong className="text-xl font-black text-slate-900 mt-1 block">
                        {ordersKpi.totalCount}
                      </strong>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] text-amber-700 font-mono uppercase block">Нові (потребують обробки)</span>
                      <strong className="text-xl font-black text-amber-600 mt-1 block">
                        {ordersKpi.newCount}
                      </strong>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <span className="text-[11px] text-slate-500 font-mono uppercase block">Загальна сума</span>
                      <strong className="text-xl font-black text-brand-600 mt-1 block">
                        {ordersKpi.totalSum.toLocaleString('uk-UA')} ₴
                      </strong>
                    </div>

                    {/* Outbox Status Card */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 font-mono uppercase block">Черга Outbox</span>
                        <span
                          className={`w-2 h-2 rounded-full ${
                            outboxCount === 0 ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <strong className="text-xl font-black text-slate-900">
                          {outboxCount} {outboxCount === 0 ? '✓' : 'очікують'}
                        </strong>
                        {outboxCount > 0 && (
                          <button
                            type="button"
                            disabled={isFlushingOutbox}
                            onClick={handleFlushOutboxClick}
                            className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                          >
                            <RefreshCw className={`w-3 h-3 ${isFlushingOutbox ? 'animate-spin' : ''}`} />
                            <span>Відправити</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Outbox Banner if pending */}
                  {outboxCount > 0 && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-xs flex items-center justify-between gap-3 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          <strong>Увага:</strong> У черзі Outbox збережено <strong>{outboxCount}</strong> замовлень, які очікують синхронізації з сервером.
                        </span>
                      </div>
                      <button
                        onClick={handleFlushOutboxClick}
                        disabled={isFlushingOutbox}
                        className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-xs"
                      >
                        <RefreshCw className={`w-3 h-3 ${isFlushingOutbox ? 'animate-spin' : ''}`} />
                        <span>Повторити відправку</span>
                      </button>
                    </div>
                  )}

                  {outboxFeedback && (
                    <div className="p-3 rounded-xl bg-slate-900 text-white text-xs font-mono text-center animate-fade-in">
                      {outboxFeedback}
                    </div>
                  )}

                  {/* Toolbar */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    {/* Search */}
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Пошук за номером, ім'ям, телефоном, містом..."
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Filter by status */}
                      <select
                        value={orderStatusFilter}
                        onChange={(e) => setOrderStatusFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-500 text-slate-700"
                      >
                        <option value="ALL">Всі статуси ({orders.length})</option>
                        <option value="new">Нові</option>
                        <option value="confirmed">Підтверджені</option>
                        <option value="shipped">Відправлені</option>
                        <option value="completed">Виконані</option>
                        <option value="cancelled">Скасовані</option>
                      </select>

                      {orders.length > 0 && (
                        <button
                          type="button"
                          onClick={async () => {
                            if (confirm('Видалити всю історію замовлень?')) {
                              await clearOrders();
                            }
                          }}
                          className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 text-xs font-bold transition-colors"
                        >
                          Очистити все
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-mono">
                          <tr>
                            <th className="py-3 px-4">Замовлення</th>
                            <th className="py-3 px-4">Клієнт & Телефон</th>
                            <th className="py-3 px-4">Місто & Відділення</th>
                            <th className="py-3 px-4">Товари</th>
                            <th className="py-3 px-4">Сума (₴)</th>
                            <th className="py-3 px-4 w-36">Статус</th>
                            <th className="py-3 px-4 w-28">Telegram</th>
                            <th className="py-3 px-4 text-right w-24">Дії</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredOrders.length > 0 ? (
                            filteredOrders.map((ord) => {
                              const cleanPhone = ord.phone ? normalizeUaPhoneForAnalytics(ord.phone).replace('+', '') : '';
                              return (
                                <tr key={ord.orderId} className="hover:bg-slate-50/60 transition-colors">
                                  {/* ID & Date */}
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <div className="font-bold font-mono text-brand-700">{ord.orderId}</div>
                                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{ord.date}</div>
                                  </td>

                                  {/* Client */}
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <div className="font-bold text-slate-900">{ord.name}</div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <a
                                        href={`tel:${ord.phone}`}
                                        className="text-brand-600 hover:underline font-mono text-[11px]"
                                      >
                                        {ord.phone}
                                      </a>
                                      {cleanPhone && (
                                        <a
                                          href={`https://t.me/+${cleanPhone}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-blue-500 hover:text-blue-700"
                                          title="Написати в Telegram"
                                        >
                                          <Send className="w-3 h-3" />
                                        </a>
                                      )}
                                    </div>
                                  </td>

                                  {/* Delivery & City */}
                                  <td className="py-3 px-4">
                                    <div className="font-medium text-slate-900">{ord.city || '—'}</div>
                                    <div className="text-[11px] text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                                      {ord.warehouse || 'Уточнюється'}
                                    </div>
                                  </td>

                                  {/* Items summary */}
                                  <td className="py-3 px-4">
                                    <div className="text-slate-800 font-medium line-clamp-1 max-w-xs">
                                      {ord.items?.[0]?.product?.title || 'Товар'}
                                      {(ord.items?.length || 0) > 1 && ` (+ще ${ord.items.length - 1})`}
                                    </div>
                                    <div className="text-[11px] text-slate-400">
                                      {ord.items?.reduce((a, b) => a + b.quantity, 0) || 1} шт.
                                    </div>
                                  </td>

                                  {/* Total & Payment */}
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <div className="font-bold font-mono text-slate-900 text-sm">
                                      {ord.total?.toLocaleString('uk-UA')} ₴
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                      {ord.paymentMethod === 'card' ? 'Оплата картою' : 'Накладений платіж'}
                                    </div>
                                  </td>

                                  {/* Status Dropdown */}
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    <select
                                      value={ord.status}
                                      onChange={(e) => updateOrderStatus(ord.orderId, e.target.value as OrderStatus)}
                                      className="text-xs font-bold py-1 px-2 rounded-lg border border-slate-200 bg-white focus:outline-none cursor-pointer"
                                    >
                                      <option value="new">🟡 Нове</option>
                                      <option value="confirmed">🔵 Підтверджено</option>
                                      <option value="shipped">🟣 Відправлено</option>
                                      <option value="completed">🟢 Виконано</option>
                                      <option value="cancelled">⚪ Скасовано</option>
                                    </select>
                                  </td>

                                  {/* Telegram status */}
                                  <td className="py-3 px-4 whitespace-nowrap">
                                    {ord.syncedToTelegram ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                        <Check className="w-3 h-3" />
                                        <span>Надіслано</span>
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => handleRetryTelegramForOrder(ord.orderId)}
                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-full border border-blue-200"
                                        title="Надіслати повторно в Telegram бот"
                                      >
                                        <Send className="w-3 h-3" />
                                        <span>Надіслати</span>
                                      </button>
                                    )}
                                  </td>

                                  {/* Actions */}
                                  <td className="py-3 px-4 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() => setSelectedOrderDetails(ord)}
                                        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        title="Переглянути деталі замовлення"
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          if (confirm(`Видалити замовлення ${ord.orderId}?`)) {
                                            await deleteOrder(ord.orderId);
                                          }
                                        }}
                                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                        title="Видалити"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={8} className="py-12 text-center text-slate-400 text-xs">
                                Замовлень поки що немає або нічого не знайдено за вашим запитом.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Order Details Modal / Card */}
                  {selectedOrderDetails && (
                    <div
                      className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
                      onClick={() => setSelectedOrderDetails(null)}
                    >
                      <div
                        className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4 text-xs font-sans"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] text-slate-400 font-mono uppercase block">Деталі замовлення</span>
                            <h3 className="font-black text-slate-900 text-lg font-mono">
                              #{selectedOrderDetails.orderId}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            {renderStatusBadge(selectedOrderDetails.status)}
                            <button
                              onClick={() => setSelectedOrderDetails(null)}
                              className="text-slate-400 hover:text-slate-600 p-1"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {/* Customer Card & 1-Click Communications */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-3">
                          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                            Контакти покупця
                          </h4>

                          <div className="grid grid-cols-2 gap-2 text-slate-700">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Ім'я:</span>
                              <strong className="text-slate-900">{selectedOrderDetails.name}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Телефон:</span>
                              <strong className="font-mono text-slate-900">{selectedOrderDetails.phone}</strong>
                            </div>
                          </div>

                          {/* 1-Click Actions: Call / Telegram / Viber */}
                          {selectedOrderDetails.phone && (
                            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-200/60">
                              <a
                                href={`tel:${selectedOrderDetails.phone}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Зателефонувати</span>
                              </a>

                              <a
                                href={`https://t.me/+${normalizeUaPhoneForAnalytics(selectedOrderDetails.phone).replace('+', '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] shadow-xs"
                              >
                                <Send className="w-3 h-3" />
                                <span>Telegram</span>
                              </a>

                              <a
                                href={`viber://chat?number=%2B${normalizeUaPhoneForAnalytics(selectedOrderDetails.phone).replace('+', '')}`}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-xs"
                              >
                                <MessageSquare className="w-3 h-3" />
                                <span>Viber</span>
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Delivery & Payment Card */}
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
                          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                            Доставка та оплата
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-slate-700">
                            <div>
                              <span className="text-slate-400 block text-[10px]">Місто:</span>
                              <strong>{selectedOrderDetails.city || 'Уточнюється'}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Служба доставки:</span>
                              <strong>
                                {selectedOrderDetails.deliveryMethod === 'nova_poshta'
                                  ? 'Нова Пошта'
                                  : selectedOrderDetails.deliveryMethod === 'ukrposhta'
                                  ? 'Укрпошта'
                                  : 'Кур’єр'}
                              </strong>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-400 block text-[10px]">Відділення / Адреса:</span>
                              <strong>{selectedOrderDetails.warehouse || 'Уточнюється'}</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Спосіб оплати:</span>
                              <strong>
                                {selectedOrderDetails.paymentMethod === 'card'
                                  ? 'Оплата карткою'
                                  : 'Накладений платіж'}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px]">Дата створення:</span>
                              <strong className="font-mono">{selectedOrderDetails.date}</strong>
                            </div>
                          </div>

                          {selectedOrderDetails.notes && (
                            <div className="pt-2 border-t border-slate-200">
                              <span className="text-slate-400 block text-[10px]">Коментар клієнта:</span>
                              <p className="italic text-slate-700">{selectedOrderDetails.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* Order Items Table */}
                        <div className="space-y-2">
                          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                            Замовлені товари
                          </h4>
                          <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono">
                                <tr>
                                  <th className="p-2">Товар</th>
                                  <th className="p-2 text-center">К-сть</th>
                                  <th className="p-2 text-right">Ціна</th>
                                  <th className="p-2 text-right">Разом</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {selectedOrderDetails.items?.map((it, idx) => (
                                  <tr key={idx}>
                                    <td className="p-2">
                                      <div className="font-bold text-slate-900">{it.product?.title}</div>
                                      {it.selectedVariant && (
                                        <div className="text-[10px] text-slate-500">Варіант: {it.selectedVariant}</div>
                                      )}
                                    </td>
                                    <td className="p-2 text-center font-mono">{it.quantity} шт.</td>
                                    <td className="p-2 text-right font-mono">
                                      {it.product?.price?.toLocaleString('uk-UA')} ₴
                                    </td>
                                    <td className="p-2 text-right font-bold font-mono">
                                      {((it.product?.price || 0) * it.quantity).toLocaleString('uk-UA')} ₴
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-900 text-white rounded-xl font-bold font-mono text-sm">
                            <span>РАЗОМ ДО СПЛАТИ:</span>
                            <span className="text-brand-400 text-base">
                              {selectedOrderDetails.total?.toLocaleString('uk-UA')} ₴
                            </span>
                          </div>
                        </div>

                        {/* Telegram re-send button */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <span>Статус Telegram:</span>
                            {selectedOrderDetails.syncedToTelegram ? (
                              <span className="text-emerald-600 font-bold">✓ Надіслано</span>
                            ) : (
                              <span className="text-amber-600 font-bold">Не надіслано</span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRetryTelegramForOrder(selectedOrderDetails.orderId)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Відправити в Telegram</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================== */}
              {/* MODULE 4: MARKETING, INTEGRATIONS & LIVE DEBUGGER         */}
              {/* ======================================================== */}
              {activeTab === 'marketing' && (
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Form */}
                  <form onSubmit={handleSaveMarketing} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="font-heading font-black text-slate-900 text-base">
                          Налаштування сповіщень та маркетингових пікселів
                        </h3>
                        <p className="text-xs text-slate-500">
                          Підключіть Telegram бота, Google Ads, GA4 та Facebook Pixel для повної автоматизації.
                        </p>
                      </div>
                    </div>

                    {/* Section 1: Telegram Bot */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-sky-600" />
                        <h4 className="font-bold text-slate-800 text-sm">Telegram Бот для замовлень</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 uppercase font-mono">
                            Telegram Bot Token
                          </label>
                          <input
                            type="text"
                            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                            value={tgToken}
                            onChange={(e) => setTgToken(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 uppercase font-mono">
                            Telegram Chat ID
                          </label>
                          <input
                            type="text"
                            placeholder="987654321 або -100123456789"
                            value={tgChatId}
                            onChange={(e) => setTgChatId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleTestTelegramOrder}
                          disabled={tgTestResult.status === 'loading'}
                          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 text-sky-600" />
                          <span>Надіслати тестове замовлення в Telegram</span>
                        </button>
                      </div>

                      {tgTestResult.message && (
                        <div
                          className={`p-3 rounded-xl text-xs font-medium ${
                            tgTestResult.status === 'success'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : tgTestResult.status === 'error'
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {tgTestResult.message}
                        </div>
                      )}
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 2: Advertising & Analytics */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-emerald-600" />
                        <h4 className="font-bold text-slate-800 text-sm">Маркетинг, Google Ads та Facebook Pixel</h4>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* GA4 */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 uppercase font-mono">
                            Google Analytics 4 (Measurement ID)
                          </label>
                          <input
                            type="text"
                            placeholder="G-XXXXXXXXXX"
                            value={gaId}
                            onChange={(e) => setGaId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                          />
                        </div>

                        {/* Facebook Pixel */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 uppercase font-mono">
                            Facebook Pixel (ID)
                          </label>
                          <input
                            type="text"
                            placeholder="123456789012345"
                            value={fbPixelId}
                            onChange={(e) => setFbPixelId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                          />
                        </div>

                        {/* Google Ads ID */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 uppercase font-mono">
                            Google Ads ID
                          </label>
                          <input
                            type="text"
                            placeholder="AW-XXXXXXXXX"
                            value={gadsId}
                            onChange={(e) => setGadsId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                          />
                        </div>

                        {/* Google Ads Label */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700 uppercase font-mono">
                            Мітка конверсії (Conversion Label)
                          </label>
                          <input
                            type="text"
                            placeholder="AbCdEf123456"
                            value={gadsLabel}
                            onChange={(e) => setGadsLabel(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                          />
                        </div>
                      </div>

                      {/* GMC Verification tag */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700 uppercase font-mono">
                          Google Merchant Center (Підтвердження власності сайту meta-тег)
                        </label>
                        <input
                          type="text"
                          placeholder='<meta name="google-site-verification" content="..." />'
                          value={gmcTag}
                          onChange={(e) => setGmcTag(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Зберегти налаштування інтеграцій</span>
                      </button>
                    </div>

                    {marketingSavedNotice && (
                      <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold text-center border border-emerald-200 animate-fade-in">
                        ✅ Налаштування маркетингу та бота успішно збережено!
                      </div>
                    )}

                    {/* Section 3: Security & PIN change */}
                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wide">
                        Безпека: Зміна PIN-коду панелі
                      </h4>
                      <div className="flex gap-2">
                        <input
                          type="password"
                          maxLength={10}
                          placeholder="Новий PIN (мін. 4 цифри)"
                          value={newPin}
                          onChange={(e) => setNewPin(e.target.value)}
                          className="w-48 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500"
                        />
                        <button
                          type="button"
                          onClick={handleUpdatePin}
                          className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
                        >
                          Змінити PIN
                        </button>
                      </div>
                      {pinNotice && (
                        <p className="text-xs text-emerald-600 font-bold mt-1">✓ PIN-код успішно оновлено!</p>
                      )}
                    </div>
                  </form>

                  {/* Section 4: Live Event Debugger */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-slate-700" />
                          <h4 className="font-bold text-slate-900 text-sm">Live-лог подій аналітики</h4>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <p className="text-xs text-slate-500">
                          Події фіксуються в реальному часі (add_to_cart, begin_checkout, purchase)
                        </p>
                      </div>

                      {/* Quick Event Trigger Buttons */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={handleTestAddToCartEvent}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                        >
                          + add_to_cart
                        </button>
                        <button
                          type="button"
                          onClick={handleTestBeginCheckoutEvent}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                        >
                          + begin_checkout
                        </button>
                        <button
                          type="button"
                          onClick={handleTestConversionEvent}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors"
                        >
                          + purchase (конверсія)
                        </button>
                      </div>
                    </div>

                    {/* Filter logs by platform */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-mono">Фільтр:</span>
                      {['ALL', 'Google Analytics', 'Google Ads', 'Facebook Pixel', 'System'].map((plt) => (
                        <button
                          key={plt}
                          onClick={() => setLogFilterPlatform(plt)}
                          className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                            logFilterPlatform === plt
                              ? 'bg-slate-900 text-white font-bold'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {plt === 'ALL' ? 'Всі' : plt}
                        </button>
                      ))}
                    </div>

                    {/* Log list */}
                    {logs.length > 0 ? (
                      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                        {logs
                          .filter((l) => logFilterPlatform === 'ALL' || l.platform === logFilterPlatform)
                          .map((log) => (
                            <div
                              key={log.id}
                              className="p-3 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono border border-slate-800 space-y-1.5"
                            >
                              <div className="flex items-center justify-between border-b border-slate-800 pb-1">
                                <span className="font-bold text-emerald-400">
                                  [{log.platform}] {log.eventName}
                                </span>
                                <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                              </div>
                              <pre className="text-[11px] text-slate-300 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(log.payload, null, 2)}
                              </pre>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-xs bg-slate-50 rounded-xl border border-slate-200/60 p-4">
                        Поки що немає зафіксованих подій. Натисніть кнопку вище для симуляції або відкрийте сторінку сайту!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminControlHub;
