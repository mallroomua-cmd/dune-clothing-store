import { Product } from '../types';

export interface BundlePricing {
  productA: Product;
  productB: Product;
  originalTotal: number;
  bundlePrice: number;
  discountAmount: number;
  discountPercent: number;
  savingsLabel: string;
}

/**
 * Finds the most synergistic complementary product for cross-sell bundling.
 */
export function getComplementaryProduct(current: Product, catalog: Product[]): Product | null {
  if (!current || !catalog || catalog.length <= 1) return null;

  const currentTitle = current.title.toLowerCase();
  const currentBrand = (current.vendor || '').toLowerCase();
  const currentCategory = (current.category || '').toLowerCase();

  // 1. Specific brand synergies
  // Rhode Lip Tint <-> Rhode Pocket Blush
  if (currentBrand.includes('rhode') || currentTitle.includes('rhode')) {
    if (currentTitle.includes('lip') || currentTitle.includes('тінт')) {
      const blush = catalog.find((p) => p.id !== current.id && p.title.toLowerCase().includes('blush'));
      if (blush) return blush;
    } else {
      const lip = catalog.find((p) => p.id !== current.id && (p.title.toLowerCase().includes('lip') || p.title.toLowerCase().includes('тінт')));
      if (lip) return lip;
    }
  }

  // Olaplex <-> K18 hair care holy grail
  if (currentBrand.includes('olaplex') || currentTitle.includes('olaplex')) {
    const k18 = catalog.find((p) => p.id !== current.id && p.title.toLowerCase().includes('k18'));
    if (k18) return k18;
  }
  if (currentBrand.includes('k18') || currentTitle.includes('k18')) {
    const olaplex = catalog.find((p) => p.id !== current.id && p.title.toLowerCase().includes('olaplex'));
    if (olaplex) return olaplex;
  }

  // Sol de Janeiro mist <-> Sol de Janeiro cream
  if (currentBrand.includes('sol de janeiro') || currentTitle.includes('cheirosa')) {
    const matching = catalog.find(
      (p) => p.id !== current.id && (p.vendor?.toLowerCase().includes('sol de janeiro') || p.title.toLowerCase().includes('janeiro'))
    );
    if (matching) return matching;
  }

  // Rare Beauty <-> Fenty Beauty
  if (currentBrand.includes('rare beauty') || currentTitle.includes('rare beauty')) {
    const fenty = catalog.find((p) => p.id !== current.id && p.title.toLowerCase().includes('fenty'));
    if (fenty) return fenty;
  }

  // 2. Same brand pairing
  if (current.vendor) {
    const sameVendor = catalog.find((p) => p.id !== current.id && p.vendor?.toLowerCase() === currentBrand);
    if (sameVendor) return sameVendor;
  }

  // 3. Same category pairing
  if (current.category || current.productType) {
    const sameCategory = catalog.find(
      (p) =>
        p.id !== current.id &&
        (((p.category || '').toLowerCase() === currentCategory) ||
          ((p.productType || '').toLowerCase() === currentCategory))
    );
    if (sameCategory) return sameCategory;
  }

  // 4. Default fallback: first different item
  return catalog.find((p) => p.id !== current.id) || null;
}

/**
 * Calculates bundled price with a 10% instant bundle discount.
 */
export function calculateBundlePricing(
  productA: Product,
  productB: Product,
  discountPercent: number = 10
): BundlePricing {
  const originalTotal = (productA.price || 0) + (productB.price || 0);
  const discountAmount = Math.round((originalTotal * discountPercent) / 100);
  const bundlePrice = Math.max(originalTotal - discountAmount, 0);

  return {
    productA,
    productB,
    originalTotal,
    bundlePrice,
    discountAmount,
    discountPercent,
    savingsLabel: `Економія ${discountAmount.toLocaleString('uk-UA')} ₴`,
  };
}

/**
 * Determines beauty-specific classification and protocol badges
 */
export function getBeautyBadges(product: Product): { badges: string[]; categoryLabel: string; isBeauty: boolean } {
  const text = `${product.title} ${product.vendor || ''} ${(product.tags || []).join(' ')} ${product.productType || ''} ${product.category || ''}`.toLowerCase();

  const isBeauty =
    text.includes('косметик') ||
    text.includes('догляд') ||
    text.includes('макіяж') ||
    text.includes('beauty') ||
    text.includes('rhode') ||
    text.includes('rare beauty') ||
    text.includes('olaplex') ||
    text.includes('k18') ||
    text.includes('sol de janeiro') ||
    text.includes('gisou') ||
    text.includes('fenty') ||
    text.includes('dyson') ||
    text.includes('lip') ||
    text.includes('blush') ||
    text.includes('oil') ||
    text.includes('cream') ||
    text.includes('mist');

  if (!isBeauty) {
    return {
      badges: ['✨ 100% ORIGINAL', '⚡ VERIFIED LEGIT'],
      categoryLabel: 'STREETWEAR ARCHIVE',
      isBeauty: false,
    };
  }

  const badges: string[] = [];

  if (text.includes('lip') || text.includes('тінт') || text.includes('блиск') || text.includes('губ')) {
    badges.push('🌸 PEPTIDE NOURISHMENT');
    badges.push('💄 GLOSSY FINISH');
  } else if (text.includes('blush') || text.includes('рум')) {
    badges.push('🌸 DEWY FLUSH');
    badges.push('✨ BLENDABLE PIGMENT');
  } else if (text.includes('olaplex') || text.includes('k18') || text.includes('волос') || text.includes('hair') || text.includes('dyson')) {
    badges.push('✨ MOLECULAR REPAIR');
    badges.push('⚡ SALON GRADE');
  } else if (text.includes('mist') || text.includes('спрей') || text.includes('парфум') || text.includes('cheirosa')) {
    badges.push('🥥 SIGNATURE SCENT');
    badges.push('🌴 ALL-DAY SILLAGE');
  } else if (text.includes('cream') || text.includes('крем') || text.includes('зволож')) {
    badges.push('💧 24H HYDRATION');
    badges.push('🌿 CLEAN BEAUTY');
  } else {
    badges.push('✨ 100% ОРИГІНАЛ (США / ЄС)');
    badges.push('🧪 ТЕСТОВАНО ДЕРМАТОЛОГАМИ');
  }

  badges.push('🇺🇦 ШВИДКА ВІДПРАВКА 1 ДЕНЬ');

  return {
    badges: badges.slice(0, 3),
    categoryLabel: 'BEAUTY & CARE PROTOCOL',
    isBeauty: true,
  };
}
