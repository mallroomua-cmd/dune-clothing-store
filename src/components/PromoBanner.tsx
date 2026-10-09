import React from 'react';
import { ArrowRight, Sparkles, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import birthdayBannerImg from '../assets/birthday-deals.png';

interface PromoBannerProps {
  onExploreDeals?: () => void;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ onExploreDeals }) => {
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

  return (
    <section className="relative w-full bg-neutral-900 border-b border-neutral-200 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
        {/* Banner Card Container */}
        <div
          onClick={handleBannerClick}
          className="group relative w-full cursor-pointer overflow-hidden rounded-xl bg-black shadow-md transition-all duration-300 hover:shadow-xl"
        >
          {/* Main Banner Image */}
          <div className="relative w-full aspect-[21/9] sm:aspect-[24/9] md:aspect-[28/9] min-h-[170px] sm:min-h-[220px] md:min-h-[260px] overflow-hidden bg-neutral-950 flex items-center justify-center">
            <img
              src={birthdayBannerImg}
              alt="New Season Drops - Знижки до -50% на культовий одяг та снікери"
              className="w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              loading="eager"
            />

            {/* Subtle Gradient vignette for contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30 pointer-events-none" />

            {/* Floating Editorial Badges */}
            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 flex flex-wrap items-center gap-2 pointer-events-none">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-black/85 backdrop-blur-md text-white font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-white/20 rounded shadow-sm">
                <Sparkles className="w-3 h-3 text-[#dec400] animate-pulse" />
                <span>NEW SEASON DROPS</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 bg-[#dec400] text-black font-mono text-[10px] sm:text-xs font-black uppercase tracking-wider rounded">
                <Tag className="w-2.5 h-2.5" />
                <span>ДО -50%</span>
              </span>
            </div>

            {/* Bottom Floating CTA Bar */}
            <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white text-black font-mono text-xs font-bold uppercase tracking-wider rounded-lg shadow-lg group-hover:bg-[#dec400] group-hover:text-black transition-all transform group-hover:translate-x-0.5">
                <span>ПЕРЕЙТИ ДО ДРОПІВ</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </div>
            </div>

            {/* Cosibella Style Nav Arrows (Visual/Interactive) */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleBannerClick();
              }}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-black items-center justify-center shadow backdrop-blur transition-all opacity-0 group-hover:opacity-100"
              aria-label="Попередній банер"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleBannerClick();
              }}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-black items-center justify-center shadow backdrop-blur transition-all opacity-0 group-hover:opacity-100"
              aria-label="Наступний банер"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots Indicator (Cosibella slider style) */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 pointer-events-none">
            <span className="w-6 h-1.5 rounded-full bg-[#dec400]" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/50" />
          </div>
        </div>
      </div>
    </section>
  );
};
