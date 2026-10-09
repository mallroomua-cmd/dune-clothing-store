import React, { useState, useEffect } from 'react';
import { ShoppingBag, Settings, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getDispatchStatus } from '../lib/related';

export const Header: React.FC = () => {
  const { cart, setIsAdminOpen, setIsCartDrawerOpen, isAdminOpen } = useStore();
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
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


  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md hairline-b transition-all">
      {/* Top DUNE / Stiletto Ticker Bar */}
      <div className="bg-black text-white py-1.5 px-4 overflow-hidden text-[11px] font-mono tracking-widest uppercase">
        <div className="marquee-track flex items-center gap-8 whitespace-nowrap">
          <span>★ БЕЗКОШТОВНА ДОСТАВКА ВІД 2 000 ₴</span>
          <span className="text-dune-ochre">///</span>
          <span>ВІДПРАВКА СЬОГОДНІ: {dispatch.text}</span>
          <span className="text-dune-ochre">///</span>
          <span>ОПЛАТА ПРИ ОТРИМАННІ БЕЗ ПЕРЕДОПЛАТИ</span>
          <span className="text-dune-ochre">///</span>
          <span>100% ПЕРЕВІРЕНІ ОРИГІНАЛЬНІ ТОВАРИ</span>
          <span className="text-dune-ochre">///</span>
          <span>★ БЕЗКОШТОВНА ДОСТАВКА ВІД 2 000 ₴</span>
          <span className="text-dune-ochre">///</span>
          <span>ВІДПРАВКА СЬОГОДНІ: {dispatch.text}</span>
          <span className="text-dune-ochre">///</span>
          <span>ОПЛАТА ПРИ ОТРИМАННІ БЕЗ ПЕРЕДОПЛАТИ</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo - DUNE Stiletto Aesthetic */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex flex-col group">
              <span className="text-2xl sm:text-3xl font-black font-display tracking-tight text-black group-hover:text-dune-ochre transition-colors">
                MALLROOM
              </span>
              <span className="text-[10px] font-mono font-medium tracking-widest text-neutral-500 uppercase -mt-1 flex items-center gap-1">
                <span>CONCEPT STORE</span>
                <span className="text-dune-ochre">//</span>
                <span>KYIV</span>
              </span>
            </a>
          </div>

          {/* Desktop Navigation Links (Monospaced Technical Feel) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono font-medium uppercase tracking-wider text-neutral-700">
            <a
              href="#catalog-section"
              className="hover:text-black transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-black after:transition-all"
            >
              [ КАТАЛОГ ]
            </a>
            <a
              href="#trust-section"
              className="hover:text-black transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-black after:transition-all"
            >
              [ ПЕРЕВАГИ ]
            </a>
            <a
              href="#reviews-section"
              className="hover:text-black transition-colors relative py-1 after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-[1px] after:bg-black after:transition-all"
            >
              [ ВІДГУКИ ]
            </a>
            <a
              href="tel:+380800332211"
              className="inline-flex items-center gap-1 text-neutral-500 hover:text-black transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>0 (800) 33-22-11</span>
            </a>
          </nav>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
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
              className="relative inline-flex items-center justify-center min-h-[44px] px-4 py-2.5 bg-black hover:bg-neutral-800 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98]"
              aria-label="Кошик покупок"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              <span>BAG</span>
              <span className="ml-1.5 text-dune-ochre">[{totalCartCount}]</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
