import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Truck, CreditCard, Banknote, Sparkles, MapPin, Zap } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatUaPhone, POPULAR_UA_CITIES } from '../lib/formatters';
import { findVariant } from '../lib/ids';
import { useModal } from '../hooks/useModal';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    checkoutProduct,
    checkoutVariant,
    cart,
    submitOrder,
  } = useStore();

  const isQuick = !!checkoutProduct;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+380 ');
  const [city, setCity] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'nova_poshta' | 'ukrposhta' | 'courier'>('nova_poshta');
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'card'>('cash_on_delivery');
  const [notes, setNotes] = useState('');
  const [website, setWebsite] = useState(''); // Anti-bot honeypot
  const [openedAt] = useState(() => Date.now()); // Time trap
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderComplete(false);
    setErrorMessage(null);
  };

  useModal(isCheckoutOpen, handleClose);

  if (!isCheckoutOpen) return null;

  const items = checkoutProduct
    ? [{ product: checkoutProduct, quantity: 1, selectedVariant: checkoutVariant }]
    : cart;

  const total = items.reduce((acc, item) => {
    const v = findVariant(item.product, item.selectedVariant);
    return acc + (v?.price || item.product.price) * item.quantity;
  }, 0);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatUaPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validate phone: must contain 12 digits in UA international format
    const cleanDigits = phone.replace(/\D/g, '');
    if (cleanDigits.length < 12) {
      setErrorMessage('Будь ласка, введіть повний номер телефону: +380 (XX) XXX-XX-XX');
      return;
    }

    if (!isQuick && !city.trim()) {
      setErrorMessage('Будь ласка, вкажіть місто для доставки');
      return;
    }

    setIsSubmitting(true);
    try {
      const elapsedMs = Date.now() - openedAt;
      const res = await submitOrder({
        name: name.trim() || (isQuick ? 'Клієнт (В 1 клік)' : 'Клієнт'),
        phone: phone.trim(),
        city: city.trim() || 'Уточнюється менеджером',
        warehouse: warehouse.trim() || 'Уточнюється менеджером',
        deliveryMethod,
        paymentMethod,
        notes: notes.trim(),
        website,
        elapsedMs,
      });

      setOrderNumber(res.orderId);
      setOrderComplete(true);
    } catch {
      setErrorMessage('Помилка при оформленні. Спробуйте ще раз або зателефонуйте нам.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-contain animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-title"
    >
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full shadow-2xl max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto border border-slate-100 p-5 sm:p-8 overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label="Закрити вікно замовлення"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {orderComplete ? (
          /* Success Screen */
          <div className="text-center py-6 animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Замовлення №{orderNumber} прийнято!</span>
            </span>

            <h3 className="text-2xl font-black font-heading text-slate-900 mb-2">
              Дякуємо за покупку!
            </h3>

            <p className="text-sm text-slate-600 max-w-md mx-auto mb-6 leading-relaxed">
              Наш менеджер зв’яжеться з вами за номером <strong>{phone}</strong> протягом 10 хвилин для підтвердження та уточнення відділення відправки.
            </p>

            <div className="bg-slate-50 rounded-2xl p-4 text-left border border-slate-200/60 text-xs text-slate-600 space-y-2 mb-6">
              <div className="flex justify-between font-semibold text-slate-800 border-b pb-2">
                <span>Номер замовлення:</span>
                <span className="font-mono text-brand-600">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Телефон покупця:</span>
                <span>{phone}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 border-t pt-2">
                <span>Сума до сплати:</span>
                <span className="text-brand-600">{total.toLocaleString('uk-UA')} ₴</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md transition-all"
            >
              Повернутися до магазину
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                isQuick ? 'bg-amber-100 text-amber-800' : 'bg-brand-100 text-brand-800'
              }`}>
                {isQuick ? <Zap className="w-3 h-3 fill-current" /> : null}
                {isQuick ? 'Швидке замовлення в 1 клік' : 'Оформлення замовлення'}
              </span>
            </div>

            <h2 id="checkout-title" className="text-2xl font-black font-heading text-slate-900 mb-1">
              {isQuick ? 'Замовлення в 1 клік' : 'Ваше замовлення'}
            </h2>
            <p className="text-xs text-slate-500 mb-5">
              {isQuick
                ? 'Введіть номер телефону — наш менеджер зателефонує та оформить доставку!'
                : 'Заповніть дані для відправки Новою Поштою або Укрпоштою'}
            </p>

            {/* Order Items Preview */}
            <div className="bg-slate-50 rounded-2xl p-3.5 mb-5 border border-slate-200/60 max-h-40 overflow-y-auto space-y-2.5">
              {items.map((item, idx) => {
                const v = findVariant(item.product, item.selectedVariant);
                const price = v?.price || item.product.price;
                return (
                  <div key={idx} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.product.featuredImage}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200"
                      />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 truncate">{item.product.title}</p>
                        <p className="text-slate-500">
                          {item.selectedVariant && item.selectedVariant !== 'Default Title'
                            ? `${item.selectedVariant} • `
                            : ''}
                          {item.quantity} шт. × {price} ₴
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {(price * item.quantity).toLocaleString('uk-UA')} ₴
                    </span>
                  </div>
                );
              })}
              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Разом:</span>
                <span className="text-brand-600 text-base">{total.toLocaleString('uk-UA')} ₴</span>
              </div>
            </div>

            {errorMessage && (
              <div role="alert" className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Hidden Honeypot Field */}
              <input
                type="text"
                name="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />

              {/* Phone Input (Primary conversion driver) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Номер телефону (Україна) *
                </label>
                <input
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="+380 (99) 000-00-00"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-base font-bold text-slate-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 shadow-sm"
                />
              </div>

              {/* Name (Optional in 1-click mode) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ваше ім'я {isQuick ? '(необов’язково)' : '*'}
                </label>
                <input
                  type="text"
                  required={!isQuick}
                  placeholder="Олександр"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Full Checkout Fields (Hidden in 1-Click mode for maximum conversion speed!) */}
              {!isQuick && (
                <>
                  {/* Delivery Service */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Служба доставки
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('nova_poshta')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          deliveryMethod === 'nova_poshta'
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                        <span>Нова Пошта (1-2 дні)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('ukrposhta')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          deliveryMethod === 'ukrposhta'
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
                        <span>Укрпошта (3-5 днів)</span>
                      </button>
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Місто / Населений пункт *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Київ, Львів, Одеса..."
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500 mb-1.5"
                    />
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                      <span className="text-slate-400 flex items-center gap-0.5 shrink-0">
                        <MapPin className="w-3 h-3" /> Популярні:
                      </span>
                      {POPULAR_UA_CITIES.slice(0, 5).map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCity(c)}
                          className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 shrink-0 font-medium transition-colors"
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Відділення або поштомат
                    </label>
                    <input
                      type="text"
                      placeholder="Відділення №12 / Поштомат №5432"
                      value={warehouse}
                      onChange={(e) => setWarehouse(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Payment */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Спосіб оплати
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash_on_delivery')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          paymentMethod === 'cash_on_delivery'
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>При отриманні</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                          paymentMethod === 'card'
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : 'border-slate-200 hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-blue-600" />
                        <span>Оплата карткою</span>
                      </button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Коментар до замовлення (необов’язково)
                    </label>
                    <input
                      type="text"
                      placeholder="Зателефонувати після 14:00, код під'їзду..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </>
              )}

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-xl bg-accent-500 hover:bg-accent-600 active:scale-95 text-white font-black text-base shadow-lg shadow-accent-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>
                    {isSubmitting
                      ? 'Оформлення...'
                      : `Замовити зараз • ${total.toLocaleString('uk-UA')} ₴`}
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {isQuick
                    ? 'Менеджер зателефонує протягом 10 хв і уточнить адресу доставки'
                    : 'Оплата при отриманні • Огляд перед оплатою на пошті'}
                </span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
