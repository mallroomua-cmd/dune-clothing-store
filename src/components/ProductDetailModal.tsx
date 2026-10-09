import React, { useState } from 'react';
import { ShoppingBag, Zap, CheckCircle2, Star } from 'lucide-react';
import DOMPurify from 'dompurify';
import { useStore } from '../context/StoreContext';
import { ProductJsonLd } from './ProductJsonLd';
import { findVariant } from '../lib/ids';
import { useModal } from '../hooks/useModal';
import { getRelatedProducts } from '../lib/related';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    selectedVariant,
    setSelectedVariant,
    products,
    addToCart,
    openQuickOrder,
  } = useStore();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [added, setAdded] = useState(false);

  const handleClose = () => {
    setSelectedProduct(null);
    setSelectedImage('');
    setSelectedVariant('');
  };

  useModal(!!selectedProduct, handleClose);

  if (!selectedProduct) return null;

  const currentVariant = findVariant(selectedProduct, selectedVariant);
  const activePrice = currentVariant?.price ?? selectedProduct.price;
  const activeComparePrice = currentVariant?.compareAtPrice ?? selectedProduct.compareAtPrice;

  const activeImage = selectedImage || selectedProduct.featuredImage;
  const discountPercent =
    activeComparePrice && activeComparePrice > activePrice
      ? Math.round(((activeComparePrice - activePrice) / activeComparePrice) * 100)
      : null;

  // Cross-sell items
  const related = getRelatedProducts([selectedProduct], products, 2);

  const handleAddAndClose = () => {
    addToCart(selectedProduct, 1, selectedVariant || currentVariant?.title);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      handleClose();
    }, 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 md:p-6 animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Schema.org JSON-LD microdata for Google Merchant / SEO */}
      <ProductJsonLd product={selectedProduct} />

      <div
        className="relative bg-white max-w-3xl w-full hairline-all flex flex-col md:flex-row max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto md:overflow-hidden overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile top handle */}
        <div className="w-10 h-1 bg-neutral-300 mx-auto my-2 sm:hidden shrink-0" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Закрити вікно товару"
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-8 h-8 font-mono text-neutral-400 hover:text-black flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        {/* Left Column: Image Gallery with #F6F6F6 background */}
        <div className="md:w-1/2 p-5 sm:p-6 bg-[#f6f6f6] flex flex-col items-center justify-center hairline-b md:hairline-b-0 md:hairline-r">
          <div className="relative aspect-square w-full max-w-xs sm:max-w-sm overflow-hidden mb-3 sm:mb-4">
            <img
              src={activeImage}
              alt={selectedProduct.title}
              className="w-full h-full object-cover object-center mix-blend-multiply"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
              }}
            />
            {discountPercent && (
              <span className="absolute top-2 left-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-black text-white">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {selectedProduct.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto w-full max-w-xs sm:max-w-sm pb-1 scrollbar-none">
              {selectedProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-12 h-12 overflow-hidden shrink-0 transition-all ${
                    activeImage === img
                      ? 'border-2 border-black'
                      : 'border border-neutral-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Order CTA */}
        <div className="md:w-1/2 p-5 sm:p-7 overflow-y-auto flex flex-col font-sans">
          <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500 uppercase tracking-wider mb-2">
            <span>{selectedProduct.productType || 'ITEM'}</span>
            <span>//</span>
            <span className="text-black font-semibold">{selectedProduct.vendor || 'CONCEPT'}</span>
          </div>

          <h2 className="text-lg sm:text-xl font-medium text-black uppercase mb-2 leading-snug">
            {selectedProduct.title}
          </h2>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3 font-mono text-xs">
            <div className="flex items-center gap-0.5 text-dune-ochre">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-neutral-500 text-[11px] uppercase">4.9 / 5 (ВІДГУКИ)</span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-4 font-mono">
            <span className="text-2xl font-bold text-black tabular-nums">
              {activePrice.toLocaleString('uk-UA')} ₴
            </span>
            {activeComparePrice && activeComparePrice > activePrice && (
              <span className="text-sm text-neutral-400 line-through tabular-nums">
                {activeComparePrice.toLocaleString('uk-UA')} ₴
              </span>
            )}
          </div>

          {/* Stock state */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-dune-ochre uppercase border border-dune-ochre/30 px-2.5 py-1 w-fit mb-5">
            <CheckCircle2 className="w-3.5 h-3.5 text-dune-ochre" />
            <span>В НАЯВНОСТІ • ВІДПРАВКА СЬОГОДНІ</span>
          </div>

          {/* Variants Selector */}
          {selectedProduct.variants && selectedProduct.variants.length > 1 && (
            <div className="mb-5 font-mono">
              <label className="block text-[11px] text-neutral-500 uppercase tracking-wider mb-2">
                // ВАРІАНТ / РОЗМІР / КОЛІР:
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.title)}
                    className={`min-h-[38px] px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
                      (selectedVariant || selectedProduct.variants[0].title) === v.title
                        ? 'bg-black text-white hairline-all'
                        : 'bg-white text-neutral-700 hover:text-black hairline-all'
                    }`}
                  >
                    {v.title} — {v.price} ₴
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sanitized HTML Description */}
          <div className="text-xs text-neutral-600 leading-relaxed mb-6 space-y-2 hairline-t pt-4">
            <h4 className="font-mono font-bold text-black text-xs uppercase tracking-wider">
              // ОПИС ТА ХАРАКТЕРИСТИКИ
            </h4>
            {selectedProduct.bodyHtml ? (
              <div
                className="prose prose-sm max-w-none text-neutral-600 line-clamp-5 text-xs"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(selectedProduct.bodyHtml),
                }}
              />
            ) : (
              <p>Оригінальний товар, перевірений перед відправкою. Офіційна гарантія 14 днів.</p>
            )}
          </div>

          {/* Cross-Sell Recommendations */}
          {related.length > 0 && (
            <div className="hairline-t pt-4 mb-6">
              <h4 className="font-mono text-neutral-500 text-[10px] uppercase tracking-wider mb-2">
                // ЧАСТО ЗАМОВЛЯЮТЬ РАЗОМ:
              </h4>
              <div className="space-y-2">
                {related.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between p-2 bg-neutral-50 hairline-all text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={rel.featuredImage}
                        alt=""
                        className="w-8 h-8 object-cover bg-white shrink-0"
                      />
                      <span className="font-sans font-medium text-black truncate uppercase text-[11px]">
                        {rel.title}
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(rel, 1)}
                      className="min-h-[30px] inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white font-mono text-[10px] uppercase font-bold shrink-0 ml-2 hover:bg-neutral-800 transition-all"
                    >
                      <span>+ {rel.price} ₴</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-auto space-y-2 pt-4 hairline-t font-mono">
            <button
              onClick={() => {
                openQuickOrder(selectedProduct, selectedVariant || currentVariant?.title);
                handleClose();
              }}
              className="w-full min-h-[46px] py-3 px-4 bg-black hover:bg-neutral-800 text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5 text-dune-ochre fill-current" />
              <span>ШВИДКЕ ЗАМОВЛЕННЯ В 1 КЛІК</span>
            </button>

            <button
              onClick={handleAddAndClose}
              className="w-full min-h-[44px] py-2.5 px-4 bg-white hover:bg-neutral-100 text-black hairline-all font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{added ? 'ДОДАНО ДО КОШИКА!' : 'ДОДАТИ В КОШИК'}</span>
            </button>
          </div>
        </div>

        {/* Sticky Mobile Quick Order Bar */}
        <div className="sticky bottom-0 left-0 right-0 p-3 bg-white hairline-t flex items-center justify-between gap-3 md:hidden z-20 font-mono">
          <div className="min-w-0">
            <div className="text-[10px] text-neutral-400 uppercase">ЦІНА:</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-black tabular-nums">
                {activePrice.toLocaleString('uk-UA')} ₴
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                addToCart(selectedProduct, 1, selectedVariant || currentVariant?.title);
                handleClose();
              }}
              className="min-h-[40px] px-3 bg-white hairline-all text-black font-bold text-xs uppercase flex items-center justify-center"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                openQuickOrder(selectedProduct, selectedVariant || currentVariant?.title);
                handleClose();
              }}
              className="min-h-[40px] py-2 px-4 bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-dune-ochre fill-current" />
              <span>В 1 КЛІК</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
