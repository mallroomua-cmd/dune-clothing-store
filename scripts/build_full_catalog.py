#!/usr/bin/env python3
import json
import csv
import os

BEAUTY_PRODUCTS = [
    # --- 1. ПАРФУМИ ТА АРОМАТИ ---
    {
        "id": "sprei-parfumovanyi-dlia-tila-ta-volossia-sol-de-janeiro-rio-radiance-perfume-mis",
        "handle": "sprei-parfumovanyi-dlia-tila-ta-volossia-sol-de-janeiro-rio-radiance-perfume-mis",
        "title": "Спрей парфумований для тіла та волосся Sol de Janeiro Rio Radiance Perfume Mist 90 ml",
        "bodyHtml": "<p><strong>Sol de Janeiro Rio Radiance Perfume Mist</strong> — парфумований спрей для тіла та волосся, натхненний сонячним теплом Ріо. Ноти сонячної туберози, кокосового молока та теплого піску.</p>",
        "vendor": "Sol de Janeiro",
        "productType": "Парфуми та аромати",
        "tags": ["Парфуми", "Спреї", "Sol de Janeiro"],
        "price": 799,
        "compareAtPrice": 920,
        "images": [
            "https://lil-shop.com.ua/content/images/37/390x390l80mc0/sprei-parfumovanyi-dlia-tila-ta-volossia-sol-de-janeiro-rio-radiance-perfume-mist-90-ml-70923026042711.webp",
            "https://lil-shop.com.ua/content/images/37/390x390l80mc0/sprei-parfumovanyi-dlia-tila-ta-volossia-sol-de-janeiro-rio-radiance-perfume-mist-90-ml-22625774301625.webp",
            "https://lil-shop.com.ua/content/images/37/700x700l80mc0/sprei-parfumovanyi-dlia-tila-ta-volossia-sol-de-janeiro-rio-radiance-perfume-mist-90-ml-70923026042711.webp"
        ],
        "sku": "SDJ-RIO-90",
        "variants": [{"title": "90 ml", "price": 799, "compareAtPrice": 920, "sku": "SDJ-RIO-90"}]
    },
    {
        "id": "sol-de-janeiro-brazilian-crush-cheirosa-71-mist-90ml",
        "handle": "sol-de-janeiro-brazilian-crush-cheirosa-71-mist-90ml",
        "title": "Спрей парфумований для тіла та волосся Sol de Janeiro Cheirosa 71 Mist 90ml",
        "bodyHtml": "<p><strong>Sol de Janeiro Cheirosa 71</strong> — теплий та затишний гурманський спрей з нотами карамелізованої ванілі, смаженого горіха макадамія та бобів тонка.</p>",
        "vendor": "Sol de Janeiro",
        "productType": "Парфуми та аромати",
        "tags": ["Парфуми", "Спреї", "Sol de Janeiro"],
        "price": 799,
        "compareAtPrice": 920,
        "images": [
            "https://lil-shop.com.ua/content/images/8/1500x1500l80mc0/sprei-parfumovanyi-dlia-tila-ta-volossia-sol-de-janeirobrazilian-crush-cheirosa-71-90-ml-73260098762614.webp"
        ],
        "sku": "SDJ-CH71-90",
        "variants": [{"title": "90 ml", "price": 799, "compareAtPrice": 920, "sku": "SDJ-CH71-90"}]
    },
    {
        "id": "sol-de-janeiro-brazilian-crush-trio-mist-set",
        "handle": "sol-de-janeiro-brazilian-crush-trio-mist-set",
        "title": "Набір парфумованих спреїв Sol de Janeiro Brazilian Crush Trio (62, 71, Rio Radiance)",
        "bodyHtml": "<p>Подарунковий набір трьох бестселерів Sol de Janeiro: культовий Cheirosa 62, ванільний Cheirosa 71 та сонячний Rio Radiance.</p>",
        "vendor": "Sol de Janeiro",
        "productType": "Парфуми та аромати",
        "tags": ["Парфуми", "Спреї", "Набори", "Sol de Janeiro"],
        "price": 1890,
        "compareAtPrice": 2200,
        "images": [
            "https://lil-shop.com.ua/content/images/2/1800x1103l80mc0/nabir-aromativ-brazilian-crush-cheirosa-6271rio-sprei-dlia-tila-ta-volossia-brazilian-crush-cheirosa-49536280110337.webp"
        ],
        "sku": "SDJ-SET-TRIO",
        "variants": [{"title": "3 x 90 ml", "price": 1890, "compareAtPrice": 2200, "sku": "SDJ-SET-TRIO"}]
    },
    {
        "id": "interierna-aromatychna-svichka-amber-vanilla",
        "handle": "interierna-aromatychna-svichka-amber-vanilla",
        "title": "Інтерʼєрна ароматична свічка Amber & Vanilla Essence 220g",
        "bodyHtml": "<p>Ароматична інтер'єрна свічка з натурального соєвого воску з дерев'яним ґнотом. Ноти амбри, бурштину та теплої мадагаскарської ванілі.</p>",
        "vendor": "MOLAND Home",
        "productType": "Парфуми та аромати",
        "tags": ["Аромати для дому", "Свічки", "Інтер'єр"],
        "price": 650,
        "compareAtPrice": 780,
        "images": [
            "https://lil-shop.com.ua/content/images/2/1439x1200l80mc0/46837915370455.webp"
        ],
        "sku": "CANDLE-AMB-220",
        "variants": [{"title": "220g", "price": 650, "compareAtPrice": 780, "sku": "CANDLE-AMB-220"}]
    },
    {
        "id": "podarunkovyi-nabir-soievykh-svichok",
        "handle": "podarunkovyi-nabir-soievykh-svichok",
        "title": "Подарунковий набір ароматичних свічок Luxury Home Set (3 шт)",
        "bodyHtml": "<p>Ексклюзивний подарунковий бокс з трьома преміальними свічками: Santal 26, Cashmere Wood та Vanilla Orchid.</p>",
        "vendor": "MOLAND Home",
        "productType": "Парфуми та аромати",
        "tags": ["Аромати для дому", "Свічки", "Подарункові набори"],
        "price": 1290,
        "compareAtPrice": 1550,
        "images": [
            "https://lil-shop.com.ua/content/images/3/856x656l80mc0/17319949087054.webp"
        ],
        "sku": "CANDLE-SET-3",
        "variants": [{"title": "3 x 80g", "price": 1290, "compareAtPrice": 1550, "sku": "CANDLE-SET-3"}]
    },

    # --- 2. ДЕКОРАТИВНА КОСМЕТИКА: ГУБИ ---
    {
        "id": "blysk-dlia-hub-fenty-beauty-gloss-bomb-universal-lip-luminizer-fenty-glow-9ml",
        "handle": "blysk-dlia-hub-fenty-beauty-gloss-bomb-universal-lip-luminizer-fenty-glow-9ml",
        "title": "Блиск для губ Fenty Beauty Gloss Bomb Universal Lip Luminizer - Fenty Glow 9ml",
        "bodyHtml": "<p>Культовий універсальний блиск від Ріанни. Зволожувальне масло ши, нелипка текстура та спокусливий глянцевий блиск з ароматом персика.</p>",
        "vendor": "Fenty Beauty",
        "productType": "Декоративна косметика",
        "tags": ["Губи", "Декоративна косметика", "Fenty Beauty", "Блиски"],
        "price": 599,
        "compareAtPrice": 690,
        "images": [
            "https://lil-shop.com.ua/content/images/1/374x390l80mc0/blysk-dlia-hub-gloss-bomb-universal-lip-luminizer-fenty-glow-33591340940514.webp",
            "https://lil-shop.com.ua/content/images/1/387x390l80mc0/blysk-dlia-hub-gloss-bomb-universal-lip-luminizer-fenty-glow-13099499521487.webp",
            "https://lil-shop.com.ua/content/images/1/312x390l80mc0/blysk-dlia-hub-gloss-bomb-universal-lip-luminizer-fenty-glow-51825259419611.webp"
        ],
        "sku": "FB-GLOSS-GLOW",
        "variants": [{"title": "Fenty Glow (9ml)", "price": 599, "compareAtPrice": 690, "sku": "FB-GLOSS-GLOW"}]
    },
    {
        "id": "tint-dlia-hub-rare-beauty-soft-pinch-tinted-lip-oil-hope",
        "handle": "tint-dlia-hub-rare-beauty-soft-pinch-tinted-lip-oil-hope",
        "title": "Тінт для губ Rare Beauty Soft Pinch Tinted Lip Oil - Hope",
        "bodyHtml": "<p>Інноваційна желеподібна текстура олійки-тінту від Селени Гомес. Зволожує губи оліями жожоба та соняшника і залишає ніжний стійкий відтінок Hope.</p>",
        "vendor": "Rare Beauty",
        "productType": "Декоративна косметика",
        "tags": ["Губи", "Декоративна косметика", "Rare Beauty", "Тінти"],
        "price": 1099,
        "compareAtPrice": 1250,
        "images": [
            "https://lil-shop.com.ua/content/images/10/390x390l80mc0/tint-dlia-hub-rare-beauty-soft-pinch-tinted-lip-oil-hope-55545230580396.webp",
            "https://lil-shop.com.ua/content/images/10/390x390l80mc0/tint-dlia-hub-rare-beauty-soft-pinch-tinted-lip-oil-hope-18423838788886.webp",
            "https://lil-shop.com.ua/content/images/10/390x390l80mc0/tint-dlia-hub-rare-beauty-soft-pinch-tinted-lip-oil-hope-21817775073710.webp"
        ],
        "sku": "RB-TINT-HOPE",
        "variants": [{"title": "Hope (Нюд рожевий)", "price": 1099, "compareAtPrice": 1250, "sku": "RB-TINT-HOPE"}]
    },
    {
        "id": "balzam-dlia-hub-summer-fridays-lip-butter-balm-brown-sugar-15ml",
        "handle": "balzam-dlia-hub-summer-fridays-lip-butter-balm-brown-sugar-15ml",
        "title": "Бальзам для губ Summer Fridays Lip Butter Balm - Brown Sugar 15ml",
        "bodyHtml": "<p>Улюблений шовковистий бальзам-баттер для губ з оліями ши та мурумуру. Надає дзеркальний блиск і теплий карамельний відтінок Brown Sugar.</p>",
        "vendor": "Summer Fridays",
        "productType": "Декоративна косметика",
        "tags": ["Губи", "Декоративна косметика", "Summer Fridays", "Бальзами"],
        "price": 499,
        "compareAtPrice": 620,
        "images": [
            "https://lil-shop.com.ua/content/images/8/390x390l80mc0/balzam-dlia-hub-summer-fridays-lip-butter-balm-brown-sugar-75168103762214.webp",
            "https://lil-shop.com.ua/content/images/8/390x390l80mc0/balzam-dlia-hub-summer-fridays-lip-butter-balm-brown-sugar-94935871299443.webp"
        ],
        "sku": "SF-BALM-BROWN",
        "variants": [{"title": "Brown Sugar (15ml)", "price": 499, "compareAtPrice": 620, "sku": "SF-BALM-BROWN"}]
    },
    {
        "id": "oliika-dlia-hub-summer-fridays-dream-lip-oil-soft-mauve-4-5ml",
        "handle": "oliika-dlia-hub-summer-fridays-dream-lip-oil-soft-mauve-4-5ml",
        "title": "Олійка для губ Summer Fridays Dream Lip Oil - Soft Mauve 4.5ml",
        "bodyHtml": "<p>Живильна олійка для губ з комплексом з 9 натуральних рослинних олій та вітаміном E. Глибоко живить, не липне і дарує витончений відтінок Soft Mauve.</p>",
        "vendor": "Summer Fridays",
        "productType": "Декоративна косметика",
        "tags": ["Губи", "Декоративна косметика", "Summer Fridays", "Олійки"],
        "price": 599,
        "compareAtPrice": 720,
        "images": [
            "https://lil-shop.com.ua/content/images/26/390x390l80mc0/oliika-dlia-hub-summer-fridays-dream-lip-oil-soft-mauve-83798386800838.webp",
            "https://lil-shop.com.ua/content/images/26/390x390l80mc0/oliika-dlia-hub-summer-fridays-dream-lip-oil-soft-mauve-25124021246831.webp"
        ],
        "sku": "SF-OIL-MAUVE",
        "variants": [{"title": "Soft Mauve (4.5ml)", "price": 599, "compareAtPrice": 720, "sku": "SF-OIL-MAUVE"}]
    },
    {
        "id": "konturnyi-olivets-dlia-hub-rhode-peptide-lip-shape-stretch",
        "handle": "konturnyi-olivets-dlia-hub-rhode-peptide-lip-shape-stretch",
        "title": "Контурний олівець для губ Rhode Peptide Lip Shape - Stretch",
        "bodyHtml": "<p>Пептидний олівець для контурування губ від Гейлі Бібер. Оксамитова ковзаюча формула, що візуально збільшує об'єм губ та тримається цілий день.</p>",
        "vendor": "Rhode",
        "productType": "Декоративна косметика",
        "tags": ["Губи", "Декоративна косметика", "Rhode", "Олівці"],
        "price": 799,
        "compareAtPrice": 950,
        "images": [
            "https://lil-shop.com.ua/content/images/2/390x390l80mc0/konturnyi-olivets-dlia-hub-rhode-peptide-lip-shape-stretch-98576261965888.webp",
            "https://lil-shop.com.ua/content/images/2/390x390l80mc0/konturnyi-olivets-dlia-hub-rhode-peptide-lip-shape-stretch-17785765135199.webp"
        ],
        "sku": "RHODE-LIP-STR",
        "variants": [{"title": "Stretch", "price": 799, "compareAtPrice": 950, "sku": "RHODE-LIP-STR"}]
    },
    {
        "id": "balzam-z-tintom-rhode-peptide-lip-tint-raspberry-jelly-10ml",
        "handle": "balzam-z-tintom-rhode-peptide-lip-tint-raspberry-jelly-10ml",
        "title": "Бальзам з тінтом для губ Rhode Peptide Lip Tint - Raspberry Jelly 10ml",
        "bodyHtml": "<p>Вірусний пептидний тінт-бальзам Гейлі Бібер. Відтінок соковитої стиглої малини Raspberry Jelly відновлює сухі губи та дарує сяючий об'єм.</p>",
        "vendor": "Rhode",
        "productType": "Декоративна косметика",
        "tags": ["Губи", "Декоративна косметика", "Rhode", "Тінти", "Бальзами"],
        "price": 799,
        "compareAtPrice": 920,
        "images": [
            "https://lil-shop.com.ua/content/images/19/600x600l80mc0/balzam-z-tintom-rhode-peptide-lip-tint-raspberry-jelly-10ml-59876748159092.webp"
        ],
        "sku": "RHODE-TINT-RASP",
        "variants": [{"title": "Raspberry Jelly (10ml)", "price": 799, "compareAtPrice": 920, "sku": "RHODE-TINT-RASP"}]
    },
    {
        "id": "dior-addict-lip-glow-oil-001",
        "handle": "dior-addict-lip-glow-oil-001",
        "title": "Олія-блиск для губ Dior Addict Lip Glow Oil 001 Pink",
        "bodyHtml": "<p>Культова олія для губ Dior Addict з технологією Color Reviver, що адаптується до індивідуального pH губ, створюючи неповторний свіжий рожевий відтінок.</p>",
        "vendor": "Dior",
        "productType": "Декоративна косметика",
        "tags": ["Губи", "Декоративна косметика", "Dior", "Олійки"],
        "price": 1850,
        "compareAtPrice": 2100,
        "images": [
            "https://lil-shop.com.ua/content/images/14/400x500l80mc0/dior-addict-lip-glow-oil-oliia-dlia-hub-001-13168465110396.webp"
        ],
        "sku": "DIOR-GLOW-001",
        "variants": [{"title": "001 Pink", "price": 1850, "compareAtPrice": 2100, "sku": "DIOR-GLOW-001"}]
    },

    # --- 3. ДЕКОРАТИВНА КОСМЕТИКА: ОБЛИЧЧЯ ТА ОЧІ ---
    {
        "id": "palitra-khailaiteriv-dlia-oblychchia-dior-backstage-glow-face-palette-001-univer",
        "handle": "palitra-khailaiteriv-dlia-oblychchia-dior-backstage-glow-face-palette-001-univer",
        "title": "Палітра хайлайтерів для обличчя Dior Backstage Glow Face Palette 001 Universal 10g",
        "bodyHtml": "<p>Знакова палітра хайлайтерів Dior Backstage. Чотири сяючі відтінки з мікроперламутром, що нашаровуються від ніжного внутрішнього сяйва до яскравого глянцю.</p>",
        "vendor": "Dior",
        "productType": "Декоративна косметика",
        "tags": ["Обличчя", "Декоративна косметика", "Dior", "Палітри", "Хайлайтери"],
        "price": 2199,
        "compareAtPrice": 2500,
        "images": [
            "https://lil-shop.com.ua/content/images/47/390x390l80mc0/palitra-khailaiteriv-dlia-oblychchia-dior-backstage-glow-face-palette-001-universal-10g-83055883802753.webp",
            "https://lil-shop.com.ua/content/images/47/390x390l80mc0/palitra-khailaiteriv-dlia-oblychchia-dior-backstage-glow-face-palette-001-universal-10g-30957074229681.webp"
        ],
        "sku": "DIOR-BACK-001",
        "variants": [{"title": "001 Universal (10g)", "price": 2199, "compareAtPrice": 2500, "sku": "DIOR-BACK-001"}]
    },
    {
        "id": "ridki-rumiana-hourglass-unreal-liquid-blush-whim-10-3ml",
        "handle": "ridki-rumiana-hourglass-unreal-liquid-blush-whim-10-3ml",
        "title": "Рідкі румʼяна Hourglass Unreal Liquid Blush - Whim 10.3ml",
        "bodyHtml": "<p>Преміальні невагомі рідкі рум'яна Hourglass Unreal з сироватковим ефектом. Формула з гіалуроновою кислотою та пептидами для ефекту розмитого фокусу.</p>",
        "vendor": "Hourglass",
        "productType": "Декоративна косметика",
        "tags": ["Обличчя", "Декоративна косметика", "Hourglass", "Рум'яна"],
        "price": 899,
        "compareAtPrice": 1050,
        "images": [
            "https://lil-shop.com.ua/content/images/21/390x390l80mc0/ridki-rumiana-unreal-liquid-blush-10.3ml-59723467636263.webp",
            "https://lil-shop.com.ua/content/images/21/390x390l80mc0/ridki-rumiana-unreal-liquid-blush-10.3ml-91808013028194.webp"
        ],
        "sku": "HG-BLUSH-WHIM",
        "variants": [{"title": "Whim (10.3ml)", "price": 899, "compareAtPrice": 1050, "sku": "HG-BLUSH-WHIM"}]
    },
    {
        "id": "rhode-pocket-blush-juice-box",
        "handle": "rhode-pocket-blush-juice-box",
        "title": "Пептидні кремові рум'яна Rhode Pocket Blush - Juice Box",
        "bodyHtml": "<p>Компактні кремові рум'яна Rhode у трендовому відтінку Juice Box (яскравий ягідний). Надають шкірі свіжого натурального рум'янцю та легкого вологого сяйва.</p>",
        "vendor": "Rhode",
        "productType": "Декоративна косметика",
        "tags": ["Обличчя", "Декоративна косметика", "Rhode", "Рум'яна"],
        "price": 1150,
        "compareAtPrice": 1300,
        "images": [
            "https://lil-shop.com.ua/content/images/39/1284x1605l80mc0/rumiana-peptydni-kremovi-rhode-pocket-blush-juice-box-86471484829067.webp"
        ],
        "sku": "RHODE-BLUSH-JB",
        "variants": [{"title": "Juice Box", "price": 1150, "compareAtPrice": 1300, "sku": "RHODE-BLUSH-JB"}]
    },
    {
        "id": "rare-beauty-positive-light-liquid-luminizer-enchant-15ml",
        "handle": "rare-beauty-positive-light-liquid-luminizer-enchant-15ml",
        "title": "Рідкий хайлайтер Rare Beauty Positive Light Liquid Luminizer - Enchant 15ml",
        "bodyHtml": "<p>Шовковистий рідкий хайлайтер другого покоління від Rare Beauty. Відтінок Enchant (м'яке рожеве сяйво) бездоганно розтушовується без підкреслення текстури.</p>",
        "vendor": "Rare Beauty",
        "productType": "Декоративна косметика",
        "tags": ["Обличчя", "Декоративна косметика", "Rare Beauty", "Хайлайтери"],
        "price": 1250,
        "compareAtPrice": 1400,
        "images": [
            "https://lil-shop.com.ua/content/images/37/1280x1280l80mc0/ridkyi-khailaiter-rare-beauty-positive-light-liquid-luminizer-enchant-15-ml-60956111488083.webp"
        ],
        "sku": "RB-LUM-ENCHANT",
        "variants": [{"title": "Enchant (15ml)", "price": 1250, "compareAtPrice": 1400, "sku": "RB-LUM-ENCHANT"}]
    },
    {
        "id": "tarte-shape-tape-contour-concealer-20b-light",
        "handle": "tarte-shape-tape-contour-concealer-20b-light",
        "title": "Консилер Tarte Shape Tape Contour Concealer - 20B Light",
        "bodyHtml": "<p>Найпопулярніший у світі консилер з повним перекриттям. Миттєво маскує темні кола під очима та недосконалості без скочування до 16 годин.</p>",
        "vendor": "Tarte",
        "productType": "Декоративна косметика",
        "tags": ["Обличчя", "Декоративна косметика", "Консилери", "Tarte"],
        "price": 1100,
        "compareAtPrice": 1280,
        "images": [
            "https://lil-shop.com.ua/content/images/37/1000x1000l80mc0/konsyler-tarte-shape-tape-contour-concealer-20b-light-29693226878509.webp"
        ],
        "sku": "TARTE-ST-20B",
        "variants": [{"title": "20B Light", "price": 1100, "compareAtPrice": 1280, "sku": "TARTE-ST-20B"}]
    },
    {
        "id": "elegance-la-poudre-haute-nuance-01-powder-27g",
        "handle": "elegance-la-poudre-haute-nuance-01-powder-27g",
        "title": "Стійка матуюча пудра для обличчя Elegance La Poudre Haute Nuance 01 (27g)",
        "bodyHtml": "<p>Легендарна японська пудра вищого класу Elegance. Вирівнює рельєф пор, фіксує макіяж і створює шовковисту порцелянову шкіру.</p>",
        "vendor": "Elegance",
        "productType": "Декоративна косметика",
        "tags": ["Обличчя", "Декоративна косметика", "Пудри"],
        "price": 2450,
        "compareAtPrice": 2800,
        "images": [
            "https://lil-shop.com.ua/content/images/2/1280x1280l80mc0/elegance-la-poudre-haute-nuance-01-stiika-pudra-dlia-oblychchia-27g-95541467097747.webp"
        ],
        "sku": "ELEGANCE-01-27G",
        "variants": [{"title": "01 Elegance (27g)", "price": 2450, "compareAtPrice": 2800, "sku": "ELEGANCE-01-27G"}]
    },
    {
        "id": "dr-ceuracle-recovery-bb-cream-spf-28-45ml",
        "handle": "dr-ceuracle-recovery-bb-cream-spf-28-45ml",
        "title": "Стійкий BB-крем бальзам Dr.Ceuracle Recovery SPF 28 PA++ 45ml",
        "bodyHtml": "<p>Корейський лікувальний BB-крем з матовим оксамитовим фінішем. Заспокоює чутливу шкіру, маскує почервоніння та захищає від ультрафіолету.</p>",
        "vendor": "Dr.Ceuracle",
        "productType": "Декоративна косметика",
        "tags": ["Обличчя", "Декоративна косметика", "BB крем", "SPF", "Dr.Ceuracle"],
        "price": 890,
        "compareAtPrice": 1050,
        "images": [
            "https://lil-shop.com.ua/content/images/5/390x390l80mc0/stiikyi-bb-krem-balzam-z-matovym-efektom-dr.ceuracle-recovery-spf-28-pa-45ml-70439076110325.webp"
        ],
        "sku": "DRC-BB-45",
        "variants": [{"title": "45 ml", "price": 890, "compareAtPrice": 1050, "sku": "DRC-BB-45"}]
    },
    {
        "id": "nyx-ultimate-eyeshadow-palette-16-warm-neutrals",
        "handle": "nyx-ultimate-eyeshadow-palette-16-warm-neutrals",
        "title": "Палетка тіней для повік NYX Professional Ultimate 16 Shades 04W Warm Neutrals",
        "bodyHtml": "<p>Універсальна палетка тіней з 16 теплими базовими відтінками від сатинових до насичено матових. Висока пігментація та бездоганне розтушовування.</p>",
        "vendor": "NYX Professional",
        "productType": "Декоративна косметика",
        "tags": ["Очі", "Декоративна косметика", "NYX", "Тіні"],
        "price": 850,
        "compareAtPrice": 980,
        "images": [
            "https://lil-shop.com.ua/content/images/13/1063x1063l80mc0/nyx-professional-paletka-tinei-ultimate-16-vidtinkiv-04w-warm-neutrals-98157405341796.webp"
        ],
        "sku": "NYX-ULT-16WN",
        "variants": [{"title": "04W Warm Neutrals", "price": 850, "compareAtPrice": 980, "sku": "NYX-ULT-16WN"}]
    },
    {
        "id": "revitabrow-advanced-eyebrow-conditioner-3ml",
        "handle": "revitabrow-advanced-eyebrow-conditioner-3ml",
        "title": "Сироватка для росту та зміцнення брів RevitaBrow Advanced (3ml)",
        "bodyHtml": "<p>Оригінальна сироватка з запатентованим BioPeptin Complex для стимуляції росту, густоти та захисту волосків брів від ламкості.</p>",
        "vendor": "RevitaLash",
        "productType": "Декоративна косметика",
        "tags": ["Очі", "Декоративна косметика", "Брови", "Сироватки"],
        "price": 2600,
        "compareAtPrice": 2950,
        "images": [
            "https://lil-shop.com.ua/content/images/50/600x600l80mc0/3ml-revitabrow-advanced-syrovatka-dlia-rostu-briv-61074207028964.webp"
        ],
        "sku": "REV-BROW-3ML",
        "variants": [{"title": "3 ml", "price": 2600, "compareAtPrice": 2950, "sku": "REV-BROW-3ML"}]
    },
    {
        "id": "nabir-penzliv-dlia-makiiazhu-pro",
        "handle": "nabir-penzliv-dlia-makiiazhu-pro",
        "title": "Набір професійних пензлів для макіяжу Pro Artist Brush Set (8 шт)",
        "bodyHtml": "<p>Повний набір ультрам'яких синтетичних пензлів для нанесення тону, пудри, рум'ян, хайлайтера та тіней з чохлом для зберігання.</p>",
        "vendor": "MOLAND Beauty",
        "productType": "Декоративна косметика",
        "tags": ["Обличчя", "Аксесуари", "Пензлі"],
        "price": 990,
        "compareAtPrice": 1200,
        "images": [
            "https://lil-shop.com.ua/content/images/50/630x630l80mc0/41288408830248.webp"
        ],
        "sku": "BRUSH-SET-8",
        "variants": [{"title": "8 шт + Чохол", "price": 990, "compareAtPrice": 1200, "sku": "BRUSH-SET-8"}]
    },

    # --- 4. ДОГЛЯД ЗА ОБЛИЧЧЯМ ---
    {
        "id": "prod-medicube-cleansing-oil",
        "handle": "prod-medicube-cleansing-oil",
        "title": "Очищувальна гідрофільна олія Medicube Zero Pore Blackhead Deep Cleansing Oil (150ml)",
        "bodyHtml": "<p>Глибоко очищує пори від чорних цяток, водостійкого макіяжу та сонцезахисних кремів. Містить LHA-кислоти та ніацинамід для звуження пор.</p>",
        "vendor": "Medicube",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Очищення", "Medicube", "Гідрофільна олія"],
        "price": 880,
        "compareAtPrice": 990,
        "images": [
            "https://lil-shop.com.ua/content/images/45/1800x1800l80mc0/ochyshchuvalna-hidrofilna-oliia-medicube-zero-pore-blackhead-deep-cleansing-oil-lha-ta-niatsynamid-150ml-95294052613319.webp"
        ],
        "sku": "MED-OIL-150",
        "variants": [{"title": "150 ml", "price": 880, "compareAtPrice": 990, "sku": "MED-OIL-150"}]
    },
    {
        "id": "skin1004-madagascar-centella-tone-brightening-cleansing-foam-125ml",
        "handle": "skin1004-madagascar-centella-tone-brightening-cleansing-foam-125ml",
        "title": "Освітлюючий гель-пінка для вмивання Skin1004 Madagascar Centella (125ml)",
        "bodyHtml": "<p>Делікатна пінка з екстрактом центелли азіатської та мадекасосидом. Освітлює постакне, заспокоює подразнення і не сушить шкіру.</p>",
        "vendor": "Skin1004",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Очищення", "Skin1004", "Центелла", "Вмивання"],
        "price": 540,
        "compareAtPrice": 620,
        "images": [
            "https://lil-shop.com.ua/content/images/3/388x600l80mc0/skin1004-madagascar-centella-tone-brightening-cleansing-gel-foam-osvitliuiuchyi-hel-pinka-dlia-vmyvannia-z-tsenteloiu-125ml-71127830164614.webp"
        ],
        "sku": "SKIN-CENT-125",
        "variants": [{"title": "125 ml", "price": 540, "compareAtPrice": 620, "sku": "SKIN-CENT-125"}]
    },
    {
        "id": "panoxyl-acne-foaming-wash-156ml",
        "handle": "panoxyl-acne-foaming-wash-156ml",
        "title": "Гель-пінка для проблемної шкіри з акне PanOxyl Acne Foaming Wash 10% (156ml)",
        "bodyHtml": "<p>Максимальна концентрація 10% бензоїл пероксиду для лікування акне та запалень на обличчі, плечах та спині. Очищає пори від бактерій.</p>",
        "vendor": "PanOxyl",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Очищення", "PanOxyl", "Вмивання"],
        "price": 680,
        "compareAtPrice": 790,
        "images": [
            "https://lil-shop.com.ua/content/images/23/700x700l80mc0/156ml-panoxyl-acne-foaming-wash-hel-pinka-dlia-chutlyvoi-ta-problemnoi-shkiry-z-akne-19561877194385.webp"
        ],
        "sku": "PANOXYL-10-156",
        "variants": [{"title": "156 ml", "price": 680, "compareAtPrice": 790, "sku": "PANOXYL-10-156"}]
    },
    {
        "id": "molochko-dlia-ochyshchennia-sensitive",
        "handle": "molochko-dlia-ochyshchennia-sensitive",
        "title": "Заспокійливе молочко для очищення чутливої шкіри обличчя Gentle Milk (200ml)",
        "bodyHtml": "<p>Ультрам'яке очищувальне молочко з церамідами та пантенолом для делікатного видалення макіяжу без порушення захисного ліпідного бар'єру.</p>",
        "vendor": "MOLAND Skincare",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Очищення", "Молочко"],
        "price": 520,
        "compareAtPrice": 610,
        "images": [
            "https://lil-shop.com.ua/content/images/48/500x500l80mc0/32889521080825.webp"
        ],
        "sku": "MILK-SENS-200",
        "variants": [{"title": "200 ml", "price": 520, "compareAtPrice": 610, "sku": "MILK-SENS-200"}]
    },
    {
        "id": "prod-anua-heartleaf-ampoule",
        "handle": "prod-anua-heartleaf-ampoule",
        "title": "Заспокійлива сироватка Anua Heartleaf 80% Soothing Ampoule (30ml)",
        "bodyHtml": "<p>Концентрована ампула з 80% екстрактом хауттюйнії серцеподібної. Миттєво знімає почервоніння, подразнення та балансує виділення себуму.</p>",
        "vendor": "Anua",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Сироватки", "Anua", "Заспокоєння"],
        "price": 790,
        "compareAtPrice": 890,
        "images": [
            "https://lil-shop.com.ua/content/images/22/800x800l80mc0/zvolozhuiucha-syrovatka-anua-heartleaf-80-soothing-ampoule-30ml-71235933533437.webp"
        ],
        "sku": "ANUA-AMP-30",
        "variants": [{"title": "30 ml", "price": 790, "compareAtPrice": 890, "sku": "ANUA-AMP-30"}]
    },
    {
        "id": "la-roche-posay-pure-vitamin-c10-serum-30ml",
        "handle": "la-roche-posay-pure-vitamin-c10-serum-30ml",
        "title": "Сироватка-антиоксидант проти зморшок La Roche-Posay Pure Vitamin C10 (30ml)",
        "bodyHtml": "<p>Концентрована антиоксидантна сироватка з 10% чистим вітаміном C, саліциловою кислотою та нейросенсином для сяйва шкіри та вирівнювання рельєфу.</p>",
        "vendor": "La Roche-Posay",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Сироватки", "La Roche-Posay", "Вітамін C"],
        "price": 1290,
        "compareAtPrice": 1450,
        "images": [
            "https://lil-shop.com.ua/content/images/17/195x630l80mc0/la-roche-posay-pure-vitamin-c10-syrovatka-antyoksydant-proty-zmorshok-dlia-vidnovlennia-shkiry-oblychchia-30-ml-14381565333304.webp"
        ],
        "sku": "LRP-VITC-30",
        "variants": [{"title": "30 ml", "price": 1290, "compareAtPrice": 1450, "sku": "LRP-VITC-30"}]
    },
    {
        "id": "la-roche-posay-retinol-b3-serum-30ml",
        "handle": "la-roche-posay-retinol-b3-serum-30ml",
        "title": "Сироватка проти зморшок з ретинолом La Roche-Posay Retinol B3 Serum (30ml)",
        "bodyHtml": "<p>Антивікова сироватка з поступовим вивільненням чистого ретинолу та вітаміном B3 (ніацинамід). Зменшує глибокі зморшки та фотостаріння без подразнень.</p>",
        "vendor": "La Roche-Posay",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Сироватки", "La Roche-Posay", "Ретинол"],
        "price": 1350,
        "compareAtPrice": 1520,
        "images": [
            "https://lil-shop.com.ua/content/images/15/750x700l80mc0/la-roche-posay-retinol-b3-serum-syrovatka-proty-zmorshok-z-retynolom-30ml-11184830109498.webp"
        ],
        "sku": "LRP-RET-30",
        "variants": [{"title": "30 ml", "price": 1350, "compareAtPrice": 1520, "sku": "LRP-RET-30"}]
    },
    {
        "id": "la-roche-posay-pure-niacinamide-10-serum-30ml",
        "handle": "la-roche-posay-pure-niacinamide-10-serum-30ml",
        "title": "Сироватка проти пігментації La Roche-Posay Pure Niacinamide 10 Serum (30ml)",
        "bodyHtml": "<p>Потужна дерматологічна сироватка з 10% ніацинамідом. Ефективно бореться з пігментними плямами, постакне та тьмяним тоном обличчя.</p>",
        "vendor": "La Roche-Posay",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Сироватки", "La Roche-Posay", "Ніацинамід"],
        "price": 1250,
        "compareAtPrice": 1400,
        "images": [
            "https://lil-shop.com.ua/content/images/37/1010x1069l80mc0/syrovatka-dlia-oblychchia-la-roche-posay-pure-niacinamide-10-serum-72722839118468.webp"
        ],
        "sku": "LRP-NIAC-30",
        "variants": [{"title": "30 ml", "price": 1250, "compareAtPrice": 1400, "sku": "LRP-NIAC-30"}]
    },
    {
        "id": "la-roche-posay-effaclar-daily-skin-renewal-serum-30ml",
        "handle": "la-roche-posay-effaclar-daily-skin-renewal-serum-30ml",
        "title": "Сироватка для оновлення шкіри La Roche-Posay Effaclar Daily Renewal (30ml)",
        "bodyHtml": "<p>Ультраконцентрована сироватка з трьома кислотами (саліцилова, гліколева, LHA) та ніацинамідом проти стійких недосконалостей шкіри.</p>",
        "vendor": "La Roche-Posay",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Сироватки", "La Roche-Posay", "Проблемна шкіра"],
        "price": 1190,
        "compareAtPrice": 1350,
        "images": [
            "https://lil-shop.com.ua/content/images/17/800x1011l80mc0/syrovatka-dlia-oblychchia-la-roche-posay-effaclar-daily-skin-renewal-serum-30ml-19626486072483.webp"
        ],
        "sku": "LRP-EFAC-30",
        "variants": [{"title": "30 ml", "price": 1190, "compareAtPrice": 1350, "sku": "LRP-EFAC-30"}]
    },
    {
        "id": "prod-paulas-choice-bha-exfoliant",
        "handle": "prod-paulas-choice-bha-exfoliant",
        "title": "Тонік-ексфоліант Paula's Choice Skin Perfecting 2% BHA Liquid Exfoliant (118ml)",
        "bodyHtml": "<p>Світовий бестселер ексфоліації. 2% саліцилова кислота м'яко відлущує омертвілі клітини, очищає забиті пори та вирівнює тон шкіри.</p>",
        "vendor": "Paula's Choice",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Тоніки", "Paula's Choice", "BHA"],
        "price": 1450,
        "compareAtPrice": 1650,
        "images": [
            "https://lil-shop.com.ua/content/images/24/1500x1500l80mc0/tonik-dlia-problemnoi-shkiry-exfoliate-paulas-choice-iz-salitsylovoiu-kyslotoiu-2-118ml-60428301325264.webp"
        ],
        "sku": "PC-BHA-118",
        "variants": [{"title": "118 ml", "price": 1450, "compareAtPrice": 1650, "sku": "PC-BHA-118"}]
    },
    {
        "id": "la-mer-the-treatment-lotion-30ml",
        "handle": "la-mer-the-treatment-lotion-30ml",
        "title": "Лосьйон для догляду за шкірою La Mer The Treatment Lotion (30ml)",
        "bodyHtml": "<p>Шовковистий підготовчий лосьйон з клітинним Miracle Broth. Заряджає шкіру енергією, глибоко зволожує та готує до наступних етапів догляду.</p>",
        "vendor": "La Mer",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Тоніки", "La Mer", "Лосьйони"],
        "price": 2200,
        "compareAtPrice": 2500,
        "images": [
            "https://lil-shop.com.ua/content/images/32/630x630l80mc0/la-mer-the-treatment-lotion-losion-dlia-dohliadu-za-shkiroiu-30ml-13881267600703.webp"
        ],
        "sku": "LAMER-LOT-30",
        "variants": [{"title": "30 ml", "price": 2200, "compareAtPrice": 2500, "sku": "LAMER-LOT-30"}]
    },
    {
        "id": "la-mer-the-moisturizing-cream-60ml",
        "handle": "la-mer-the-moisturizing-cream-60ml",
        "title": "Зволожуючий крем для обличчя La Mer The Moisturizing Cream (60ml)",
        "bodyHtml": "<p>Легендарний Crème de la Mer з ферментом морських водоростей Miracle Broth. Глибоко живить, заспокоює сухість та повертає шкірі молодість і сяйво.</p>",
        "vendor": "La Mer",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Креми", "La Mer", "Зволоження"],
        "price": 2950,
        "compareAtPrice": 3400,
        "images": [
            "https://lil-shop.com.ua/content/images/26/1080x1080l80mc0/zvolozhuiuchyi-krem-dlia-oblychchia-la-mer-the-moisturizing-cream-60-ml-49795685594321.webp"
        ],
        "sku": "LAMER-CRM-60",
        "variants": [{"title": "60 ml", "price": 2950, "compareAtPrice": 3400, "sku": "LAMER-CRM-60"}]
    },
    {
        "id": "centellian24-the-madeca-cream-season6-45ml",
        "handle": "centellian24-the-madeca-cream-season6-45ml",
        "title": "Багатофункціональний антивіковий крем Centellian24 The Madeca Cream Season 6 (45ml)",
        "bodyHtml": "<p>Знаменитий регенеруючий крем з концентрованою центеллою TECA від фармгіганта Dongkook. Загоює, зміцнює бар'єр шкіри та бореться зі зморшками.</p>",
        "vendor": "Centellian24",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Креми", "Centellian24", "Антивікові"],
        "price": 620,
        "compareAtPrice": 750,
        "images": [
            "https://lil-shop.com.ua/content/images/6/400x400l80mc0/centellian24-the-madeca-cream-season6-bahatofunktsionalnyi-antyvikovyi-krem-45ml-72337466721322.webp"
        ],
        "sku": "CENT-CRM-45",
        "variants": [{"title": "45 ml", "price": 620, "compareAtPrice": 750, "sku": "CENT-CRM-45"}]
    },
    {
        "id": "tocobo-collagen-brightening-eye-gel-cream",
        "handle": "tocobo-collagen-brightening-eye-gel-cream",
        "title": "Колагеновий гель навколо очей Tocobo Collagen Brightening Eye Gel Cream (30ml)",
        "bodyHtml": "<p>Легкий освіжаючий гель-крем з рослинним колагеном та водою лаванди. Освітлює темні кола, зменшує набряки та зволожує ніжну шкіру повік.</p>",
        "vendor": "Tocobo",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Зона навколо очей", "Tocobo", "Креми"],
        "price": 590,
        "compareAtPrice": 680,
        "images": [
            "https://lil-shop.com.ua/content/images/1/500x500l80mc0/kolahenovyi-hel-navkolo-ochei-tocobo-collagen-brightening-eye-gel-cream-42337467305049.webp"
        ],
        "sku": "TOCOBO-EYE-30",
        "variants": [{"title": "30 ml", "price": 590, "compareAtPrice": 680, "sku": "TOCOBO-EYE-30"}]
    },
    {
        "id": "silulan-collagen-eye-patches-5-pairs",
        "handle": "silulan-collagen-eye-patches-5-pairs",
        "title": "Колагенові патчі Silulan для шкіри навколо очей (5 пар)",
        "bodyHtml": "<p>Гідрогелеві патчі з морським колагеном проти зморшок, набряків та втоми очей. Швидкий ефект відпочилого погляду за 15 хвилин.</p>",
        "vendor": "Silulan",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Зона навколо очей", "Патчі", "Silulan"],
        "price": 390,
        "compareAtPrice": 460,
        "images": [
            "https://lil-shop.com.ua/content/images/18/1024x1024l80mc0/kolahenovi-patchi-silulan-dlia-shkiry-navkolo-ochei-proty-zmorshok-ta-nabriakiv-5-par-45050273724710.webp"
        ],
        "sku": "SIL-PATCH-5P",
        "variants": [{"title": "5 пар", "price": 390, "compareAtPrice": 460, "sku": "SIL-PATCH-5P"}]
    },
    {
        "id": "estee-lauder-anr-eye-concentrate-matrix-15ml",
        "handle": "estee-lauder-anr-eye-concentrate-matrix-15ml",
        "title": "Омолоджувальний концентрат Estée Lauder Advanced Night Repair Matrix (15ml)",
        "bodyHtml": "<p>Ультраживильний концентрат для контуру очей зі сталевим охолоджуючим аплікатором. Зміцнює делікатну шкіру та розгладжує мімічні зморшки.</p>",
        "vendor": "Estée Lauder",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Зона навколо очей", "Estée Lauder", "Сироватки"],
        "price": 2350,
        "compareAtPrice": 2700,
        "images": [
            "https://lil-shop.com.ua/content/images/9/600x600l80mc0/estee-lauder-anr-eye-concentrate-matrix-omolodzhuvalnyi-dohliad-dlia-shkiry-navkolo-ochei-15ml-68224068447595.webp"
        ],
        "sku": "EL-ANR-EYE-15",
        "variants": [{"title": "15 ml", "price": 2350, "compareAtPrice": 2700, "sku": "EL-ANR-EYE-15"}]
    },
    {
        "id": "biodance-collagen-gel-toner-pads-60pcs",
        "handle": "biodance-collagen-gel-toner-pads-60pcs",
        "title": "Зволожуючі колагенові педи для обличчя Biodance Collagen Gel Toner Pads (60 шт)",
        "bodyHtml": "<p>Щільні тонер-педи, просочені концентрованим колагеновим гелем та гіалуроновою кислотою. Миттєво освіжають, заспокоюють і дарують гладкість.</p>",
        "vendor": "Biodance",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Маски та педи", "Biodance", "Тоніки"],
        "price": 980,
        "compareAtPrice": 1150,
        "images": [
            "https://lil-shop.com.ua/content/images/36/1080x1120l80mc0/zvolozhuiuchi-kolahenovi-pady-dlia-oblychchia-biodance-collagen-gel-toner-pads-60sht-58464449758575.webp"
        ],
        "sku": "BIO-PADS-60",
        "variants": [{"title": "60 шт", "price": 980, "compareAtPrice": 1150, "sku": "BIO-PADS-60"}]
    },
    {
        "id": "prod-biodance-bio-collagen-mask",
        "handle": "prod-biodance-bio-collagen-mask",
        "title": "Гідрогелева маска з колагеном Biodance Bio-Collagen Real Deep Mask",
        "bodyHtml": "<p>Вірусна корейська нічна маска, яка стає прозорою після повного вбирання оліго-гіалуронової кислоти та колагену в глибокі шари епідермісу.</p>",
        "vendor": "Biodance",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "Маски та педи", "Biodance", "Маски"],
        "price": 450,
        "compareAtPrice": 520,
        "images": [
            "https://lil-shop.com.ua/content/images/45/1000x1000l80mc0/maska-hidroheleva-z-kolahenom-biodance-bio-collagen-real-deep-mask-57891938294814.webp"
        ],
        "sku": "BIO-MASK-DEEP",
        "variants": [{"title": "1 шт (34g)", "price": 450, "compareAtPrice": 520, "sku": "BIO-MASK-DEEP"}]
    },
    {
        "id": "sontsezakhysnyi-krem-spf50",
        "handle": "sontsezakhysnyi-krem-spf50",
        "title": "Сонцезахисний зволожуючий крем Daily Moisture Sunscreen SPF 50+ PA++++ (50ml)",
        "bodyHtml": "<p>Невагомий хімічний сонцезахисний крем нового покоління без білих слідів та липкості. Зволожує гіалуроновою кислотою та надійно блокує UVA/UVB.</p>",
        "vendor": "MOLAND Skincare",
        "productType": "Догляд за обличчям",
        "tags": ["Догляд за обличчям", "SPF захист", "Креми"],
        "price": 640,
        "compareAtPrice": 750,
        "images": [
            "https://lil-shop.com.ua/content/images/44/1000x667l80mc0/78795577073420.webp"
        ],
        "sku": "SPF50-DAILY-50",
        "variants": [{"title": "50 ml", "price": 640, "compareAtPrice": 750, "sku": "SPF50-DAILY-50"}]
    },

    # --- 5. ДОГЛЯД ЗА ВОЛОССЯМ ---
    {
        "id": "prod-olaplex-bonding-oil",
        "handle": "prod-olaplex-bonding-oil",
        "title": "Відновлююча олія для волосся Olaplex No.7 Bonding Oil (30ml)",
        "bodyHtml": "<p>Ультралегка висококонцентрована олія для відновлення пошкоджених дисульфідних зв'язків волосся. Надає дзеркальний блиск і термозахист до 232°C.</p>",
        "vendor": "Olaplex",
        "productType": "Догляд за волоссям",
        "tags": ["Догляд за волоссям", "Olaplex", "Олії для волосся"],
        "price": 1250,
        "compareAtPrice": 1400,
        "images": [
            "https://lil-shop.com.ua/content/images/18/1000x1000l80mc0/olaplex-no.7-bonding-oil-30ml-vidnovliuiucha-oliia-dlia-volossia-43019718400082.webp"
        ],
        "sku": "OLA-NO7-30",
        "variants": [{"title": "30 ml", "price": 1250, "compareAtPrice": 1400, "sku": "OLA-NO7-30"}]
    },
    {
        "id": "prod-k18-leave-in-mask",
        "handle": "prod-k18-leave-in-mask",
        "title": "Незмивна маска для молекулярного відновлення волосся K18 Leave-in Mask (50ml)",
        "bodyHtml": "<p>Революційний біоактивний пептид K18 відновлює кератинові ланцюжки волосся всього за 4 хвилини після фарбування чи термоукладання.</p>",
        "vendor": "K18",
        "productType": "Догляд за волоссям",
        "tags": ["Догляд за волоссям", "K18", "Маски для волосся"],
        "price": 1190,
        "compareAtPrice": 1350,
        "images": [
            "https://lil-shop.com.ua/content/images/12/509x515l80mc0/50ml-k18-maska-dlia-volossia-leave-in-molecular-repair-hair-mask-43210506973965.webp"
        ],
        "sku": "K18-MASK-50",
        "variants": [{"title": "50 ml", "price": 1190, "compareAtPrice": 1350, "sku": "K18-MASK-50"}]
    },
    {
        "id": "vidnovliuvalnyi-bezsulfatnyi-shampun",
        "handle": "vidnovliuvalnyi-bezsulfatnyi-shampun",
        "title": "Відновлювальний безсульфатний шампунь Repair & Moisture (250ml)",
        "bodyHtml": "<p>Професійний безсульфатний шампунь з амінокислотами шовку та рослинними протеїнами для щоденного дбайливого очищення пошкодженого волосся.</p>",
        "vendor": "MOLAND Hair",
        "productType": "Догляд за волоссям",
        "tags": ["Догляд за волоссям", "Шампуні"],
        "price": 580,
        "compareAtPrice": 690,
        "images": [
            "https://lil-shop.com.ua/content/images/36/595x700l80mc0/84792797635563.webp"
        ],
        "sku": "SHAMP-REP-250",
        "variants": [{"title": "250 ml", "price": 580, "compareAtPrice": 690, "sku": "SHAMP-REP-250"}]
    },

    # --- 6. ДОГЛЯД ЗА ТІЛОМ ---
    {
        "id": "prod-sol-de-janeiro-bum-bum",
        "handle": "prod-sol-de-janeiro-bum-bum",
        "title": "Крем для тіла Sol de Janeiro Brazilian Bum Bum Cream (75ml)",
        "bodyHtml": "<p>Культовий бразильський крем для пружності шкіри з екстрактом гуарани, олією купуасу та фірмовим п'янким ароматом солоної карамелі й фісташки.</p>",
        "vendor": "Sol de Janeiro",
        "productType": "Догляд за тілом",
        "tags": ["Догляд за тілом", "Sol de Janeiro", "Креми для тіла"],
        "price": 890,
        "compareAtPrice": 990,
        "images": [
            "https://lil-shop.com.ua/content/images/21/1200x630l80mc0/krem-dlia-tila-brazilian-bum-sol-de-janeiro-75ml-38934533931936.webp"
        ],
        "sku": "SDJ-BUM-75",
        "variants": [{"title": "75 ml", "price": 890, "compareAtPrice": 990, "sku": "SDJ-BUM-75"}]
    },

    # --- 7. АКСЕСУАРИ ТА СУМКИ ---
    {
        "id": "kosmetychka-charlotte-tilbury-sumka-zhinocha",
        "handle": "kosmetychka-charlotte-tilbury-sumka-zhinocha",
        "title": "Косметичка Charlotte Tilbury сумка жіноча",
        "bodyHtml": "<p>Фірмова стьобана оксамитова косметичка Charlotte Tilbury у відтінку Rose Gold з золотою фурнітурою та водостійкою підкладкою.</p>",
        "vendor": "Charlotte Tilbury",
        "productType": "Аксесуари та сумки",
        "tags": ["Сумки", "Аксесуари", "Charlotte Tilbury", "Косметички"],
        "price": 1499,
        "compareAtPrice": 1800,
        "images": [
            "https://lil-shop.com.ua/content/images/24/505x390l80mc0/kosmetychka-charlotte-tilbury-18342289879514.webp",
            "https://lil-shop.com.ua/content/images/24/390x390l80mc0/kosmetychka-charlotte-tilbury-62947243149201.webp",
            "https://lil-shop.com.ua/content/images/24/390x390l80mc0/kosmetychka-charlotte-tilbury-49868432513971.webp"
        ],
        "sku": "CT-BAG-ROSE",
        "variants": [{"title": "One Size", "price": 1499, "compareAtPrice": 1800, "sku": "CT-BAG-ROSE"}]
    }
]

