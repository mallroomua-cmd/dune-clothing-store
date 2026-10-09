import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    openCartCheckout,
  } = useStore();

  if (!isCartDrawerOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end animate-fade-in">
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
            onClick={() => setIsCartDrawerOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100"
              >
                <img
                  src={item.product.featuredImage}
                  alt={item.product.title}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 text-xs sm:text-sm line-clamp-1 mb-1">
                    {item.product.title}
                  </h3>
                  <div className="text-brand-600 font-black text-sm mb-2">
                    {item.product.price.toLocaleString('uk-UA')} ₴
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center border border-slate-200 rounded-lg bg-white">
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 hover:bg-slate-100 text-slate-600 rounded-l-lg transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 hover:bg-slate-100 text-slate-600 rounded-r-lg transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-600 hover:text-rose-500 p-1 transition-colors"
                      title="Видалити з кошика"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="font-bold text-slate-700 text-base mb-1">Ваш кошик порожній</p>
              <p className="text-slate-600 text-xs mb-4">Додайте товари з каталогу, щоб оформити замовлення</p>
              <button
                onClick={() => setIsCartDrawerOpen(false)}
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
              <span className="text-emerald-600 font-bold">За тарифами перевізника</span>
            </div>
            <div className="flex justify-between items-center text-lg font-black text-slate-900 border-t border-slate-200/80 pt-2">
              <span>Всього до сплати:</span>
              <span className="text-brand-600 text-xl font-heading">{total.toLocaleString('uk-UA')} ₴</span>
            </div>
            <button
              onClick={openCartCheckout}
              className="w-full py-3.5 px-4 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm shadow-lg shadow-accent-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all"
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
