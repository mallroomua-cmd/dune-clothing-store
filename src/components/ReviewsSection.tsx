import React from 'react';
import { Star, CheckCircle2, MessageSquareHeart } from 'lucide-react';

interface Review {
  id: string;
  name: string;
  city: string;
  rating: number;
  date: string;
  product: string;
  comment: string;
  avatarBg: string;
}

const REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Олександр Коваленко',
    city: 'м. Київ',
    rating: 5,
    date: 'Вчора о 14:20',
    product: 'Швидка доставка',
    comment:
      'Замовляв у другій половині дня, і вже наступного ранку посилка чекала у поштоматі. Усе було запаковано ідеально, оглянув перед оплатою. Дуже задоволений сервісом!',
    avatarBg: 'bg-emerald-600',
  },
  {
    id: '2',
    name: 'Марина Бондар',
    city: 'м. Львів',
    rating: 5,
    date: '2 дні тому',
    product: 'Оригінальна якість',
    comment:
      'Купувала подарунок для чоловіка. Менеджер дуже ввічливо підказав по характеристиках, перевірив наявність на складі. Товар 100% оригінальний, працює відмінно.',
    avatarBg: 'bg-blue-600',
  },
  {
    id: '3',
    name: 'Дмитро Мельник',
    city: 'м. Дніпро',
    rating: 5,
    date: '3 дні тому',
    product: 'Оплата при отриманні',
    comment:
      'Найголовніше для мене — жодних передоплат на карту не просили. Перевірив у відділенні Нової Пошти, розрахувався картою і спокійний. Рекомендую цей магазин!',
    avatarBg: 'bg-amber-600',
  },
];

export const ReviewsSection: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-slate-50/70 border-b border-slate-200/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
            <MessageSquareHeart className="w-3.5 h-3.5 text-emerald-600" />
            <span>Реальний досвід клієнтів</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black font-heading text-slate-900 tracking-tight mb-3">
            Понад 1 200 задоволених покупців по всій Україні
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Ми цінуємо довіру кожного клієнта і робимо все, щоб покупка приносила радість із першого дотику.
          </p>

          {/* Social Proof Live Metrics Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8">
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tabular-nums">
                1 280+
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Виконаних замовлень</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black font-heading text-amber-500 flex items-center justify-center gap-1 tabular-nums">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>4.9 / 5</span>
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Середня оцінка</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black font-heading text-emerald-600 tabular-nums">
                99.4%
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Позитивних відгуків</div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
              <div className="text-2xl sm:text-3xl font-black font-heading text-blue-600 tabular-nums">
                1–2 дні
              </div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Швидкість доставки</div>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-premium hover:shadow-premium-hover transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header: Stars & Date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-600 font-semibold">{rev.date}</span>
                </div>

                {/* Comment quote */}
                <p className="text-sm text-slate-700 leading-relaxed font-normal mb-6">
                  "{rev.comment}"
                </p>
              </div>

              {/* Author info */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full ${rev.avatarBg} text-white font-black text-sm flex items-center justify-center shrink-0 shadow-sm`}
                  >
                    {rev.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {rev.name}
                    </h4>
                    <span className="text-[11px] text-slate-500">{rev.city}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Перевірено</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
