export interface BrandItem {
  id: string;
  name: string;
  sub: string;
  badge?: string;
}

export const STREETWEAR_BRANDS: BrandItem[] = [
  { id: 'nike', name: 'Nike', sub: 'USA • Sneaker & Apparel Icon', badge: 'ТОП' },
  { id: 'jordan', name: 'Jordan', sub: 'USA • Retro & Court Classics', badge: 'ХІТ' },
  { id: 'new-balance', name: 'New Balance', sub: 'USA • 1906R, 2002R, 9060', badge: 'ТОП' },
  { id: 'stussy', name: 'Stüssy', sub: 'California • Streetwear OG', badge: 'ХІТ' },
  { id: 'carhartt-wip', name: 'Carhartt WIP', sub: 'Workwear • Double Knee & Canvas', badge: 'ХІТ' },
  { id: 'salomon', name: 'Salomon', sub: 'France • XT-6 & Gorpcore', badge: 'ТРЕНД' },
  { id: 'supreme', name: 'Supreme', sub: 'New York • Box Logo & Drops', badge: 'ДРОП' },
  { id: 'stone-island', name: 'Stone Island', sub: 'Italy • Compass Patch & Outerwear', badge: 'PREMIUM' },
  { id: 'adidas-originals', name: 'adidas Originals', sub: 'Germany • Samba, Gazelle, Campus', badge: 'ТОП' },
  { id: 'arcteryx', name: "Arc'teryx", sub: 'Canada • Technical Gorpcore', badge: 'GORPCORE' },
  { id: 'asics', name: 'ASICS', sub: 'Japan • Gel-Kayano & Gel-NYC', badge: 'ТРЕНД' },
  { id: 'new-era', name: 'New Era', sub: 'USA • 59FIFTY & 9FORTY Caps', badge: 'CLASSIC' },
  { id: 'crep-protect', name: 'Crep Protect', sub: 'UK • Ultimate Sneaker Care' },
];

// Alias for backwards compatibility across existing components and tests
export const KOREAN_BRANDS = STREETWEAR_BRANDS;
