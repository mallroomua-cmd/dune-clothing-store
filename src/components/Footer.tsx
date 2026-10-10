import { Phone, Mail, MapPin, Clock, Settings, ShieldCheck, Truck, RotateCcw, FileText, Sparkles, Send } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { setIsAdminOpen, openPolicyModal, setIsQuizOpen, setIsTrackingOpen } = useStore();

  return (
    <footer className="bg-[#0f0f0f] text-neutral-300 pt-16 pb-12 hairline-t border-neutral-800 text-xs font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand Manifesto */}
          <div className="space-y-4">
            <div className="flex flex-col">
              <span className="text-2xl font-black font-serif tracking-tight text-white uppercase">
                MOLAND
              </span>
              <span className="text-[10px] text-neutral-400 uppercase tracking-widest mt-0.5">
                CONCEPT STORE // KYIV
              </span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed font-sans font-normal">
              Кураторський мультибрендовий простір дизайнерського одягу, взуття та аксесуарів у Києві. Селекція провідних світових брендів: AMI Paris, Ganni, Jacquemus, Jil Sander, Stone Island, Carhartt WIP, New Balance, Salomon, Breda. 100% оригінальність, швидка відправка.
            </p>
            <div className="text-[11px] text-[#A77A06] pt-1 font-bold flex items-center gap-1.5">
              <span>★</span>
              <span>ВІДПРАВКА СЬОГОДНІ НОВОЮ ПОШТОЮ ДО 18:00</span>
            </div>
          </div>

          {/* Customer Care & Policies */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white uppercase tracking-wider text-sm">
              Сервіс & Політики
            </h4>
            <ul className="space-y-2 text-neutral-400">
              <li>
                <button
                  onClick={() => openPolicyModal('about')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-left"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A77A06]" />
                  <span>[ 01 ] Про концепт-стор MOLAND</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPolicyModal('shipping')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-left"
                >
                  <Truck className="w-3.5 h-3.5 text-[#A77A06]" />
                  <span>[ 02 ] Умови оплати та доставки</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPolicyModal('refund')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-left"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#A77A06]" />
                  <span>[ 03 ] Обмін та повернення 14 днів</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPolicyModal('privacy')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-left"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A77A06]" />
                  <span>[ 04 ] Політика конфіденційності</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPolicyModal('terms')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-left"
                >
                  <FileText className="w-3.5 h-3.5 text-[#A77A06]" />
                  <span>[ 05 ] Договір публічної оферти</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPolicyModal('contacts')}
                  className="hover:text-white transition-colors flex items-center gap-1.5 text-left"
                >
                  <span>[ 06 ] Контакти та реквізити ФОП</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsTrackingOpen(true)}
                  className="text-white hover:text-[#A77A06] transition-colors flex items-center gap-1.5 text-left font-bold"
                >
                  <Truck className="w-3.5 h-3.5 text-[#A77A06]" />
                  <span>[ 07 ] Відстеження посилки / ТТН</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsQuizOpen(true)}
                  className="text-white hover:text-[#A77A06] transition-colors flex items-center gap-1.5 text-left font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A77A06]" />
                  <span>[ 08 ] Підбір образу & Style Finder (-15%)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Working hours & Logistics */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white uppercase tracking-wider text-sm">
              Логістика & Графік
            </h4>
            <div className="space-y-2 text-neutral-400">
              <div className="flex items-start gap-2">
                <Clock className="w-3.5 h-3.5 text-[#A77A06] shrink-0 mt-0.5" />
                <span>Пн–Нд: 10:00 — 20:00 (без вихідних)</span>
              </div>
              <p className="text-neutral-400 text-xs leading-relaxed font-sans font-normal">
                Нова Пошта: щоденні відправлення о 18:00. Замовлення, оформлені до 17:00, відправляються день у день.
              </p>
              <div className="pt-2 text-[11px] text-neutral-400">
                Безкоштовна доставка у відділення та поштомати для всіх замовлень від <strong>3 000 ₴</strong>.
              </div>
            </div>
          </div>

          {/* Direct Contacts */}
          <div className="space-y-3">
            <h4 className="font-serif font-bold text-white uppercase tracking-wider text-sm">
              Контакти
            </h4>
            <ul className="space-y-2.5 text-neutral-400">
              <li>
                <a
                  href="tel:+380933456810"
                  className="flex items-center gap-2 text-white font-bold hover:text-[#A77A06] transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#A77A06]" />
                  <span>+38 (093) 345-68-10</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:store@moland.com.ua"
                  className="flex items-center gap-2 hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-[#A77A06]" />
                  <span>store@moland.com.ua</span>
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/moland_ua"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#229ED9] hover:underline"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Telegram @moland_ua</span>
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/moland.ua"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#E1306C] hover:underline"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram @moland.ua</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-[11px] pt-1">
                <MapPin className="w-3.5 h-3.5 text-[#A77A06] shrink-0 mt-0.5" />
                <span>Київ, вул. Велика Васильківська, 23 (Шоурум MOLAND)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with payment badges and sys admin */}
        <div className="hairline-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>© {new Date().getFullYear()} MOLAND // CONCEPT STORE • KYIV. ВСІ ПРАВА ЗАХИЩЕНІ.</span>
            <span className="hidden sm:inline text-neutral-700">|</span>
            <span className="text-neutral-400">100% ОРИГІНАЛ · НОВА ПОШТА · ОПЛАТА ПРИ ОТРИМАННІ</span>
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
              <Settings className="w-3 h-3 text-[#A77A06]" />
              <span>SYS ADMIN</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
