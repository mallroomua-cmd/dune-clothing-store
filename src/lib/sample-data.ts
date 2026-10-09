import { Product } from '../types';

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'prod-cosrx-snail-essence',
    handle: 'cosrx-advanced-snail-96-mucin-power-essence-100ml',
    title: 'COSRX Advanced Snail 96 Mucin Power Essence (100ml)',
    bodyHtml: '<p>Культова регенерувальна есенція з 96% фільтратом равликового муцину для глибокого зволоження, загоєння подразнень та відновлення захисного бар’єру шкіри. Легка невагома текстура миттєво вбирається, освітлює сліди постакне та надає природного здорового сяйва (Glass Skin).</p><ul><li><strong>Активні компоненти:</strong> 96% фільтрат муцину равлика, гіалуронова кислота, алантоїн, пантенол.</li><li><strong>Призначення:</strong> зневодненість, тьмяний тон, запалення, постакне.</li><li><strong>Країна-виробник:</strong> Південна Корея.</li></ul>',
    vendor: 'COSRX',
    productType: 'Тонери & Есенції',
    tags: ['Хіт', 'Муцин равлика', 'Зволоження', 'Регенерація', 'Топ вибір'],
    price: 780,
    compareAtPrice: 950,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608248597359-009943633e50?w=800&auto=format&fit=crop&q=80',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
    available: true,
    sku: 'COSRX-SNAIL-ESS-100',
    variants: [
      { id: 'v-snail-100', title: '100 ml (Повнорозмірний)', price: 780, compareAtPrice: 950 },
    ],
  },
  {
    id: 'prod-cosrx-low-ph-cleanser',
    handle: 'cosrx-low-ph-good-morning-gel-cleanser-150ml',
    title: 'COSRX Low pH Good Morning Gel Cleanser (150ml)',
    bodyHtml: '<p>М’який слабокислотний гель для ранкового та вечірнього вмивання з рівнем pH 5.0–6.0, що ідеально відповідає фізіологічному рівню кислотності здорової шкіри. Ефективно очищає пори, розчиняє надлишки себуму та ороговілі клітини без відчуття стягнутості.</p><ul><li><strong>Активні компоненти:</strong> олія листя чайного дерева, BHA (Betaine Salicylate 0.5%), екстракт хвої криптомерії.</li><li><strong>Дія:</strong> антибактеріальна, протизапальна, заспокійлива.</li><li><strong>Об’єм:</strong> 150 мл.</li></ul>',
    vendor: 'COSRX',
    productType: 'Очищення',
    tags: ['Очищення', 'Чутлива шкіра', 'Хіт', 'BHA кислоти', 'Чайне дерево'],
    price: 450,
    compareAtPrice: 580,
    images: [
      'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
    available: true,
    sku: 'COSRX-LOWPH-GEL-150',
    variants: [
      { id: 'v-cleanser-150', title: '150 ml (Оригінал)', price: 450, compareAtPrice: 580 },
    ],
  },
  {
    id: 'prod-boj-relief-sun-rice',
    handle: 'beauty-of-joseon-relief-sun-rice-probiotics-spf50',
    title: 'Beauty of Joseon Relief Sun: Rice + Probiotics SPF50+ PA++++ (50ml)',
    bodyHtml: '<p>Світовий бестселер сонцезахисного догляду. Легкий крем з 30% екстрактом рису та ферментованими зерновими пробіотиками на сучасних фотостабільних хімічних фільтрах. Надійно захищає від UVA та UVB променів, не вибілює шкіру, не забиває пори та служить бездоганною базою під макіяж.</p><ul><li><strong>Фільтри:</strong> Uvinul A Plus, Uvinul T 150, Tinosorb M, Iscotrizinol.</li><li><strong>Фініш:</strong> зволожена, осяйна шкіра без відчуття липкості.</li><li><strong>Об’єм:</strong> 50 мл.</li></ul>',
    vendor: 'Beauty of Joseon',
    productType: 'Сонцезахист (SPF)',
    tags: ['SPF 50+', 'Хіт року', 'Пробіотики', 'Сяйво', 'Зволоження'],
    price: 620,
    compareAtPrice: 790,
    images: [
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
    available: true,
    sku: 'BOJ-RELIEF-SUN-50',
    variants: [
      { id: 'v-boj-sun-50', title: '50 ml (Standard)', price: 620, compareAtPrice: 790 },
      { id: 'v-boj-sun-set', title: 'Set 2x50 ml (Вигідний набір)', price: 1150, compareAtPrice: 1580 },
    ],
  },
  {
    id: 'prod-cosrx-bha-blackhead-liquid',
    handle: 'cosrx-bha-blackhead-power-liquid-100ml',
    title: 'COSRX BHA Blackhead Power Liquid (100ml)',
    bodyHtml: '<p>Концентрована есенція з 4% натуральної BHA-кислоти (Betaine Salicylate) та гідролатом білої верби (68%). Глибоко розчиняє надлишки себуму у сальних протоках, очищає чорні цятки, звужує пори та вирівнює рельєф шкіри.</p><ul><li><strong>Активні компоненти:</strong> Betaine Salicylate 4%, ніацинамід 2%, гідролат кори білої верби.</li><li><strong>Тип шкіри:</strong> проблемна, комбінована, жирна, з розширеними порами.</li><li><strong>Об’єм:</strong> 100 мл.</li></ul>',
    vendor: 'COSRX',
    productType: 'Тонери & Есенції',
    tags: ['Кислоти', 'Від чорних цяток', 'Звуження пор', 'BHA', 'Себорегуляція'],
    price: 820,
    compareAtPrice: 990,
    images: [
      'https://images.unsplash.com/photo-1608248597359-009943633e50?w=800&auto=format&fit=crop&q=80',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1608248597359-009943633e50?w=800&auto=format&fit=crop&q=80',
    available: true,
    sku: 'COSRX-BHA-LIQ-100',
    variants: [
      { id: 'v-bha-100', title: '100 ml', price: 820, compareAtPrice: 990 },
    ],
  },
  {
    id: 'prod-roundlab-birch-cream',
    handle: 'round-lab-birch-juice-moisturizing-cream-80ml',
    title: 'Round Lab Birch Juice Moisturizing Cream (80ml)',
    bodyHtml: '<p>Інтенсивно зволожувальний крем з березовим соком з екологічного регіону Індже та гіалуроновою кислотою. Капсули з колагеном утримують вологу всередині клітин протягом 48 годин, відновлюючи гідроліпідний баланс та усуваючи лущення.</p><ul><li><strong>Активні компоненти:</strong> березовий сік (10,000 ppm), гіалуронова кислота, екстракт люпину.</li><li><strong>Текстура:</strong> легка гель-кремова, не обтяжує шкіру.</li><li><strong>Об’єм:</strong> 80 мл.</li></ul>',
    vendor: 'Round Lab',
    productType: 'Креми & Зволоження',
    tags: ['Глибоке зволоження', 'Березовий сік', 'Бар’єр шкіри', 'Топ крем'],
    price: 890,
    compareAtPrice: 1120,
    images: [
      'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&auto=format&fit=crop&q=80',
    available: true,
    sku: 'RL-BIRCH-CRM-80',
    variants: [
      { id: 'v-birch-80', title: '80 ml (Банка)', price: 890, compareAtPrice: 1120 },
    ],
  },
  {
    id: 'prod-skin1004-centella-ampoule',
    handle: 'skin1004-madagascar-centella-ampoule-100ml',
    title: 'Skin1004 Madagascar Centella Ampoule (100ml)',
    bodyHtml: '<p>Концентрована заспокійлива ампула, що містить 100% чистий екстракт азіатської центели з Мадагаскару. Миттєво знімає почервоніння, свербіж та відчуття печіння, зміцнює стінки капілярів при куперозі та прискорює загоєння запалень.</p><ul><li><strong>Склад:</strong> 100% Centella Asiatica Extract.</li><li><strong>Безпека:</strong> гіпоалергенна формула, 0% штучних барвників та ароматизаторів.</li><li><strong>Об’єм:</strong> 100 мл.</li></ul>',
    vendor: 'Skin1004',
    productType: 'Сироватки & Ампули',
    tags: ['Центелла', 'Заспокоєння', 'Купероз', 'Чутлива шкіра', 'Хіт'],
    price: 750,
    compareAtPrice: 920,
    images: [
      'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&auto=format&fit=crop&q=80',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1617897903246-719242758050?w=800&auto=format&fit=crop&q=80',
    available: true,
    sku: 'SKIN-CENT-AMP-100',
    variants: [
      { id: 'v-cent-100', title: '100 ml (Флакон з піпеткою)', price: 750, compareAtPrice: 920 },
    ],
  },
  {
    id: 'prod-manyo-cleansing-oil',
    handle: 'manyo-pure-cleansing-oil-200ml',
    title: 'Manyo Pure Cleansing Oil (200ml)',
    bodyHtml: '<p>Культова гідрофільна олія №1 у Південній Кореї з 14 рослинними оліями. Делікатно та глибоко розчиняє водостійкий макіяж, сонцезахисні креми (SPF), себум і забруднення в порах, не руйнуючи гідроліпідний бар’єр шкіри.</p><ul><li><strong>Активні компоненти:</strong> олії сої, лісового горіха, виноградних кісточок, оливи та жожоба.</li><li><strong>Дія:</strong> розчинення сальних ниток, пом’якшення та живлення шкіри.</li><li><strong>Об’єм:</strong> 200 мл.</li></ul>',
    vendor: 'Manyo Factory',
    productType: 'Очищення',
    tags: ['Гідрофільна олія', 'Зняття макіяжу', 'Очищення пор', '№1 в Кореї'],
    price: 860,
    compareAtPrice: 1050,
    images: [
      'https://images.unsplash.com/photo-1556228722-d0b777a83f1d?w=800&auto=format&fit=crop&q=80',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1556228722-d0b777a83f1d?w=800&auto=format&fit=crop&q=80',
    available: true,
    sku: 'MANYO-PURE-OIL-200',
    variants: [
      { id: 'v-manyo-200', title: '200 ml (З помпою)', price: 860, compareAtPrice: 1050 },
    ],
  },
  {
    id: 'prod-cosrx-snail-eye-cream',
    handle: 'cosrx-advanced-snail-peptide-eye-cream-25ml',
    title: 'COSRX Advanced Snail Peptide Eye Cream (25ml)',
    bodyHtml: '<p>Омолоджувальний крем для повік з пептидним комплексом (5 видів пептидів), 72% равликовим муцином та 2% ніацинамідом. Ефективно зменшує мімічні зморшки навколо очей, знімає ранкову набряклість та освітлює темні кола.</p><ul><li><strong>Активні компоненти:</strong> фільтрат муцину равлика 72%, комплекс 5 пептидів, ніацинамід 2%.</li><li><strong>Упаковка:</strong> вакуумна помпа для збереження активності компонентів.</li><li><strong>Об’єм:</strong> 25 мл.</li></ul>',
    vendor: 'COSRX',
    productType: 'Догляд за очима & Маски',
    tags: ['Для очей', 'Пептиди', 'Від зморшок', 'Темні кола', 'Муцин'],
    price: 840,
    compareAtPrice: 1040,
    images: [
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80',
    ],
    featuredImage: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&auto=format&fit=crop&q=80',
    available: true,
    sku: 'COSRX-PEPT-EYE-25',
    variants: [
      { id: 'v-eye-25', title: '25 ml (Airless помпа)', price: 840, compareAtPrice: 1040 },
    ],
  },
];

export const SAMPLE_SHOPIFY_CSV = `Handle,Title,Body (HTML),Vendor,Type,Tags,Published,Option1 Name,Option1 Value,Variant SKU,Variant Price,Variant Compare At Price,Image Src
cosrx-snail-essence,"COSRX Advanced Snail 96 Mucin Power Essence (100ml)","Культова есенція з 96% фільтратом равликового муцину для глибокої регенерації.","COSRX","Тонери & Есенції","Хіт, Муцин равлика, Зволоження, Регенерація",TRUE,"Title","100 ml","COSRX-SNAIL-01",780,950,https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800
cosrx-low-ph-cleanser,"COSRX Low pH Good Morning Gel Cleanser (150ml)","М'який слабокислотний гель для ранкового очищення pH 5.0–6.0.","COSRX","Очищення","Очищення, Чутлива шкіра, BHA кислоти",TRUE,"Title","150 ml","COSRX-GEL-01",450,580,https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800
beauty-of-joseon-spf,"Beauty of Joseon Relief Sun: Rice + Probiotics SPF50+ (50ml)","Сонцезахисний крем з екстрактом рису та пробіотиками на хімічних фільтрах.","Beauty of Joseon","Сонцезахист (SPF)","SPF 50+, Хіт року, Пробіотики, Сяйво",TRUE,"Title","50 ml","BOJ-SUN-01",620,790,https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800
round-lab-birch-cream,"Round Lab Birch Juice Moisturizing Cream (80ml)","Інтенсивний крем з березовим соком та капсульованою гіалуроновою кислотою.","Round Lab","Креми & Зволоження","Глибоке зволоження, Березовий сік, Бар’єр шкіри",TRUE,"Title","80 ml","RL-BIRCH-01",890,1120,https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800
skin1004-centella-ampoule,"Skin1004 Madagascar Centella Ampoule (100ml)","Заспокійлива ампула зі 100% екстрактом мадагаскарської центели.","Skin1004","Сироватки & Ампули","Центелла, Заспокоєння, Купероз, Чутлива шкіра",TRUE,"Title","100 ml","SKIN-CENT-01",750,920,https://images.unsplash.com/photo-1617897903246-719242758050?w=800
manyo-cleansing-oil,"Manyo Pure Cleansing Oil (200ml)","Гідрофільна олія №1 в Кореї з 14 рослинними оліями для розчинення пор.","Manyo Factory","Очищення","Гідрофільна олія, Зняття макіяжу, Очищення пор",TRUE,"Title","200 ml","MANYO-OIL-01",860,1050,https://images.unsplash.com/photo-1556228722-d0b777a83f1d?w=800
cosrx-bha-liquid,"COSRX BHA Blackhead Power Liquid (100ml)","Есенція-пілінг з натуральною 4% BHA-кислотою проти чорних цяток.","COSRX","Тонери & Есенції","Кислоти, Від чорних цяток, Звуження пор, BHA",TRUE,"Title","100 ml","COSRX-BHA-01",820,990,https://images.unsplash.com/photo-1608248597359-009943633e50?w=800
cosrx-snail-eye-cream,"COSRX Advanced Snail Peptide Eye Cream (25ml)","Крем для повік з пептидами та равликовим муцином від темних кіл.","COSRX","Догляд за очима & Маски","Для очей, Пептиди, Від зморшок, Муцин",TRUE,"Title","25 ml","COSRX-EYE-01",840,1040,https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800
`;
