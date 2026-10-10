import assert from 'node:assert';
import { rowToProduct, productToRow, STORE_ID } from '../src/lib/supabase.ts';
import { Product } from '../src/types/index.ts';

async function runTests() {
  console.log('Testing Supabase Data Mapping & Sync Helpers...');

  const sampleProduct: Product = {
    id: 'prod-ami-01',
    handle: 'ami-paris-de-coeur-sweatshirt',
    title: 'Світшот AMI Paris De Coeur Heather Grey',
    bodyHtml: '<p>Фірмовий світшот з вишитим логотипом серця</p>',
    vendor: 'AMI Paris',
    productType: 'Одяг',
    tags: ['Одяг', 'Світшот', 'AMI Paris'],
    price: 9400,
    compareAtPrice: 10800,
    images: ['https://example.com/ami-1.jpg', 'https://example.com/ami-2.jpg'],
    featuredImage: 'https://example.com/ami-1.jpg',
    available: true,
    sku: 'AMI-SW-GRY',
    barcode: '3601234567890',
    variants: [
      { id: 'var-1', title: 'S', price: 9400, compareAtPrice: 10800, sku: 'AMI-SW-GRY-S' },
      { id: 'var-2', title: 'M', price: 9400, compareAtPrice: 10800, sku: 'AMI-SW-GRY-M' },
      { id: 'var-3', title: 'L', price: 9400, compareAtPrice: 10800, sku: 'AMI-SW-GRY-L' },
    ],
  };

  // 1. productToRow conversion
  const row = productToRow(sampleProduct, STORE_ID);
  assert.strictEqual(row.id, 'prod-ami-01');
  assert.strictEqual(row.store_id, STORE_ID);
  assert.strictEqual(row.title, 'Світшот AMI Paris De Coeur Heather Grey');
  assert.strictEqual(row.price, 9400);
  assert.strictEqual(row.compare_at_price, 10800);
  assert.strictEqual(row.sku, 'AMI-SW-GRY');
  assert.strictEqual(row.barcode, '3601234567890');
  assert.ok(row.variants.length === 3);

  // 2. rowToProduct roundtrip
  const reconstructed = rowToProduct(row);
  assert.strictEqual(reconstructed.id, sampleProduct.id);
  assert.strictEqual(reconstructed.title, sampleProduct.title);
  assert.strictEqual(reconstructed.price, sampleProduct.price);
  assert.strictEqual(reconstructed.compareAtPrice, sampleProduct.compareAtPrice);
  assert.strictEqual(reconstructed.sku, sampleProduct.sku);
  assert.strictEqual(reconstructed.barcode, sampleProduct.barcode);
  assert.strictEqual(reconstructed.vendor, sampleProduct.vendor);
  assert.strictEqual(reconstructed.variants.length, 3);
  assert.strictEqual(reconstructed.variants[1].title, 'M');

  // 3. Fallbacks when row has missing fields
  const sparseRow = {
    id: 'sparse-01',
    store_id: 'dune',
    handle: 'sparse-item',
    title: 'Sparse Item',
    body_html: '',
    vendor: '',
    product_type: '',
    tags: '["тег1", "тег2"]', // JSON string format from postgres
    price: 1500,
    compare_at_price: null,
    images: '["https://example.com/img.jpg"]',
    featured_image: '',
    available: true,
    sku: '',
    barcode: '',
    variants: [],
  };

  const parsedSparse = rowToProduct(sparseRow as any);
  assert.strictEqual(parsedSparse.id, 'sparse-01');
  assert.strictEqual(parsedSparse.tags.length, 2);
  assert.strictEqual(parsedSparse.tags[0], 'тег1');
  assert.strictEqual(parsedSparse.featuredImage, 'https://example.com/img.jpg');
  assert.strictEqual(parsedSparse.compareAtPrice, undefined);

  console.log('✓ All Supabase Data Mapping tests passed successfully!');
}

runTests().catch((err) => {
  console.error('Supabase sync test failure:', err);
  process.exit(1);
});
