import assert from 'node:assert';
import { SAMPLE_PRODUCTS } from '../src/lib/sample-data.ts';
import { findVariant, getItemId, newOrderId } from '../src/lib/ids.ts';
import { formatUaPhone, normalizeUaPhoneForAnalytics } from '../src/lib/formatters.ts';
import { toGaItem } from '../src/lib/analytics.ts';

function runTests() {
  console.log('Testing IDs and variant lookup...');
  const watch = SAMPLE_PRODUCTS[0];
  const v1 = findVariant(watch, 'Midnight Black');
  assert.strictEqual(v1.title, 'Midnight Black');
  assert.strictEqual(v1.price, 1899);

  const defaultVariant = findVariant(watch, undefined);
  assert.ok(defaultVariant, 'Should return first variant when none specified');

  const itemId = getItemId(watch, 'Midnight Black');
  assert.ok(itemId.includes('smart-watch-ultra-titanium'), 'Item ID should be stable and based on handle');

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
  const gaItem = toGaItem({ product: watch, quantity: 2, selectedVariant: 'Midnight Black' });
  assert.strictEqual(gaItem.price, 1899);
  assert.strictEqual(gaItem.quantity, 2);
  assert.strictEqual(gaItem.item_brand, 'TechPro');
  assert.strictEqual(gaItem.item_category, 'Електроніка');

  console.log('✓ All cart and order calculation tests passed successfully!');
}

runTests();
