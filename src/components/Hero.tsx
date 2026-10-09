import React from 'react';
import { ArrowDown, CheckCircle2, Star, Sparkles, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getDispatchStatus } from '../lib/related';

export const Hero: React.FC = () => {
  const { products } = useStore();
  const dispatch = getDispatchStatus();

  const scrollToCatalog = () => {
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-slate-50/40 to-white pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-slate-200/60 bg-mesh-grid">
      {/* Background ambient decorative shapes & glow aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[700px] h-[350px] bg-gradient-to-tr from-brand-300/25 via-emerald-200/20 to-accent-200/20 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
      <div className="absolute -top-24 right-10 -z-10 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-4 left-10 -z-10 w-80 h-80 bg-accent-200/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Dynamic Live Status & Trust Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-premium text-xs sm:text-sm font-semibold text-slate-800 mb-6 hover:border-brand-300 transition-all duration-300 animate-fade-in">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="text-emerald-700 font-bold">Live:</span>
            <span className="text-slate-700 font-medium">{dispatch.text}</span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="hidden sm:flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-slate-800">4.9/5</span>
              <span className="text-slate-500 text-xs font-normal">(1 200+ відгуків)</span>
            </div>
          </div>

          {/* Main Headline with balanced typography */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-slate-900 leading-[1.12] mb-6 drop-shadow-sm">
            Оригінальні товари{' '}
            <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent underline decoration-brand-200/50 decoration-wavy decoration-2 underline-offset-8">
              за чесними цінами
            </span>{' '}
            в Україні
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto font-normal">
            Обирайте перевірену техніку, ґаджети та корисні товари. Прямі поставки, офіційна гарантія та огляд у відділенні перед оплатою без жодних ризиків.
          </p>

          {/* High-Converting CTAs with tactile micro-interactions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 mb-10">
            <button
              onClick={scrollToCatalog}
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-extrabold text-base shadow-lg shadow-accent-500/30 hover:shadow-glow-accent active:scale-[0.97] transition-all duration-200"
            >
              <Sparkles className="w-5 h-5 text-amber-200" />
              <span>Обрати товари ({products.length})</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </button>

            <a
              href="#catalog-section"
              className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm sm:text-base border border-slate-200/90 shadow-sm hover:border-slate-300 active:scale-[0.97] transition-all duration-200"
            >
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              <span>Оплата при отриманні</span>
            </a>
          </div>

          {/* Micro trust icons list */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-2 px-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-slate-200/60 shadow-sm text-xs sm:text-sm font-semibold text-slate-700">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Без передоплати</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{dispatch.text}</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>14 днів на повернення</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
