import assert from 'node:assert';
import { SAMPLE_PRODUCTS } from '../src/lib/sample-data.ts';
import { cleanPhoneForTel, filterProductsByCriteria, MobileFilterState } from '../src/lib/mobile-filters.ts';

async function runTests() {
  console.log('Testing Mobile Experience & Navigation Logic...');

  // 1. Phone number formatting for tel: links
  const formatted = cleanPhoneForTel('+38 (093) 345-68-10');
  assert.strictEqual(formatted, '+380933456810', 'Phone should be cleaned for tel: link');

  // 2. Mobile filter matching logic:
  // Test price range filter
  const criteria1: MobileFilterState = {
    category: 'all',
    brand: 'all',
    minPrice: 3000,
    maxPrice: 8000,
    inStockOnly: false,
    sortBy: 'popular',
  };
  const filtered1 = filterProductsByCriteria(SAMPLE_PRODUCTS, criteria1);
  assert.ok(filtered1.length > 0, 'Should find products in price range 3000-8000');
  filtered1.forEach((p) => {
    assert.ok(p.price >= 3000 && p.price <= 8000);
  });

  // Test in-stock only filter
  const criteria2: MobileFilterState = {
    category: 'all',
    brand: 'all',
    minPrice: 0,
    maxPrice: 0,
    inStockOnly: true,
    sortBy: 'popular',
  };
  const filtered2 = filterProductsByCriteria(SAMPLE_PRODUCTS, criteria2);
  assert.ok(filtered2.length > 0);
  filtered2.forEach((p) => {
    assert.strictEqual(p.available, true);
  });

  // Test Brand filter
  const criteria3: MobileFilterState = {
    category: 'all',
    brand: 'AMI Paris',
    minPrice: 0,
    maxPrice: 0,
    inStockOnly: false,
    sortBy: 'popular',
  };
  const filtered3 = filterProductsByCriteria(SAMPLE_PRODUCTS, criteria3);
  assert.ok(filtered3.length > 0);
  filtered3.forEach((p) => {
    assert.strictEqual(p.vendor, 'AMI Paris');
  });

  console.log('✓ All Mobile experience & filter logic tests passed successfully!');
}

runTests().catch((err) => {
  console.error('Mobile experience test failure:', err);
  process.exit(1);
});
