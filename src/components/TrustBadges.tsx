import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones, CheckCircle2, ArrowUpRight } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  return (
    <section className="py-14 sm:py-20 bg-white border-b border-slate-200/60 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Стандарти обслуговування</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black font-heading text-slate-900 tracking-tight mb-3">
            Купуйте впевнено та безпечно
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-normal">
            Ми усунули всі бар'єри та ризики для вашого спокою: відправка без передоплат, швидка доставка та 100% захист прав покупця.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Bento Card 1: Large Featured Card (2 Columns) */}
          <div className="md:col-span-2 lg:col-span-2 relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-premium overflow-hidden group">
            {/* Ambient decorative background glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/30 transition-all duration-500" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-13 h-13 p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    100% Безпека
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black font-heading text-white mb-2">
                  Оплата при отриманні без передоплат
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                  Жодних сюрпризів. Відкривайте посилку у відділенні Нової Пошти, перевіряйте працездатність, комплектність та якість товару. Оплачуйте лише тоді, коли переконаєтесь на власні очі.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/60 text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Огляд до оплати</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Готівка або картка</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bento Card 2: Express Delivery */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-brand-500/40 hover:bg-white hover:shadow-premium transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-brand-100/80 text-brand-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-200/60">
                  1-2 дні
                </span>
              </div>
              <h3 className="text-lg font-black font-heading text-slate-900 mb-2">
                Доставка Новою Поштою
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Щоденна відправка о 18:00 по всій Україні: у відділення, поштомати або кур'єром до дверей.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Швидка комплектація</span>
            </div>
          </div>

          {/* Bento Card 3: 14 Days Warranty */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-amber-500/40 hover:bg-white hover:shadow-premium transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                  Закон України
                </span>
              </div>
              <h3 className="text-lg font-black font-heading text-slate-900 mb-2">
                Обмін та повернення 14 днів
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                Не підійшов колір чи розмір? Обміняємо товар на інший або повернемо кошти без зайвих суперечок.
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200/60 text-xs font-semibold text-slate-700">
              <span>Офіційна гарантія якості</span>
            </div>
          </div>

          {/* Bento Card 4: Customer Care & Support (Span 4) */}
          <div className="md:col-span-3 lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-50/70 via-emerald-50/40 to-teal-50/60 border border-brand-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-brand-500/20">
                <Headphones className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black font-heading text-slate-900 mb-1">
                  Потрібна допомога з вибором чи консультація?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-normal">
                  Наші фахівці готові відповісти на будь-які запитання щодня з 09:00 до 21:00 без вихідних.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <a
                href="tel:+380800332211"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs sm:text-sm border border-slate-200 shadow-sm active:scale-95 transition-all"
              >
                <span>0 (800) 33-22-11</span>
                <ArrowUpRight className="w-4 h-4 text-brand-600" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
