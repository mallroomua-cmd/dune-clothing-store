import React from 'react';
import { ArrowDown, CheckCircle2, Star, Sparkles, Upload } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Hero: React.FC = () => {
  const { products, setIsAdminOpen } = useStore();

  const scrollToCatalog = () => {
    document.getElementById('catalog-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 via-slate-50 to-white pt-8 pb-12 sm:pt-14 sm:pb-20 border-b border-slate-200/60">
      {/* Background ambient decorative shapes */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -z-10 w-80 h-80 bg-accent-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Top Trust Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-brand-200/70 shadow-sm text-xs sm:text-sm font-semibold text-brand-700 mb-6 animate-fade-in">
            <span className="flex items-center text-amber-500">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-700">4.9 / 5</span>
            <span className="text-slate-400">•</span>
            <span>Понад 10 000 задоволених покупців</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight text-slate-900 leading-tight sm:leading-none mb-6">
            Оригінальні товари <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 to-emerald-600 bg-clip-text text-transparent">
              за чесними цінами
            </span>{' '}
            в Україні
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto">
            Обирайте перевірену техніку, ґаджети та аксесуари. Швидка відправка в день замовлення, офіційна гарантія та огляд перед оплатою.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-10">
            <button
              onClick={scrollToCatalog}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-base shadow-lg shadow-accent-500/25 active:scale-95 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>Переглянути каталог ({products.length})</span>
              <ArrowDown className="w-4 h-4 animate-bounce" />
            </button>

            <button
              onClick={() => setIsAdminOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-base border border-slate-200 shadow-sm transition-all"
            >
              <Upload className="w-5 h-5 text-brand-600" />
              <span>Завантажити свій CSV фід</span>
            </button>
          </div>

          {/* Micro trust icons list */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              <span>Без передоплати</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              <span>Відправка сьогодні</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-brand-600" />
              <span>14 днів на обмін</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
