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

export function parseShopifyCsv(csvString: string): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvString, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        try {
          const productsMap = new Map<string, Product>();

          results.data.forEach((row) => {
            if (!isRowActive(row)) return;

            const handle = (row['Handle'] || row['handle'] || '').trim();
            const title = (row['Title'] || row['title'] || '').trim();

            if (!handle && !title) return;

            const productKey = handle || title;

            // Extract image
            const imageSrc = (row['Image Src'] || row['image_src'] || row['Image URL'] || '').trim();

            // Robust price parsing (handles Ukrainian commas)
            const price = parsePrice(row['Variant Price'] || row['Price']);
            const compareAtPrice = parsePrice(row['Variant Compare At Price'] || row['Compare At Price']) || undefined;

            // Inventory quantity
            const rawQty = row['Variant Inventory Qty'];
            const inventoryQty = rawQty !== undefined && rawQty !== '' ? parseInt(rawQty, 10) : undefined;
            const inventoryPolicy = (row['Variant Inventory Policy'] || '').toLowerCase();
            const isAvailable = inventoryQty === undefined ? true : inventoryQty > 0 || inventoryPolicy === 'continue';

            const sku = (row['Variant SKU'] || row['SKU'] || '').trim();
            const barcode = (row['Variant Barcode'] || '').trim();
            const variantTitle = (row['Option1 Value'] || row['Variant Title'] || 'Default Title').trim();

            if (!productsMap.has(productKey)) {
              const tagsRaw = (row['Tags'] || row['tags'] || '').trim();
              const tags = tagsRaw
                ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
                : [];

              const bodyHtml = row['Body (HTML)'] || row['Body'] || row['Description'] || '';
              const vendor = (row['Vendor'] || row['vendor'] || '').trim();
              const productType = (row['Type'] || row['Product Category'] || 'Загальне').trim();

              const newProduct: Product = {
                id: productKey, // Stable ID based on handle/key
                handle: productKey,
                title: title || handle,
                bodyHtml,
                vendor,
                productType,
                tags,
                price: price || 0,
                compareAtPrice: compareAtPrice && compareAtPrice > price ? compareAtPrice : undefined,
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
                price: price || 0,
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

          const finalProducts = Array.from(productsMap.values()).map((p) => {
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
      error: (err: any) => {
        reject(err);
      },
    });
  });
}
