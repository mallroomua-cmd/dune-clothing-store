import { Product } from '../types';

export interface MobileFilterState {
  category: string;
  brand: string;
  minPrice: number;
  maxPrice: number;
  inStockOnly: boolean;
  sortBy: 'popular' | 'price_asc' | 'price_desc' | 'discount';
}

export function cleanPhoneForTel(phone?: string): string {
  if (!phone) return '+380933456810';
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (!cleaned.startsWith('+') && cleaned.startsWith('380')) {
    return `+${cleaned}`;
  }
  return cleaned.length > 5 ? cleaned : '+380933456810';
}

export function filterProductsByCriteria(
  products: Product[],
  criteria: MobileFilterState
): Product[] {
  let result = [...products];

  // Category filter
  if (criteria.category && criteria.category !== 'all') {
    const cLower = criteria.category.toLowerCase().trim();
    result = result.filter((p) => {
      const typeLower = (p.productType || 'Інше').toLowerCase();
      const titleLower = p.title.toLowerCase();
      const tagMatch = p.tags.some((t) => t.toLowerCase().includes(cLower));
      return (
        typeLower.includes(cLower) ||
        cLower.includes(typeLower) ||
        tagMatch ||
        titleLower.includes(cLower)
      );
    });
  }

  // Brand filter
  if (criteria.brand && criteria.brand !== 'all') {
    const bLower = criteria.brand.toLowerCase().trim();
    result = result.filter(
      (p) =>
        (p.vendor || '').toLowerCase().trim().includes(bLower) ||
        bLower.includes((p.vendor || '').toLowerCase().trim())
    );
  }

  // Price Range
  if (criteria.minPrice > 0) {
    result = result.filter((p) => p.price >= criteria.minPrice);
  }
  if (criteria.maxPrice > 0) {
    result = result.filter((p) => p.price <= criteria.maxPrice);
  }

  // In Stock Only
  if (criteria.inStockOnly) {
    result = result.filter((p) => p.available);
  }

  // Sorting
  if (criteria.sortBy === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (criteria.sortBy === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  } else if (criteria.sortBy === 'discount') {
    result.sort((a, b) => {
      const discA = a.compareAtPrice ? a.compareAtPrice - a.price : 0;
      const discB = b.compareAtPrice ? b.compareAtPrice - b.price : 0;
      return discB - discA;
    });
  }

  return result;
}
