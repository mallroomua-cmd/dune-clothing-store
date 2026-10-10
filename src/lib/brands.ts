export interface BrandItem {
  id: string;
  name: string;
  sub: string;
  badge?: string;
}

export const STREETWEAR_BRANDS: BrandItem[] = [
  { id: 'ami-paris', name: 'AMI Paris', sub: 'France • Ami De Coeur & Knitwear', badge: 'ТОП' },
  { id: 'ganni', name: 'Ganni', sub: 'Copenhagen • Bou Bags & Graphic Prints', badge: 'ХІТ' },
  { id: 'jacquemus', name: 'Jacquemus', sub: 'Paris • Le Chiquito & Contemporary Luxury', badge: 'PREMIUM' },
  { id: 'jil-sander', name: 'Jil Sander', sub: 'Milan • Modernist Tailoring & Minimalist Tees', badge: 'LUXURY' },
  { id: 'golden-goose', name: 'Golden Goose', sub: 'Venice • Super-Star & Vintage Craft', badge: 'ICON' },
  { id: 'marc-jacobs', name: 'Marc Jacobs', sub: 'New York • The Tote Bag & Snapshot', badge: 'ХІТ' },
  { id: 'acne-studios', name: 'Acne Studios', sub: 'Stockholm • Scandinavian Denim & Scarves', badge: 'PREMIUM' },
  { id: 'new-balance', name: 'New Balance', sub: 'USA • 1906R, 2002R, 990v6 Made in USA', badge: 'ТОП' },
  { id: 'salomon', name: 'Salomon', sub: 'France • XT-6 Advanced & Gorpcore Tech', badge: 'ТРЕНД' },
  { id: 'stone-island', name: 'Stone Island', sub: 'Italy • Compass Patch & Technical Outerwear', badge: 'PREMIUM' },
  { id: 'carhartt-wip', name: 'Carhartt WIP', sub: 'Workwear • Double Knee & Heavy Canvas', badge: 'ХІТ' },
  { id: 'nike', name: 'Nike', sub: 'USA • ACG, Dunk & Sneaker Icon', badge: 'ТОП' },
  { id: 'jordan', name: 'Jordan', sub: 'USA • Retro 1 High & Court Classics', badge: 'ХІТ' },
  { id: 'stussy', name: 'Stüssy', sub: 'California • Streetwear OG & Heavyweight Fleece', badge: 'ХІТ' },
  { id: 'breda', name: 'Breda', sub: 'Dallas • Minimalist Watches & Jane Time Charm', badge: 'НОВИНКА' },
  { id: 'd1-milano', name: 'D1 Milano', sub: 'Italy • Ultra Thin & Polycarbon Watches', badge: 'LUXURY' },
  { id: 'birkenstock', name: 'Birkenstock', sub: 'Germany • Boston Clogs & Arizona Sandals', badge: 'CLASSIC' },
  { id: 'asics', name: 'ASICS', sub: 'Japan • Gel-Kayano 14 & Gel-NYC', badge: 'ТРЕНД' },
  { id: 'supreme', name: 'Supreme', sub: 'New York • Box Logo & Limited Drops', badge: 'ДРОП' },
  { id: 'adidas-originals', name: 'adidas Originals', sub: 'Germany • Samba, Gazelle, Handball Spezial', badge: 'ТОП' },
  { id: 'fenty-beauty', name: 'Fenty Beauty', sub: 'Rihanna • Gloss Bomb & Radiant Beauty', badge: 'ХІТ' },
  { id: 'rare-beauty', name: 'Rare Beauty', sub: 'Selena Gomez • Soft Pinch Lip Oil', badge: 'ТОП' },
  { id: 'summer-fridays', name: 'Summer Fridays', sub: 'USA • Lip Butter Balm & Dream Lip Oil', badge: 'ХІТ' },
  { id: 'rhode', name: 'Rhode', sub: 'Hailey Bieber • Peptide Lip Shape & Glaze', badge: 'ТРЕНД' },
  { id: 'dior', name: 'Dior', sub: 'Paris • Backstage Glow Face Palette', badge: 'LUXURY' },
  { id: 'hourglass', name: 'Hourglass', sub: 'USA • Unreal Liquid Blush & Ambient Glow', badge: 'PREMIUM' },
  { id: 'sol-de-janeiro', name: 'Sol de Janeiro', sub: 'Brazil • Rio Radiance & Cheirosa Mists', badge: 'ХІТ' },
  { id: 'charlotte-tilbury', name: 'Charlotte Tilbury', sub: 'London • Pillow Talk & Quilted Bags', badge: 'LUXURY' },
];

// Alias for backwards compatibility across existing components and tests
export const KOREAN_BRANDS = STREETWEAR_BRANDS;
