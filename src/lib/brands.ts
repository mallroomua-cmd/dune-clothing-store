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
  { id: 'la-mer', name: 'La Mer', sub: 'France • Crème de la Mer & Miracle Broth', badge: 'LUXURY' },
  { id: 'paulas-choice', name: "Paula's Choice", sub: 'USA • Skin Perfecting 2% BHA', badge: 'ТОП' },
  { id: 'biodance', name: 'Biodance', sub: 'Korea • Bio-Collagen Real Deep Mask', badge: 'ХІТ' },
  { id: 'anua', name: 'Anua', sub: 'Korea • Heartleaf 80% Soothing Ampoule', badge: 'ТРЕНД' },
  { id: 'medicube', name: 'Medicube', sub: 'Korea • Zero Pore Deep Cleansing Oil', badge: 'ТОП' },
  { id: 'skin1004', name: 'Skin1004', sub: 'Korea • Madagascar Centella Cleansing', badge: 'ХІТ' },
  { id: 'panoxyl', name: 'PanOxyl', sub: 'USA • Acne Foaming Wash 10% Benzoyl', badge: 'ТОП' },
  { id: 'centellian24', name: 'Centellian24', sub: 'Korea • The Madeca Cream Season 6', badge: 'ХІТ' },
  { id: 'tocobo', name: 'Tocobo', sub: 'Korea • Collagen Brightening Eye Gel', badge: 'ТРЕНД' },
  { id: 'silulan', name: 'Silulan', sub: 'Korea • Collagen Eye Patches 5 Pairs', badge: 'ХІТ' },
  { id: 'estee-lauder', name: 'Estée Lauder', sub: 'USA • Advanced Night Repair Matrix', badge: 'LUXURY' },
  { id: 'la-roche-posay', name: 'La Roche-Posay', sub: 'France • Pure Vitamin C10 & Retinol B3', badge: 'ДЕРМА' },
  { id: 'nyx-professional', name: 'NYX Professional', sub: 'USA • Ultimate Eyeshadow Palette 16', badge: 'ХІТ' },
  { id: 'tarte', name: 'Tarte', sub: 'USA • Shape Tape Contour Concealer', badge: 'ТОП' },
  { id: 'elegance', name: 'Elegance', sub: 'Japan • La Poudre Haute Nuance 01', badge: 'LUXURY' },
  { id: 'revitalash', name: 'RevitaLash', sub: 'USA • RevitaBrow Advanced Serum', badge: 'ПРЕМІУМ' },
  { id: 'k18', name: 'K18', sub: 'USA • Biomimetic Hairscience Molecular Mask', badge: 'ТОП' },
  { id: 'olaplex', name: 'Olaplex', sub: 'USA • No.7 Bonding Oil & Bond Multiplier', badge: 'ХІТ' },
];

// Alias for backwards compatibility across existing components and tests
export const KOREAN_BRANDS = STREETWEAR_BRANDS;
