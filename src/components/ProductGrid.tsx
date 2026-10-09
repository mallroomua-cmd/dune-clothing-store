import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, PackageX, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

const PAGE_SIZE = 12;

export const ProductGrid: React.FC = () => {
  const { products } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'discount'>('popular');
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);

  // Single O(N) pass to calculate category counts (Fixes B11 performance issue!)
  const { categories, categoryCounts } = useMemo(() => {
    const counts = new Map<string, number>();
    const catList: string[] = [];

    for (const p of products) {
      const type = p.productType || 'Інше';
      if (!counts.has(type)) {
        counts.set(type, 0);
        catList.push(type);
      }
      counts.set(type, counts.get(type)! + 1);
    }

    return { categories: catList, categoryCounts: counts };
  }, [products]);

  // Filter and sort
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter((p) => (p.productType || 'Інше') === selectedCategory);
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => {
        const discA = a.compareAtPrice ? a.compareAtPrice - a.price : 0;
        const discB = b.compareAtPrice ? b.compareAtPrice - b.price : 0;
        return discB - discA;
      });
    }

    return result;
  }, [products, search, selectedCategory, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  return (
    <section id="catalog-section" className="py-12 sm:py-16 bg-slate-50/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-brand-100 text-brand-800 text-xs font-bold uppercase tracking-wider mb-2">
              Каталог товарів
            </div>
            <h2 className="text-2xl sm:text-4xl font-black font-heading text-slate-900 tracking-tight">
              Обирайте найкраще для себе
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-1">
              Знайдено {filteredProducts.length} товарів, доступних до швидкого замовлення
            </p>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <SlidersHorizontal className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as any);
                setVisibleCount(PAGE_SIZE);
              }}
              className="bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl px-3 py-2 outline-none focus:border-brand-500 shadow-sm cursor-pointer"
            >
              <option value="popular">За популярністю</option>
              <option value="price_asc">Ціна: від дешевих</option>
              <option value="price_desc">Ціна: від дорогих</option>
              <option value="discount">За розміром знижки</option>
            </select>
          </div>
        </div>

        {/* Search and Category Filter Chips */}
        <div className="space-y-4 mb-8">
          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Пошук товарів за назвою, брендом або тегом..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              className="w-full min-h-[46px] pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-200/90 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-800 font-bold w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center transition-colors"
                title="Очистити пошук"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips with 44px min height touch target and tabular count */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none py-1">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setVisibleCount(PAGE_SIZE);
              }}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-sm active:scale-[0.97] ${
                selectedCategory === 'all'
                  ? 'bg-brand-600 text-white shadow-brand-600/20 shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300'
              }`}
            >
              Всі товари <span className="ml-1 opacity-80 tabular-nums">({products.length})</span>
            </button>
            {categories.map((cat) => {
              const count = categoryCounts.get(cat) ?? 0;
              return (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setVisibleCount(PAGE_SIZE);
                  }}
                  className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-sm active:scale-[0.97] ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white shadow-brand-600/20 shadow-md'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  {cat} <span className="ml-1 opacity-80 tabular-nums">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {displayedProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-200/80 shadow-md transition-all active:scale-95"
                >
                  <span>Показати ще товари (залишилось {filteredProducts.length - visibleCount})</span>
                  <ChevronDown className="w-4 h-4 text-brand-600" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 max-w-md mx-auto shadow-sm">
            <PackageX className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-slate-800 text-lg mb-1">
              Нічого не знайдено
            </h3>
            <p className="text-slate-500 text-sm mb-4">
              Спробуйте змінити пошуковий запит або скинути фільтри категорій
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
                setVisibleCount(PAGE_SIZE);
              }}
              className="px-4 py-2 rounded-xl bg-brand-50 text-brand-700 font-bold text-sm hover:bg-brand-100 transition-colors"
            >
              Скинути фільтри
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
