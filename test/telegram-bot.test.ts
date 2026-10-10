import assert from 'node:assert';
import {
  buildOrderInlineKeyboard,
  buildOrderSummaryCard,
  processTelegramUpdate,
  TelegramUpdate,
  TelegramBotConfig,
} from '../src/lib/telegram-bot-core.ts';
import { StoredOrder, Product } from '../src/types/index.ts';

async function runTests() {
  console.log('Testing Telegram Bot Interactive Core & Handlers...');

  const sampleOrder: StoredOrder = {
    id: 'ord-test-101',
    orderId: 'M-101',
    name: 'Марія Коваль',
    phone: '+380 (93) 123-45-67',
    city: 'Львів',
    warehouse: 'Відділення №5',
    deliveryMethod: 'nova_poshta',
    paymentMethod: 'cash_on_delivery',
    notes: 'Швидка доставка',
    items: [
      {
        product: {
          id: 'p-1',
          handle: 'jacquemus-le-chiquito',
          title: 'Сумка Jacquemus Le Chiquito',
          bodyHtml: '',
          vendor: 'Jacquemus',
          productType: 'Сумки',
          tags: ['Сумка'],
          price: 18500,
          images: [],
          featuredImage: '',
          available: true,
          variants: [],
        },
        quantity: 1,
      },
    ],
    total: 18500,
    date: '10.10.2026, 17:00',
    createdAt: Date.now(),
    status: 'new',
  };

  // 1. Test buildOrderInlineKeyboard
  const keyboard = buildOrderInlineKeyboard(sampleOrder);
  assert.ok(Array.isArray(keyboard.inline_keyboard), 'Must have inline_keyboard rows');
  assert.strictEqual(keyboard.inline_keyboard.length, 2, 'Should have 2 rows of buttons');

  const actionRow = keyboard.inline_keyboard[0];
  assert.strictEqual(actionRow[0].text, '✅ Підтвердити');
  assert.strictEqual(actionRow[0].callback_data, 'status:confirmed:M-101');
  assert.strictEqual(actionRow[1].text, '📦 Відправлено');
  assert.strictEqual(actionRow[1].callback_data, 'status:shipped:M-101');
  assert.strictEqual(actionRow[2].text, '❌ Скасувати');
  assert.strictEqual(actionRow[2].callback_data, 'status:cancelled:M-101');

  const contactRow = keyboard.inline_keyboard[1];
  assert.ok(contactRow.some((b) => b.text.includes('Telegram') && b.url?.includes('380931234567')), 'Should have client Telegram url');

  // 2. Test buildOrderSummaryCard
  const summary = buildOrderSummaryCard(sampleOrder);
  const normalizedSummary = summary.replace(/[\s\u00A0\u202F]+/g, ' ');
  assert.ok(normalizedSummary.includes('M-101'), 'Summary should contain orderId');
  assert.ok(normalizedSummary.includes('Марія Коваль'), 'Summary should contain customer name');
  assert.ok(normalizedSummary.includes('18 500 ₴') || normalizedSummary.includes('18500'), 'Summary should contain total amount');
  assert.ok(normalizedSummary.includes('Jacquemus'), 'Summary should contain product details');

  // Mock store repository for bot handler testing
  const ordersDatabase: StoredOrder[] = [sampleOrder];
  const productsDatabase: Product[] = [sampleOrder.items[0].product];

  const botConfig: TelegramBotConfig = {
    botToken: '123456:ABC-DEF-MOCK',
    allowedChatIds: ['12345678'],
    storeId: 'dune',
    dataProvider: {
      async getOrders() {
        return ordersDatabase;
      },
      async updateOrderStatus(orderId, status) {
        const ord = ordersDatabase.find((o) => o.orderId === orderId || o.id === orderId);
        if (ord) ord.status = status;
      },
      async updateOrderTtn(orderId, ttn) {
        const ord = ordersDatabase.find((o) => o.orderId === orderId || o.id === orderId);
        if (ord) {
          ord.ttn = ttn;
          ord.status = 'shipped';
        }
      },
      async getProducts() {
        return productsDatabase;
      },
    },
  };

  // 3. Test /start command
  const startUpdate: TelegramUpdate = {
    update_id: 1,
    message: {
      message_id: 10,
      chat: { id: 12345678 },
      from: { id: 12345678, username: 'shop_admin' },
      text: '/start',
      date: Math.floor(Date.now() / 1000),
    },
  };

  const startResponse = await processTelegramUpdate(startUpdate, botConfig);
  assert.ok(startResponse, 'Should return a response for /start');
  assert.ok(startResponse.text?.includes('DUNE / MOLAND') || startResponse.text?.includes('Панель керування'), 'Welcome message content');
  assert.ok(startResponse.reply_markup, 'Should provide menu keyboard');

  // 4. Test /stats command
  const statsUpdate: TelegramUpdate = {
    update_id: 2,
    message: {
      message_id: 11,
      chat: { id: 12345678 },
      from: { id: 12345678, username: 'shop_admin' },
      text: '/stats',
      date: Math.floor(Date.now() / 1000),
    },
  };

  const statsResponse = await processTelegramUpdate(statsUpdate, botConfig);
  assert.ok(statsResponse, 'Should return stats response');
  assert.ok(statsResponse.text?.includes('СТАТИСТИКА') || statsResponse.text?.includes('Оборот'), 'Stats header');
  const normalizedStats = (statsResponse.text || '').replace(/[\s\u00A0\u202F]+/g, ' ');
  assert.ok(normalizedStats.includes('18 500') || normalizedStats.includes('18500'), 'Stats should show turnover');

  // 5. Test /orders command
  const ordersUpdate: TelegramUpdate = {
    update_id: 3,
    message: {
      message_id: 12,
      chat: { id: 12345678 },
      from: { id: 12345678, username: 'shop_admin' },
      text: '/orders',
      date: Math.floor(Date.now() / 1000),
    },
  };

  const ordersResponse = await processTelegramUpdate(ordersUpdate, botConfig);
  assert.ok(ordersResponse, 'Should return orders response');
  assert.ok(ordersResponse.text?.includes('M-101'), 'Orders response should list active order');

  // 6. Test Callback Query: status confirmation
  const callbackConfirm: TelegramUpdate = {
    update_id: 4,
    callback_query: {
      id: 'cb-1',
      from: { id: 12345678, username: 'shop_admin' },
      message: {
        message_id: 50,
        chat: { id: 12345678 },
        text: 'Order text',
        date: Math.floor(Date.now() / 1000),
      },
      data: 'status:confirmed:M-101',
    },
  };

  const callbackResponse = await processTelegramUpdate(callbackConfirm, botConfig);
  assert.ok(callbackResponse, 'Should return callback response');
  assert.strictEqual(ordersDatabase[0].status, 'confirmed', 'Database order status should be updated to confirmed');
  assert.ok(callbackResponse.callbackQueryAnswer?.text.includes('підтверджено'), 'Answer callback with success alert');
  assert.ok(callbackResponse.editMessage?.text.includes('ПІДТВЕРДЖЕНО'), 'Message should be edited with confirmed badge');

  // 7. Test /ttn command
  const ttnUpdate: TelegramUpdate = {
    update_id: 5,
    message: {
      message_id: 13,
      chat: { id: 12345678 },
      from: { id: 12345678, username: 'shop_admin' },
      text: '/ttn M-101 20450999888777',
      date: Math.floor(Date.now() / 1000),
    },
  };

  const ttnResponse = await processTelegramUpdate(ttnUpdate, botConfig);
  assert.ok(ttnResponse, 'Should return response for /ttn command');
  assert.strictEqual(ordersDatabase[0].ttn, '20450999888777', 'TTN should be saved to order');
  assert.strictEqual(ordersDatabase[0].status, 'shipped', 'Order should transition to shipped');
  assert.ok(ttnResponse.text?.includes('20450999888777'), 'Response should mention TTN number');

  console.log('✓ All Telegram Bot Interactive Core & Handlers tests passed successfully!');
}

runTests().catch((err) => {
  console.error('Telegram Bot test failure:', err);
  process.exit(1);
});
