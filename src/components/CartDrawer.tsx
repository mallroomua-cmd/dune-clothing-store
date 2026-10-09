import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Truck, CheckCircle2 } from 'lucide-react';
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

  const totalCount = cart.reduce((a, b) => a + b.quantity, 0);
  const amountToFreeShipping = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);
  const freeShippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);

  // Recommendations for items not in cart
  const cartProducts = cart.map((i) => i.product);
  const crossSell = getRelatedProducts(cartProducts, products, 2);

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-md flex justify-end animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black font-heading text-slate-900">
                Кошик покупок
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {totalCount} {totalCount === 1 ? 'товар' : 'товари(-ів)'}
              </span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors active:scale-90"
            aria-label="Закрити кошик"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar (CRO Booster) */}
        <div className="bg-slate-50/90 border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="flex items-center gap-1.5 text-slate-700">
              <Truck className="w-4 h-4 text-brand-600" />
              {amountToFreeShipping === 0 ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Безкоштовна доставка активована!
                </span>
              ) : (
                <span>
                  До безкоштовної доставки ще{' '}
                  <strong className="text-brand-600 tabular-nums">
                    {amountToFreeShipping.toLocaleString('uk-UA')} ₴
                  </strong>
                </span>
              )}
            </span>
            <span className="text-[11px] font-bold text-slate-500 tabular-nums">
              {Math.round(freeShippingProgress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 via-emerald-500 to-teal-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {cart.length > 0 ? (
            <>
              {cart.map((item) => {
                const v = findVariant(item.product, item.selectedVariant);
                const price = v?.price || item.product.price;
                return (
                  <div
                    key={`${item.product.id}__${item.selectedVariant || 'default'}`}
                    className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm transition-all"
                  >
                    <div className="w-18 h-18 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60 img-optical-outline">
                      <img
                        src={item.product.featuredImage}
                        alt={item.product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 mb-0.5 leading-snug">
                        {item.product.title}
                      </h3>
                      {item.selectedVariant && item.selectedVariant !== 'Default Title' && (
                        <p className="text-[11px] text-slate-500 mb-1">
                          Варіант: <span className="font-semibold">{item.selectedVariant}</span>
                        </p>
                      )}
                      <div className="text-brand-600 font-black text-sm mb-2.5 tabular-nums">
                        {price.toLocaleString('uk-UA')} ₴
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/70 p-0.5">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.quantity - 1,
                                item.selectedVariant
                              )
                            }
                            className="w-7 h-7 flex items-center justify-center hover:bg-white text-slate-600 rounded-lg transition-colors active:scale-90"
                            title="Зменшити кількість"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-900 tabular-nums">
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
                            className="w-7 h-7 flex items-center justify-center hover:bg-white text-slate-600 rounded-lg transition-colors active:scale-90"
                            title="Збільшити кількість"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id, item.selectedVariant)}
                          className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
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
                          className="min-h-[36px] inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-brand-50 hover:text-brand-800 font-bold text-slate-700 shrink-0 ml-2 active:scale-95 transition-all"
                        >
                          <Plus className="w-3 h-3 text-brand-600" />
                          <span className="tabular-nums">{rel.price} ₴</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20 px-4">
              <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bold text-slate-800 text-base mb-1">Ваш кошик порожній</p>
              <p className="text-slate-500 text-xs mb-6 max-w-xs mx-auto">
                Оберіть якісні товари з каталогу, щоб скористатися знижками та швидкою відправкою
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-3 rounded-xl bg-brand-50 text-brand-700 font-bold text-sm hover:bg-brand-100 transition-colors active:scale-95"
              >
                Перейти до каталогу
              </button>
            </div>
          )}
        </div>

        {/* Footer & Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/80 space-y-3.5">
            <div className="flex justify-between items-center text-xs sm:text-sm text-slate-600 font-medium">
              <span>Доставка:</span>
              <span className={amountToFreeShipping === 0 ? 'text-emerald-700 font-bold' : 'text-slate-700 font-semibold'}>
                {amountToFreeShipping === 0 ? 'Безкоштовно 🎉' : 'За тарифами пошти'}
              </span>
            </div>

            <div className="flex justify-between items-center text-lg font-black text-slate-900 border-t border-slate-200/80 pt-3">
              <span>Всього до сплати:</span>
              <span className="text-brand-600 text-xl font-heading tabular-nums">
                {total.toLocaleString('uk-UA')} ₴
              </span>
            </div>

            <button
              onClick={openCartCheckout}
              className="w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-accent-500/25 hover:shadow-glow-accent flex items-center justify-center gap-2 active:scale-[0.97] transition-all"
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