# Curated Streetwear & Designer items from DUNE / MOLAND The Rooms
DESIGNER_PRODUCTS = [
    {
        "id": "prod-jordan-1-lost-and-found",
        "handle": "air-jordan-1-chicago-lost-and-found",
        "title": "Air Jordan 1 Retro High OG 'Chicago Lost & Found'",
        "bodyHtml": "<p>Культовий силует 1985 року у вінтажному виконанні Lost & Found. Преміальна потріскана шкіра, оригінальний колорвей Varsity Red / Black / Sail та автентична коробка зі старовинним чеком.</p>",
        "vendor": "Jordan",
        "productType": "Взуття / Кросівки",
        "tags": ["Взуття", "Кросівки", "Jordan", "Deadstock", "Хіт"],
        "price": 9800,
        "compareAtPrice": 11500,
        "images": [
            "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80",
            "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80"
        ],
        "sku": "DZ5485-612",
        "variants": [
            {"title": "EU 41 (26.0 cm)", "price": 9800, "sku": "DZ5485-612-41"},
            {"title": "EU 42 (26.5 cm)", "price": 9800, "sku": "DZ5485-612-42"},
            {"title": "EU 42.5 (27.0 cm)", "price": 9800, "sku": "DZ5485-612-425"},
            {"title": "EU 43 (27.5 cm)", "price": 9800, "sku": "DZ5485-612-43"},
            {"title": "EU 44 (28.0 cm)", "price": 9800, "sku": "DZ5485-612-44"}
        ]
    },
    {
        "id": "prod-stussy-basic-hoodie-black",
        "handle": "stussy-basic-applique-hoodie-black",
        "title": "Stüssy Basic Applique Hoodie 'Black'",
        "bodyHtml": "<p>Класичне важке худі від каліфорнійського бренду Stüssy з фірмовим вишитим логотипом на грудях. Щільна бавовна 380 gsm з м'яким начосом.</p>",
        "vendor": "Stüssy",
        "productType": "Одяг / Худі та світшоти",
        "tags": ["Одяг", "Худі", "Stüssy", "Streetwear", "ТОП"],
        "price": 5400,
        "compareAtPrice": 6200,
        "images": [
            "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80"
        ],
        "sku": "STU-HD-BLK",
        "variants": [
            {"title": "S (Oversize)", "price": 5400, "sku": "STU-HD-BLK-S"},
            {"title": "M (Oversize)", "price": 5400, "sku": "STU-HD-BLK-M"},
            {"title": "L (Oversize)", "price": 5400, "sku": "STU-HD-BLK-L"},
            {"title": "XL (Oversize)", "price": 5400, "sku": "STU-HD-BLK-XL"}
        ]
    },
    {
        "id": "prod-newbalance-1906r-silver",
        "handle": "new-balance-1906r-silver-metallic",
        "title": "New Balance 1906R 'Silver Metallic / Cordura'",
        "bodyHtml": "<p>Сучасна класика бігового ретро-стилю 2000-х. Амортизаційна підошва N-ergy та вставки ABZORB SBS забезпечують неперевершений комфорт протягом усього дня.</p>",
        "vendor": "New Balance",
        "productType": "Взуття / Кросівки",
        "tags": ["Взуття", "Кросівки", "New Balance", "Ретро-ранери"],
        "price": 6900,
        "compareAtPrice": 7800,
        "images": [
            "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80"
        ],
        "sku": "M1906R-SLV",
        "variants": [
            {"title": "EU 41.5 (26.0 cm)", "price": 6900, "sku": "NB1906-415"},
            {"title": "EU 42 (26.5 cm)", "price": 6900, "sku": "NB1906-42"},
            {"title": "EU 43 (27.5 cm)", "price": 6900, "sku": "NB1906-43"},
            {"title": "EU 44 (28.0 cm)", "price": 6900, "sku": "NB1906-44"}
        ]
    },
    {
        "id": "prod-carhartt-double-knee-pant",
        "handle": "carhartt-wip-double-knee-pant-hamilton-brown",
        "title": "Carhartt WIP Double Knee Pant 'Hamilton Brown'",
        "bodyHtml": "<p>Культові робочі штани зі щільного органічного канвасу Dearborn Canvas (12 oz). Подвійний шар тканини на колінах з металевими заклепками.</p>",
        "vendor": "Carhartt WIP",
        "productType": "Одяг / Штани та джинси",
        "tags": ["Одяг", "Штани", "Carhartt WIP", "Workwear"],
        "price": 4800,
        "compareAtPrice": 5600,
        "images": [
            "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80"
        ],
        "sku": "I029196-HZ",
        "variants": [
            {"title": "W30 / L32", "price": 4800, "sku": "CAR-DK-30"},
            {"title": "W32 / L32", "price": 4800, "sku": "CAR-DK-32"},
            {"title": "W34 / L32", "price": 4800, "sku": "CAR-DK-34"}
        ]
    },
    {
        "id": "prod-salomon-xt6-black",
        "handle": "salomon-xt-6-black-phantom",
        "title": "Salomon XT-6 'Black / Phantom'",
        "bodyHtml": "<p>Ультимативна трейлова пара у стилі gorpcore. Система швидкого шнурування Quicklace, шасі ACS для стабільності та чіпка підошва Mud Contagrip.</p>",
        "vendor": "Salomon",
        "productType": "Взуття / Кросівки",
        "tags": ["Взуття", "Кросівки", "Salomon", "Gorpcore"],
        "price": 8200,
        "compareAtPrice": 9400,
        "images": [
            "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80"
        ],
        "sku": "L41086600",
        "variants": [
            {"title": "EU 42 (26.5 cm)", "price": 8200, "sku": "SAL-XT6-42"},
            {"title": "EU 43 (27.5 cm)", "price": 8200, "sku": "SAL-XT6-43"},
            {"title": "EU 44 (28.0 cm)", "price": 8200, "sku": "SAL-XT6-44"}
        ]
    },
    {
        "id": "prod-supreme-box-logo-crewneck",
        "handle": "supreme-box-logo-crewneck-heather-grey",
        "title": "Supreme Box Logo Crewneck 'Heather Grey'",
        "bodyHtml": "<p>Справжня ікона нью-йоркського стрітвіру. Фірмовий вишитий логотип Box Logo на грудях, надщільний важкий фліс Crossgrain та ребристі манжети.</p>",
        "vendor": "Supreme",
        "productType": "Одяг / Худі та світшоти",
        "tags": ["Одяг", "Світшот", "Supreme", "Box Logo", "Дроп"],
        "price": 7500,
        "compareAtPrice": 8900,
        "images": [
            "https://images.unsplash.com/photo-1578587018452-892bacefd3f2?w=800&auto=format&fit=crop&q=80"
        ],
        "sku": "SUP-BOGO-GRY",
        "variants": [
            {"title": "M (Regular/Oversize)", "price": 7500, "sku": "SUP-BOGO-M"},
            {"title": "L (Regular/Oversize)", "price": 7500, "sku": "SUP-BOGO-L"}
        ]
    },
    {
        "id": "prod-stone-island-soft-shell",
        "handle": "stone-island-soft-shell-r-jacket-black",
        "title": "Stone Island Soft Shell-R Jacket 'Black'",
        "bodyHtml": "<p>Високотехнологічна куртка з 2-шарового водостійкого та вітрозахисного еластичного матеріалу Soft Shell-R. Знімний автентичний патч компаса на лівому рукаві.</p>",
        "vendor": "Stone Island",
        "productType": "Одяг / Куртки та верхній одяг",
        "tags": ["Одяг", "Куртки", "Stone Island", "Технічний одяг"],
        "price": 17800,
        "compareAtPrice": 21000,
        "images": [
            "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80"
        ],
        "sku": "771540927-V0029",
        "variants": [
            {"title": "M (Regular)", "price": 17800, "sku": "SI-SOFTSHELL-M"},
            {"title": "L (Regular)", "price": 17800, "sku": "SI-SOFTSHELL-L"}
        ]
    },
    {
        "id": "prod-stussy-8ball-tee-white",
        "handle": "stussy-8-ball-heavyweight-tee-white",
        "title": "Stüssy 8 Ball Heavyweight T-Shirt 'White'",
        "bodyHtml": "<p>Легендарна футболка з графікою культової вісімки 8-Ball на спині та логотипом Stüssy на грудях. 100% щільна чесана бавовна.</p>",
        "vendor": "Stüssy",
        "productType": "Одяг / Футболки",
        "tags": ["Одяг", "Футболки", "Stüssy", "Графіка"],
        "price": 2400,
        "compareAtPrice": 2900,
        "images": [
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80"
        ],
        "sku": "STU-8BALL-WHT",
        "variants": [
            {"title": "M (Boxy fit)", "price": 2400, "sku": "STU-8BALL-M"},
            {"title": "L (Boxy fit)", "price": 2400, "sku": "STU-8BALL-L"}
        ]
    },
    {
        "id": "prod-jacquemus-le-chiquito-moyen",
        "handle": "jacquemus-le-chiquito-moyen-black",
        "title": "Jacquemus Le Chiquito Moyen Leather Bag 'Black'",
        "bodyHtml": "<p>Еталон паризького мінімалізму від Симона Порта Жакмюса. Гладка натуральна теляча шкіра, фірмова видовжена ручка та золотий металевий логотип.</p>",
        "vendor": "Jacquemus",
        "productType": "Сумки / Кросбоді",
        "tags": ["Сумки", "Аксесуари", "Jacquemus", "Люкс"],
        "price": 19800,
        "compareAtPrice": 23500,
        "images": [
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80"
        ],
        "sku": "JACQ-CHIQ-BLK",
        "variants": [{"title": "One Size", "price": 19800, "sku": "JACQ-CHIQ-BLK"}]
    },
    {
        "id": "prod-ami-paris-ami-de-coeur-sweatshirt",
        "handle": "ami-paris-ami-de-coeur-sweatshirt-black",
        "title": "AMI Paris Ami de Coeur Sweatshirt 'Noir / Red'",
        "bodyHtml": "<p>Французький преміальний світшот з культовою червоною вишивкою Ami de Coeur. М'яка органічна бавовна петлястого плетіння.</p>",
        "vendor": "AMI Paris",
        "productType": "Одяг / Худі та світшоти",
        "tags": ["Одяг", "Світшот", "AMI Paris", "Паризький стиль"],
        "price": 9200,
        "compareAtPrice": 10800,
        "images": [
            "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80"
        ],
        "sku": "AMI-COEUR-BLK",
        "variants": [
            {"title": "M (Regular fit)", "price": 9200, "sku": "AMI-COEUR-BLK-M"},
            {"title": "L (Regular fit)", "price": 9200, "sku": "AMI-COEUR-BLK-L"}
        ]
    },
    {
        "id": "prod-ganni-graphic-tee-white",
        "handle": "ganni-graphic-organic-cotton-tee-white",
        "title": "Ganni Graphic Organic Cotton T-Shirt 'Bright White'",
        "bodyHtml": "<p>Скандинавський шик від копенгагенського бренду Ganni. Розслаблений силует, 100% органічна сертифікована бавовна та фірмовий принт.</p>",
        "vendor": "Ganni",
        "productType": "Одяг / Футболки",
        "tags": ["Одяг", "Футболки", "Ganni", "Копенгаген"],
        "price": 3600,
        "compareAtPrice": 4200,
        "images": [
            "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80"
        ],
        "sku": "T3190-100",
        "variants": [
            {"title": "S (Relaxed)", "price": 3600, "sku": "GAN-TEE-S"},
            {"title": "M (Relaxed)", "price": 3600, "sku": "GAN-TEE-M"}
        ]
    },
    {
        "id": "prod-breda-jane-watch-gold",
        "handle": "breda-jane-1741-mesh-watch-champagne",
        "title": "Breda Jane 1741 Gold Mesh Watch 'Champagne'",
        "bodyHtml": "<p>Вишуканий вінтажний годинник з ювелірним міланським плетінням ремінця. Корпус із позолоченої нержавіючої сталі 23 мм та надійний японський кварцовий механізм Miyota.</p>",
        "vendor": "Breda",
        "productType": "Аксесуари / Годинники",
        "tags": ["Аксесуари", "Годинники", "Breda", "Вінтаж"],
        "price": 6800,
        "compareAtPrice": 7900,
        "images": [
            "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80"
        ],
        "sku": "BREDA-1741-GLD",
        "variants": [{"title": "One Size (Регульований)", "price": 6800, "sku": "BREDA-1741-GLD"}]
    }
]

