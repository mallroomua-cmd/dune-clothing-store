import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Settings,
  Phone,
  Sparkles,
  Truck,
  Search,
  Heart,
  Menu,
  X,
  ChevronDown,
  Flame,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DispatchCountdown } from './DispatchCountdown';

interface NavCategory {
  id: string;
  label: string;
  badge?: string;
  highlight?: boolean;
  subcategories?: { title: string; categoryKey: string }[];
}

const BRAND_TICKER_ITEMS = [
  'FENTY BEAUTY',
  'RARE BEAUTY',
  'SUMMER FRIDAYS',
  'RHODE',
  'DIOR',
  'HOURGLASS',
  'SOL DE JANEIRO',
  'CHARLOTTE TILBURY',
  'AMI PARIS',
  'CARHARTT WIP',
  'STONE ISLAND',
  'GANNI',
  'JACQUEMUS',
  'JIL SANDER',
  'NEW BALANCE',
  'SALOMON',
  'AIR JORDAN',
  'BREDA',
  'STÜSSY',
  'SUPREME',
];

const NAV_CATEGORIES: NavCategory[] = [
  {
    id: 'makeup',
    label: 'ДЕКОРАТИВНА КОСМЕТИКА',
    badge: 'ХІТ',
    subcategories: [
      { title: 'Вся декоративна косметика', categoryKey: 'Декоративна косметика' },
      { title: 'Губи (Блиски, Тінти, Бальзами, Олійки)', categoryKey: 'Губи' },
      { title: 'Обличчя (Хайлайтери, Румʼяна, Пудри, BB)', categoryKey: 'Обличчя' },
      { title: 'Очі та брови (Палетки тіней, RevitaBrow)', categoryKey: 'Очі' },
      { title: 'Rhode (Lip Shape, Lip Tint, Pocket Blush)', categoryKey: 'Rhode' },
      { title: 'Dior (Backstage Palette, Lip Glow Oil)', categoryKey: 'Dior' },
      { title: 'Fenty Beauty (Gloss Bomb Luminizer)', categoryKey: 'Fenty Beauty' },
      { title: 'Rare Beauty (Lip Oil, Liquid Luminizer)', categoryKey: 'Rare Beauty' },
      { title: 'Summer Fridays (Lip Butter & Lip Oil)', categoryKey: 'Summer Fridays' },
      { title: 'Hourglass (Unreal Liquid Blush)', categoryKey: 'Hourglass' },
    ],
  },
  {
    id: 'skincare-body',
    label: 'ДОГЛЯД ТА ПАРФУМИ',
    subcategories: [
      { title: 'Весь догляд та парфуми', categoryKey: 'all' },
      { title: 'Догляд за обличчям (Всі засоби)', categoryKey: 'Догляд за обличчям' },
      { title: 'Очищення та демакіяж (Medicube, PanOxyl, Skin1004)', categoryKey: 'Очищення' },
      { title: 'Сироватки та ампули (Anua, La Roche-Posay)', categoryKey: 'Сироватки' },
      { title: 'Креми та зволоження (La Mer, Centellian24, Tocobo)', categoryKey: 'Креми' },
      { title: 'Тоніки та ексфоліанти (Paula\'s Choice 2% BHA)', categoryKey: 'Тоніки' },
      { title: 'Маски та педи (Biodance Real Deep Mask)', categoryKey: 'Маски та педи' },
      { title: 'Догляд за волоссям (Olaplex No.7, K18 Mask)', categoryKey: 'Догляд за волоссям' },
      { title: 'Догляд за тілом (Sol de Janeiro Bum Bum)', categoryKey: 'Догляд за тілом' },
      { title: 'Парфуми, місти та свічки (Rio Radiance, Cheirosa)', categoryKey: 'Парфуми та аромати' },
    ],
  },
  {
    id: 'brands',
    label: 'БРЕНДИ',
    badge: '35+',
    subcategories: [
      { title: 'Rhode (Hailey Bieber)', categoryKey: 'Rhode' },
      { title: 'Dior (Backstage)', categoryKey: 'Dior' },
      { title: 'Fenty Beauty (Rihanna)', categoryKey: 'Fenty Beauty' },
      { title: 'Rare Beauty (Selena Gomez)', categoryKey: 'Rare Beauty' },
      { title: 'Summer Fridays', categoryKey: 'Summer Fridays' },
      { title: 'Hourglass', categoryKey: 'Hourglass' },
      { title: 'Sol de Janeiro', categoryKey: 'Sol de Janeiro' },
      { title: 'La Mer', categoryKey: 'La Mer' },
      { title: 'Paula\'s Choice', categoryKey: 'Paula\'s Choice' },
      { title: 'Biodance', categoryKey: 'Biodance' },
      { title: 'Anua', categoryKey: 'Anua' },
      { title: 'Medicube', categoryKey: 'Medicube' },
      { title: 'Skin1004', categoryKey: 'Skin1004' },
      { title: 'PanOxyl', categoryKey: 'PanOxyl' },
      { title: 'La Roche-Posay', categoryKey: 'La Roche-Posay' },
      { title: 'Charlotte Tilbury', categoryKey: 'Charlotte Tilbury' },
      { title: 'AMI Paris', categoryKey: 'AMI Paris' },
      { title: 'Ganni', categoryKey: 'Ganni' },
      { title: 'Jacquemus', categoryKey: 'Jacquemus' },
      { title: 'Carhartt WIP', categoryKey: 'Carhartt WIP' },
      { title: 'New Balance', categoryKey: 'New Balance' },
      { title: 'Salomon', categoryKey: 'Salomon' },
      { title: 'Air Jordan & Nike', categoryKey: 'Jordan' },
      { title: 'Stüssy & Supreme', categoryKey: 'Stüssy' },
      { title: 'Breda (Годинники)', categoryKey: 'Breda' },
      { title: 'Усі бренди від А до Я', categoryKey: 'all' },
    ],
  },
  {
    id: 'bags',
    label: 'СУМКИ ТА АКСЕСУАРИ',
    subcategories: [
      { title: 'Всі сумки та аксесуари', categoryKey: 'Аксесуари та сумки' },
      { title: 'Косметички Charlotte Tilbury', categoryKey: 'Charlotte Tilbury' },
      { title: 'Сумки Jacquemus Le Chiquito', categoryKey: 'Jacquemus' },
      { title: 'Годинники Breda Vintage Gold', categoryKey: 'Breda' },
    ],
  },
  {
    id: 'clothing',
    label: 'ОДЯГ ТА ВЗУТТЯ',
    subcategories: [
      { title: 'Весь одяг та взуття', categoryKey: 'Одяг' },
      { title: 'Кросівки & снікери (Jordan, NB, Salomon)', categoryKey: 'Взуття' },
      { title: 'Худі & світшоти (AMI Paris, Stüssy)', categoryKey: 'Худі' },
      { title: 'Штани & денім (Carhartt WIP)', categoryKey: 'Штани' },
      { title: 'Футболки & топи (Ganni, Stüssy)', categoryKey: 'Футболки' },
    ],
  },
  {
    id: 'new-in',
    label: 'НОВИНКИ',
    badge: 'NEW',
  },
  {
    id: 'sale',
    label: 'SALE',
    badge: '-40%',
    highlight: true,
  },
  {
    id: 'quiz',
    label: 'ПІДБІР РОЗМІРУ',
    badge: 'FIT GUIDE',
  },
];

