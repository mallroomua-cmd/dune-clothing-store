import assert from 'node:assert';
import {
  isTelegramWebApp,
  getTelegramUser,
  hapticImpact,
  hapticNotification,
  hapticSelection,
} from '../src/lib/telegram-webapp.ts';
import {
  calculateBundlePricing,
  getComplementaryProduct,
  getBeautyBadges,
} from '../src/lib/bundle-synergy.ts';
import { buildAdminDashboardInlineKeyboard } from '../src/lib/telegram-bot-core.ts';
import { Product } from '../src/types/index.ts';

console.log('Testing Pareto High-Impact Features...');

// 1. Telegram WebApp Degradation and Mock Tests
console.log('1. Testing Telegram WebApp SDK bindings & graceful degradation...');

// Outside Telegram environment (Node.js)
assert.strictEqual(isTelegramWebApp(), false, 'isTelegramWebApp should return false in Node');
assert.strictEqual(getTelegramUser(), null, 'getTelegramUser should return null when outside Telegram');

// Calling haptic feedback without window should not throw
assert.doesNotThrow(() => hapticImpact('light'));
assert.doesNotThrow(() => hapticNotification('success'));
assert.doesNotThrow(() => hapticSelection());

// Mock window.Telegram
const mockUser = {
  id: 8377628706,
  first_name: 'Erik',
  last_name: 'Shulim',
  username: 'erikshulim',
};

let lastImpact = '';
let lastNotification = '';

(globalThis as any).window = {
  Telegram: {
    WebApp: {
      ready: () => {},
      expand: () => {},
      close: () => {},
      initData: 'query_id=AA...',
      initDataUnsafe: {
        user: mockUser,
      },
      HapticFeedback: {
        impactOccurred: (style: string) => {
          lastImpact = style;
        },
        notificationOccurred: (type: string) => {
          lastNotification = type;
        },
        selectionChanged: () => {},
      },
    },
  },
};

assert.strictEqual(isTelegramWebApp(), true, 'isTelegramWebApp should return true when WebApp is injected');
const user = getTelegramUser();
assert.ok(user, 'User should be extracted from Telegram WebApp');
assert.strictEqual(user?.id, 8377628706);
assert.strictEqual(user?.fullName, 'Erik Shulim');
assert.strictEqual(user?.username, 'erikshulim');

hapticImpact('medium');
assert.strictEqual(lastImpact, 'medium', 'hapticImpact should invoke impactOccurred');

hapticNotification('success');
assert.strictEqual(lastNotification, 'success', 'hapticNotification should invoke notificationOccurred');

delete (globalThis as any).window;
console.log('✓ Telegram WebApp SDK tests passed successfully!');

// 2. Bundle Synergy & 10% Discount Math Tests
console.log('2. Testing Bundle Synergy & Pricing calculations...');

const dummyRhodeLip: Product = {
  id: 'rhode-lip-toast',
  title: 'Rhode Peptide Lip Tint - Toast',
  price: 1350,
  compareAtPrice: 1500,
  featuredImage: 'https://images.unsplash.com/rhode-lip.jpg',
  images: ['https://images.unsplash.com/rhode-lip.jpg'],
  productType: 'Декоративна косметика',
  vendor: 'Rhode Skin',
  tags: ['rhode', 'lip', 'tint', 'bestseller'],
  variants: [{ id: 'v1', title: 'Toast', price: 1350, available: true }],
  available: true,
  description: 'Пептидний тінт',
  category: 'Декоративна косметика',
};

const dummyRhodeBlush: Product = {
  id: 'rhode-blush-freckle',
  title: 'Rhode Pocket Blush - Freckle',
  price: 1550,
  compareAtPrice: 1700,
  featuredImage: 'https://images.unsplash.com/rhode-blush.jpg',
  images: ['https://images.unsplash.com/rhode-blush.jpg'],
  productType: 'Декоративна косметика',
  vendor: 'Rhode Skin',
  tags: ['rhode', 'blush', 'pocket'],
  variants: [{ id: 'v2', title: 'Freckle', price: 1550, available: true }],
  available: true,
  description: 'Кремові румʼяна',
  category: 'Декоративна косметика',
};

const dummyStreetwearHoodie: Product = {
  id: 'ami-paris-hoodie',
  title: 'AMI Paris Ami de Coeur Heavyweight Hoodie',
  price: 7800,
  compareAtPrice: 9200,
  featuredImage: 'https://images.unsplash.com/ami.jpg',
  images: ['https://images.unsplash.com/ami.jpg'],
  productType: 'Худі',
  vendor: 'AMI Paris',
  tags: ['ami', 'hoodie', 'paris'],
  variants: [{ id: 'v3', title: 'L', price: 7800, available: true }],
  available: true,
  description: 'Худі з серцем',
  category: 'Одяг',
};

const catalog = [dummyRhodeLip, dummyRhodeBlush, dummyStreetwearHoodie];

// Test Complementary Pairing
const pairedWithLip = getComplementaryProduct(dummyRhodeLip, catalog);
assert.ok(pairedWithLip, 'Should find complement for Rhode Lip Tint');
assert.strictEqual(pairedWithLip?.id, 'rhode-blush-freckle', 'Rhode Lip Tint should pair with Rhode Pocket Blush');

// Test Bundle Pricing Math
const bundle = calculateBundlePricing(dummyRhodeLip, dummyRhodeBlush, 10);
assert.strictEqual(bundle.originalTotal, 1350 + 1550, 'Original total must be sum of prices (2900)');
assert.strictEqual(bundle.discountAmount, 290, 'Discount must be 10% of 2900 = 290');
assert.strictEqual(bundle.bundlePrice, 2610, 'Bundle price must be 2900 - 290 = 2610');
assert.strictEqual(bundle.discountPercent, 10);
assert.ok(bundle.savingsLabel.includes('290'), 'Savings label should highlight 290 ₴');
console.log('✓ Bundle Synergy & Pricing calculations verified!');

// 3. Beauty Classification Badges vs Streetwear
console.log('3. Testing Beauty Badges classification...');

const beautyResult = getBeautyBadges(dummyRhodeLip);
assert.strictEqual(beautyResult.isBeauty, true, 'Rhode item must be detected as beauty');
assert.ok(beautyResult.badges.some((b) => b.includes('PEPTIDE') || b.includes('GLOSS')), 'Lip item must have lip peptide badge');

const streetwearResult = getBeautyBadges(dummyStreetwearHoodie);
assert.strictEqual(streetwearResult.isBeauty, false, 'AMI Paris hoodie must not be beauty');
console.log('✓ Beauty badges classification verified!');

// 4. Telegram Bot Core WebApp Button
console.log('4. Testing Telegram Bot Core WebApp inline keyboard...');

const keyboard = buildAdminDashboardInlineKeyboard('https://v0-luxury-fashion-homepage.vercel.app');
assert.ok(keyboard.inline_keyboard.length >= 3, 'Keyboard should have at least 3 rows');
const webAppBtn = keyboard.inline_keyboard[0][0];
assert.ok(webAppBtn.web_app, 'First button should have web_app property');
assert.strictEqual(webAppBtn.web_app?.url, 'https://v0-luxury-fashion-homepage.vercel.app');
console.log('✓ Telegram Bot Core WebApp keyboard verified!');

console.log('\n★ ALL PARETO HIGH-IMPACT OPTIMIZATION TESTS PASSED PERFECTLY!\n');
