import React from 'react';
import { ShoppingBag, Zap, Eye, Check } from 'lucide-react';
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
      className="group relative bg-white hairline-all hover:border-black transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Badges container */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start pointer-events-none">
        {discountPercent && (
          <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-black text-white">
            -{discountPercent}%
          </span>
        )}
        <span className="font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 bg-white/95 text-dune-ochre hairline-all">
          В НАЯВНОСТІ
        </span>
      </div>

      {/* Image container with DUNE #F6F6F6 background */}
      <div className="relative aspect-square w-full bg-[#f6f6f6] overflow-hidden">
        <img
          src={product.featuredImage}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out mix-blend-multiply"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
          }}
        />

        {/* Hover quick view hint on desktop */}
        <div className="hidden sm:flex absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 items-center justify-center p-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-black font-mono text-[11px] font-bold uppercase tracking-wider shadow-sm">
            <Eye className="w-3.5 h-3.5 text-dune-ochre" />
            <span>ОГЛЯД</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 bg-white">
        {/* Vendor & Category in Monospace */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
          <span className="truncate">{product.vendor || 'CONCEPT'}</span>
          <span className="text-neutral-300">//</span>
          <span className="text-neutral-400">{product.productType || 'ITEM'}</span>
        </div>

        {/* Title */}
        <h3 className="font-sans font-medium text-xs sm:text-sm text-black line-clamp-2 uppercase group-hover:text-dune-ochre transition-colors leading-snug mb-2">
          {product.title}
        </h3>

        {/* Price Box */}
        <div className="mt-auto pt-2 hairline-t flex items-baseline gap-2 mb-3">
          <span className="text-sm sm:text-base font-bold font-mono text-black tabular-nums tracking-tight">
            {product.price.toLocaleString('uk-UA')} ₴
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[11px] sm:text-xs text-neutral-400 line-through font-mono tabular-nums">
              {product.compareAtPrice.toLocaleString('uk-UA')} ₴
            </span>
          )}
        </div>

        {/* Stiletto Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={handleQuickBuy}
            className="min-h-[38px] sm:min-h-[40px] inline-flex items-center justify-center gap-1 py-1.5 px-2 bg-white hover:bg-neutral-100 active:scale-[0.98] text-black font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider hairline-all transition-all"
            title="Швидке замовлення в 1 клік"
          >
            <Zap className="w-3 h-3 text-dune-ochre fill-current" />
            <span>1-КЛІК</span>
          </button>

          <button
            onClick={handleAddToCart}
            className={`min-h-[38px] sm:min-h-[40px] inline-flex items-center justify-center gap-1 py-1.5 px-2 font-mono font-bold text-[10px] sm:text-xs uppercase tracking-wider transition-all active:scale-[0.98] ${
              added
                ? 'bg-dune-ochre text-white'
                : 'bg-black hover:bg-neutral-800 text-white'
            }`}
            title="Додати в кошик"
          >
            {added ? (
              <>
                <Check className="w-3 h-3" />
                <span>ДОДАНО</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3" />
                <span>В КОШИК</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
