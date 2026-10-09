import React from 'react';
import { Product } from '../types';

export const ProductJsonLd: React.FC<{ product: Product }> = ({ product }) => {
  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    name: product.title,
    image: product.images,
    description: product.bodyHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300),
    sku: product.sku || product.handle,
    brand: {
      '@type': 'Brand',
      name: product.vendor || 'ШопінгМаркет',
    },
    offers: {
      '@type': 'Offer',
      url: typeof window !== 'undefined' ? `${window.location.origin}#${product.handle}` : '',
      priceCurrency: 'UAH',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'ШопінгМаркет',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
