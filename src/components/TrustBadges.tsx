import React from 'react';
import { Truck, ShieldCheck, RefreshCw, Headphones } from 'lucide-react';

export const TrustBadges: React.FC = () => {
  const badges = [
    {
      icon: Truck,
      title: 'Швидка доставка 1-2 дні',
      desc: 'Відправляємо Новою Поштою по всій Україні щодня о 18:00',
    },
    {
      icon: ShieldCheck,
      title: 'Оплата при отриманні',
      desc: 'Ніяких ризиків: перевірте товар у відділенні перед оплатою',
    },
    {
      icon: RefreshCw,
      title: 'Гарантія та повернення 14 днів',
      desc: 'Простий обмін або 100% повернення коштів без зайвих питань',
    },
    {
      icon: Headphones,
      title: 'Підтримка клієнтів 24/7',
      desc: 'Консультація та підбір аксесуарів у Telegram або за телефоном',
    },
  ];

  return (
    <section className="py-10 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/50 hover:bg-slate-50 hover:border-brand-200 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 shrink-0">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm mb-1">{b.title}</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
