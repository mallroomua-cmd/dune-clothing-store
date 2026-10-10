import React from 'react';
import { ShoppingBag, Search, SlidersHorizontal, Heart, Layers } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const MobileFloatingBar: React.FC = () => {
  const {
    cart,
    wishlist,
    selectedCategory,
    selectedBrand,
    setIsCartDrawerOpen,
    setIsSearchOpen,
    setIsWishlistOpen,
    setIsMobileFiltersOpen,
  } = useStore();

  const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalSum = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const hasActiveFilter = selectedCategory !== 'all' || selectedBrand !== 'all';

  const scrollToCatalog = () => {
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-black/95 text-white backdrop-blur-md border-t border-neutral-800 p-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] transition-transform duration-300">
      <div className="grid grid-cols-5 items-center gap-1 max-w-md mx-auto">
        {/* 1. Catalog / Home */}
        <button
          type="button"
          onClick={scrollToCatalog}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-lg text-neutral-300 hover:text-white active:scale-90 transition-all"
          title="Каталог товарів"
          aria-label="Каталог товарів"
        >
          <Layers className="w-4 h-4 text-dune-ochre mb-0.5" />
          <span className="font-mono text-[9px] uppercase tracking-wider font-bold">Каталог</span>
        </button>

        {/* 2. Quick Search */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-1 rounded-lg text-neutral-300 hover:text-white active:scale-90 transition-all"
          title="Пошук товарів"
          aria-label="Пошук товарів"
        >
          <Search className="w-4 h-4 text-neutral-300 mb-0.5" />
          <span className="font-mono text-[9px] uppercase tracking-wider font-medium">Пошук</span>
        </button>

        {/* 3. Mobile Filters */}
        <button
          type="button"
          onClick={() => setIsMobileFiltersOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-1 rounded-lg text-neutral-300 hover:text-white active:scale-90 transition-all"
          title="Фільтри та сортування"
          aria-label="Фільтри та сортування"
        >
          <SlidersHorizontal className="w-4 h-4 text-neutral-300 mb-0.5" />
          {hasActiveFilter && (
            <span className="absolute top-0 right-3 w-2 h-2 rounded-full bg-dune-ochre ring-2 ring-black" />
          )}
          <span className="font-mono text-[9px] uppercase tracking-wider font-medium">Фільтри</span>
        </button>

        {/* 4. Wishlist */}
        <button
          type="button"
          onClick={() => setIsWishlistOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-1 rounded-lg text-neutral-300 hover:text-white active:scale-90 transition-all"
          title="Список бажань"
          aria-label="Список бажань"
        >
          <Heart className={`w-4 h-4 mb-0.5 ${wishlist.length > 0 ? 'text-rose-500 fill-rose-500' : 'text-neutral-300'}`} />
          {wishlist.length > 0 && (
            <span className="absolute top-0 right-2 bg-rose-500 text-white font-mono text-[8px] font-bold px-1 rounded-full">
              {wishlist.length}
            </span>
          )}
          <span className="font-mono text-[9px] uppercase tracking-wider font-medium">Бажане</span>
        </button>

        {/* 5. Cart / Bag */}
        <button
          type="button"
          onClick={() => setIsCartDrawerOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-1 rounded-lg bg-white text-black active:scale-95 transition-all shadow-sm"
          title="Кошик покупок"
          aria-label="Кошик покупок"
        >
          <div className="flex items-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-dune-ochre" />
            <span className="font-mono text-[10px] font-bold">
              {totalCount > 0 ? totalCount : '0'}
            </span>
          </div>
          <span className="font-mono text-[8px] uppercase tracking-wider font-bold">
            {totalCount > 0 ? `${totalSum.toLocaleString('uk-UA')} ₴` : 'Кошик'}
          </span>
        </button>
      </div>
    </div>
  );
};
