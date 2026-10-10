import assert from 'node:assert';
import { STREETWEAR_BRANDS } from '../src/lib/brands.ts';
import { SAMPLE_PRODUCTS, SAMPLE_SHOPIFY_CSV } from '../src/lib/sample-data.ts';

console.log('Testing Wave 5: MOLAND & The Rooms Rebranding Verification...');

// 1. Check Designer & Luxury Brands from The Rooms
const brandNames = STREETWEAR_BRANDS.map(b => b.name);
const expectedTheRoomsBrands = [
  'AMI Paris',
  'Ganni',
  'Jacquemus',
  'Jil Sander',
  'Stone Island',
  'Carhartt WIP',
  'New Balance',
  'Salomon',
  'Breda'
];

for (const expected of expectedTheRoomsBrands) {
  assert.ok(
    brandNames.includes(expected),
    `Expected brand "${expected}" from The Rooms to be in STREETWEAR_BRANDS, but found: ${brandNames.join(', ')}`
  );
}
console.log('✓ The Rooms designer brand portfolio verified!');

// 2. Check Designer Products in Sample Data
const sampleVendors = SAMPLE_PRODUCTS.map(p => p.vendor);
assert.ok(sampleVendors.includes('Jacquemus'), 'Expected Jacquemus bag in SAMPLE_PRODUCTS');
assert.ok(sampleVendors.includes('AMI Paris'), 'Expected AMI Paris sweatshirt in SAMPLE_PRODUCTS');
assert.ok(sampleVendors.includes('Ganni'), 'Expected Ganni tee in SAMPLE_PRODUCTS');
assert.ok(sampleVendors.includes('Breda'), 'Expected Breda watch in SAMPLE_PRODUCTS');
console.log('✓ Curated designer products (Jacquemus, AMI Paris, Ganni, Breda) verified!');

// 3. Check Bags category in SAMPLE_PRODUCTS
const bagProducts = SAMPLE_PRODUCTS.filter(p => p.productType.includes('Сумки'));
assert.ok(bagProducts.length > 0, 'Expected at least 1 bag product in sample catalog');
console.log('✓ Handbags / Bags category presence verified!');

// 4. Check Sample Shopify CSV includes new lines
assert.ok(SAMPLE_SHOPIFY_CSV.includes('Jacquemus'), 'CSV should contain Jacquemus');
assert.ok(SAMPLE_SHOPIFY_CSV.includes('AMI Paris'), 'CSV should contain AMI Paris');
assert.ok(SAMPLE_SHOPIFY_CSV.includes('Ganni'), 'CSV should contain Ganni');
assert.ok(SAMPLE_SHOPIFY_CSV.includes('Breda'), 'CSV should contain Breda');
console.log('✓ Sample Shopify CSV designer items verified!');

console.log('✓ ALL WAVE 5 MOLAND REBRANDING & THE ROOMS TESTS PASSED PERFECTLY!\n');
