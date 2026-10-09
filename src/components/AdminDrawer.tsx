import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Settings,
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
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SAMPLE_SHOPIFY_CSV } from '../lib/sample-data';
import {
  eventHistory,
  subscribeToAnalytics,
  AnalyticsEventLog,
  trackPurchase,
} from '../lib/analytics';
import { downloadGoogleMerchantXml } from '../lib/merchant-xml';
import { sendTelegramOrderNotification } from '../lib/telegram';
import { readCsvFileWithEncoding } from '../lib/shopify-parser';
import { useModal } from '../hooks/useModal';

export const AdminDrawer: React.FC = () => {
  const {
    isAdminOpen,
    setIsAdminOpen,
    products,
    uploadCsv,
    resetToDemo,
    analyticsConfig,
    updateAnalyticsConfig,
  } = useStore();

  const handleClose = () => setIsAdminOpen(false);
  useModal(isAdminOpen, handleClose);

  const [activeTab, setActiveTab] = useState<'csv' | 'analytics' | 'telegram' | 'debug' | 'orders'>('csv');
  const [dragActive, setDragActive] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Analytics form state
  const [gaId, setGaId] = useState(analyticsConfig.gaMeasurementId);
  const [gadsId, setGadsId] = useState(analyticsConfig.googleAdsId);
  const [gadsLabel, setGadsLabel] = useState(analyticsConfig.googleAdsConversionLabel);
  const [gmcTag, setGmcTag] = useState(analyticsConfig.merchantCenterTag);
  const [gtmId, setGtmId] = useState(analyticsConfig.gtmId);
  const [tgToken, setTgToken] = useState(analyticsConfig.telegramBotToken);
  const [tgChatId, setTgChatId] = useState(analyticsConfig.telegramChatId);
  const [npKey, setNpKey] = useState(analyticsConfig.novaPoshtaApiKey);
  const [savedNotice, setSavedNotice] = useState(false);
  const [tgTestResult, setTgTestResult] = useState<string | null>(null);

  // Live debug events
  const [logs, setLogs] = useState<AnalyticsEventLog[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    setGaId(analyticsConfig.gaMeasurementId);
    setGadsId(analyticsConfig.googleAdsId);
    setGadsLabel(analyticsConfig.googleAdsConversionLabel);
    setGmcTag(analyticsConfig.merchantCenterTag);
    setGtmId(analyticsConfig.gtmId);
    setTgToken(analyticsConfig.telegramBotToken);
    setTgChatId(analyticsConfig.telegramChatId);
    setNpKey(analyticsConfig.novaPoshtaApiKey);
  }, [analyticsConfig]);

  useEffect(() => {
    setLogs([...eventHistory]);
    const unsub = subscribeToAnalytics((newEvent) => {
      setLogs((prev) => [newEvent, ...prev.slice(0, 49)]);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (isAdminOpen) {
      try {
        const saved = JSON.parse(localStorage.getItem('shopify_store_orders') || '[]');
        setOrders(saved);
      } catch {
        setOrders([]);
      }
    }
  }, [isAdminOpen, activeTab]);

  if (!isAdminOpen) return null;

  // File handler with auto charset decoding (UTF-8 & Windows-1251)
  const handleFileProcess = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Будь ласка, оберіть файл формату .csv');
      return;
    }

    setUploadLoading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const text = await readCsvFileWithEncoding(file);
      const res = await uploadCsv(text);
      setUploadSuccess(`Успішно імпортовано та збережено ${res.count} товарів (IndexedDB)!`);
    } catch (err: any) {
      setUploadError(err.message || 'Помилка читання файлу CSV');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_SHOPIFY_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'shopify_products_export_example.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAnalyticsConfig({
      gaMeasurementId: gaId.trim(),
      googleAdsId: gadsId.trim(),
      googleAdsConversionLabel: gadsLabel.trim(),
      merchantCenterTag: gmcTag.trim(),
      gtmId: gtmId.trim(),
      telegramBotToken: tgToken.trim(),
      telegramChatId: tgChatId.trim(),
      novaPoshtaApiKey: npKey.trim(),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleTestTelegram = async () => {
    setTgTestResult('Відправка тестового сповіщення...');
    const res = await sendTelegramOrderNotification(
      {
        name: 'Тестовий Клієнт',
        phone: '+380991234567',
        city: 'Київ',
        warehouse: 'Відділення №1 (Тест)',
        deliveryMethod: 'nova_poshta',
        paymentMethod: 'cash_on_delivery',
        notes: 'Тестове повідомлення з адмін-панелі',
        items: [
          {
            product: products[0] || {
              id: 'test-1',
              title: 'Тестовий товар',
              price: 1500,
              productType: 'Тест',
              tags: [],
              images: [],
              featuredImage: '',
              handle: 'test',
              bodyHtml: '',
              vendor: '',
              available: true,
              variants: [],
            },
            quantity: 1,
          },
        ],
        total: products[0]?.price || 1500,
      },
      tgToken,
      tgChatId
    );

    if (res.success) {
      setTgTestResult('✅ Успішно надіслано в Telegram!');
    } else {
      setTgTestResult(`❌ Помилка: ${res.error}`);
    }
  };

  const handleTestConversion = () => {
    trackPurchase(
      {
        orderId: `TEST-${Date.now().toString().slice(-5)}`,
        name: 'Тестовий Клієнт',
        phone: '+380991234567',
        city: 'Київ',
        warehouse: 'Відділення №1',
        deliveryMethod: 'nova_poshta',
        paymentMethod: 'cash_on_delivery',
        items: [
          {
            product: products[0],
            quantity: 1,
          },
        ],
        total: products[0]?.price || 1500,
      },
      analyticsConfig
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-sm flex justify-end animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 sm:px-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white shadow-sm">
                <Settings className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-black font-heading text-slate-900">
                Панель керування магазином
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              CSV фід, Google Ads, Telegram бот та Google Merchant Center
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-4 sm:px-8 bg-white gap-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('csv')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'csv'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Товари з CSV ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'analytics'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Google Ads & Аналітика</span>
            {(analyticsConfig.gaMeasurementId || analyticsConfig.googleAdsId) && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('telegram')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'telegram'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Telegram Бот</span>
            {analyticsConfig.telegramBotToken && <span className="w-2 h-2 rounded-full bg-blue-500" />}
          </button>

          <button
            onClick={() => setActiveTab('debug')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'debug'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Консоль</span>
            {logs.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
                {logs.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'orders'
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Замовлення ({orders.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8">
          {/* TAB 1: CSV UPLOAD & MERCHANT EXPORT */}
          {activeTab === 'csv' && (
            <div className="space-y-6">
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                  dragActive
                    ? 'border-brand-600 bg-brand-50/60 scale-[0.99]'
                    : 'border-slate-300 hover:border-brand-400 bg-slate-50/50'
                }`}
              >
                <div className="w-16 h-16 rounded-2xl bg-brand-100 text-brand-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Upload className="w-8 h-8" />
                </div>

                <h3 className="font-heading font-black text-slate-900 text-lg mb-1">
                  Перетягніть CSV файл Shopify сюди
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-5 leading-relaxed">
                  Підтримуються кодування UTF-8 та Windows-1251 (Excel UA). Без обмеження розміру завдяки IndexedDB.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all active:scale-95">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Обрати файл на диску (.csv)</span>
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
              </div>

              {/* Status messages */}
              {uploadLoading && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-3 animate-pulse">
                  <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span>Розпізнавання та збереження товарів в IndexedDB...</span>
                </div>
              )}

              {uploadSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">{uploadSuccess}</span>
                </div>
              )}

              {uploadError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span className="font-semibold">{uploadError}</span>
                </div>
              )}

              {/* Extra helper controls */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/70 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span>Експорт та інструменти фіда</span>
                </h4>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Google Merchant XML Export Button */}
                  <button
                    onClick={() => downloadGoogleMerchantXml(products)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <FileCode className="w-4 h-4" />
                    <span>Експорт XML для Google Merchant Center</span>
                  </button>

                  {/* JSON Catalog Export */}
                  <button
                    onClick={handleExportJson}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors shadow-sm"
                    title="Завантажити catalog.json для розміщення в public/catalog.json"
                  >
                    <FileJson className="w-3.5 h-3.5 text-blue-600" />
                    <span>Експорт catalog.json</span>
                  </button>

                  <button
                    onClick={handleDownloadSample}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-brand-600" />
                    <span>Зразок Shopify CSV</span>
                  </button>

                  <button
                    onClick={async () => {
                      if (confirm('Скинути всі товари до початкових демо-даних?')) {
                        await resetToDemo();
                        setUploadSuccess('Товари повернуто до початкових демо-значень.');
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 text-xs font-bold transition-colors shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Скинути до демо</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MARKETING & ANALYTICS */}
          {activeTab === 'analytics' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 leading-relaxed flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">Розширені конверсії (Enhanced Conversions):</strong>
                  Тег автоматично активує Enhanced Conversions у Google Ads, передаючи нормалізований номер телефону `+380...` та місто клієнта для максимізації ефективності Smart Bidding!
                </div>
              </div>

              {/* GA4 */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Google Analytics 4 (Ідентифікатор вимірювання)
                </label>
                <input
                  type="text"
                  placeholder="G-XXXXXXXXXX"
                  value={gaId}
                  onChange={(e) => setGaId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* Google Ads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Google Ads ID
                  </label>
                  <input
                    type="text"
                    placeholder="AW-XXXXXXXXX"
                    value={gadsId}
                    onChange={(e) => setGadsId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Мітка конверсії (Conversion Label)
                  </label>
                  <input
                    type="text"
                    placeholder="AbCdEf123456789"
                    value={gadsLabel}
                    onChange={(e) => setGadsLabel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>

              {/* Google Merchant Center Meta Tag */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Google Merchant Center (Підтвердження власності сайту)
                </label>
                <textarea
                  rows={2}
                  placeholder='<meta name="google-site-verification" content="ваш_код_підтвердження" />'
                  value={gmcTag}
                  onChange={(e) => setGmcTag(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              {/* GTM */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Google Tag Manager ID (Необов'язково)
                </label>
                <input
                  type="text"
                  placeholder="GTM-XXXXXXX"
                  value={gtmId}
                  onChange={(e) => setGtmId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Зберегти налаштування реклами</span>
                </button>
              </div>

              {savedNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center animate-fade-in">
                  ✅ Налаштування успішно збережено!
                </div>
              )}
            </form>
          )}

          {/* TAB 3: TELEGRAM BOT */}
          {activeTab === 'telegram' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-900 leading-relaxed flex items-start gap-3">
                <Send className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold mb-0.5">Миттєві сповіщення про замовлення:</strong>
                  Кожне замовлення надсилається у ваш приватний Telegram-чат з деталями: ім'я, телефон, товари, сума, місто та відділення Нової Пошти.
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Telegram Bot Token
                </label>
                <input
                  type="text"
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  value={tgToken}
                  onChange={(e) => setTgToken(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Telegram Chat ID
                </label>
                <input
                  type="text"
                  placeholder="987654321 або -100123456789"
                  value={tgChatId}
                  onChange={(e) => setTgChatId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
                >
                  Зберегти Telegram налаштування
                </button>

                <button
                  type="button"
                  onClick={handleTestTelegram}
                  className="px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Тест бота</span>
                </button>
              </div>

              {tgTestResult && (
                <div className="p-3 rounded-xl bg-slate-100 text-slate-800 text-xs font-medium text-center">
                  {tgTestResult}
                </div>
              )}
            </form>
          )}

          {/* TAB 4: LIVE EVENT DEBUGGER */}
          {activeTab === 'debug' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Журнал подій аналітики</h4>
                  <p className="text-xs text-slate-500">
                    Переглядайте в реальному часі спрацьовування тегів
                  </p>
                </div>
                <button
                  onClick={handleTestConversion}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Тест конверсії</span>
                </button>
              </div>

              {logs.length > 0 ? (
                <div className="space-y-2.5">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono border border-slate-800 space-y-1.5"
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
                <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200/60 p-6">
                  Поки що немає зафіксованих подій. Відкрийте будь-який товар або надішліть тестову конверсію!
                </div>
              )}
            </div>
          )}

          {/* TAB 5: ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-800 text-sm">
                  Отримані замовлення ({orders.length})
                </h4>
                {orders.length > 0 && (
                  <button
                    onClick={() => {
                      if (confirm('Очистити історію замовлень?')) {
                        localStorage.removeItem('shopify_store_orders');
                        setOrders([]);
                      }
                    }}
                    className="text-xs text-slate-400 hover:text-rose-500 font-semibold"
                  >
                    Очистити історію
                  </button>
                )}
              </div>

              {orders.length > 0 ? (
                orders.map((ord, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="font-bold text-brand-700 text-sm">{ord.id}</span>
                      <span className="text-slate-500">{ord.date}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-slate-800">
                      <div>
                        <strong>Клієнт:</strong> {ord.name}
                      </div>
                      <div>
                        <strong>Телефон:</strong>{' '}
                        <a href={`tel:${ord.phone}`} className="text-brand-600 font-bold">
                          {ord.phone}
                        </a>
                      </div>
                      <div>
                        <strong>Місто:</strong> {ord.city}
                      </div>
                      <div>
                        <strong>Відділення:</strong> {ord.warehouse}
                      </div>
                    </div>
                    <div className="border-t border-slate-200 pt-2 flex justify-between items-center font-bold text-sm text-slate-900">
                      <span>Сума замовлення:</span>
                      <span className="text-brand-600">{ord.total?.toLocaleString('uk-UA')} ₴</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200/60 p-6">
                  Замовлень поки що немає. Зробіть тестове замовлення через форму на сайті!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
