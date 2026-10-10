import Papa from 'papaparse';
import { Product } from '../types';

/**
 * Robust price parser that handles both dot and comma decimals (e.g. Ukrainian Excel "1299,50" -> 1299.5)
 */
export function parsePrice(raw?: string): number {
  if (!raw) return 0;
  const s = raw.replace(/[\s\u00A0]/g, '').replace(/[^\d.,]/g, '');
  if (!s) return 0;
  const decComma = s.lastIndexOf(',') > s.lastIndexOf('.');
  const n = decComma ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  return parseFloat(n) || 0;
}

/**
 * Detects if a product row is active and published
 */
function isRowActive(row: Record<string, string>): boolean {
  const status = (row['Status'] || row['status'] || 'active').toLowerCase();
  const published = (row['Published'] || row['published'] || 'true').toLowerCase();
  return status !== 'draft' && published !== 'false';
}

/**
 * Reads a File object with automatic charset fallback (UTF-8 with fallback to Windows-1251 for Ukrainian Excel exports)
 */
export async function readCsvFileWithEncoding(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buffer);
  } catch {
    // Fallback to Windows-1251 for legacy Excel CSVs
    return new TextDecoder('windows-1251').decode(buffer);
  }
}

export function inferVendorAndCategory(
  title: string,
  rawVendor?: string,
  rawType?: string,
  rawCategory?: string
): { vendor: string; productType: string; tags: string[] } {
  let vendor = (rawVendor || '').trim();
  const titleLower = title.toLowerCase();

  // If vendor missing or generic, infer from brand names in title
  if (!vendor || vendor === 'Загальне' || vendor === 'Default' || vendor === 'Косметика') {
    const knownVendors = [
      'Sol de Janeiro', 'Fenty Beauty', 'Rare Beauty', 'Summer Fridays',
      'Rhode Cosmetics', 'Rhode', 'Dior', 'Hourglass', 'Charlotte Tilbury',
      'La Mer', "Paula's Choice", 'Biodance', 'Anua', 'Medicube', 'Skin1004',
      'PanOxyl', 'Centellian24', 'Tocobo', 'Silulan', 'Estée Lauder',
      'La Roche-Posay', 'NYX Professional', 'NYX', 'Tarte', 'Elegance',
      'RevitaLash', 'RevitaBrow', 'Dr.Ceuracle', 'COSRX', 'Beauty of Joseon',
      'Round Lab', 'Manyo', 'Dr. Althea', 'Olaplex', 'K18',
      'AMI Paris', 'Ganni', 'Jacquemus', 'Jil Sander', 'New Balance',
      'Salomon', 'Jordan', 'Nike', 'Stüssy', 'Supreme', 'Carhartt WIP',
      'Stone Island', 'Breda', 'D1 Milano', 'MOLAND'
    ];
    const match = knownVendors.find((v) => titleLower.includes(v.toLowerCase()));
    if (match) {
      vendor = match === 'Rhode Cosmetics' ? 'Rhode' : match === 'NYX' ? 'NYX Professional' : match === 'RevitaBrow' ? 'RevitaLash' : match;
    } else {
      vendor = 'MOLAND';
    }
  }

  let productType = (rawType || rawCategory || 'Загальне').trim();
  const text = `${title} ${productType} ${rawCategory || ''}`.toLowerCase();
  const extraTags: string[] = [];

  if (
    text.includes('губ') ||
    text.includes('блиск') ||
    text.includes('тінт') ||
    text.includes('бальзам для губ') ||
    text.includes('олійка для губ') ||
    text.includes('помад') ||
    text.includes('контурний олівець')
  ) {
    productType = 'Декоративна косметика';
    extraTags.push('Губи', 'Декоративна косметика');
  } else if (
    text.includes('тіні') ||
    text.includes('туш') ||
    text.includes('брів') ||
    text.includes('повік') ||
    text.includes('eyeshadow') ||
    text.includes('revitabrow')
  ) {
    productType = 'Декоративна косметика';
    extraTags.push('Очі', 'Декоративна косметика');
  } else if (
    text.includes('хайлайтер') ||
    text.includes('румʼян') ||
    text.includes('рум\'ян') ||
    text.includes('палітра') ||
    text.includes('пудр') ||
    text.includes('консилер') ||
    text.includes('bb-крем') ||
    text.includes('bb krem') ||
    text.includes('dr.ceuracle') ||
    text.includes('макіяж') ||
    text.includes('пензл')
  ) {
    productType = 'Декоративна косметика';
    extraTags.push('Обличчя', 'Декоративна косметика');
  } else if (
    text.includes('парфум') ||
    text.includes('міст') ||
    text.includes('perfume mist') ||
    text.includes('аромат') ||
    text.includes('cheirosa') ||
    text.includes('свічк')
  ) {
    productType = 'Парфуми та аромати';
    extraTags.push('Парфуми', 'Спреї');
  } else if (
    text.includes('косметичк') ||
    text.includes('сумк') ||
    text.includes('handbag') ||
    text.includes('рюкзак') ||
    text.includes('chiquito') ||
    text.includes('годинник') ||
    text.includes('breda')
  ) {
    productType = 'Аксесуари та сумки';
    extraTags.push('Сумки', 'Аксесуари');
  } else if (
    text.includes('волос') ||
    text.includes('шампун') ||
    text.includes('olaplex') ||
    text.includes('k18') ||
    text.includes('маска для волосся') ||
    text.includes('олійка для волосся')
  ) {
    productType = 'Догляд за волоссям';
    extraTags.push('Догляд за волоссям');
  } else if (
    text.includes('для тіла') ||
    text.includes('bum bum') ||
    text.includes('крем для тіла')
  ) {
    productType = 'Догляд за тілом';
    extraTags.push('Догляд за тілом');
  } else if (
    text.includes('сироватк') ||
    text.includes('ампул') ||
    text.includes('крем для обличчя') ||
    text.includes('вмиванн') ||
    text.includes('очищенн') ||
    text.includes('тонік') ||
    text.includes('тонер') ||
    text.includes('маск') ||
    text.includes('педи') ||
    text.includes('патчі') ||
    text.includes('spf') ||
    text.includes('сонцезахис') ||
    text.includes('la mer') ||
    text.includes('biodance') ||
    text.includes('centella') ||
    text.includes('anua') ||
    text.includes('medicube') ||
    text.includes('panoxyl') ||
    text.includes('tocobo') ||
    text.includes('la roche-posay') ||
    text.includes('estee lauder')
  ) {
    productType = 'Догляд за обличчям';
    extraTags.push('Догляд за обличчям');
  } else if (
    text.includes('кросів') ||
    text.includes('снікер') ||
    text.includes('взуття')
  ) {
    productType = 'Взуття / Кросівки';
    extraTags.push('Взуття', 'Кросівки');
  } else if (
    text.includes('худі') ||
    text.includes('світшот') ||
    text.includes('футболк') ||
    text.includes('штани') ||
    text.includes('куртк') ||
    text.includes('одяг')
  ) {
    productType = 'Одяг';
    extraTags.push('Одяг');
  }

  return { vendor, productType, tags: extraTags };
}

