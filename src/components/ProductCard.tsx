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
      className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-brand-500/40 shadow-sm hover:shadow-premium-hover hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Badges container */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start pointer-events-none">
        {discountPercent && (
          <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-gradient-to-r from-accent-600 to-rose-500 text-white shadow-md shadow-accent-500/25 tracking-wide flex items-center gap-1">
            <span>-{discountPercent}%</span>
          </span>
        )}
        {product.tags.includes('Хіт продажу') || product.tags.includes('Хіт') ? (
          <span className="px-2.5 py-0.5 rounded-xl text-[11px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/20 tracking-wider uppercase">
            🔥 Топ Хіт
          </span>
        ) : null}
      </div>

      {/* Image container */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden img-optical-outline">
        <img
          src={product.featuredImage}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Hover overlay quick view action */}
        <div className="absolute inset-0 bg-slate-900/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-4">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/95 backdrop-blur-md text-slate-800 text-xs font-extrabold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
            <Eye className="w-4 h-4 text-brand-600" />
            <span>Швидкий перегляд</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        {/* Category & Vendor */}
        <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5 font-medium">
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
            {product.productType || 'Товар'}
          </span>
          {product.vendor && <span className="font-semibold text-slate-700">{product.vendor}</span>}
        </div>

        {/* Title */}
        <h2 className="font-heading font-bold text-slate-900 text-sm sm:text-base line-clamp-2 mb-2 group-hover:text-brand-600 transition-colors leading-snug">
          {product.title}
        </h2>

        {/* In-Stock Indicator & CRO Urgency */}
        <div className="flex items-center justify-between text-xs mb-3">
          <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>В наявності</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-semibold border border-amber-200/60">
            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>Залишилось 3 шт.</span>
          </div>
        </div>

        {/* Price Box */}
        <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-baseline gap-2 mb-4">
          <span className="text-xl sm:text-2xl font-black font-heading text-slate-900 tabular-nums tracking-tight">
            {product.price.toLocaleString('uk-UA')} <span className="text-sm font-bold text-slate-800">₴</span>
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs sm:text-sm text-slate-600 line-through font-semibold tabular-nums">
              {product.compareAtPrice.toLocaleString('uk-UA')} ₴
            </span>
          )}
        </div>

        {/* Action Buttons with 44px min touch target */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleQuickBuy}
            className="w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 active:scale-[0.96] text-white font-extrabold text-xs sm:text-sm shadow-md shadow-accent-500/20 hover:shadow-glow-accent transition-all duration-200"
            title="Купити в 1 клік"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>В 1 клік</span>
          </button>

          <button
            onClick={handleAddToCart}
            className={`w-full min-h-[44px] inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-200 border active:scale-[0.96] ${
              added
                ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                : 'bg-brand-50 hover:bg-brand-100 text-brand-800 border-brand-200/90'
            }`}
            title="Додати в кошик"
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Додано!</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>В кошик</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
