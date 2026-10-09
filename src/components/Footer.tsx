import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Clock, Settings } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { setIsAdminOpen } = useStore();

  return (
    <footer className="bg-slate-900 text-slate-400 pt-16 pb-12 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand & Value */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-heading tracking-tight text-white">
                Шопінг<span className="text-brand-400">Маркет</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Офіційний онлайн-магазин трендових товарів в Україні. Швидка логістика, чесні ціни та турбота про кожного покупця.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% безпечні покупки з оглядом перед оплатою</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-white text-base">Клієнтам</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#catalog-section" className="hover:text-white transition-colors">
                  Каталог товарів
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Умови оплати та доставки
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Гарантія та повернення 14 днів
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Договір публічної оферти
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Політика конфіденційності
                </a>
              </li>
            </ul>
          </div>

          {/* Working hours & delivery */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-white text-base">Графік та доставка</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <span>Пн–Нд: 09:00 — 21:00 (без вихідних)</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed pt-1">
                Відправки замовлень Новою Поштою здійснюються щодня о 18:00. Замовлення до 17:00 відправляються в той же день.
              </p>
            </div>
          </div>

          {/* Contacts */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-white text-base">Контакти</h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  href="tel:+380800332211"
                  className="flex items-center gap-2 text-white font-bold hover:text-brand-400 transition-colors"
                >
                  <Phone className="w-4 h-4 text-brand-500" />
                  <span>0 (800) 33-22-11 (Безкоштовно)</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-brand-500" />
                <span>support@shopmarket.ua</span>
              </li>
              <li className="flex items-start gap-2 text-xs">
                <MapPin className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <span>Україна, м. Київ, вул. Хрещатик, 22</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} ШопінгМаркет Україна. Всі права захищені.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-brand-400 transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Керування фідом та аналітикою</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
