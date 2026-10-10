import assert from 'node:assert';
import {
  parseUniversalCsvFeed,
  generateSampleCsvTemplate,
  mergeProducts,
} from '../src/lib/universal-csv.ts';
import { Product } from '../src/types/index.ts';

async function runTests() {
  console.log('Testing Universal CSV Parser...');

  // 1. Ukrainian CSV Feed format
  const ukrainianCsv = `Назва,Ціна,Стара ціна,Артикул,Категорія,Бренд,Зображення,Опис,Розміри
"Худі Stüssy Basic Logo Black",3890,4500,"STU-HD-BLK","Худі","Stüssy","https://images.unsplash.com/photo-1","Оригінальне худі з флісом","S, M, L, XL"
"Кросівки New Balance 1906R Silver",6499,,"NB-1906R-SLV","Взуття","New Balance","https://images.unsplash.com/photo-2","Ретро-ранер силует","41, 42, 43, 44"`;

  const uaParsed = await parseUniversalCsvFeed(ukrainianCsv);
  assert.strictEqual(uaParsed.length, 2, 'Should parse 2 Ukrainian products');
  assert.strictEqual(uaParsed[0].title, 'Худі Stüssy Basic Logo Black');
  assert.strictEqual(uaParsed[0].price, 3890);
  assert.strictEqual(uaParsed[0].compareAtPrice, 4500);
  assert.strictEqual(uaParsed[0].sku, 'STU-HD-BLK');
  assert.strictEqual(uaParsed[0].productType, 'Худі');
  assert.strictEqual(uaParsed[0].vendor, 'Stüssy');
  assert.strictEqual(uaParsed[0].images[0], 'https://images.unsplash.com/photo-1');
  assert.strictEqual(uaParsed[0].variants.length, 4, 'Should parse 4 size variants for S, M, L, XL');

  // Second product check
  assert.strictEqual(uaParsed[1].title, 'Кросівки New Balance 1906R Silver');
  assert.strictEqual(uaParsed[1].price, 6499);
  assert.strictEqual(uaParsed[1].compareAtPrice, undefined);
  assert.strictEqual(uaParsed[1].variants.length, 4, 'Should parse 4 shoe sizes');

  // 2. Generic English CSV Feed format
  const englishCsv = `title,price,compare_at_price,sku,category,vendor,image,description,sizes
"Jacquemus Le Bambino Bag",18500,21000,"JACQ-BAM-01","Сумки","Jacquemus","https://images.unsplash.com/photo-3","Signature leather bag","ONE SIZE"`;

  const enParsed = await parseUniversalCsvFeed(englishCsv);
  assert.strictEqual(enParsed.length, 1);
  assert.strictEqual(enParsed[0].title, 'Jacquemus Le Bambino Bag');
  assert.strictEqual(enParsed[0].price, 18500);
  assert.strictEqual(enParsed[0].compareAtPrice, 21000);
  assert.strictEqual(enParsed[0].vendor, 'Jacquemus');
  assert.strictEqual(enParsed[0].variants.length, 1);
  assert.strictEqual(enParsed[0].variants[0].title, 'ONE SIZE');

  // 3. Fallback to Shopify CSV
  const shopifyCsv = `Handle,Title,Price,Vendor,Type
"ami-de-coeur-tee","AMI Paris Tee",4200,"AMI Paris","Футболки"`;
  const shopifyParsed = await parseUniversalCsvFeed(shopifyCsv);
  assert.strictEqual(shopifyParsed.length, 1);
  assert.strictEqual(shopifyParsed[0].title, 'AMI Paris Tee');
  assert.strictEqual(shopifyParsed[0].price, 4200);

  // 4. Sample CSV Template generator
  const template = generateSampleCsvTemplate();
  assert.ok(template.includes('Назва'), 'Template should contain Назва header');
  assert.ok(template.includes('Ціна'), 'Template should contain Ціна header');
  assert.ok(template.includes('Артикул'), 'Template should contain Артикул header');
  const templateParsed = await parseUniversalCsvFeed(template);
  assert.ok(templateParsed.length > 0, 'Generated template must be parseable');

  // 5. Merge logic tests (replace vs upsert)
  const existingProducts: Product[] = [
    {
      id: 'existing-1',
      handle: 'existing-1',
      title: 'Old Item 1',
      bodyHtml: '',
      vendor: 'Brand A',
      productType: 'Одяг',
      tags: [],
      price: 1000,
      images: ['img1'],
      featuredImage: 'img1',
      available: true,
      sku: 'SKU-001',
      barcode: '',
      variants: [{ id: 'v1', title: 'Default', price: 1000, sku: 'SKU-001' }],
    },
    {
      id: 'existing-2',
      handle: 'existing-2',
      title: 'Old Item 2',
      bodyHtml: '',
      vendor: 'Brand B',
      productType: 'Взуття',
      tags: [],
      price: 2000,
      images: ['img2'],
      featuredImage: 'img2',
      available: true,
      sku: 'SKU-002',
      barcode: '',
      variants: [{ id: 'v2', title: 'Default', price: 2000, sku: 'SKU-002' }],
    },
  ];

  const incomingUpdates: Product[] = [
    {
      id: 'updated-1',
      handle: 'existing-1',
      title: 'Updated Item 1 Name',
      bodyHtml: 'New desc',
      vendor: 'Brand A',
      productType: 'Одяг',
      tags: ['new'],
      price: 1250,
      images: ['img1'],
      featuredImage: 'img1',
      available: true,
      sku: 'SKU-001',
      barcode: '',
      variants: [{ id: 'v1', title: 'Default', price: 1250, sku: 'SKU-001' }],
    },
    {
      id: 'new-3',
      handle: 'new-3',
      title: 'Brand New Item 3',
      bodyHtml: '',
      vendor: 'Brand C',
      productType: 'Сумки',
      tags: [],
      price: 3000,
      images: ['img3'],
      featuredImage: 'img3',
      available: true,
      sku: 'SKU-003',
      barcode: '',
      variants: [{ id: 'v3', title: 'Default', price: 3000, sku: 'SKU-003' }],
    },
  ];

  // Test Replace mode
  const replaced = mergeProducts(existingProducts, incomingUpdates, 'replace');
  assert.strictEqual(replaced.length, 2, 'Replace mode replaces full catalog');
  assert.strictEqual(replaced[0].title, 'Updated Item 1 Name');
  assert.strictEqual(replaced[1].title, 'Brand New Item 3');

  // Test Upsert mode
  const upserted = mergeProducts(existingProducts, incomingUpdates, 'upsert');
  assert.strictEqual(upserted.length, 3, 'Upsert mode updates existing and appends new');
  const foundUpdated = upserted.find((p) => p.sku === 'SKU-001');
  assert.ok(foundUpdated);
  assert.strictEqual(foundUpdated.price, 1250, 'Price updated by SKU in upsert');
  assert.strictEqual(foundUpdated.title, 'Updated Item 1 Name');
  const foundOld = upserted.find((p) => p.sku === 'SKU-002');
  assert.ok(foundOld, 'Preserved non-updated existing product in upsert');
  assert.strictEqual(foundOld.price, 2000);
  const foundNew = upserted.find((p) => p.sku === 'SKU-003');
  assert.ok(foundNew, 'New product appended in upsert');

  // 6. Test imported Lil-Shop beauty catalog parsing & categorization
  const fs = await import('node:fs');
  const path = await import('node:path');
  const importedCsvPath = path.resolve(process.cwd(), 'data/imported-catalog.csv');
  if (fs.existsSync(importedCsvPath)) {
    const importedCsv = fs.readFileSync(importedCsvPath, 'utf-8');
    const importedProducts = await parseUniversalCsvFeed(importedCsv);
    assert.strictEqual(importedProducts.length, 46, 'Should parse all 46 products from data/imported-catalog.csv');

    // All must be in-stock, priced, with multiple images
    for (const p of importedProducts) {
      assert.ok(p.price > 0, `Product ${p.title} must have positive price`);
      assert.strictEqual(p.available, true, `Product ${p.title} must be available`);
      assert.ok(p.images.length > 0, `Product ${p.title} must have images`);
    }

    // Verify categories
    const makeup = importedProducts.filter((p) => p.productType === 'Декоративна косметика');
    const skincare = importedProducts.filter((p) => p.productType === 'Догляд за обличчям');
    const fragrance = importedProducts.filter((p) => p.productType === 'Парфуми та аромати');
    const haircare = importedProducts.filter((p) => p.productType === 'Догляд за волоссям');
    const bodycare = importedProducts.filter((p) => p.productType === 'Догляд за тілом');
    const bags = importedProducts.filter((p) => p.productType === 'Аксесуари та сумки');

    assert.strictEqual(makeup.length, 17, 'Expected 17 makeup items');
    assert.strictEqual(skincare.length, 19, 'Expected 19 skincare items');
    assert.strictEqual(fragrance.length, 5, 'Expected 5 fragrance items');
    assert.strictEqual(haircare.length, 3, 'Expected 3 haircare items');
    assert.strictEqual(bodycare.length, 1, 'Expected 1 bodycare item');
    assert.strictEqual(bags.length, 1, 'Expected 1 accessories/bag item');

    // Subcategory tag filtering
    const lips = importedProducts.filter((p) => p.tags.includes('Губи'));
    assert.strictEqual(lips.length, 7, 'Expected 7 lip products (Fenty, Rare Beauty, SF balm, SF oil, Rhode, Dior)');

    const face = importedProducts.filter((p) => p.tags.includes('Обличчя'));
    assert.strictEqual(face.length, 8, 'Expected 8 face makeup items (Dior, Hourglass, Rhode, Rare Beauty, Tarte, Elegance, Dr.Ceuracle, brushes)');

    const eyes = importedProducts.filter((p) => p.tags.includes('Очі'));
    assert.strictEqual(eyes.length, 2, 'Expected 2 eye makeup items (NYX palette, RevitaBrow)');

    console.log(`✓ Imported catalog beauty parsing & categorization verified (${importedProducts.length} products across categories)!`);
  }

  console.log('✓ All Universal CSV parser & merge tests passed successfully!');
}

runTests().catch((err) => {
  console.error('Universal CSV test failure:', err);
  process.exit(1);
});
