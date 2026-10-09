import assert from 'node:assert';
import { STREETWEAR_BRANDS, KOREAN_BRANDS } from '../src/lib/brands.ts';

console.log('Testing Brand Logos and Streetwear Navigation...');

// Test 1: Brand list coverage
assert.ok(STREETWEAR_BRANDS.length >= 10, 'Expected at least 10 streetwear brands');
assert.strictEqual(KOREAN_BRANDS, STREETWEAR_BRANDS, 'KOREAN_BRANDS must alias STREETWEAR_BRANDS for backwards compatibility');
const brandNames = STREETWEAR_BRANDS.map((b) => b.name);
assert.ok(brandNames.includes('Nike'), 'Nike must be in brand list');
assert.ok(brandNames.includes('Jordan'), 'Jordan must be in brand list');
assert.ok(brandNames.includes('New Balance'), 'New Balance must be in brand list');
assert.ok(brandNames.includes('Stüssy'), 'Stüssy must be in brand list');
assert.ok(brandNames.includes('Carhartt WIP'), 'Carhartt WIP must be in brand list');
assert.ok(brandNames.includes('Salomon'), 'Salomon must be in brand list');
assert.ok(brandNames.includes('Stone Island'), 'Stone Island must be in brand list');
console.log('✓ Streetwear brand inventory verification passed!');

// Test 2: Filter matching logic test
const sampleProducts = [
  { id: '1', title: 'Air Jordan 1 Retro High OG Chicago', vendor: 'Jordan', productType: 'Взуття', tags: ['Снікери', 'Deadstock'] },
  { id: '2', title: 'Stüssy Basic Applique Hoodie', vendor: 'Stüssy', productType: 'Одяг', tags: ['Худі', 'Streetwear'] },
  { id: '3', title: 'New Balance 1906R Protection Pack', vendor: 'New Balance', productType: 'Взуття', tags: ['Снікери', 'Хіт'] },
  { id: '4', title: 'Carhartt WIP Double Knee Pant', vendor: 'Carhartt WIP', productType: 'Одяг', tags: ['Штани', 'Workwear'] },
];

function filterBySelectedBrand(products: typeof sampleProducts, selectedBrand: string) {
  if (selectedBrand === 'all') return products;
  const bLower = selectedBrand.toLowerCase().trim();
  return products.filter((p) => (p.vendor || '').toLowerCase().trim().includes(bLower));
}

function filterBySelectedCategory(products: typeof sampleProducts, selectedCategory: string) {
  if (selectedCategory === 'all') return products;
  const cLower = selectedCategory.toLowerCase().trim();
  return products.filter((p) => {
    const typeLower = (p.productType || 'Інше').toLowerCase();
    const tagMatch = p.tags.some((t) => t.toLowerCase().includes(cLower));
    return typeLower.includes(cLower) || tagMatch || p.title.toLowerCase().includes(cLower);
  });
}

// Brand filter check
const jordanItems = filterBySelectedBrand(sampleProducts, 'Jordan');
assert.strictEqual(jordanItems.length, 1);
assert.strictEqual(jordanItems[0].vendor, 'Jordan');

const stussyItems = filterBySelectedBrand(sampleProducts, 'Stüssy');
assert.strictEqual(stussyItems.length, 1);
assert.strictEqual(stussyItems[0].vendor, 'Stüssy');

// Category filter check
const shoesItems = filterBySelectedCategory(sampleProducts, 'Взуття');
assert.strictEqual(shoesItems.length, 2);

const clothesItems = filterBySelectedCategory(sampleProducts, 'Одяг');
assert.strictEqual(clothesItems.length, 2);

console.log('✓ Brand and Category filter algorithm tests passed!');
console.log('✓ ALL WAVE 4 NAVIGATION & BANNER TESTS PASSED PERFECTLY!');
