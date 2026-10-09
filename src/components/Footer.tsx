import React from 'react';
import { Phone, Mail, MapPin, Clock, Settings } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { setIsAdminOpen } = useStore();

  return (
    <footer className="bg-black text-[#dec400] pt-16 pb-12 hairline-t border-neutral-800 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Manifesto */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black font-display tracking-tight text-white uppercase">
                MALLROOM
              </span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest mt-0.5">
                CONCEPT STORE // KYIV
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed font-sans font-normal">
              Мультибрендовий простір оригінальних товарів, техніки та трендових дропів. Проєкт про сучасний стиль життя, технологічність та чесні ціни в Україні.
            </p>
            <div className="text-[11px] text-[#dec400] pt-1">
              ★ ВІДПРАВКА СЬОГОДНІ ДО 18:00
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-sm">
              Навігація
            </h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <a href="#catalog-section" className="hover:text-white transition-colors">
                  [ 01 ] Каталог товарів
                </a>
              </li>
              <li>
                <a href="#trust-section" className="hover:text-white transition-colors">
                  [ 02 ] Умови оплати та доставки
                </a>
              </li>
              <li>
                <a href="#reviews-section" className="hover:text-white transition-colors">
                  [ 03 ] Відгуки клієнтів
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  [ 04 ] Гарантія та повернення 14 днів
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  [ 05 ] Договір публічної оферти
                </a>
              </li>
            </ul>
          </div>

          {/* Working hours & Logistics */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-sm">
              Логістика & Графік
            </h4>
            <div className="space-y-2 text-neutral-400">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-[#dec400] shrink-0 mt-0.5" />
                <span>Пн–Нд: 10:00 — 20:00 (без вихідних)</span>
              </div>
              <p className="text-neutral-500 text-[11px] leading-relaxed pt-1">
                Нова Пошта: щоденні відправки о 18:00. Всі замовлення, прийняті до 17:00, відправляються в той же день.
              </p>
            </div>
          </div>

          {/* Direct Contacts */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-sm">
              Контакти
            </h4>
            <ul className="space-y-2.5 text-neutral-400">
              <li>
                <a
                  href="tel:+380800332211"
                  className="flex items-center gap-2 text-white font-bold hover:text-[#dec400] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#dec400]" />
                  <span>0 (800) 33-22-11</span>
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#dec400]" />
                <span>object@mallroom.ua</span>
              </li>
              <li className="flex items-start gap-2 text-[11px]">
                <MapPin className="w-3.5 h-3.5 text-[#dec400] shrink-0 mt-0.5" />
                <span>Київ, вул. Митрополита Василя Липківського, 16Б</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="hairline-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © {new Date().getFullYear()} MALLROOM // CONCEPT STORE. ALL RIGHTS RESERVED.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsAdminOpen(true);
                if (typeof window !== 'undefined') {
                  window.location.hash = '#admin';
                }
              }}
              className="inline-flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
            >
              <Settings className="w-3 h-3 text-[#dec400]" />
              <span>SYS ADMIN</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
