import { Product } from '../types';

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-demo-1',
    handle: 'smart-watch-ultra-titanium',
    title: 'Смарт-годинник Ultra 2 Titanium Series (49mm)',
    bodyHtml: '<p>Преміальний ударостійкий корпус із титану, яскравий Always-On Retina дисплей до 3000 ніт, GPS високої точності та до 72 годин автономної роботи в режимі енергозбереження. Ідеальний вибір для спорту, активного відпочинку та повсякденного стилю.</p><ul><li>Вологозахист WR100</li><li>Моніторинг серцевого ритму та кисню</li><li>Швидка бездротова зарядка</li></ul>',
    vendor: 'TechPro',
    productType: 'Електроніка',
    tags: ['Хіт продажу', 'Знижка', 'Годинники', 'Новинки'],
    price: 1899,
    compareAtPrice: 2499,
    images: [
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
    available: true,
    sku: 'WATCH-ULTRA-TI',
    variants: [
      { id: 'v1', title: 'Midnight Black', price: 1899, compareAtPrice: 2499 },
      { id: 'v2', title: 'Starlight Silver', price: 1899, compareAtPrice: 2499 },
      { id: 'v3', title: 'Orange Trail', price: 1899, compareAtPrice: 2499 },
    ],
  },
  {
    id: 'prod-demo-2',
    handle: 'wireless-noise-cancelling-headphones-pro',
    title: 'Бездротові навушники Studio Pro Max Active ANC',
    bodyHtml: '<p>Глибоке студійне звучання з динамічним басом і активним шумозаглушенням нового покоління. М’які амбушури з ефектом пам’яті для максимального комфорту протягом усього дня.</p>',
    vendor: 'AcousticLab',
    productType: 'Аудіо',
    tags: ['ТОП вибір', 'Навушники', 'Знижка'],
    price: 1450,
    compareAtPrice: 1990,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    available: true,
    sku: 'HP-ANC-PRO',
    variants: [
      { id: 'v4', title: 'Space Gray', price: 1450, compareAtPrice: 1990 },
      { id: 'v5', title: 'Silver White', price: 1450, compareAtPrice: 1990 },
    ],
  },
  {
    id: 'prod-demo-3',
    handle: 'smart-speaker-hi-fi-bass',
    title: 'Портативна акустична колонка BoomBeat 360° Waterproof',
    bodyHtml: '<p>Потужний звук 40 Вт із пасивними випромінювачами низьких частот. Захист від води та пилу за стандартом IP67 — беріть її на пляж, пікнік або в подорож без жодних хвилювань.</p>',
    vendor: 'SoundCore',
    productType: 'Аудіо',
    tags: ['Вологозахист', 'Акція', 'Акустика'],
    price: 990,
    compareAtPrice: 1390,
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80',
    available: true,
    sku: 'SPK-BOOM-360',
    variants: [{ id: 'v6', title: 'Black Edition', price: 990, compareAtPrice: 1390 }],
  },
  {
    id: 'prod-demo-4',
    handle: 'ergonomic-mechanical-keyboard-rgb',
    title: 'Механічна клавіатура CyberKey RGB Hot-Swap',
    bodyHtml: '<p>Бездротове підключення 2.4G + Bluetooth 5.0, якісні змащені лінійні перемикачі Red Switch, RGB-підсвічування та стильний компактний форм-фактор 75%.</p>',
    vendor: 'KeyForge',
    productType: 'Геймінг',
    tags: ['Геймінг', 'Хіт', 'Клавіатури'],
    price: 2199,
    compareAtPrice: 2850,
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    available: true,
    sku: 'KB-CYBER-75',
    variants: [{ id: 'v7', title: 'Gateron Red', price: 2199, compareAtPrice: 2850 }],
  },
  {
    id: 'prod-demo-5',
    handle: 'wireless-charging-station-3in1',
    title: 'Швидка бездротова зарядна станція 3-в-1 MagSafe',
    bodyHtml: '<p>Одночасна зарядка смартфона, годинника та бездротових навушників на одному компактному столику. Алюмінієва основа із захистом від перегріву.</p>',
    vendor: 'PowerBase',
    productType: 'Аксесуари',
    tags: ['Аксесуари', 'Новинки', 'Знижка'],
    price: 850,
    compareAtPrice: 1190,
    images: [
      'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=800&auto=format&fit=crop&q=80',
    available: true,
    sku: 'CHG-3IN1-MAG',
    variants: [{ id: 'v8', title: 'Space Gray', price: 850, compareAtPrice: 1190 }],
  },
  {
    id: 'prod-demo-6',
    handle: 'action-camera-4k-ultra-hd',
    title: 'Екшн-камера ProShot 4K Ultra HD 60fps',
    bodyHtml: '<p>Оптична стабілізація зображення EIS, водонепроникний кейс до 30 метрів під водою, ширококутний об’єктив 170° та керування через додаток на смартфоні.</p>',
    vendor: 'ProShot',
    productType: 'Камери',
    tags: ['Камери', 'Спорт', 'Знижка'],
    price: 2490,
    compareAtPrice: 3200,
    images: [
      'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&auto=format&fit=crop&q=80',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&auto=format&fit=crop&q=80',
    available: true,
    sku: 'CAM-4K-PRO',
    variants: [{ id: 'v9', title: 'Full Set Kit', price: 2490, compareAtPrice: 3200 }],
  },
];

export const SAMPLE_SHOPIFY_CSV = `Handle,Title,Body (HTML),Vendor,Type,Tags,Published,Option1 Name,Option1 Value,Variant SKU,Variant Price,Variant Compare At Price,Image Src
smart-watch-titanium,"Смарт-годинник Ultra 2 Titanium","Преміальний титановий корпус та яскравий екран.","TechPro","Електроніка","Хіт продажу, Годинники, Знижка",TRUE,"Title","Default Title","WATCH-TI-01",1899,2499,https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800
wireless-headphones-pro,"Бездротові навушники Studio Pro Max","Студійний звук та активне шумозаглушення ANC.","AcousticLab","Аудіо","Навушники, ТОП вибір",TRUE,"Title","Default Title","HP-ANC-01",1450,1990,https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800
smart-speaker-boom,"Портативна колонка BoomBeat 360","Вологозахист IP67 та потужний бас 40W.","SoundCore","Аудіо","Акустика, Акція",TRUE,"Title","Default Title","SPK-360-01",990,1390,https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800
cyberkey-keyboard,"Механічна клавіатура CyberKey RGB","Бездротове підключення 2.4G та червоні свічі.","KeyForge","Геймінг","Геймінг, Новинки",TRUE,"Title","Default Title","KB-CYB-01",2199,2850,https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800
`;
