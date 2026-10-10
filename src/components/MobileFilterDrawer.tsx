import React, { useMemo } from 'react';
import { X, SlidersHorizontal, Check, RotateCcw } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useModal } from '../hooks/useModal';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  minPrice: number;
  maxPrice: number;
  setMinPrice: (val: number) => void;
  setMaxPrice: (val: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  sortBy: 'popular' | 'price_asc' | 'price_desc' | 'discount';
  setSortBy: (val: 'popular' | 'price_asc' | 'price_desc' | 'discount') => void;
  totalFilteredCount: number;
}

export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  inStockOnly,
  setInStockOnly,
  sortBy,
  setSortBy,
  totalFilteredCount,
}) => {
  useModal(isOpen, onClose);
  const {
    products,
    selectedCategory,
    setSelectedCategory,
    selectedBrand,
    setSelectedBrand,
  } = useStore();

  // Extract all categories with counts
  const { categories, categoryCounts } = useMemo(() => {
    const counts = new Map<string, number>();
    const list: string[] = [];
    products.forEach((p) => {
      const cat = p.productType || 'Інше';
      if (!counts.has(cat)) {
        counts.set(cat, 0);
        list.push(cat);
      }
      counts.set(cat, counts.get(cat)! + 1);
    });
    return { categories: list, categoryCounts: counts };
  }, [products]);

  // Extract all brands with counts
  const { brands, brandCounts } = useMemo(() => {
    const counts = new Map<string, number>();
    const list: string[] = [];
    products.forEach((p) => {
      const b = p.vendor || 'Інше';
      if (!counts.has(b)) {
        counts.set(b, 0);
        list.push(b);
      }
      counts.set(b, counts.get(b)! + 1);
    });
    return { brands: list.sort(), brandCounts: counts };
  }, [products]);

  const handleResetAll = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setMinPrice(0);
    setMaxPrice(0);
    setInStockOnly(false);
    setSortBy('popular');
  };

  const handleApply = () => {
    onClose();
    if (typeof document !== 'undefined') {
      document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Card */}
      <div className="relative w-full max-h-[88vh] bg-white rounded-t-2xl shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom duration-300">
        {/* Drag Indicator & Header */}
        <div className="p-4 border-b border-neutral-200 bg-white sticky top-0 z-20">
          <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-dune-ochre" />
              <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-black">
                ФІЛЬТРИ ТА СОРТУВАННЯ
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 text-neutral-600 flex items-center justify-center hover:bg-neutral-200 transition-colors"
              aria-label="Закрити фільтри"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Filter Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* 1. Sorting Order */}
          <div className="space-y-2">
            <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest block">
              // СОРТУВАННЯ
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'popular', label: 'За популярністю' },
                { id: 'price_asc', label: 'Ціна: від низької' },
                { id: 'price_desc', label: 'Ціна: від високої' },
                { id: 'discount', label: 'За розміром знижки' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSortBy(s.id as any)}
                  className={`p-2.5 rounded-lg text-xs font-mono font-medium text-left transition-all border ${
                    sortBy === s.id
                      ? 'bg-black text-white border-black font-bold'
                      : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Categories Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
                // КАТЕГОРІЯ
              </span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-[11px] font-mono text-dune-ochre hover:underline uppercase"
                >
                  Всі
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider transition-all border ${
                  selectedCategory === 'all'
                    ? 'bg-black text-white border-black'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                }`}
              >
                ВСІ ({products.length})
              </button>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count = categoryCounts.get(cat) ?? 0;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-mono font-semibold uppercase tracking-wider transition-all border ${
                      isSelected
                        ? 'bg-black text-white border-black'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Brands Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest">
                // БРЕНДИ & ДИЗАЙНЕРИ
              </span>
              {selectedBrand !== 'all' && (
                <button
                  onClick={() => setSelectedBrand('all')}
                  className="text-[11px] font-mono text-dune-ochre hover:underline uppercase"
                >
                  Всі бренди
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-neutral-100 rounded-lg">
              <button
                onClick={() => setSelectedBrand('all')}
                className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-all ${
                  selectedBrand === 'all'
                    ? 'bg-black text-white font-bold'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                ВСІ
              </button>
              {brands.map((b) => {
                const isSelected = selectedBrand === b;
                const count = brandCounts.get(b) ?? 0;
                return (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(isSelected ? 'all' : b)}
                    className={`px-2.5 py-1 rounded text-xs font-mono uppercase transition-all ${
                      isSelected
                        ? 'bg-black text-white font-bold'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {b} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Price Range */}
          <div className="space-y-2">
            <span className="font-mono text-xs text-neutral-400 uppercase tracking-widest block">
              // ДІАПАЗОН ЦІНИ (₴)
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">
                  Від:
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={minPrice || ''}
                  onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg border border-neutral-200 font-mono text-xs focus:border-black focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-neutral-500 uppercase block mb-1">
                  До:
                </label>
                <input
                  type="number"
                  placeholder="25000"
                  value={maxPrice || ''}
                  onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg border border-neutral-200 font-mono text-xs focus:border-black focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 5. In-Stock Only Toggle */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold uppercase text-black block">
                Тільки в наявності
              </span>
              <span className="text-[11px] font-mono text-neutral-400">
                Приховати позиції під замовлення
              </span>
            </div>
            <button
              type="button"
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                inStockOnly ? 'bg-black' : 'bg-neutral-200'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                  inStockOnly ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-neutral-200 bg-white flex items-center gap-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleResetAll}
            className="px-4 py-3 rounded-xl border border-neutral-200 text-xs font-mono font-bold uppercase text-neutral-600 hover:bg-neutral-50 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Скинути</span>
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="flex-1 py-3 px-4 rounded-xl bg-black hover:bg-neutral-800 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
          >
            <Check className="w-4 h-4 text-dune-ochre" />
            <span>ПОКАЗАТИ ({totalFilteredCount} ТОВАРІВ)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
