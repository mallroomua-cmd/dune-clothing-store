import React, { useState } from 'react';
import { X, ShoppingCart, Zap, CheckCircle2, ShieldCheck, Truck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductJsonLd } from './ProductJsonLd';

export const ProductDetailModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, openQuickOrder } = useStore();
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<string>('');

  if (!selectedProduct) return null;

  const activeImage = selectedImage || selectedProduct.featuredImage;
  const discountPercent =
    selectedProduct.compareAtPrice && selectedProduct.compareAtPrice > selectedProduct.price
      ? Math.round(
          ((selectedProduct.compareAtPrice - selectedProduct.price) /
            selectedProduct.compareAtPrice) *
            100
        )
      : null;

  const handleClose = () => {
    setSelectedProduct(null);
    setSelectedImage('');
    setSelectedVariant('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Schema.org JSON-LD microdata for Google Merchant / SEO */}
      <ProductJsonLd product={selectedProduct} />

      <div
        className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-100 my-8 flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
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
            <div className="flex items-center gap-2 overflow-x-auto w-full max-w-sm pb-1">
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

          <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 mb-3 leading-snug">
            {selectedProduct.title}
          </h2>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl sm:text-3xl font-black font-heading text-slate-900">
              {selectedProduct.price.toLocaleString('uk-UA')} <span className="text-base font-bold">₴</span>
            </span>
            {selectedProduct.compareAtPrice &&
              selectedProduct.compareAtPrice > selectedProduct.price && (
                <span className="text-base text-slate-400 line-through font-semibold">
                  {selectedProduct.compareAtPrice.toLocaleString('uk-UA')} ₴
                </span>
              )}
          </div>

          {/* Stock state */}
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit mb-5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>В наявності на складі • Відправка сьогодні</span>
          </div>

          {/* Variants Selector (if multiple) */}
          {selectedProduct.variants && selectedProduct.variants.length > 1 && (
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Варіант / Колір:
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.title)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      (selectedVariant || selectedProduct.variants[0].title) === v.title
                        ? 'border-brand-600 bg-brand-50 text-brand-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="text-sm text-slate-600 leading-relaxed mb-6 space-y-2 border-t border-slate-100 pt-4">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
              Опис товару
            </h4>
            {selectedProduct.bodyHtml ? (
              <div
                className="prose prose-sm max-w-none text-slate-600 line-clamp-6"
                dangerouslySetInnerHTML={{ __html: selectedProduct.bodyHtml }}
              />
            ) : (
              <p>Якісний товар, протестований перед відправкою. Офіційна гарантія виробника.</p>
            )}
          </div>

          {/* CTAs */}
          <div className="mt-auto space-y-2.5 pt-4 border-t border-slate-100">
            <button
              onClick={() => {
                openQuickOrder(selectedProduct);
                handleClose();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-accent-500 hover:bg-accent-600 active:scale-95 text-white font-bold text-sm shadow-lg shadow-accent-500/25 flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Швидке замовлення в 1 клік</span>
            </button>

            <button
              onClick={() => {
                addToCart(selectedProduct, 1, selectedVariant);
                handleClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-brand-50 hover:bg-brand-100 active:scale-95 text-brand-700 border border-brand-200 font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Додати в кошик</span>
            </button>
          </div>

          {/* Mini guarantee reassurance */}
          <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-brand-600" />
              <span>Доставка 1-2 дні</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              <span>Оплата при огляді</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
