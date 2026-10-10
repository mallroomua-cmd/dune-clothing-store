import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Flame, Compass } from 'lucide-react';
import duneBannerImg from '../assets/dune-banner.jpg';
import { useStore } from '../context/StoreContext';

interface PromoBannerProps {
  onExploreDeals?: () => void;
}

const QUICK_DROPS = [
  { id: 'all', label: 'УСІ ДРОПИ', filter: 'all' },
  { id: 'clothing', label: '🧥 ОДЯГ', filter: 'Одяг' },
  { id: 'footwear', label: '👟 ВЗУТТЯ', filter: 'Взуття' },
  { id: 'bags', label: '👜 СУМКИ', filter: 'Сумки' },
  { id: 'accessories', label: '🕶️ АКСЕСУАРИ', filter: 'Аксесуари' },
  { id: 'brands', label: '✦ БРЕНДИ', filter: 'all' },
  { id: 'sale', label: '🏷️ SALE', filter: 'all' },
];

export const PromoBanner: React.FC<PromoBannerProps> = ({ onExploreDeals }) => {
  const { setSelectedCategory, setIsQuizOpen } = useStore();

  const handleBannerClick = () => {
    if (onExploreDeals) {
      onExploreDeals();
    } else {
      const el = document.getElementById('catalog-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleQuickFilter = (e: React.MouseEvent, filterCat: string) => {
    e.stopPropagation();
    setSelectedCategory(filterCat);
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full bg-[#0d0d0d] border-b border-neutral-800 text-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Main Banner Hero Card */}
        <div
          onClick={handleBannerClick}
          className="group relative w-full cursor-pointer overflow-hidden rounded-2xl bg-[#111111] border border-neutral-800/80 shadow-2xl transition-all duration-300 hover:border-neutral-700"
        >
          {/* Banner Image Container with adaptive aspect ratio */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[2.1/1] min-h-[260px] sm:min-h-[340px] md:min-h-[420px] bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
            <img
              src={duneBannerImg}
              alt="MOLAND Concept Store - Брендовий одяг, взуття та аксесуари"
              className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.015]"
              loading="eager"
            />

            {/* Subtle cinematic gradient vignette for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40 pointer-events-none" />

            {/* Top Bar Badges */}
            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 right-3 sm:right-5 flex items-center justify-between pointer-events-none">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-black/80 backdrop-blur-md text-white font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-white/15 rounded shadow-sm">
                  <Sparkles className="w-3 h-3 text-[#A77A06] animate-pulse" />
                  <span>MOLAND // LOOKBOOK 2026</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-[#A77A06] text-white font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider rounded">
                  <Flame className="w-3 h-3" />
                  <span>NEW SEASON DROP</span>
                </span>
              </div>

              <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 bg-black/70 backdrop-blur-md text-neutral-300 font-mono text-[11px] border border-white/10 rounded">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A77A06]" />
                <span>100% LEGIT CHECK</span>
              </span>
            </div>

            {/* Bottom Content Area */}
            <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
              {/* Editorial Headings */}
              <div className="max-w-xl space-y-1 sm:space-y-2 pointer-events-none">
                <div className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-[#A77A06] font-semibold flex items-center gap-1.5">
                  <span>AMI PARIS</span>
                  <span>•</span>
                  <span>GANNI</span>
                  <span>•</span>
                  <span>JACQUEMUS</span>
                  <span>•</span>
                  <span>CARHARTT WIP</span>
                </div>
                <h2 className="text-xl sm:text-3xl md:text-4xl font-bold font-serif text-white uppercase tracking-tight leading-tight drop-shadow-md">
                  КОНЦЕПТУАЛЬНИЙ БРЕНДОВИЙ ОДЯГ ТА ВЗУТТЯ
                </h2>
                <p className="hidden sm:block text-xs md:text-sm text-neutral-300 font-sans max-w-lg leading-relaxed drop-shadow">
                  Кураторська селекція світових брендів: AMI Paris, Ganni, Jacquemus, Stone Island, Carhartt WIP, New Balance, Salomon, Breda.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-start md:self-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsQuizOpen(true);
                  }}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-black/80 hover:bg-black text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/20 rounded-lg shadow-lg backdrop-blur-md transition-all active:scale-[0.98]"
                >
                  <Compass className="w-3.5 h-3.5 text-[#A77A06]" />
                  <span>ПІДБІР ОБРАЗУ</span>
                </button>

                <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-[#A77A06] hover:bg-[#8e6704] text-white font-mono text-xs font-black uppercase tracking-wider rounded-lg shadow-xl transition-all transform group-hover:translate-x-0.5">
                  <span>ДО КАТАЛОГУ</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Drop Category Chips under the banner */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
          <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest shrink-0 mr-1">
            ДРОПИ:
          </span>
          {QUICK_DROPS.map((drop) => (
            <button
              key={drop.id}
              onClick={(e) => handleQuickFilter(e, drop.filter)}
              className="px-3 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-800 hover:border-neutral-700 font-mono text-xs font-semibold uppercase tracking-wider shrink-0 transition-all active:scale-95 flex items-center gap-1.5"
            >
              <span>{drop.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
