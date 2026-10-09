import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { findVariant } from '../lib/ids';
import { useModal } from '../hooks/useModal';
import { FREE_SHIPPING_THRESHOLD, getRelatedProducts } from '../lib/related';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    products,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    openCartCheckout,
    addToCart,
  } = useStore();

  const handleClose = () => setIsCartDrawerOpen(false);
  useModal(isCartDrawerOpen, handleClose);

  if (!isCartDrawerOpen) return null;

  const total = cart.reduce((acc, item) => {
    const v = findVariant(item.product, item.selectedVariant);
    return acc + (v?.price || item.product.price) * item.quantity;
  }, 0);

  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);
  const freeShippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);

  // Recommendations for items not in cart
  const cartProducts = cart.map((i) => i.product);
  const crossSell = getRelatedProducts(cartProducts, products, 2);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-brand-600" />
            <h2 className="text-lg font-black font-heading text-slate-900">
              Кошик покупок ({cart.reduce((a, b) => a + b.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar (CRO Booster) */}
        <div className="px-5 py-3.5 bg-brand-50/60 border-b border-brand-100 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-800 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-brand-600" />
              {amountToFreeShipping === 0 ? (
                <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Безкоштовна доставка активована!
                </span>
              ) : (
                <span>
                  До безкоштовної доставки:{' '}
                  <strong className="text-brand-700">{amountToFreeShipping.toLocaleString('uk-UA')} ₴</strong>
                </span>
              )}
            </span>
            <span className="text-slate-600 font-extrabold">{Math.round(freeShippingProgress)}%</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length > 0 ? (
            <>
              {cart.map((item) => {
                const v = findVariant(item.product, item.selectedVariant);
                const price = v?.price || item.product.price;
                return (
                  <div
                    key={`${item.product.id}__${item.selectedVariant || 'default'}`}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100"
                  >
                    <img
                      src={item.product.featuredImage}
                      alt={item.product.title}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 mb-0.5">
                        {item.product.title}
                      </h3>
                      {item.selectedVariant && item.selectedVariant !== 'Default Title' && (
                        <p className="text-[11px] text-slate-500 mb-1">
                          Варіант: <span className="font-semibold">{item.selectedVariant}</span>
                        </p>
                      )}
                      <div className="text-brand-600 font-black text-sm mb-2">
                        {price.toLocaleString('uk-UA')} ₴
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.selectedVariant
                              )
                            }
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded-l-lg transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.quantity + 1,
                                item.selectedVariant
                              )
                            }
                            className="p-1 hover:bg-slate-100 text-slate-600 rounded-r-lg transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedVariant)}
                          className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                          title="Видалити з кошика"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* In-Cart Cross-sell block */}
              {crossSell.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="font-bold text-xs text-slate-700 uppercase tracking-wider mb-2.5">
                    Додайте до замовлення:
                  </p>
                  <div className="space-y-2">
                    {crossSell.map((rel) => (
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
            </>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-base mb-1">Ваш кошик порожній</p>
              <p className="text-slate-500 text-xs mb-4">Додайте товари з каталогу, щоб оформити замовлення</p>
              <button
                onClick={handleClose}
                className="px-5 py-2.5 rounded-xl bg-brand-50 text-brand-700 font-bold text-xs hover:bg-brand-100 transition-colors"
              >
                Перейти до покупок
              </button>
            </div>
          )}
        </div>

        {/* Footer & Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
            <div className="flex justify-between items-center text-sm font-semibold text-slate-600">
              <span>Доставка:</span>
              <span className={amountToFreeShipping === 0 ? 'text-emerald-700 font-bold' : 'text-slate-700 font-bold'}>
                {amountToFreeShipping === 0 ? 'Безкоштовно' : 'За тарифами пошти'}
              </span>
            </div>
            <div className="flex justify-between items-center text-lg font-black text-slate-900 border-t border-slate-200/80 pt-2">
              <span>Всього до сплати:</span>
              <span className="text-brand-600 text-xl font-heading">{total.toLocaleString('uk-UA')} ₴</span>
            </div>
            <button
              onClick={openCartCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-black text-sm shadow-lg shadow-accent-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>Оформити замовлення</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
