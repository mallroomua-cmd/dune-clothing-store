import React from 'react';
import { ShoppingCart, Zap, Eye, Check, Flame } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';

export const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { addToCart, openQuickOrder, setSelectedProduct } = useStore();
  const [added, setAdded] = React.useState(false);

  const discountPercent =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleQuickBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    openQuickOrder(product);
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Badges container */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {discountPercent && (
          <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-accent-500 text-white shadow-sm tracking-wide">
            -{discountPercent}%
          </span>
        )}
        {product.tags.includes('Хіт продажу') || product.tags.includes('Хіт') ? (
          <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-500 text-white shadow-sm">
            ТОП ХІТ
          </span>
        ) : null}
      </div>

      {/* Image container */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
        <img
          src={product.featuredImage}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Hover overlay quick view action */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 text-slate-800 text-xs font-bold shadow-md">
            <Eye className="w-4 h-4 text-brand-600" />
            <span>Швидкий перегляд</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Category & Vendor */}
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
          <span>{product.productType || 'Товар'}</span>
          {product.vendor && <span className="font-semibold text-slate-600">{product.vendor}</span>}
        </div>

        {/* Title */}
        <h2 className="font-heading font-bold text-slate-900 text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors">
          {product.title}
        </h2>

        {/* In-Stock Indicator & CRO Urgency */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>В наявності</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-medium">
            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>Залишилось 3 шт.</span>
          </div>
        </div>

        {/* Price Box */}
        <div className="mt-auto pt-2 border-t border-slate-100 flex items-baseline gap-2 mb-4">
          <span className="text-xl sm:text-2xl font-black font-heading text-slate-900">
            {product.price.toLocaleString('uk-UA')} <span className="text-sm font-bold">₴</span>
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs sm:text-sm text-slate-600 line-through font-semibold">
              {product.compareAtPrice.toLocaleString('uk-UA')} ₴
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleQuickBuy}
            className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-accent-500 hover:bg-accent-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-accent-500/20 transition-all"
            title="Купити в 1 клік"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>В 1 клік</span>
          </button>

          <button
            onClick={handleAddToCart}
            className={`w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
              added
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-brand-50 hover:bg-brand-100 text-brand-700 border-brand-200 active:scale-95'
            }`}
            title="Додати в кошик"
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Додано!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>В кошик</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
