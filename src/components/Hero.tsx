import React from 'react';
import { ArrowDown, Sparkles, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { DispatchCountdown } from './DispatchCountdown';

export const Hero: React.FC = () => {
  const { products, setIsQuizOpen } = useStore();

  const scrollToCatalog = () => {
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-white hairline-b pt-10 pb-12 sm:pt-16 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Top Editorial Monospace Tag & Live Countdown */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 text-[11px] font-mono uppercase tracking-widest text-neutral-700 bg-neutral-100 hairline-all">
              <span className="w-2 h-2 rounded-full bg-dune-ochre animate-pulse" />
              <span>DUNE // CONCEPT STORE 2026</span>
            </div>
            <DispatchCountdown variant="hero" />
          </div>

          {/* Large Unbounded Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display tracking-tight text-black leading-[1.08] mb-6 uppercase">
            Проєкт про моду, спорт{' '}
            <br className="hidden sm:inline" />
            <span className="text-dune-ochre">та снікер-культуру</span>
          </h1>

          {/* Subtitle in clean grotesque */}
          <p className="text-sm sm:text-base lg:text-lg text-neutral-600 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
            Мультибрендовий простір автентичного уличного одягу та культових кросівок: <strong>Jordan, Nike, New Balance, Stüssy, Carhartt WIP, Salomon, Supreme, Stone Island</strong>. Офіційні поставки, перевірка автентичності (Legit Check) та огляд у відділенні Нової Пошти перед оплатою.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12">
            <button
              onClick={() => setIsQuizOpen(true)}
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-black hover:bg-neutral-800 text-white font-mono font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-dune-ochre" />
              <span>ПІДІБРАТИ АУТФІТ (-15%)</span>
            </button>

            <button
              onClick={scrollToCatalog}
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-neutral-50 text-black font-mono font-bold text-xs uppercase tracking-widest hairline-all transition-all active:scale-[0.98]"
            >
              <span>КАТАЛОГ ДРОПІВ ({products.length})</span>
              <ArrowDown className="w-3.5 h-3.5 text-neutral-500" />
            </button>

            <a
              href="#catalog-section"
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-neutral-50 text-neutral-700 font-mono font-medium text-xs uppercase tracking-widest hairline-all transition-all active:scale-[0.98]"
            >
              <ShieldCheck className="w-4 h-4 text-dune-ochre" />
              <span>ОПЛАТА ПРИ ОТРИМАННІ</span>
            </a>
          </div>

          {/* Technical Spec Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 hairline-all text-left bg-neutral-50/60 divide-y md:divide-y-0 md:divide-x divide-neutral-200">
            <div className="p-4 sm:p-5">
              <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                // 01. АВТЕНТИЧНІСТЬ
              </div>
              <div className="font-mono font-bold text-xs sm:text-sm text-black uppercase">
                100% LEGIT CHECK
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                // 02. ВІДПРАВКА
              </div>
              <div className="font-mono font-bold text-xs sm:text-sm text-black uppercase">
                СЬОГОДНІ О 18:00
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                // 03. РОЗРАХУНОК
              </div>
              <div className="font-mono font-bold text-xs sm:text-sm text-black uppercase">
                ПРИ ОТРИМАННІ НП
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <div className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider mb-1">
                // 04. ГАРАНТІЯ
              </div>
              <div className="font-mono font-bold text-xs sm:text-sm text-black uppercase">
                ОБМІН 14 ДНІВ
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
