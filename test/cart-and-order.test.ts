import assert from 'node:assert';
import { SAMPLE_PRODUCTS } from '../src/lib/sample-data.ts';
import { findVariant, getItemId, newOrderId } from '../src/lib/ids.ts';
import { formatUaPhone, normalizeUaPhoneForAnalytics } from '../src/lib/formatters.ts';
import { toGaItem } from '../src/lib/analytics.ts';

function runTests() {
  console.log('Testing IDs and variant lookup...');
  const firstProduct = SAMPLE_PRODUCTS[0];
  const firstVariantTitle = firstProduct.variants[0].title;
  const v1 = findVariant(firstProduct, firstVariantTitle);
  assert.strictEqual(v1.title, firstVariantTitle);
  assert.strictEqual(v1.price, firstProduct.price);

  const defaultVariant = findVariant(firstProduct, undefined);
  assert.ok(defaultVariant, 'Should return first variant when none specified');

  const itemId = getItemId(firstProduct, firstVariantTitle);
  assert.ok(
    itemId === firstProduct.sku ||
      itemId === firstProduct.variants[0]?.sku ||
      itemId.includes(firstProduct.handle),
    'Item ID should be stable (SKU or handle)'
  );

  console.log('Testing Order ID generation...');
  const orderId1 = newOrderId();
  const orderId2 = newOrderId();
  assert.notStrictEqual(orderId1, orderId2);
  assert.ok(orderId1.length >= 6, 'Order ID should be formatted');

  console.log('Testing phone formatters...');
  const formatted = formatUaPhone('0991234567');
  assert.strictEqual(formatted, '+380 (99) 123-45-67');

  const normalized = normalizeUaPhoneForAnalytics('+380 (99) 123-45-67');
  assert.strictEqual(normalized, '+380991234567');

  console.log('Testing toGaItem calculation...');
  const gaItem = toGaItem({ product: firstProduct, quantity: 2, selectedVariant: firstVariantTitle });
  assert.strictEqual(gaItem.price, firstProduct.price);
  assert.strictEqual(gaItem.quantity, 2);
  assert.strictEqual(gaItem.item_brand, firstProduct.vendor);
  assert.strictEqual(gaItem.item_category, firstProduct.productType);

  console.log('✓ All cart and order calculation tests passed successfully!');
}

runTests();