ALL_PRODUCTS = BEAUTY_PRODUCTS + DESIGNER_PRODUCTS

# Fill default fields for all products
for p in ALL_PRODUCTS:
    p["featuredImage"] = p["images"][0]
    p["available"] = True
    if not p.get("variants"):
        p["variants"] = [{"id": f"v-{p['id']}-0", "title": "Default Title", "price": p["price"], "compareAtPrice": p.get("compareAtPrice"), "sku": p.get("sku", "")}]
    else:
        for idx, v in enumerate(p["variants"]):
            if "id" not in v:
                v["id"] = f"v-{p['id']}-{idx}"

print(f"Total products generated: {len(ALL_PRODUCTS)}")
print(f"Beauty products count: {len(BEAUTY_PRODUCTS)}")
print(f"Designer products count: {len(DESIGNER_PRODUCTS)}")

# Write to src/lib/sample-data.ts
with open("src/lib/sample-data.ts", "w", encoding="utf-8") as f:
    f.write('import { Product } from "../types";\n\n')
    f.write('export const SAMPLE_PRODUCTS: Product[] = ')
    f.write(json.dumps(ALL_PRODUCTS, indent=2, ensure_ascii=False))
    f.write(';\n\n')
    
    # Also export SAMPLE_SHOPIFY_CSV string for tests
    f.write('export const SAMPLE_SHOPIFY_CSV = `Handle,Title,Body (HTML),Vendor,Product Category,Type,Tags,Published,Option1 Name,Option1 Value,Variant SKU,Variant Price,Variant Compare At Price,Image Src,Status\n')
    for p in ALL_PRODUCTS:
        first_img = p["images"][0] if p["images"] else ""
        v = p["variants"][0]
        f.write(f'"{p["handle"]}","{p["title"]}","{p["bodyHtml"].replace(chr(34), chr(39))}","{p["vendor"]}","{p["productType"]}","{p["productType"]}","{", ".join(p["tags"])}",true,"Size","{v["title"]}","{v.get("sku","")}","{v["price"]}","{v.get("compareAtPrice","")}","{first_img}","active"\n')
    f.write('`;\n')

print("✓ Successfully updated src/lib/sample-data.ts")

# Write to data/imported-catalog.csv (Shopify format with ALL rows populated)
with open("data/imported-catalog.csv", "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow([
        "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type",
        "Tags", "Published", "Option1 Name", "Option1 Value", "Variant SKU",
        "Variant Price", "Variant Compare At Price", "Image Src", "Status"
    ])
    
    # Write all beauty products with all their images as secondary rows
    for p in BEAUTY_PRODUCTS:
        first = True
        for img_idx, img in enumerate(p["images"]):
            if first:
                v = p["variants"][0]
                writer.writerow([
                    p["handle"],
                    p["title"],
                    p["bodyHtml"],
                    p["vendor"],
                    p["productType"],
                    p["productType"],
                    ", ".join(p["tags"]),
                    "true",
                    "Title",
                    v["title"],
                    v.get("sku", ""),
                    str(v["price"]),
                    str(v.get("compareAtPrice", "")),
                    img,
                    "active"
                ])
                first = False
            else:
                writer.writerow([
                    p["handle"],
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    "",
                    img,
                    ""
                ])

print("✓ Successfully updated data/imported-catalog.csv with all active, priced products and gallery rows!")
