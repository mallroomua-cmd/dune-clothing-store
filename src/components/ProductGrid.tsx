import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, PackageX } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from './ProductCard';

export const ProductGrid: React.FC = () => {
  const { products } = useStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc' | 'discount'>('popular');

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.productType) set.add(p.productType);
    });
    return Array.from(set);
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
      result = result.filter((p) => p.productType === selectedCategory);
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
              onChange={(e) => setSortBy(e.target.value as any)}
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
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Пошук товарів за назвою, брендом або тегом..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-sm transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold px-1.5 py-0.5 rounded bg-slate-100"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === 'all'
                  ? 'bg-brand-600 text-white shadow-brand-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Всі товари ({products.length})
            </button>
            {categories.map((cat) => {
              const count = products.filter((p) => p.productType === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white shadow-brand-600/20'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
