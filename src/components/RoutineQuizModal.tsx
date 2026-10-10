import React, { useState, useMemo } from 'react';
import { ArrowLeft, Check, RefreshCw, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { useModal } from '../hooks/useModal';

interface QuizState {
  category: 'sneakers' | 'hoodies' | 'pants' | 'outerwear';
  fit: 'oversize' | 'regular' | 'gorpcore' | 'classic';
  depth: '2-step' | '3-step';
}

export const RoutineQuizModal: React.FC = () => {
  const {
    isQuizOpen,
    setIsQuizOpen,
    products,
    addToCart,
    addToast,
    setIsCartDrawerOpen,
  } = useStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [answers, setAnswers] = useState<QuizState>({
    category: 'sneakers',
    fit: 'oversize',
    depth: '2-step',
  });

  const handleClose = () => {
    setIsQuizOpen(false);
    setTimeout(() => setStep(1), 300);
  };

  useModal(isQuizOpen, handleClose);

  // Recommendations generator matching real products in the clothing & sneakers catalog
  const recommendedRoutine = useMemo(() => {
    if (!products.length) return [];

    const getMatching = (types: string[], keywords: string[]): Product => {
      const match = products.find((p) => {
        const typeMatch = types.some((t) => (p.productType || '').toLowerCase().includes(t.toLowerCase()));
        const fullText = `${p.title} ${(p.tags || []).join(' ')} ${p.bodyHtml}`.toLowerCase();
        const kwMatch = keywords.some((k) => fullText.includes(k.toLowerCase()));
        return typeMatch && kwMatch;
      });
      if (match) return match;

      const fallbackType = products.find((p) =>
        types.some((t) => (p.productType || '').toLowerCase().includes(t.toLowerCase()))
      );
      if (fallbackType) return fallbackType;

      return products[Math.floor(Math.random() * products.length)];
    };

    const outfit: { stepName: string; stepNumber: string; product: Product; role: string }[] = [];

    // Item 1: Sneakers / Footwear
    const footwear = getMatching(['Взуття', 'Кросівки', 'Sneakers'], ['jordan', 'new balance', 'salomon', 'nike']);
    if (footwear) {
      outfit.push({
        stepNumber: '01',
        stepName: 'Взуття // Іконічні снікери',
        product: footwear,
        role: 'Базовий акцент аутфіту з перевіреною амортизацією та оригінальним силуетом',
      });
    }

    // Item 2: Hoodie / Crewneck (Core Upper)
    const upper = getMatching(['Худі', 'Світшот', 'Футболка', 'Одяг'], ['stüssy', 'supreme', 'fleece', 'oversize']);
    if (upper && upper.id !== footwear?.id) {
      outfit.push({
        stepNumber: '02',
        stepName: 'Верхній шар // Heavyweight фліс',
        product: upper,
        role: 'Вільний крій Relaxed fit із натуральної щільної бавовни',
      });
    }

    // Item 3: Pants / Outerwear if 3-step bundle
    if (answers.depth === '3-step') {
      const lowerOrJacket = getMatching(
        ['Штани', 'Куртки', 'Одяг'],
        ['carhartt', 'stone island', 'canvas', 'double knee', 'soft shell']
      );
      if (lowerOrJacket && lowerOrJacket.id !== upper?.id && lowerOrJacket.id !== footwear?.id) {
        outfit.push({
          stepNumber: '03',
          stepName: 'Низ або куртка // Утилітарний захист',
          product: lowerOrJacket,
          role: 'Надміцний канвас або технологічна мембрана для завершення луку',
        });
      }
    }

    return outfit;
  }, [products, answers]);

  const routineSubtotal = recommendedRoutine.reduce((sum, item) => sum + item.product.price, 0);
  const bundleDiscount = Math.round(routineSubtotal * 0.15); // 15% drop discount
  const routineFinalPrice = routineSubtotal - bundleDiscount;

  const handleAddBundleToCart = () => {
    recommendedRoutine.forEach((item) => {
      addToCart(item.product, 1);
    });
    addToast(`Усі ${recommendedRoutine.length} айтеми додано до кошика! Знижка 15% врахована.`, 'success');
    handleClose();
    setTimeout(() => setIsCartDrawerOpen(true), 350);
  };

  if (!isQuizOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 md:p-6 animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative bg-white max-w-2xl w-full hairline-all flex flex-col max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto overscroll-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 sm:p-5 hairline-b flex items-center justify-between bg-neutral-50/80 sticky top-0 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-dune-ochre animate-pulse" />
            <h3 className="font-mono font-bold text-xs uppercase tracking-widest text-black">
              // FIT & STYLE FINDER • ПІДБІР АУТФІТУ
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 font-mono text-neutral-400 hover:text-black flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Quiz Steps Body */}
        <div className="p-5 sm:p-8 flex-1">
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-dune-ochre font-bold tracking-widest uppercase">
                  КРОК 1 З 3
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-display text-black uppercase tracking-tight">
                  Який айтем є основою вашого пошуку?
                </h2>
                <p className="text-xs text-neutral-500 font-sans">
                  Виберіть головний фокус у гардеробі:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                {[
                  {
                    id: 'sneakers' as const,
                    label: 'Кросівки & Снікери',
                    desc: 'Jordan Retro, New Balance 1906R, Salomon XT-6, Nike Dunk',
                    icon: '👟',
                  },
                  {
                    id: 'hoodies' as const,
                    label: 'Худі та Світшоти',
                    desc: 'Важкий фліс Stüssy, культові Supreme Box Logo',
                    icon: '👕',
                  },
                  {
                    id: 'pants' as const,
                    label: 'Штани & Карго',
                    desc: 'Carhartt WIP Double Knee, утилітарні карго з канвасу',
                    icon: '👖',
                  },
                  {
                    id: 'outerwear' as const,
                    label: 'Куртки & Мембрани',
                    desc: 'Stone Island Soft Shell, Arc’teryx Gorpcore',
                    icon: '🧥',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, category: opt.id }));
                      setStep(2);
                    }}
                    className={`p-4 text-left hairline-all transition-all flex flex-col justify-between gap-2 hover:bg-neutral-50 active:scale-[0.98] ${
                      answers.category === opt.id ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-lg">{opt.icon}</span>
                      {answers.category === opt.id && <Check className="w-4 h-4 text-dune-ochre" />}
                    </div>
                    <div>
                      <div className="font-bold uppercase text-xs tracking-wider mb-1">{opt.label}</div>
                      <div className={`text-[11px] font-sans leading-relaxed ${answers.category === opt.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {opt.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-dune-ochre font-bold tracking-widest uppercase">
                  КРОК 2 З 3
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-display text-black uppercase tracking-tight">
                  Бажаний силует та посадка (Fit):
                </h2>
                <p className="text-xs text-neutral-500 font-sans">
                  Як саме одяг та взуття повинні сидіти на вас:
                </p>
              </div>

              <div className="space-y-2.5 font-mono text-xs">
                {[
                  {
                    id: 'oversize' as const,
                    title: 'Relaxed / Boxy Oversize',
                    details: 'Вільний невимушений силует, спущені плечі, широкі штанини',
                    icon: '⚡',
                  },
                  {
                    id: 'regular' as const,
                    title: 'Regular / True to size',
                    details: 'Класична точна посадка за розмірною сіткою бренду',
                    icon: '📐',
                  },
                  {
                    id: 'gorpcore' as const,
                    title: 'Techwear & Gorpcore Fit',
                    details: 'Анатомічний функціональний крій для активного міського руху',
                    icon: '🧗',
                  },
                  {
                    id: 'classic' as const,
                    title: 'OG Streetwear Heritage',
                    details: 'Вінтажні класичні пропорції 1980–2000-х років',
                    icon: '🔥',
                  },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, fit: opt.id }));
                      setStep(3);
                    }}
                    className={`w-full p-4 text-left hairline-all transition-all flex items-center justify-between hover:bg-neutral-50 active:scale-[0.99] ${
                      answers.fit === opt.id ? 'bg-black text-white' : 'bg-white text-black'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{opt.icon}</span>
                      <div>
                        <div className="font-bold uppercase text-xs tracking-wider">{opt.title}</div>
                        <div className={`text-[11px] font-sans ${answers.fit === opt.id ? 'text-neutral-300' : 'text-neutral-500'}`}>
                          {opt.details}
                        </div>
                      </div>
                    </div>
                    {answers.fit === opt.id && <Check className="w-4 h-4 text-dune-ochre" />}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1 font-mono text-xs text-neutral-500 hover:text-black uppercase"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Назад
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-dune-ochre font-bold tracking-widest uppercase">
                  КРОК 3 З 3
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-display text-black uppercase tracking-tight">
                  Формат капсули (Дроп-сет):
                </h2>
                <p className="text-xs text-neutral-500 font-sans">
                  Оберіть комплектацію готового образу зі спеціальною знижкою:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <button
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, depth: '2-step' }));
                    setStep(4);
                  }}
                  className={`p-5 text-left hairline-all transition-all flex flex-col justify-between gap-3 hover:bg-neutral-50 active:scale-[0.98] ${
                    answers.depth === '2-step' ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider">ДУЕТ (2 АЙТЕМИ)</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-dune-ochre text-black">
                      -15% ДРОП
                    </span>
                  </div>
                  <p className={`text-[11px] font-sans leading-relaxed ${answers.depth === '2-step' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Снікери + худі або футболка. Готовий базовий тандем для щоденного стрітвір-стилю.
                  </p>
                </button>

                <button
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, depth: '3-step' }));
                    setStep(4);
                  }}
                  className={`p-5 text-left hairline-all transition-all flex flex-col justify-between gap-3 hover:bg-neutral-50 active:scale-[0.98] ${
                    answers.depth === '3-step' ? 'bg-black text-white' : 'bg-white text-black'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase tracking-wider">TOTAL LOOK (3 АЙТЕМИ)</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-dune-ochre text-black">
                      -15% ТА БЕЗКОШТОВНО НП
                    </span>
                  </div>
                  <p className={`text-[11px] font-sans leading-relaxed ${answers.depth === '3-step' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    Повний образ: Кросівки + Худі + Штани/Куртка. Максимальна вигода та бездоганний стиль.
                  </p>
                </button>
              </div>

              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1 font-mono text-xs text-neutral-500 hover:text-black uppercase"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Назад
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-fade-in font-mono">
              <div className="space-y-1">
                <span className="text-[10px] text-dune-ochre font-bold tracking-widest uppercase">
                  РЕЗУЛЬТАТ ПІДБОРУ // MOLAND CURATED DROP
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-display text-black uppercase tracking-tight">
                  Ваш персональний дроп-сет
                </h2>
                <p className="text-xs text-neutral-500 font-sans">
                  Складено на основі вашого стилю. Всі позиції доступні з приміркою на Новій Пошті:
                </p>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {recommendedRoutine.map((item) => (
                  <div key={item.product.id} className="p-3 bg-neutral-50 hairline-all flex items-center gap-3">
                    <img
                      src={item.product.featuredImage}
                      alt={item.product.title}
                      className="w-16 h-16 object-cover bg-white shrink-0 mix-blend-multiply"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider">
                        {item.stepNumber} // {item.stepName}
                      </div>
                      <div className="font-sans font-bold text-xs text-black truncate uppercase">
                        {item.product.title}
                      </div>
                      <div className="text-xs font-bold text-black mt-0.5">
                        {item.product.price.toLocaleString('uk-UA')} ₴
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Calculation Box */}
              <div className="p-4 bg-black text-white hairline-all space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Сума без знижки:</span>
                  <span className="line-through">{routineSubtotal.toLocaleString('uk-UA')} ₴</span>
                </div>
                <div className="flex items-center justify-between text-xs text-dune-ochre font-bold">
                  <span>Знижка дропу (-15%):</span>
                  <span>-{bundleDiscount.toLocaleString('uk-UA')} ₴</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold pt-2 hairline-t border-neutral-800">
                  <span>Разом до сплати:</span>
                  <span className="text-xl text-white">{routineFinalPrice.toLocaleString('uk-UA')} ₴</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleAddBundleToCart}
                  className="py-3 px-4 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <ShoppingBag className="w-4 h-4 text-dune-ochre" />
                  <span>ДОДАТИ СЕТ У КОШИК</span>
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="py-3 px-4 bg-white hover:bg-neutral-50 text-neutral-700 font-bold text-xs uppercase tracking-wider hairline-all flex items-center justify-center gap-1.5 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ПРОЙТИ ЩЕ РАЗ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
