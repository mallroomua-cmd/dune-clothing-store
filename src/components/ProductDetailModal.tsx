import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  Zap,
  CheckCircle2,
  Star,
  Heart,
  Share2,
  Eye,
  Sparkles,
} from 'lucide-react';
import DOMPurify from 'dompurify';
import { useStore } from '../context/StoreContext';
import { ProductJsonLd } from './ProductJsonLd';
import { findVariant } from '../lib/ids';
import { useModal } from '../hooks/useModal';
import { getRelatedProducts } from '../lib/related';
import { hapticImpact } from '../lib/telegram-webapp';
import { getComplementaryProduct, calculateBundlePricing, getBeautyBadges } from '../lib/bundle-synergy';

type DetailTab = 'desc' | 'sizing' | 'materials' | 'delivery' | 'reviews';

export const ProductDetailModal: React.FC = () => {
  const {
    selectedProduct,
    setSelectedProduct,
    selectedVariant,
    setSelectedVariant,
    products,
    addToCart,
    openQuickOrder,
    isInWishlist,
    toggleWishlist,
    addRecentlyViewed,
    addToast,
    getProductReviews,
    addReview,
    setIsCartDrawerOpen,
  } = useStore();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>('desc');

  // Review form state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewSkin, setReviewSkin] = useState('Комбінована');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (selectedProduct) {
      addRecentlyViewed(selectedProduct.id);
      setActiveTab('desc');
    }
  }, [selectedProduct?.id]);

  const handleClose = () => {
    setSelectedProduct(null);
    setSelectedImage('');
    setSelectedVariant('');
  };

  useModal(!!selectedProduct, handleClose);

  // Cross-sell items
  const related = useMemo(() => {
    if (!selectedProduct) return [];
    return getRelatedProducts([selectedProduct], products, 2);
  }, [selectedProduct, products]);

  const beautyInfo = useMemo(() => {
    if (!selectedProduct) return null;
    return getBeautyBadges(selectedProduct);
  }, [selectedProduct]);

  const dermBadges = useMemo(() => {
    if (!selectedProduct) return [];
    if (beautyInfo?.isBeauty) {
      return beautyInfo.badges;
    }
    const text = `${selectedProduct.title} ${(selectedProduct.tags || []).join(' ')} ${selectedProduct.productType || ''}`.toLowerCase();
    const badges: string[] = [];
    if (text.includes('кросів') || text.includes('sneaker') || text.includes('jordan') || text.includes('dunk'))
      badges.push('👟 Кросівки & Снікери');
    if (text.includes('худі') || text.includes('hoodie'))
      badges.push('👕 Heavyweight Fleece');
    if (text.includes('oversize') || text.includes('вільн'))
      badges.push('⚡ Relaxed Oversize Fit');
    if (text.includes('deadstock') || text.includes('box logo'))
      badges.push('📦 Limited Drop / Deadstock');
    if (text.includes('штани') || text.includes('pant') || text.includes('cargo'))
      badges.push('👖 Workwear Canvas');
    if (text.includes('куртк') || text.includes('soft shell') || text.includes('gore-tex'))
      badges.push('🧥 Технічний захист');
    badges.push('✨ Verified Legit Check');
    return badges.slice(0, 3);
  }, [selectedProduct, beautyInfo]);

  // Streetwear Drop & Style Guide / Beauty classification
  const styleProtocol = useMemo(() => {
    if (!selectedProduct) return null;
    if (beautyInfo?.isBeauty) {
      return {
        step: 'BEAUTY & CARE // 100% ORIGINAL',
        badge: '🌸 ДЕРМАТОЛОГІЧНИЙ ДОГЛЯД',
      };
    }
    const type = (selectedProduct.productType || '').toLowerCase();
    const title = selectedProduct.title.toLowerCase();

    if (type.includes('взуття') || type.includes('кросів') || title.includes('jordan') || title.includes('sneaker') || title.includes('salomon') || title.includes('balance')) {
      return {
        step: 'FOOTWEAR // SNEAKER ARCHIVE',
        badge: '👟 СНІКЕРИ',
      };
    }
    if (type.includes('худі') || type.includes('світшот') || title.includes('hoodie') || title.includes('crewneck')) {
      return {
        step: 'HEAVYWEIGHT FLEECE // OVERSIZE',
        badge: '👕 ХУДІ ТА СВІТШОТИ',
      };
    }
    if (type.includes('штани') || type.includes('джинси') || title.includes('pant') || title.includes('double knee')) {
      return {
        step: 'WORKWEAR CANVAS // RELAXED FIT',
        badge: '👖 ШТАНИ КАРГО',
      };
    }
    if (type.includes('куртк') || title.includes('jacket') || title.includes('shell') || title.includes('stone island')) {
      return {
        step: 'TECHNICAL GORPCORE // WEATHERPROOF',
        badge: '🧥 ВЕРХНІЙ ОДЯГ',
      };
    }
    return {
      step: 'STREETWEAR BASICS // 100% ORIGINAL',
      badge: '⚡ КУЛЬТОВИЙ ДРОП',
    };
  }, [selectedProduct, beautyInfo]);

  // Synergistic complementary bundle product & pricing
  const complementaryItem = useMemo(() => {
    if (!selectedProduct) return null;
    return getComplementaryProduct(selectedProduct, products);
  }, [selectedProduct, products]);

  const bundleData = useMemo(() => {
    if (!selectedProduct || !complementaryItem) return null;
    return calculateBundlePricing(selectedProduct, complementaryItem, 10);
  }, [selectedProduct, complementaryItem]);

  // Product reviews
  const productReviews = useMemo(() => {
    if (!selectedProduct) return [];
    return getProductReviews(selectedProduct.id);
  }, [selectedProduct, getProductReviews]);

  if (!selectedProduct) return null;

  const currentVariant = findVariant(selectedProduct, selectedVariant);
  const activePrice = currentVariant?.price ?? selectedProduct.price;
  const activeComparePrice = currentVariant?.compareAtPrice ?? selectedProduct.compareAtPrice;

  const activeImage = selectedImage || selectedProduct.featuredImage;
  const discountPercent =
    activeComparePrice && activeComparePrice > activePrice
      ? Math.round(((activeComparePrice - activePrice) / activeComparePrice) * 100)
      : null;

  const handleAddAndClose = () => {
    hapticImpact('light');
    addToCart(selectedProduct, 1, selectedVariant || currentVariant?.title);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      handleClose();
    }, 400);
  };

  const handleBuyBundle = () => {
    if (!selectedProduct || !complementaryItem || !bundleData) return;
    hapticImpact('medium');
    addToCart(selectedProduct, 1, selectedVariant || currentVariant?.title);
    addToCart(complementaryItem, 1);
    addToast(`Комплект додано! Знижка 10% (-${bundleData.discountAmount} ₴)`, 'success');
    handleClose();
    setIsCartDrawerOpen(true);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      addToast('Посилання на засіб скопійовано в буфер обміну!', 'success');
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewText.trim()) return;
    setIsSubmittingReview(true);
    addReview({
      productId: selectedProduct.id,
      author: reviewAuthor.trim(),
      rating: reviewRating,
      text: reviewText.trim(),
      skinType: reviewSkin,
      verified: true,
    });
    setReviewAuthor('');
    setReviewText('');
    setReviewRating(5);
    setIsSubmittingReview(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center sm:p-4 md:p-6 animate-fade-in"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      {/* Schema.org JSON-LD microdata for Google Merchant / SEO */}
      <ProductJsonLd product={selectedProduct} />

      <div
        className="relative bg-white max-w-3xl w-full hairline-all flex flex-col md:flex-row max-h-[92dvh] sm:max-h-[90vh] overflow-y-auto md:overflow-hidden overscroll-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile top handle */}
        <div className="w-10 h-1 bg-neutral-300 mx-auto my-2 sm:hidden shrink-0" />

        {/* Action icons row (Share, Wishlist, Close) */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1">
          <button
            onClick={handleShare}
            aria-label="Поділитися посиланням на товар"
            className="w-8 h-8 font-mono text-neutral-400 hover:text-black flex items-center justify-center transition-colors"
            title="Поділитися"
          >
            <Share2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => toggleWishlist(selectedProduct.id)}
            aria-label={isInWishlist(selectedProduct.id) ? 'У списку бажань' : 'Додати в список бажань'}
            className="w-8 h-8 font-mono text-neutral-400 hover:text-black flex items-center justify-center transition-colors"
            title={isInWishlist(selectedProduct.id) ? 'У списку бажань' : 'Зберегти товар'}
          >
            <Heart
              className={`w-4 h-4 ${
                isInWishlist(selectedProduct.id) ? 'text-rose-500 fill-rose-500' : 'text-neutral-400 hover:text-rose-500'
              }`}
            />
          </button>

          <button
            onClick={handleClose}
            aria-label="Закрити вікно товару"
            className="w-8 h-8 font-mono text-neutral-400 hover:text-black flex items-center justify-center transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Left Column: Image Gallery with #F6F6F6 background */}
        <div className="md:w-1/2 p-5 sm:p-6 bg-[#f6f6f6] flex flex-col items-center justify-center hairline-b md:hairline-b-0 md:hairline-r shrink-0">
          <div className="relative aspect-square w-full max-w-xs sm:max-w-sm overflow-hidden mb-3 sm:mb-4 bg-white p-2 hairline-all">
            <img
              src={activeImage}
              alt={selectedProduct.title}
              className="w-full h-full object-cover object-center mix-blend-multiply"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
              }}
            />
            {discountPercent && (
              <span className="absolute top-2 left-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider bg-black text-white">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {selectedProduct.images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto w-full max-w-xs sm:max-w-sm pb-1 scrollbar-none">
              {selectedProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-12 h-12 overflow-hidden shrink-0 transition-all ${
                    activeImage === img
                      ? 'border-2 border-black'
                      : 'border border-neutral-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover mix-blend-multiply" />
                </button>
              ))}
            </div>
          )}

          {/* Social Proof Viewer Badge */}
          <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
            <Eye className="w-3 h-3 text-dune-ochre" />
            <span>4 людини дивляться цей засіб зараз</span>
          </div>
        </div>

        {/* Right Column: Details & Order CTA */}
        <div className="md:w-1/2 p-5 sm:p-7 overflow-y-auto flex flex-col font-sans">
          <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500 uppercase tracking-wider mb-2">
            <span>{selectedProduct.productType || 'ITEM'}</span>
            <span>//</span>
            <span className="text-black font-semibold">{selectedProduct.vendor || 'CONCEPT'}</span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold font-display text-black uppercase mb-2 leading-snug tracking-tight">
            {selectedProduct.title}
          </h2>

          {/* Streetwear Drop & Style Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {styleProtocol && (
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 bg-black text-white uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-dune-ochre" />
                <span>{styleProtocol.step}</span>
              </span>
            )}
            {dermBadges.map((b) => (
              <span
                key={b}
                className="font-mono text-[10px] font-bold px-2 py-0.5 bg-neutral-100 text-black border border-neutral-200 uppercase tracking-wider"
              >
                {b}
              </span>
            ))}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3 font-mono text-xs">
            <div className="flex items-center gap-0.5 text-dune-ochre">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-neutral-500 text-[11px] uppercase">
              5.0 / 5 ({productReviews.length} ВІДГУКІВ)
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 mb-3 font-mono">
            <span className="text-2xl font-black text-black tabular-nums">
              {activePrice.toLocaleString('uk-UA')} ₴
            </span>
            {activeComparePrice && activeComparePrice > activePrice && (
              <span className="text-sm text-neutral-400 line-through tabular-nums">
                {activeComparePrice.toLocaleString('uk-UA')} ₴
              </span>
            )}
          </div>

          {/* Stock state */}
          <div className="flex items-center gap-2 font-mono text-[11px] text-dune-ochre uppercase border border-dune-ochre/30 px-2.5 py-1 w-fit mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-dune-ochre" />
            <span>В НАЯВНОСТІ • ВІДПРАВКА СЬОГОДНІ</span>
          </div>

          {/* Variants Selector */}
          {selectedProduct.variants && selectedProduct.variants.length > 1 && (
            <div className="mb-4 font-mono">
              <label className="block text-[11px] text-neutral-500 uppercase tracking-wider mb-2">
                // ВАРІАНТ / РОЗМІР:
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedProduct.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.title)}
                    className={`min-h-[38px] px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all ${
                      (selectedVariant || selectedProduct.variants[0].title) === v.title
                        ? 'bg-black text-white hairline-all'
                        : 'bg-white text-neutral-700 hover:text-black hairline-all'
                    }`}
                  >
                    {v.title} — {v.price} ₴
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Editorial Tabs */}
          <div className="hairline-t pt-3 mb-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none border-b border-neutral-200 pb-2 mb-3 font-mono text-[11px] uppercase tracking-wider">
              {[
                { key: 'desc', label: 'Опис' },
                { key: 'sizing', label: '📐 Розмірна сітка' },
                { key: 'materials', label: 'Склад & Догляд' },
                { key: 'delivery', label: 'Доставка & 14 днів' },
                { key: 'reviews', label: `Відгуки (${productReviews.length})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as DetailTab)}
                  className={`pb-1 px-1 transition-all whitespace-nowrap ${
                    activeTab === tab.key
                      ? 'text-black font-bold border-b-2 border-black'
                      : 'text-neutral-400 hover:text-neutral-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENT */}
            {activeTab === 'desc' && (
              <div className="text-xs text-neutral-600 leading-relaxed space-y-2 animate-fade-in">
                {selectedProduct.bodyHtml ? (
                  <div
                    className="prose prose-sm max-w-none text-neutral-600 line-clamp-6 text-xs"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(selectedProduct.bodyHtml),
                    }}
                  />
                ) : (
                  <p>100% оригінальний айтем від офіційних дистриб'юторів. Повна перевірка (Legit Check) перед відправкою клієнту.</p>
                )}
                {/* Related drop accompaniment */}
                {related[0] && (
                  <div className="mt-3 p-3 bg-neutral-50 hairline-all">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest block mb-1">
                      // РЕКОМЕНДОВАНИЙ АУТФІТ:
                    </span>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-black truncate mr-2">{related[0].title}</span>
                      <span className="text-black font-bold whitespace-nowrap">{related[0].price} ₴</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sizing' && (
              <div className="space-y-3 text-xs animate-fade-in font-mono">
                {selectedProduct.productType.toLowerCase().includes('взуття') ||
                selectedProduct.productType.toLowerCase().includes('кросів') ? (
                  <>
                    <div className="p-2.5 bg-neutral-50 hairline-all">
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-2">
                        ТАБЛИЦЯ РОЗМІРІВ ВЗУТТЯ (SNEAKERS)
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="border-b border-neutral-200 text-neutral-400">
                              <th className="pb-1 font-bold">EU</th>
                              <th className="pb-1 font-bold">US</th>
                              <th className="pb-1 font-bold">UK</th>
                              <th className="pb-1 font-bold">CM (СТОПА)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 text-black">
                            <tr><td className="py-1">40</td><td>7.0</td><td>6.0</td><td>25.0 см</td></tr>
                            <tr><td className="py-1">41</td><td>8.0</td><td>7.0</td><td>26.0 см</td></tr>
                            <tr><td className="py-1">42</td><td>8.5</td><td>7.5</td><td>26.5 см</td></tr>
                            <tr><td className="py-1">42.5</td><td>9.0</td><td>8.0</td><td>27.0 см</td></tr>
                            <tr><td className="py-1">43</td><td>9.5</td><td>8.5</td><td>27.5 см</td></tr>
                            <tr><td className="py-1">44</td><td>10.0</td><td>9.0</td><td>28.0 см</td></tr>
                            <tr><td className="py-1">44.5</td><td>10.5</td><td>9.5</td><td>28.5 см</td></tr>
                            <tr><td className="py-1">45</td><td>11.0</td><td>10.0</td><td>29.0 см</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                      💡 <strong>Як виміряти:</strong> Поставте стопу на аркуш паперу, відмітьте п'яту та кінчик великого пальця. Виміряйте лінійкою відстань у сантиметрах. Якщо носите товстий носок або маєте широкий підйом — обирайте +0.5 EU.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="p-2.5 bg-neutral-50 hairline-all">
                      <div className="text-[10px] text-neutral-400 uppercase tracking-wider mb-2">
                        ТАБЛИЦЯ РОЗМІРІВ ОДЯГУ (APPAREL & HOODIES)
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[11px]">
                          <thead>
                            <tr className="border-b border-neutral-200 text-neutral-400">
                              <th className="pb-1 font-bold">РОЗМІР</th>
                              <th className="pb-1 font-bold">ЗРІСТ (СМ)</th>
                              <th className="pb-1 font-bold">ГРУДИ (СМ)</th>
                              <th className="pb-1 font-bold">ДОВЖИНА (СМ)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100 text-black">
                            <tr><td className="py-1 font-bold">S</td><td>165–175</td><td>92–98</td><td>68</td></tr>
                            <tr><td className="py-1 font-bold">M</td><td>174–182</td><td>98–104</td><td>71</td></tr>
                            <tr><td className="py-1 font-bold">L</td><td>180–188</td><td>106–112</td><td>74</td></tr>
                            <tr><td className="py-1 font-bold">XL</td><td>186–195</td><td>114–120</td><td>77</td></tr>
                            <tr><td className="py-1 font-bold">XXL</td><td>190+</td><td>122–128</td><td>80</td></tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-500 font-sans leading-relaxed">
                      💡 <strong>Посадка:</strong> Більшість моделей худі та футболок Stüssy і Supreme мають вільний крій (Relaxed / Oversize). Для класичної посадки обирайте свій звичний розмір.
                    </p>
                  </>
                )}
              </div>
            )}

            {activeTab === 'materials' && (
              <div className="space-y-2.5 text-xs text-neutral-700 animate-fade-in font-mono">
                <div className="p-3 bg-neutral-50 hairline-all space-y-1">
                  <div className="font-bold text-black text-[11px] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-dune-ochre" />
                    <span>Преміальні матеріали & Автентичність</span>
                  </div>
                  <p className="text-[11px] text-neutral-500 leading-relaxed font-sans">
                    Вироби з натуральної щільної бавовни (Heavyweight Fleece до 380-420 GSM), посиленого канвасу Dearborn Canvas або зносостійких мембранних тканин Soft Shell / Gore-Tex.
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 hairline-all space-y-1">
                  <div className="font-bold text-black text-[11px] uppercase">
                    // РЕКОМЕНДАЦІЇ З ДОГЛЯДУ
                  </div>
                  <ul className="text-[11px] text-neutral-600 font-sans list-disc list-inside space-y-1">
                    <li>Прання при температурі не вище 30°C навиворіт.</li>
                    <li>Не використовувати хлоровмісні відбілювачі.</li>
                    <li>Сушити природним шляхом, уникаючи прямих обігрівачів.</li>
                    <li>Кросівки чистити спеціалізованою піною (Crep Protect).</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-2.5 text-xs text-neutral-700 animate-fade-in font-mono">
                <div className="p-3 bg-neutral-50 hairline-all space-y-1">
                  <div className="font-bold text-black text-[11px] uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Швидка доставка Новою Поштою (1-2 дні)</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed font-sans">
                    Щоденні відправки замовлень до 18:00 зі складу в Києві. Отримання у будь-якому відділенні чи поштоматі України.
                  </p>
                </div>
                <div className="p-3 bg-neutral-50 hairline-all space-y-1">
                  <div className="font-bold text-black text-[11px] uppercase flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-dune-ochre" />
                    <span>Оплата при отриманні & Обмін 14 днів</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed font-sans">
                    Оглядайте та приміряйте речі у відділенні Нової Пошти перед оплатою. Гарантований обмін або повернення коштів протягом 14 днів згідно із Законом України «Про захист прав споживачів».
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4 text-xs animate-fade-in">
                {/* Reviews List */}
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {productReviews.map((rev) => (
                    <div key={rev.id} className="p-3 bg-neutral-50 hairline-all space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <strong className="font-mono text-black text-[11px]">{rev.author}</strong>
                          {rev.verified && (
                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[9px] font-mono border border-emerald-200">
                              ✓ ПЕРЕВІРЕНА ПОКУПКА
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[10px] text-neutral-400">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-dune-ochre">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                      <p className="text-[11px] text-neutral-600 leading-relaxed font-sans">{rev.text}</p>
                    </div>
                  ))}
                </div>

                {/* Submit Review Form */}
                <form onSubmit={handleReviewSubmit} className="pt-2 border-t border-neutral-200 space-y-2">
                  <div className="font-mono font-bold text-[10px] uppercase text-black">
                    // ЗАЛИШИТИ ВЛАСНИЙ ВІДГУК
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Ваше ім’я"
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      className="px-2.5 py-1.5 rounded-none border border-neutral-300 text-xs focus:outline-none focus:border-black font-mono"
                    />
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(Number(e.target.value))}
                      className="px-2.5 py-1.5 rounded-none border border-neutral-300 text-xs focus:outline-none focus:border-black font-mono bg-white"
                    >
                      <option value={5}>★★★★★ (5/5)</option>
                      <option value={4}>★★★★☆ (4/5)</option>
                      <option value={3}>★★★☆☆ (3/5)</option>
                    </select>
                    <select
                      value={reviewSkin}
                      onChange={(e) => setReviewSkin(e.target.value)}
                      className="px-2.5 py-1.5 rounded-none border border-neutral-300 text-xs focus:outline-none focus:border-black font-mono bg-white"
                    >
                      <option value="True to size">Розмір відповідає сітці</option>
                      <option value="Oversize fit">Вільний Oversize крій</option>
                      <option value="Трохи маломірить">Трохи маломірить (-0.5 розміру)</option>
                      <option value="Трохи більшомірить">Трохи більшомірить (+0.5 розміру)</option>
                    </select>
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Ваші враження від речі (якість матеріалів, шви, посадка, розмір)..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-none border border-neutral-300 text-xs focus:outline-none focus:border-black font-sans resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="px-3 py-1 bg-black text-white font-mono text-[10px] uppercase font-bold hover:bg-neutral-800 transition-colors"
                    >
                      ОПУБЛІКУВАТИ
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Bundle Synergy Booster: Часто купують разом (-10%) */}
          {bundleData && complementaryItem && (
            <div className="hairline-t pt-3 mb-4 font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-dune-ochre uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-dune-ochre" />
                  <span>// КУПУЙТЕ РАЗОМ: СИНЕРГІЯ</span>
                </span>
                <span className="bg-black text-white text-[9px] px-1.5 py-0.5 font-bold uppercase">
                  -10% НА СЕТ
                </span>
              </div>
              <div className="p-3 bg-neutral-50 hairline-all space-y-2.5">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedProduct.featuredImage}
                    alt=""
                    className="w-12 h-12 object-cover bg-white hairline-all shrink-0 mix-blend-multiply"
                  />
                  <span className="text-black font-bold text-xs">+</span>
                  <img
                    src={complementaryItem.featuredImage}
                    alt=""
                    className="w-12 h-12 object-cover bg-white hairline-all shrink-0 mix-blend-multiply"
                  />
                  <div className="min-w-0 flex-1 ml-1 font-sans">
                    <p className="text-[11px] font-semibold text-black uppercase truncate leading-tight">
                      {complementaryItem.title}
                    </p>
                    <div className="flex items-baseline gap-1.5 font-mono text-[11px] mt-1">
                      <span className="font-bold text-black tabular-nums">
                        {bundleData.bundlePrice.toLocaleString('uk-UA')} ₴
                      </span>
                      <span className="text-[10px] text-neutral-400 line-through tabular-nums">
                        {bundleData.originalTotal.toLocaleString('uk-UA')} ₴
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        (-{bundleData.discountAmount} ₴)
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleBuyBundle}
                  className="w-full py-2.5 bg-dune-ochre hover:bg-[#ebd500] text-black font-mono font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
                >
                  <Sparkles className="w-3.5 h-3.5 fill-current" />
                  <span>КУПИТИ КОМПЛЕКТОМ ({bundleData.bundlePrice.toLocaleString('uk-UA')} ₴)</span>
                </button>
              </div>
            </div>
          )}

          {/* Cross-Sell Recommendations */}
          {related.length > 0 && !bundleData && (
            <div className="hairline-t pt-3 mb-4">
              <h4 className="font-mono text-neutral-500 text-[10px] uppercase tracking-wider mb-2">
                // РЕКОМЕНДОВАНІ ПОЗИЦІЇ:
              </h4>
              <div className="space-y-2">
                {related.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-center justify-between p-2 bg-neutral-50 hairline-all text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={rel.featuredImage}
                        alt=""
                        className="w-8 h-8 object-cover bg-white shrink-0"
                      />
                      <span className="font-sans font-medium text-black truncate uppercase text-[11px]">
                        {rel.title}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        hapticImpact('light');
                        addToCart(rel, 1);
                      }}
                      className="min-h-[30px] inline-flex items-center gap-1 px-2.5 py-1 bg-black text-white font-mono text-[10px] uppercase font-bold shrink-0 ml-2 hover:bg-neutral-800 transition-all"
                    >
                      <span>+ {rel.price} ₴</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="mt-auto space-y-2 pt-3 hairline-t font-mono">
            <button
              onClick={() => {
                hapticImpact('medium');
                openQuickOrder(selectedProduct, selectedVariant || currentVariant?.title);
                handleClose();
              }}
              className="w-full min-h-[46px] py-3 px-4 bg-black hover:bg-neutral-800 text-white font-mono font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Zap className="w-3.5 h-3.5 text-dune-ochre fill-current" />
              <span>ШВИДКЕ ЗАМОВЛЕННЯ В 1 КЛІК</span>
            </button>

            <button
              onClick={handleAddAndClose}
              className="w-full min-h-[44px] py-2.5 px-4 bg-white hover:bg-neutral-100 text-black hairline-all font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{added ? 'ДОДАНО ДО КОШИКА!' : 'ДОДАТИ В КОШИК'}</span>
            </button>
          </div>
        </div>

        {/* Sticky Mobile Quick Order Bar */}
        <div className="sticky bottom-0 left-0 right-0 p-3 bg-white hairline-t flex items-center justify-between gap-3 md:hidden z-20 font-mono">
          <div className="min-w-0">
            <div className="text-[10px] text-neutral-400 uppercase">ЦІНА:</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-black tabular-nums">
                {activePrice.toLocaleString('uk-UA')} ₴
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                hapticImpact('light');
                addToCart(selectedProduct, 1, selectedVariant || currentVariant?.title);
                handleClose();
              }}
              className="min-h-[40px] px-3 bg-white hairline-all text-black font-bold text-xs uppercase flex items-center justify-center"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                hapticImpact('medium');
                openQuickOrder(selectedProduct, selectedVariant || currentVariant?.title);
                handleClose();
              }}
              className="min-h-[40px] py-2 px-4 bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-dune-ochre fill-current" />
              <span>В 1 КЛІК</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
