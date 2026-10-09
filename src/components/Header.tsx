import React, { useState, useEffect } from 'react';
import { ShoppingBag, Settings, Phone, Sparkles, Truck, Search, Heart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getDispatchStatus } from '../lib/related';
import { DispatchCountdown } from './DispatchCountdown';

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
  } = useStore();
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalWishlistCount = wishlist.length;
  const dispatch = getDispatchStatus();

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

  const freeThreshold = storeSettings.freeShippingThreshold || 2000;
  const phoneFormatted = storeSettings.phone || '0 (800) 33-22-11';
  const cleanPhoneLink = `tel:${phoneFormatted.replace(/[^\d+]/g, '')}`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md hairline-b transition-all">
      {/* Top DUNE / Stiletto Ticker Bar */}
      <div className="bg-black text-white py-1.5 px-4 overflow-hidden text-[11px] font-mono tracking-widest uppercase">
        <div className="marquee-track flex items-center gap-8 whitespace-nowrap">
          <span>★ БЕЗКОШТОВНА ДОСТАВКА ВІД {freeThreshold.toLocaleString('uk-UA')} ₴</span>
          <span className="text-dune-ochre">///</span>
          <span>ВІДПРАВКА СЬОГОДНІ: {dispatch.text}</span>
          <span className="text-dune-ochre">///</span>
          <span>100% ОРИГІНАЛЬНА КОРЕЙСЬКА КОСМЕТИКА</span>
          <span className="text-dune-ochre">///</span>
          <span>ОПЛАТА ПРИ ОТРИМАННІ БЕЗ ПЕРЕДОПЛАТИ</span>
          <span className="text-dune-ochre">///</span>
          <span>★ ОФІЦІЙНИЙ ДИСТРИБ'ЮТОР COSRX, ROUND LAB & BEAUTY OF JOSEON</span>
          <span className="text-dune-ochre">///</span>
          <span>ВІДПРАВКА СЬОГОДНІ: {dispatch.text}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo - High Aesthetic */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex flex-col group">
              <span className="text-2xl sm:text-3xl font-black font-display tracking-tight text-black group-hover:text-dune-ochre transition-colors">
                {storeSettings.storeName || 'MALLROOM'}
              </span>
              <span className="text-[10px] font-mono font-medium tracking-widest text-neutral-500 uppercase -mt-1 flex items-center gap-1">
                <span>SKINCARE CONCEPT STORE</span>
                <span className="text-dune-ochre">//</span>
                <span>KYIV</span>
              </span>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono font-medium uppercase tracking-wider text-neutral-700">
            <a
              href="#catalog-section"
              className="hover:text-black transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-black after:transition-all"
            >
              [ КАТАЛОГ ]
            </a>
            <button
              onClick={() => setIsQuizOpen(true)}
              className="text-black font-bold transition-colors relative py-1 flex items-center gap-1 cursor-pointer bg-neutral-100 px-2 hairline-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-dune-ochre" />
              <span>[ 🔬 ТЕСТ ШКІРИ (-15%) ]</span>
            </button>
            <button
              onClick={() => setIsTrackingOpen(true)}
              className="hover:text-black transition-colors relative py-1 flex items-center gap-1 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-neutral-500" />
              <span>[ ВІДСТЕЖИТИ ТТН ]</span>
            </button>
            <button
              onClick={() => openPolicyModal('about')}
              className="hover:text-black transition-colors relative py-1 flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#dec400]" />
              <span>[ ПРО БРЕНД ]</span>
            </button>
            <button
              onClick={() => openPolicyModal('shipping')}
              className="hover:text-black transition-colors relative py-1 flex items-center gap-1 cursor-pointer"
            >
              <Truck className="w-3 h-3 text-[#dec400]" />
              <span>[ ДОСТАВКА ]</span>
            </button>
            <button
              onClick={() => openPolicyModal('contacts')}
              className="hover:text-black transition-colors relative py-1 cursor-pointer"
            >
              <span>[ КОНТАКТИ ]</span>
            </button>
            <a
              href={cleanPhoneLink}
              className="inline-flex items-center gap-1 text-neutral-500 hover:text-black transition-colors font-bold"
            >
              <Phone className="w-3.5 h-3.5 text-[#dec400]" />
              <span>{phoneFormatted}</span>
            </a>
            <div className="hidden xl:flex items-center pl-3 border-l border-neutral-200">
              <DispatchCountdown variant="banner" />
            </div>
          </nav>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Skin Quiz Quick CTA */}
            <button
              onClick={() => setIsQuizOpen(true)}
              className="inline-flex items-center justify-center min-h-[40px] px-2.5 sm:px-3 py-2 text-xs font-mono font-bold uppercase text-black bg-neutral-100 hover:bg-neutral-200 hairline-all transition-all active:scale-95"
              title="Підібрати рутину за 60 сек"
              aria-label="Підібрати рутину"
            >
              <Sparkles className="w-3.5 h-3.5 text-dune-ochre sm:mr-1" />
              <span className="hidden md:inline">ТЕСТ ШКІРИ</span>
            </button>

            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="inline-flex items-center justify-center min-h-[40px] px-2.5 sm:px-3 py-2 text-xs font-mono font-semibold uppercase text-neutral-800 bg-neutral-100 hover:bg-neutral-200 hairline-all transition-all active:scale-95"
              title="Швидкий пошук товарів"
              aria-label="Пошук товарів"
            >
              <Search className="w-3.5 h-3.5 sm:mr-1 text-black" />
              <span className="hidden sm:inline">ПОШУК</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setIsWishlistOpen(true)}
              className="relative inline-flex items-center justify-center min-h-[40px] px-2.5 sm:px-3 py-2 text-xs font-mono font-semibold uppercase text-neutral-800 bg-neutral-100 hover:bg-neutral-200 hairline-all transition-all active:scale-95"
              title="Збережені товари"
              aria-label="Список бажань"
            >
              <Heart className={`w-3.5 h-3.5 ${totalWishlistCount > 0 ? 'text-rose-500 fill-current' : 'text-neutral-700'}`} />
              <span className="hidden sm:inline ml-1.5">WISHLIST</span>
              <span className="ml-1 text-dune-ochre">[{totalWishlistCount}]</span>
            </button>

            {/* Quick Policies Icon Button for mobile & tablet */}
            <button
              onClick={() => openPolicyModal('shipping')}
              className="lg:hidden inline-flex items-center justify-center min-h-[40px] px-2.5 py-1.5 text-xs font-mono font-semibold uppercase text-neutral-700 bg-neutral-100 hover:bg-neutral-200 hairline-all transition-all"
              title="Інформація про доставку та повернення"
            >
              <Truck className="w-3.5 h-3.5 mr-1 text-black" />
              <span className="text-[10px]">ІНФО</span>
            </button>

            {/* Discreet Admin Toggle */}
            {(isAdminVisible || isAdminOpen) && (
              <button
                onClick={() => {
                  setIsAdminOpen(true);
                  if (typeof window !== 'undefined') {
                    window.location.hash = '#admin';
                  }
                }}
                className="inline-flex items-center min-h-[40px] gap-1 px-3 py-2 text-xs font-mono font-semibold uppercase text-neutral-600 bg-neutral-100 hover:bg-neutral-200 hairline-all transition-all"
                title="Панель керування: CSV фід, Google Ads, Telegram"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ADM</span>
              </button>
            )}

            {/* Stiletto Cart Button: BAG [ 0 ] */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative inline-flex items-center justify-center min-h-[44px] px-3.5 sm:px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
              aria-label="Кошик покупок"
            >
              <ShoppingBag className="w-4 h-4 mr-1.5 sm:mr-2" />
              <span>BAG</span>
              <span className="ml-1 text-dune-ochre">[{totalCartCount}]</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
