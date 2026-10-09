import Papa from 'papaparse';
import { Product } from '../types';

export function parseShopifyCsv(csvString: string): Promise<Product[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvString, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        try {
          const productsMap = new Map<string, Product>();

          results.data.forEach((row, index) => {
            const handle = (row['Handle'] || row['handle'] || '').trim();
            const title = (row['Title'] || row['title'] || '').trim();

            if (!handle && !title) return;

            const productKey = handle || title;

            // Extract image
            const imageSrc = (row['Image Src'] || row['image_src'] || row['Image URL'] || '').trim();
            
            // Extract prices
            const rawPrice = (row['Variant Price'] || row['Price'] || '0').replace(/[^0-9.]/g, '');
            const price = parseFloat(rawPrice) || 0;
            const rawComparePrice = (row['Variant Compare At Price'] || row['Compare At Price'] || '').replace(/[^0-9.]/g, '');
            const compareAtPrice = rawComparePrice ? parseFloat(rawComparePrice) : undefined;

            if (!productsMap.has(productKey)) {
              // Create new product
              const tagsRaw = (row['Tags'] || row['tags'] || '').trim();
              const tags = tagsRaw
                ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
                : [];

              const bodyHtml = row['Body (HTML)'] || row['Body'] || row['Description'] || '';
              const vendor = row['Vendor'] || row['vendor'] || '';
              const productType = row['Type'] || row['Product Category'] || 'Загальне';
              const sku = row['Variant SKU'] || row['SKU'] || '';
              const barcode = row['Variant Barcode'] || '';

              const newProduct: Product = {
                id: `prod-${index}-${productKey}`,
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
                available: true,
                sku,
                barcode,
                variants: [],
              };

              // Variant
              const variantTitle = row['Option1 Value'] || row['Variant Title'] || 'За замовчуванням';
              newProduct.variants.push({
                id: `var-${index}`,
                title: variantTitle,
                price: price || 0,
                compareAtPrice,
                sku,
              });

              productsMap.set(productKey, newProduct);
            } else {
              // Existing product -> append image or variant
              const existing = productsMap.get(productKey)!;

              if (imageSrc && !existing.images.includes(imageSrc)) {
                existing.images.push(imageSrc);
                if (!existing.featuredImage || existing.featuredImage.includes('unsplash.com/photo-1523275335684')) {
                  existing.featuredImage = imageSrc;
                }
              }

              // Update price if previous was 0 and this has price
              if (existing.price === 0 && price > 0) {
                existing.price = price;
                existing.compareAtPrice = compareAtPrice;
              }

              const variantTitle = row['Option1 Value'] || row['Variant Title'];
              if (variantTitle && variantTitle !== 'Default Title') {
                existing.variants.push({
                  id: `var-${index}`,
                  title: variantTitle,
                  price: price || existing.price,
                  compareAtPrice: compareAtPrice || existing.compareAtPrice,
                  sku: row['Variant SKU'] || existing.sku,
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