export const Header: React.FC = () => {
  const {
    cart,
    wishlist,
    setIsAdminOpen,
    setIsCartDrawerOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setIsQuizOpen,
    setIsTrackingOpen,
    isAdminOpen,
    openPolicyModal,
    storeSettings,
    filterByCategory,
    filterByBrand,
  } = useStore();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>('brands');

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalWishlistCount = wishlist.length;

  const [isAdminVisible, setIsAdminVisible] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return (
        import.meta.env.DEV ||
        window.location.hash === '#admin' ||
        window.location.search.includes('admin')
      );
    }
    return false;
  });

  useEffect(() => {
    const updateVisibility = () => {
      if (
        import.meta.env.DEV ||
        window.location.hash === '#admin' ||
        window.location.search.includes('admin')
      ) {
        setIsAdminVisible(true);
      }
    };
    updateVisibility();
    window.addEventListener('hashchange', updateVisibility);
    return () => window.removeEventListener('hashchange', updateVisibility);
  }, []);

  // Close mobile drawer on route / escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
        setActiveDropdown(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const phoneFormatted = storeSettings.phone || '+38 (093) 345-68-10';
  const cleanPhoneLink = `tel:${phoneFormatted.replace(/[^\d+]/g, '')}`;

  const handleCategoryClick = (cat: NavCategory, sub?: { title: string; categoryKey: string }) => {
    setActiveDropdown(null);
    setIsMobileMenuOpen(false);

    if (cat.id === 'quiz') {
      setIsQuizOpen(true);
      return;
    }

    if (cat.id === 'sale' || cat.id === 'new-in') {
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (cat.id === 'brands') {
      if (sub && sub.categoryKey !== 'all') {
        filterByBrand(sub.categoryKey);
      } else {
        document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (sub) {
      if (sub.categoryKey === 'all') {
        document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        filterByCategory(sub.categoryKey);
      }
    } else {
      filterByCategory(cat.label);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E3E0DB] shadow-xs transition-all">
      {/* 1. Brand Ticker from the-rooms.com.ua */}
      <div className="bg-[#111111] text-white text-[10px] sm:text-[11px] font-mono tracking-widest uppercase overflow-hidden whitespace-nowrap py-1.5 border-b border-neutral-800 select-none">
        <div className="inline-flex marquee-track">
          {[...BRAND_TICKER_ITEMS, ...BRAND_TICKER_ITEMS].map((brand, idx) => (
            <span key={idx} className="inline-flex items-center mx-3 text-neutral-300 hover:text-white transition-colors">
              <span>{brand}</span>
              <span className="mx-3 text-[#A77A06]">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* 2. Top Utility Announcement Bar */}
      <div className="bg-[#F8F8F7] text-[#111111] text-[11px] font-sans tracking-wide py-1.5 px-4 border-b border-[#E3E0DB]">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6 overflow-hidden whitespace-nowrap text-xs text-neutral-600">
            <div className="flex items-center gap-1.5 font-medium">
              <Truck className="w-3.5 h-3.5 text-[#A77A06]" />
              <span>Безкоштовна доставка від 3 000 ₴ по Києву та Україні</span>
            </div>
            <span className="hidden sm:inline text-neutral-300">|</span>
            <div className="hidden sm:flex items-center gap-1.5 text-neutral-500 font-mono text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#A77A06]" />
              <span>100% Оригінальні світові бренди</span>
            </div>
            <span className="hidden md:inline text-neutral-300">|</span>
            <div className="hidden md:flex items-center">
              <DispatchCountdown variant="banner" />
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-neutral-600">
            <a
              href={cleanPhoneLink}
              className="flex items-center gap-1 hover:text-black transition-colors font-mono font-medium"
            >
              <Phone className="w-3 h-3 text-[#A77A06]" />
              <span className="hidden md:inline">{phoneFormatted}</span>
            </a>
            <button
              onClick={() => setIsTrackingOpen(true)}
              className="hidden lg:inline hover:text-black transition-colors cursor-pointer font-sans"
            >
              ТТН Нова Пошта
            </button>
            <button
              onClick={() => openPolicyModal('about')}
              className="hidden md:inline hover:text-black transition-colors cursor-pointer font-sans"
            >
              Про нас
            </button>
            <span className="text-[10px] font-mono font-bold text-neutral-600 border border-neutral-300 px-1.5 py-0.5 rounded">
              UA
            </span>
          </div>
        </div>
      </div>

      {/* 3. Main Center Bar: Hamburger | Logo | Search | Actions */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 -ml-2 text-neutral-800 hover:text-black focus:outline-none"
            aria-label="Відкрити меню навігації"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* MOLAND Brand Logo */}
          <div className="flex items-center gap-2">
            <a href="#" className="flex flex-col group">
              <span className="text-2xl sm:text-3xl font-serif tracking-[0.12em] font-normal text-black group-hover:text-neutral-700 transition-colors uppercase">
                {storeSettings.storeName || 'MOLAND'}
              </span>
              <span className="text-[8px] sm:text-[9px] font-mono tracking-[0.25em] text-neutral-500 uppercase -mt-0.5 flex items-center gap-1">
                <span>CONCEPT STORE</span>
                <span className="text-[#A77A06]">•</span>
                <span>KYIV</span>
              </span>
            </a>
          </div>

          {/* Central Search Bar (The Rooms / Stiletto Style) */}
          <div className="flex-1 max-w-xl mx-2 sm:mx-6 hidden sm:block">
            <div
              onClick={() => setIsSearchOpen(true)}
              className="relative flex items-center w-full min-h-[42px] px-4 bg-white hover:bg-neutral-50 border border-[#E3E0DB] hover:border-black rounded-none cursor-pointer transition-all group"
            >
              <Search className="w-4 h-4 text-neutral-400 group-hover:text-black mr-2.5 transition-colors" />
              <span className="font-sans text-xs text-neutral-400 group-hover:text-neutral-600 select-none">
                Пошук бренду або речі (AMI Paris, Ganni, New Balance, Salomon)...
              </span>
              <kbd className="ml-auto hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-neutral-100 border border-neutral-200">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Search Icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="sm:hidden p-2 text-neutral-700 hover:text-black"
              aria-label="Пошук"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Fit Guide Quick Button */}
            <button
              onClick={() => setIsQuizOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium uppercase text-black bg-[#F8F8F7] hover:bg-neutral-100 border border-[#E3E0DB] transition-all cursor-pointer"
              title="Підібрати розмір та образ"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#A77A06]" />
              <span>ПІДБІР РОЗМІРУ</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative p-2 sm:px-3 sm:py-2 text-neutral-700 hover:text-black hover:bg-neutral-50 transition-colors flex items-center gap-1"
              title="Список бажань"
              aria-label="Список бажань"
            >
              <Heart
                className={`w-5 h-5 ${totalWishlistCount > 0 ? 'text-rose-500 fill-current' : ''}`}
              />
              <span className="hidden lg:inline text-xs font-sans font-medium">Бажане</span>
              {totalWishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:static sm:ml-1 bg-black text-white text-[10px] font-mono font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalWishlistCount}
                </span>
              )}
            </button>

            {/* Discreet Admin Button */}
            {(isAdminVisible || isAdminOpen) && (
              <button
                onClick={() => {
                  setIsAdminOpen(true);
                  if (typeof window !== 'undefined') {
                    window.location.hash = '#admin';
                  }
                }}
                className={`p-2 rounded text-xs transition-colors flex items-center gap-1 ${
                  isAdminOpen
                    ? 'bg-neutral-900 text-white font-bold'
                    : 'text-neutral-500 hover:text-black hover:bg-neutral-100'
                }`}
                title="Панель керування магазином"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden xl:inline font-mono text-[11px]">ADMIN</span>
              </button>
            )}

            {/* Cart Button (The Rooms Style) */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-[#111111] hover:bg-[#333333] text-white font-mono text-xs font-bold uppercase transition-all active:scale-95"
              aria-label="Кошик покупок"
            >
              <ShoppingBag className="w-4 h-4 text-[#A77A06]" />
              <span className="hidden sm:inline">КОШИК</span>
              <span className="bg-white/20 text-white text-[11px] px-1.5 py-0.5 rounded font-mono font-bold">
                {totalCartCount}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Desktop Navigation Categories Bar (The Rooms Stiletto Style) */}
      <nav className="hidden lg:block bg-white border-t border-[#E3E0DB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center justify-between text-xs font-sans font-semibold uppercase tracking-[0.06em] text-neutral-800">
            {NAV_CATEGORIES.map((cat) => (
              <li
                key={cat.id}
                className="relative group"
                onMouseEnter={() => cat.subcategories && setActiveDropdown(cat.id)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => handleCategoryClick(cat)}
                  className={`flex items-center gap-1.5 py-3.5 px-3 transition-colors cursor-pointer border-b-2 border-transparent hover:border-black ${
                    cat.highlight
                      ? 'text-[#A77A06] hover:text-[#8a6404] font-bold'
                      : 'hover:text-black'
                  }`}
                >
                  {cat.highlight && <Flame className="w-3.5 h-3.5 text-[#A77A06] fill-[#A77A06]" />}
                  <span>{cat.label}</span>
                  {cat.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                        cat.highlight
                          ? 'bg-[#A77A06] text-white'
                          : 'bg-black text-white'
                      }`}
                    >
                      {cat.badge}
                    </span>
                  )}
                  {cat.subcategories && (
                    <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:text-black group-hover:rotate-180 transition-transform" />
                  )}
                </button>

                {/* Dropdown Mega-Menu */}
                {cat.subcategories && activeDropdown === cat.id && (
                  <div className="absolute left-0 top-full w-72 bg-white border border-[#E3E0DB] shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="px-3 py-1.5 border-b border-neutral-100 text-[10px] text-neutral-400 font-mono">
                      // {cat.label}
                    </div>
                    {cat.subcategories.map((sub) => (
                      <button
                        key={sub.title}
                        onClick={() => handleCategoryClick(cat, sub)}
                        className="w-full text-left px-4 py-2 text-xs font-sans font-medium text-neutral-700 hover:text-black hover:bg-neutral-50 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span>{sub.title}</span>
                        <ArrowRight className="w-3 h-3 text-neutral-300 hover:text-black" />
                      </button>
                    ))}
                    {cat.id === 'brands' && (
                      <div className="p-2 border-t border-neutral-100 bg-[#F8F8F7]">
                        <button
                          onClick={() => {
                            setActiveDropdown(null);
                            document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full text-center py-1.5 text-[11px] font-mono font-bold text-black hover:underline uppercase"
                        >
                          Всі бренди від А до Я →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* 5. Mobile Drawer Menu (The Rooms Off-Canvas) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Body */}
          <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-left duration-250">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-[#111111] text-white">
              <div>
                <span className="font-serif text-xl tracking-[0.1em] uppercase">
                  {storeSettings.storeName || 'MOLAND'}
                </span>
                <span className="block text-[10px] font-mono text-neutral-400">
                  МЕНЮ КАТЕГОРІЙ & БРЕНДІВ
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white"
                aria-label="Закрити меню"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Search inside Drawer */}
            <div className="p-4 border-b border-neutral-100 bg-neutral-50">
              <div
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsSearchOpen(true);
                }}
                className="flex items-center px-3 py-2.5 bg-white border border-neutral-300 rounded text-xs font-sans text-neutral-500 cursor-pointer"
              >
                <Search className="w-4 h-4 mr-2 text-neutral-400" />
                <span>Пошук бренду або речі...</span>
              </div>
            </div>

            {/* Categories Accordion */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <div className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-widest mb-2">
                // КАТАЛОГ MOLAND
              </div>

              {NAV_CATEGORIES.map((cat) => {
                const isExpanded = mobileExpandedCat === cat.id;

                if (!cat.subcategories) {
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat)}
                      className={`w-full flex items-center justify-between p-3 rounded text-left text-xs font-sans font-semibold uppercase transition-all ${
                        cat.highlight
                          ? 'bg-amber-50 text-[#A77A06] border border-amber-200'
                          : 'bg-neutral-50 text-neutral-800 hover:bg-neutral-100'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {cat.highlight && <Flame className="w-4 h-4 text-[#A77A06]" />}
                        <span>{cat.label}</span>
                      </div>
                      {cat.badge && (
                        <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded font-mono font-bold">
                          {cat.badge}
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <div key={cat.id} className="border border-neutral-200 rounded overflow-hidden">
                    <button
                      onClick={() => setMobileExpandedCat(isExpanded ? null : cat.id)}
                      className="w-full flex items-center justify-between p-3 bg-neutral-50 text-left text-xs font-sans font-semibold uppercase text-neutral-900"
                    >
                      <div className="flex items-center gap-2">
                        <span>{cat.label}</span>
                        {cat.badge && (
                          <span className="text-[9px] bg-black text-white px-1.5 py-0.5 rounded font-mono font-bold">
                            {cat.badge}
                          </span>
                        )}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-neutral-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {isExpanded && (
                      <div className="p-2 bg-white space-y-1 border-t border-neutral-100">
                        {cat.subcategories.map((sub) => (
                          <button
                            key={sub.title}
                            onClick={() => handleCategoryClick(cat, sub)}
                            className="w-full text-left p-2 text-xs font-sans text-neutral-600 hover:text-black hover:bg-neutral-50 rounded flex items-center justify-between"
                          >
                            <span>{sub.title}</span>
                            <ArrowRight className="w-3 h-3 text-neutral-300" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Drawer Footer Contacts */}
            <div className="p-4 border-t border-neutral-200 bg-[#F8F8F7] space-y-2 text-xs">
              <a
                href={cleanPhoneLink}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-black text-white font-mono font-bold uppercase rounded text-xs"
              >
                <Phone className="w-4 h-4 text-[#A77A06]" />
                <span>{phoneFormatted}</span>
              </a>
              <div className="flex items-center justify-between pt-2 text-[11px] text-neutral-500 font-mono">
                <span>Пн–Нд: 10:00 — 21:00</span>
                <span>Київ, Україна</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
