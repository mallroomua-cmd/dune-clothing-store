import Papa from 'papaparse';
import { Product } from '../types';
import { parsePrice, parseShopifyCsv } from './shopify-parser';

/**
 * Universal column mappings covering Ukrainian, Russian, English and Shopify CSV exports
 */
const COLUMN_ALIASES = {
  title: ['title', 'назва', 'название', 'найменування', 'товар', 'name', 'product name'],
  price: ['price', 'ціна', 'цена', 'вартість', 'variant price', 'ціна грн'],
  compareAtPrice: [
    'compare_at_price',
    'стара ціна',
    'старая цена',
    'ціна до знижки',
    'old_price',
    'compare at price',
    'variant compare at price',
  ],
  sku: ['sku', 'артикул', 'код', 'код товару', 'код товара', 'variant sku', 'item code'],
  barcode: ['barcode', 'штрихкод', 'штрих-код', 'variant barcode'],
  category: ['category', 'категорія', 'категория', 'type', 'тип', 'тип товару', 'product category', 'розділ'],
  vendor: ['vendor', 'бренд', 'brand', 'виробник', 'производитель'],
  image: ['image', 'images', 'image_url', 'image src', 'зображення', 'фото', 'фотографія', 'посилання на фото'],
  description: ['description', 'опис', 'описание', 'body', 'body (html)', 'деталі'],
  sizes: ['sizes', 'розміри', 'размеры', 'розмір', 'размер', 'option1 value', 'variant title'],
  stock: ['stock', 'залишок', 'остаток', 'наявність', 'наличие', 'variant inventory qty', 'кількість'],
};

function normalizeHeader(h: string): string {
  return h.replace(/^\uFEFF/, '').trim().toLowerCase();
}

function findColumnValue(row: Record<string, string>, aliases: string[]): string {
  for (const key of Object.keys(row)) {
    const cleanKey = normalizeHeader(key);
    if (aliases.some((alias) => cleanKey === alias || cleanKey.includes(alias))) {
      const val = row[key];
      if (val !== undefined && val !== null && String(val).trim().length > 0) {
        return String(val).trim();
      }
    }
  }
  return '';
}

/**
 * Detects if CSV has Shopify-specific headers
 */
function isShopifyCsv(headers: string[]): boolean {
  const norm = headers.map(normalizeHeader);
  return norm.includes('handle') && (norm.includes('title') || norm.includes('variant price'));
}

/**
 * Parses universal CSV feed (Ukrainian Excel, Google Sheets, Prom, Rozetka, Shopify)
 */
export async function parseUniversalCsvFeed(
  csvString: string,
  options?: { defaultVendor?: string; defaultCategory?: string }
): Promise<Product[]> {
  const defaultVendor = options?.defaultVendor || 'MOLAND';
  const defaultCategory = options?.defaultCategory || 'Одяг';

  // Fast header probe
  const firstLine = csvString.split(/\r?\n/)[0] || '';
  const parsedHeaderRow = Papa.parse(firstLine, { header: false }).data[0] as string[] | undefined;

  if (parsedHeaderRow && isShopifyCsv(parsedHeaderRow)) {
    return parseShopifyCsv(csvString);
  }

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvString, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.replace(/^\uFEFF/, '').trim(),
      complete: (results) => {
        try {
          const productsMap = new Map<string, Product>();

          results.data.forEach((row, index) => {
            const title = findColumnValue(row, COLUMN_ALIASES.title);
            const rawPrice = findColumnValue(row, COLUMN_ALIASES.price);
            const price = parsePrice(rawPrice);

            if (!title || price <= 0) return;

            const sku = findColumnValue(row, COLUMN_ALIASES.sku) || `ITEM-${index + 1}`;
            const compareAtPrice = parsePrice(findColumnValue(row, COLUMN_ALIASES.compareAtPrice)) || undefined;
            const category = findColumnValue(row, COLUMN_ALIASES.category) || defaultCategory;
            const vendor = findColumnValue(row, COLUMN_ALIASES.vendor) || defaultVendor;
            const rawImages = findColumnValue(row, COLUMN_ALIASES.image);
            const description = findColumnValue(row, COLUMN_ALIASES.description);
            const rawSizes = findColumnValue(row, COLUMN_ALIASES.sizes);
            const barcode = findColumnValue(row, COLUMN_ALIASES.barcode);
            const stockRaw = findColumnValue(row, COLUMN_ALIASES.stock);

            // Images parsing (supports comma or semicolon separated URLs)
            const imagesList = rawImages
              ? rawImages
                  .split(/[,;\n]/)
                  .map((img) => img.trim())
                  .filter((img) => img.startsWith('http') || img.startsWith('/'))
              : [];

            const featuredImage =
              imagesList[0] ||
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';

            // Size variants parsing (e.g. "S, M, L, XL" or "41; 42; 43; 44")
            const sizeList = rawSizes
              ? rawSizes
                  .split(/[,;/|]/)
                  .map((s) => s.trim())
                  .filter(Boolean)
              : ['Default Title'];

            const isAvailable =
              stockRaw.toLowerCase() === 'false' ||
              stockRaw.toLowerCase() === 'ні' ||
              stockRaw.toLowerCase() === 'out of stock' ||
              stockRaw === '0'
                ? false
                : true;

            const baseHandle = sku
              ? sku.toLowerCase().replace(/[^a-z0-9_-]/g, '-')
              : title
                  .toLowerCase()
                  .replace(/[^a-z0-9_-]/g, '-')
                  .substring(0, 40);

            const productKey = sku || baseHandle;

            const variants = sizeList.map((sizeName, idx) => ({
              id: `var-${productKey}-${idx}`,
              title: sizeName,
              price,
              compareAtPrice,
              sku: sku ? `${sku}-${sizeName.replace(/\s+/g, '')}` : sku,
            }));

            const product: Product = {
              id: productKey,
              handle: baseHandle,
              title,
              bodyHtml: description || `<p>${title} від ${vendor}. 100% оригінальна річ.</p>`,
              vendor,
              productType: category,
              tags: [category, vendor].filter(Boolean),
              price,
              compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : undefined,
              images: imagesList.length > 0 ? imagesList : [featuredImage],
              featuredImage,
              available: isAvailable,
              sku,
              barcode,
              variants,
            };

            productsMap.set(productKey, product);
          });

          resolve(Array.from(productsMap.values()));
        } catch (err) {
          reject(err);
        }
      },
      error: (err: unknown) => {
        reject(err);
      },
    });
  });
}

