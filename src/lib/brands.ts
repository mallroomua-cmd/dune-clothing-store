export interface BrandItem {
  id: string;
  name: string;
  sub: string;
  badge?: string;
}

export const KOREAN_BRANDS: BrandItem[] = [
  { id: 'cosrx', name: 'COSRX', sub: 'Korea • Snail & BHA', badge: 'ТОП' },
  { id: 'beauty-of-joseon', name: 'Beauty of Joseon', sub: 'Korea • Hanbang & Rice', badge: 'ХІТ' },
  { id: 'round-lab', name: 'Round Lab', sub: 'Korea • Dokdo & Birch', badge: 'SPF №1' },
  { id: 'skin1004', name: 'SKIN1004', sub: 'Korea • Madagascar Centella', badge: 'ХІТ' },
  { id: 'dr-althea', name: 'Dr. Althea', sub: 'Korea • 345 Relief', badge: 'НОВИНКА' },
  { id: 'anua', name: 'Anua', sub: 'Korea • Heartleaf 77%', badge: 'ТОП' },
  { id: 'torriden', name: 'Torriden', sub: 'Korea • Dive-In Hyaluronic' },
  { id: 'manyo', name: 'Manyo', sub: 'Korea • Pure Cleansing Oil' },
  { id: 'medi-peel', name: 'Medi-Peel', sub: 'Korea • Bor-Tox Peptides' },
  { id: 'haruharu', name: 'Haruharu Wonder', sub: 'Korea • Black Rice Toner' },
  { id: 'purito', name: 'Purito', sub: 'Korea • Centella & Oat' },
  { id: 'some-by-mi', name: 'Some By Mi', sub: 'Korea • AHA BHA PHA' },
  { id: 'im-from', name: "I'm From", sub: 'Korea • Rice & Mugwort' },
  { id: 'pyunkang-yul', name: 'Pyunkang Yul', sub: 'Korea • Essence Toner' },
];