export function parseShopifyCsv(
  csvString: string,
  options?: { includeDrafts?: boolean }
): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvString, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: (header) => header.replace(/^\uFEFF/, '').trim(),
      complete: (results) => {
        try {
          const productsMap = new Map<string, Product>();

          // Check if there are active rows with product titles in the CSV. If none exist (or includeDrafts is true), allow draft rows
          const hasActiveRows = results.data.some((r) => Boolean((r['Title'] || '').trim()) && isRowActive(r));
          const shouldFilterDrafts = !options?.includeDrafts && hasActiveRows;

          results.data.forEach((row) => {
            if (shouldFilterDrafts && !isRowActive(row)) return;

            const handle = (row['Handle'] || row['handle'] || '').trim();
            const title = (row['Title'] || row['title'] || '').trim();

            if (!handle && !title) return;

            // Robust price parsing (handles Ukrainian commas)
            const price = parsePrice(row['Variant Price'] || row['Price']);
            const compareAtPrice = parsePrice(row['Variant Compare At Price'] || row['Compare At Price']) || undefined;

            // Extract image
            const imageSrc = (row['Image Src'] || row['image_src'] || row['Image URL'] || '').trim();

            // Fallback price for products with images when price is omitted in export
            const effectivePrice = price > 0 ? price : (imageSrc ? 799 : 0);

            const productKey = handle || title;

            // Skip taxonomy/category placeholder rows that have 0 price and no image when real products exist
            // (but do NOT skip secondary image/variant rows for products already registered in productsMap)
            if (!productsMap.has(productKey) && effectivePrice <= 0 && (!row['Variant SKU'] || row['Variant SKU'] === 'no-content')) {
              return;
            }

            // Inventory quantity (if tracker is empty, inventory is untracked and therefore available)
            const rawQty = row['Variant Inventory Qty'];
            const inventoryTracker = (row['Variant Inventory Tracker'] || '').trim();
            const inventoryQty = rawQty !== undefined && rawQty !== '' ? parseInt(rawQty, 10) : undefined;
            const inventoryPolicy = (row['Variant Inventory Policy'] || '').toLowerCase();
            const isAvailable = !inventoryTracker
              ? true
              : inventoryQty === undefined
              ? true
              : inventoryQty > 0 || inventoryPolicy === 'continue';

            const sku = (row['Variant SKU'] || row['SKU'] || '').trim();
            const barcode = (row['Variant Barcode'] || '').trim();

            // Multi-option support: Option1 Value, Option2 Value, Option3 Value
            const opt1 = (row['Option1 Value'] || '').trim();
            const opt2 = (row['Option2 Value'] || '').trim();
            const opt3 = (row['Option3 Value'] || '').trim();
            const combinedOptions = [opt1, opt2, opt3].filter(Boolean).join(' / ');
            const variantTitle = combinedOptions || (row['Variant Title'] || 'Default Title').trim();

            if (!productsMap.has(productKey)) {
              const tagsRaw = (row['Tags'] || row['tags'] || '').trim();
              const existingTags = tagsRaw
                ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
                : [];

              const rawVendor = (row['Vendor'] || row['vendor'] || '').trim();
              const rawType = (row['Type'] || row['Product Category'] || '').trim();
              const inferred = inferVendorAndCategory(title || handle, rawVendor, rawType, row['Product Category']);

              const tags = Array.from(new Set([...existingTags, ...inferred.tags]));
              const vendor = inferred.vendor;
              const productType = inferred.productType;

              const bodyHtml = row['Body (HTML)'] || row['Body'] || row['Description'] || '';

              const newProduct: Product = {
                id: productKey, // Stable ID based on handle/key
                handle: productKey,
                title: title || handle,
                bodyHtml,
                vendor,
                productType,
                tags,
                price: effectivePrice || 0,
                compareAtPrice: compareAtPrice && compareAtPrice > effectivePrice ? compareAtPrice : undefined,
                images: imageSrc ? [imageSrc] : [],
                featuredImage: imageSrc || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
                available: isAvailable,
                sku,
                barcode,
                variants: [],
              };

              newProduct.variants.push({
                id: `var-${productKey}-0`,
                title: variantTitle,
                price: effectivePrice || 0,
                compareAtPrice,
                sku,
              });

              productsMap.set(productKey, newProduct);
            } else {
              const existing = productsMap.get(productKey)!;

              if (imageSrc && !existing.images.includes(imageSrc)) {
                existing.images.push(imageSrc);
                if (!existing.featuredImage || existing.featuredImage.includes('unsplash.com/photo-1523275335684')) {
                  existing.featuredImage = imageSrc;
                }
              }

              if (existing.price === 0 && price > 0) {
                existing.price = price;
                existing.compareAtPrice = compareAtPrice;
              }

              if (variantTitle && !existing.variants.some((v) => v.title === variantTitle)) {
                existing.variants.push({
                  id: `var-${productKey}-${existing.variants.length}`,
                  title: variantTitle,
                  price: price || existing.price,
                  compareAtPrice: compareAtPrice || existing.compareAtPrice,
                  sku: sku || existing.sku,
                });
              }
            }
          });

          const finalProducts = Array.from(productsMap.values())
            .filter((p) => p.price > 0 && p.title.trim().length > 0)
            .map((p) => {
              if (p.images.length === 0) {
                p.images = [p.featuredImage];
              }
              return p;
            });

          resolve(finalProducts);
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
 * Analyzes CSV content before applying, returning preview metrics:
 * total rows, valid products, invalid prices count, missing images count, categories list
 */
export async function validateCsvPreview(
  csvString: string,
  filename?: string,
  fileSizeBytes?: number
): Promise<import('../types').CsvPreviewResult> {
  const products = await parseShopifyCsv(csvString);

  const categoriesSet = new Set<string>();
  let invalidPriceCount = 0;
  let missingImageCount = 0;

  products.forEach((p) => {
    if (p.productType) categoriesSet.add(p.productType);
    if (!p.price || p.price <= 0) invalidPriceCount++;
    if (!p.featuredImage || p.featuredImage.includes('unsplash.com/photo-1523275335684')) {
      missingImageCount++;
    }
  });

  const lines = csvString.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const totalRows = Math.max(0, lines.length - 1);

  return {
    totalRows,
    validProducts: products,
    invalidPriceCount,
    missingImageCount,
    categories: Array.from(categoriesSet),
    filename,
    fileSizeBytes,
  };
}

/**
 * Converts products catalog back into a standard, Shopify-compatible CSV format
 * Includes UTF-8 BOM (\uFEFF) for immediate compatibility with Ukrainian/European Microsoft Excel
 */
export function exportProductsToShopifyCsv(products: Product[]): string {
  const rows: Record<string, string | number>[] = [];

  products.forEach((product) => {
    const tagsString = (product.tags || []).join(', ');
    const variants =
      product.variants && product.variants.length > 0
        ? product.variants
        : [
            {
              id: `v-${product.id}`,
              title: 'Default Title',
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              sku: product.sku,
            },
          ];

    variants.forEach((variant, vIdx) => {
      const isFirst = vIdx === 0;
      const imageSrc = product.images[vIdx] || (isFirst ? product.featuredImage : '');

      rows.push({
        Handle: product.handle || product.id,
        Title: product.title,
        'Body (HTML)': isFirst ? product.bodyHtml || '' : '',
        Vendor: product.vendor || '',
        'Product Category': product.productType || 'Загальне',
        Type: product.productType || 'Загальне',
        Tags: isFirst ? tagsString : '',
        Published: 'TRUE',
        'Option1 Name': 'Title',
        'Option1 Value': variant.title || 'Default Title',
        'Option2 Name': '',
        'Option2 Value': '',
        'Option3 Name': '',
        'Option3 Value': '',
        'Variant SKU': variant.sku || (isFirst ? product.sku || '' : ''),
        'Variant Inventory Qty': product.available ? 99 : 0,
        'Variant Inventory Policy': 'continue',
        'Variant Price': variant.price ?? product.price,
        'Variant Compare At Price':
          variant.compareAtPrice || (isFirst && product.compareAtPrice ? product.compareAtPrice : ''),
        'Image Src': imageSrc || (isFirst ? product.featuredImage || '' : ''),
        'Image Position': imageSrc ? vIdx + 1 : '',
        Status: product.available ? 'active' : 'draft',
      });
    });

    if (product.images.length > variants.length) {
      for (let i = variants.length; i < product.images.length; i++) {
        rows.push({
          Handle: product.handle || product.id,
          Title: product.title,
          'Body (HTML)': '',
          Vendor: product.vendor || '',
          'Product Category': product.productType || '',
          Type: product.productType || '',
          Tags: '',
          Published: 'TRUE',
          'Option1 Name': '',
          'Option1 Value': '',
          'Option2 Name': '',
          'Option2 Value': '',
          'Option3 Name': '',
          'Option3 Value': '',
          'Variant SKU': '',
          'Variant Inventory Qty': '',
          'Variant Inventory Policy': '',
          'Variant Price': '',
          'Variant Compare At Price': '',
          'Image Src': product.images[i],
          'Image Position': i + 1,
          Status: 'active',
        });
      }
    }
  });

  const unparsed = Papa.unparse(rows, {
    quotes: true,
    quoteChar: '"',
    escapeChar: '"',
    header: true,
  });

  return '\uFEFF' + unparsed;
}

export function downloadShopifyCsv(products: Product[], filename = 'shopify_catalog_export.csv') {
  const csvContent = exportProductsToShopifyCsv(products);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

