import React, { useState } from 'react';
import { X, ShoppingCart, Zap, CheckCircle2, ShieldCheck, Truck, Plus } from 'lucide-react';
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

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Schema.org JSON-LD microdata for Google Merchant / SEO */}
      <ProductJsonLd product={selectedProduct} />

      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 my-auto flex flex-col md:flex-row max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto md:overflow-hidden overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Закрити вікно товару"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100/90 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image Gallery */}
        <div className="md:w-1/2 p-6 bg-slate-50 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-100">
          <div className="relative aspect-square w-full max-w-sm rounded-2xl overflow-hidden bg-white shadow-sm border border-slate-200/60 mb-4">
            <img
              src={activeImage}
              alt={selectedProduct.title}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
              }}
            />
            {discountPercent && (
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-black bg-accent-500 text-white shadow-md">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {selectedProduct.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto w-full max-w-sm pb-1 scrollbar-none">
              {selectedProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                    activeImage === img
                      ? 'border-brand-600 scale-105 shadow-sm'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Order CTA */}
        <div className="md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col">
          <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
            <span>{selectedProduct.productType || 'Товар'}</span>
            {selectedProduct.vendor && (
              <>
                <span>•</span>
                <span className="text-slate-400">{selectedProduct.vendor}</span>
              </>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 mb-2 leading-snug">
            {selectedProduct.title}
          </h2>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
              {activePrice.toLocaleString('uk-UA')} <span className="text-base font-bold">₴</span>
            </span>
            {activeComparePrice && activeComparePrice > activePrice && (
              <span className="text-base text-slate-400 line-through font-semibold">
                {activeComparePrice.toLocaleString('uk-UA')} ₴
              </span>
            )}
          </div>

          {/* Stock state */}
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit mb-5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>В наявності на складі • Відправка сьогодні</span>
          </div>

          {/* Variants Selector */}
          {selectedProduct.variants && selectedProduct.variants.length > 1 && (
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Оберіть варіант / колір:
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.title)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      (selectedVariant || selectedProduct.variants[0].title) === v.title
                        ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {v.title} — {v.price} ₴
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sanitized HTML Description (Fixes XSS) */}
          <div className="text-sm text-slate-600 leading-relaxed mb-6 space-y-2 border-t border-slate-100 pt-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Опис товару
            </h4>
            {selectedProduct.bodyHtml ? (
              <div
                className="prose prose-sm max-w-none text-slate-600 line-clamp-6"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(selectedProduct.bodyHtml),
                }}
              />
            ) : (
              <p>Якісний товар, перевірений перед відправкою. Офіційна гарантія.</p>
            )}
          </div>

          {/* Cross-Sell Recommendations */}
          {related.length > 0 && (
            <div className="border-t border-slate-100 pt-4 mb-6">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2">
                Часто замовляють разом:
              </h4>
              <div className="space-y-2">
                {related.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={rel.featuredImage}
                        alt=""
                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                      />
                      <span className="font-bold text-slate-800 truncate">{rel.title}</span>
                    </div>
                    <button
                      onClick={() => addToCart(rel, 1)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-brand-50 hover:text-brand-700 font-bold text-slate-700 shrink-0 ml-2"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{rel.price} ₴</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-auto space-y-2.5 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                openQuickOrder(selectedProduct, selectedVariant || currentVariant?.title);
                handleClose();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-accent-500 hover:bg-accent-600 active:scale-95 text-white font-bold text-sm shadow-lg shadow-accent-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Швидке замовлення в 1 клік</span>
            </button>

            <button
              onClick={() => {
                addToCart(selectedProduct, 1, selectedVariant || currentVariant?.title);
                handleClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-brand-50 hover:bg-brand-100 active:scale-95 text-brand-700 border border-brand-200 font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Додати в кошик</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-brand-600" />
              <span>Доставка 1-2 дні</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Оплата при отриманні</span>
            </div>
          </div>
        </div>

        {/* Sticky Mobile Quick Order Bar */}
        <div className="sticky bottom-0 left-0 right-0 p-3.5 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-between gap-3 md:hidden z-20 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <div className="min-w-0">
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Ціна:</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900">
                {activePrice.toLocaleString('uk-UA')} ₴
              </span>
              {activeComparePrice && activeComparePrice > activePrice && (
                <span className="text-xs text-slate-400 line-through">
                  {activeComparePrice.toLocaleString('uk-UA')} ₴
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                addToCart(selectedProduct, 1, selectedVariant || currentVariant?.title);
                handleClose();
              }}
              aria-label="Додати в кошик"
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                openQuickOrder(selectedProduct, selectedVariant || currentVariant?.title);
                handleClose();
              }}
              className="py-2.5 px-4 rounded-xl bg-accent-500 hover:bg-accent-600 active:scale-95 text-white font-black text-xs shadow-md shadow-accent-500/20 flex items-center gap-1.5 transition-all whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>В 1 клік</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
