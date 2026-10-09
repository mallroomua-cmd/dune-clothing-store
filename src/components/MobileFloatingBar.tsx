import React from 'react';
import { ShoppingBag, Phone, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const MobileFloatingBar: React.FC = () => {
  const { cart, setIsCartDrawerOpen } = useStore();
  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalSum = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const scrollToCatalog = () => {
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] p-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom))] transition-transform duration-300">
      <div className="flex items-center gap-2 max-w-lg mx-auto">
        {/* Support Call button */}
        <a
          href="tel:+380800332211"
          className="w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/80 active:scale-90 transition-all"
          title="Зателефонувати менеджеру"
          aria-label="Зателефонувати менеджеру"
        >
          <Phone className="w-5 h-5 text-brand-600" />
        </a>

        {/* Primary Action Button */}
        {totalCount > 0 ? (
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="flex-1 min-h-[48px] py-2.5 px-4 rounded-2xl bg-gradient-to-r from-accent-500 via-accent-600 to-orange-600 active:scale-[0.97] text-white font-extrabold text-sm shadow-md shadow-accent-500/30 flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-2 bg-white text-accent-700 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm tabular-nums">
                  {totalCount}
                </span>
              </div>
              <span className="font-bold">Перейти до кошика</span>
            </div>

            <span className="text-sm font-black tabular-nums bg-white/20 px-2.5 py-0.5 rounded-lg">
              {totalSum.toLocaleString('uk-UA')} ₴
            </span>
          </button>
        ) : (
          <button
            onClick={scrollToCatalog}
            className="flex-1 min-h-[48px] py-2.5 px-4 rounded-2xl bg-brand-600 hover:bg-brand-700 active:scale-[0.97] text-white font-extrabold text-sm shadow-md shadow-brand-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Переглянути товари каталогу</span>
          </button>
        )}
      </div>
    </div>
  );
};