/**
 * Merges imported products into existing catalog according to strategy:
 * - 'replace': completely replaces existing items with imported ones
 * - 'upsert': updates matched items by SKU / handle / id and appends new ones
 */
export function mergeProducts(
  existing: Product[],
  imported: Product[],
  mode: 'replace' | 'upsert' = 'replace'
): Product[] {
  if (mode === 'replace') {
    return [...imported];
  }

  const existingMap = new Map<string, Product>();
  const skuMap = new Map<string, string>(); // sku -> id

  existing.forEach((p) => {
    existingMap.set(p.id, p);
    if (p.sku) {
      skuMap.set(p.sku.toLowerCase(), p.id);
    }
  });

  imported.forEach((incoming) => {
    const matchedIdBySku = incoming.sku ? skuMap.get(incoming.sku.toLowerCase()) : null;
    const targetId = matchedIdBySku || (existingMap.has(incoming.id) ? incoming.id : null);

    if (targetId && existingMap.has(targetId)) {
      const prev = existingMap.get(targetId)!;
      existingMap.set(targetId, {
        ...prev,
        ...incoming,
        id: prev.id, // keep stable id
        handle: prev.handle || incoming.handle,
        tags: Array.from(new Set([...(prev.tags || []), ...(incoming.tags || [])])),
        variants: incoming.variants.length > 0 ? incoming.variants : prev.variants,
      });
    } else {
      existingMap.set(incoming.id, incoming);
      if (incoming.sku) {
        skuMap.set(incoming.sku.toLowerCase(), incoming.id);
      }
    }
  });

  return Array.from(existingMap.values());
}

/**
 * Generates ready-to-fill CSV template for store managers
 */
export function generateSampleCsvTemplate(): string {
  const rows = [
    [
      'Назва',
      'Ціна',
      'Стара ціна',
      'Артикул',
      'Категорія',
      'Бренд',
      'Зображення',
      'Опис',
      'Розміри',
      'Наявність',
    ],
    [
      'Худі Stüssy Basic Logo Black',
      '3890',
      '4500',
      'STU-HD-BLK',
      'Худі',
      'Stüssy',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800',
      'Оригінальне худі оверсайз крою з фірмовим логотипом',
      'S, M, L, XL',
      'В наявності',
    ],
    [
      'Кросівки New Balance 1906R Silver Metallic',
      '6499',
      '',
      'NB-1906R-SLV',
      'Взуття',
      'New Balance',
      'https://images.unsplash.com/photo-1539185441755-769473a23570?w=800',
      'Ретро-ранер модель з амортизацією N-ergy та технологією Stability Web',
      '41, 42, 43, 44, 45',
      'В наявності',
    ],
    [
      'Сумка Ganni Bou Bag Lilac Leather',
      '14200',
      '16000',
      'GAN-BOU-LIL',
      'Сумки',
      'Ganni',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
      'Фірмова плетена шкіряна сумка-бестселер з фірмовою фурнітурою',
      'ONE SIZE',
      'В наявності',
    ],
  ];

  return rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
}
