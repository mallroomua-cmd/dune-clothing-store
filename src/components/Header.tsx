import React from 'react';
import { ShoppingBag, Settings, Phone, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Header: React.FC = () => {
  const { cart, setIsAdminOpen, setIsCartDrawerOpen } = useStore();
  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm transition-all">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-emerald-600 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="inline-block animate-pulse">🔥</span>
        <span>Сезонний розпродаж! Знижки до <strong>-40%</strong> • Швидка відправка по всій Україні</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-brand-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black font-heading tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                  Шопінг<span className="text-brand-600">Маркет</span>
                </span>
                <span className="hidden sm:block text-[11px] font-semibold text-slate-600 tracking-wider uppercase">
                  Офіційний інтернет-магазин
                </span>
              </div>
            </a>
          </div>

          {/* Quick info & Contacts (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-600" />
              <span>Доставка Новою Поштою 1-2 дні</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Оплата при отриманні</span>
            </div>
            <a
              href="tel:+380800332211"
              className="flex items-center gap-2 font-semibold text-slate-800 hover:text-brand-600 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                <Phone className="w-4 h-4" />
              </div>
              <span>0 (800) 33-22-11</span>
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Admin Panel Toggle */}
            <button
              onClick={() => setIsAdminOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors border border-slate-200/60"
              title="Адмін панель: завантаження CSV та налаштування Google Ads / Analytics"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Адмін панель</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="relative inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm transition-all shadow-md shadow-brand-600/20 active:scale-95"
              aria-label="Кошик покупок"
            >
              <ShoppingBag className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline font-semibold">Кошик</span>
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-accent-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-bounce">
                  {totalCartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
