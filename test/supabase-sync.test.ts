import assert from 'node:assert';
import { rowToProduct, productToRow, rowToOrder, orderToRow, STORE_ID } from '../src/lib/supabase.ts';
import { Product, StoredOrder } from '../src/types/index.ts';

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

  // 3. Fallbacks when product row has missing fields
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

  // 4. Order mapping: orderToRow and rowToOrder roundtrip
  const sampleOrder: StoredOrder = {
    id: 'ord-9921',
    orderId: 'M-9921',
    name: 'Богдан Хмельницький',
    phone: '+380 (50) 123-45-67',
    city: 'Київ',
    warehouse: 'Відділення №15 (вул. Хрещатик, 22)',
    deliveryMethod: 'nova_poshta',
    paymentMethod: 'cash_on_delivery',
    notes: 'Зателефонувати перед відправкою',
    items: [
      {
        product: sampleProduct,
        quantity: 2,
        selectedVariant: 'var-2',
      },
    ],
    total: 18800,
    date: '10.10.2026, 14:30',
    createdAt: 1775831400000,
    status: 'new',
    syncedToTelegram: true,
    ttn: '20450912345678',
  };

  const orderRow = orderToRow(sampleOrder, STORE_ID);
  assert.strictEqual(orderRow.id, 'ord-9921');
  assert.strictEqual(orderRow.store_id, STORE_ID);
  assert.strictEqual(orderRow.order_id, 'M-9921');
  assert.strictEqual(orderRow.customer_name, 'Богдан Хмельницький');
  assert.strictEqual(orderRow.phone, '+380 (50) 123-45-67');
  assert.strictEqual(orderRow.city, 'Київ');
  assert.strictEqual(orderRow.warehouse, 'Відділення №15 (вул. Хрещатик, 22)');
  assert.strictEqual(orderRow.delivery_method, 'nova_poshta');
  assert.strictEqual(orderRow.payment_method, 'cash_on_delivery');
  assert.strictEqual(orderRow.total, 18800);
  assert.strictEqual(orderRow.status, 'new');
  assert.strictEqual(orderRow.ttn, '20450912345678');
  assert.strictEqual(orderRow.synced_to_telegram, true);

  // 5. rowToOrder roundtrip
  const reconstructedOrder = rowToOrder(orderRow);
  assert.strictEqual(reconstructedOrder.id, sampleOrder.id);
  assert.strictEqual(reconstructedOrder.orderId, sampleOrder.orderId);
  assert.strictEqual(reconstructedOrder.name, sampleOrder.name);
  assert.strictEqual(reconstructedOrder.phone, sampleOrder.phone);
  assert.strictEqual(reconstructedOrder.city, sampleOrder.city);
  assert.strictEqual(reconstructedOrder.warehouse, sampleOrder.warehouse);
  assert.strictEqual(reconstructedOrder.total, 18800);
  assert.strictEqual(reconstructedOrder.status, 'new');
  assert.strictEqual(reconstructedOrder.ttn, '20450912345678');
  assert.strictEqual(reconstructedOrder.syncedToTelegram, true);
  assert.strictEqual(reconstructedOrder.items.length, 1);
  assert.strictEqual(reconstructedOrder.items[0].quantity, 2);

  // 6. Sparse order row fallback
  const sparseOrderRow = {
    id: 'ord-sparse',
    store_id: 'dune',
    order_id: '',
    customer_name: '',
    phone: '+380 (67) 000-00-00',
    city: '',
    warehouse: '',
    delivery_method: 'courier',
    payment_method: 'card',
    notes: '',
    items: '[]',
    total: 3500,
    status: 'confirmed',
    ttn: '',
    synced_to_telegram: false,
    created_at: new Date(1775831400000).toISOString(),
  };

  const parsedSparseOrder = rowToOrder(sparseOrderRow as any);
  assert.strictEqual(parsedSparseOrder.id, 'ord-sparse');
  assert.strictEqual(parsedSparseOrder.orderId, 'ord-sparse');
  assert.strictEqual(parsedSparseOrder.name, 'Клієнт');
  assert.strictEqual(parsedSparseOrder.total, 3500);
  assert.strictEqual(parsedSparseOrder.status, 'confirmed');
  assert.strictEqual(parsedSparseOrder.deliveryMethod, 'courier');
  assert.strictEqual(parsedSparseOrder.items.length, 0);

  console.log('✓ All Supabase Product & Order Data Mapping tests passed successfully!');
}

runTests().catch((err) => {
  console.error('Supabase sync test failure:', err);
  process.exit(1);
});
