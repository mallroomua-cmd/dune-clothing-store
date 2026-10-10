import { StoredOrder, OrderStatus, Product } from '../types/index.ts';
import {
  escTelegramHtml,
  clipText,
  buildOrderInlineKeyboard,
  TelegramInlineMarkup as TelegramInlineKeyboardMarkup,
  TelegramInlineButton as TelegramInlineKeyboardButton,
} from './telegram.ts';

export { buildOrderInlineKeyboard };
export type { TelegramInlineKeyboardMarkup, TelegramInlineKeyboardButton };

export interface TelegramReplyKeyboardMarkup {
  keyboard: Array<Array<{ text: string }>>;
  resize_keyboard?: boolean;
  one_time_keyboard?: boolean;
}

export interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    chat: { id: number | string };
    from?: { id: number | string; username?: string; first_name?: string };
    text?: string;
    date: number;
  };
  callback_query?: {
    id: string;
    from: { id: number | string; username?: string; first_name?: string };
    message?: {
      message_id: number;
      chat: { id: number | string };
      text?: string;
      date: number;
    };
    data?: string;
  };
}

export interface TelegramDataProvider {
  getOrders: () => Promise<StoredOrder[]>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  updateOrderTtn: (orderId: string, ttn: string) => Promise<void>;
  getProducts: () => Promise<Product[]>;
}

export interface TelegramBotConfig {
  botToken: string;
  allowedChatIds?: Array<string | number>;
  storeId?: string;
  dataProvider: TelegramDataProvider;
}

export interface TelegramBotActionResponse {
  chat_id?: string | number;
  text?: string;
  parse_mode?: 'HTML' | 'Markdown';
  reply_markup?: TelegramInlineKeyboardMarkup | TelegramReplyKeyboardMarkup;
  editMessage?: {
    chat_id?: string | number;
    message_id: number;
    text: string;
    parse_mode?: 'HTML';
    reply_markup?: TelegramInlineKeyboardMarkup;
  };
  callbackQueryAnswer?: {
    callback_query_id: string;
    text: string;
    show_alert?: boolean;
  };
}

/**
 * Builds standard reply keyboard for admin command shortcuts
 */
export function buildMainMenuReplyKeyboard(): TelegramReplyKeyboardMarkup {
  return {
    keyboard: [
      [{ text: '📦 Замовлення' }, { text: '📊 Статистика' }],
      [{ text: '🏷 Товари' }, { text: 'ℹ️ Допомога' }],
    ],
    resize_keyboard: true,
  };
}

/**
 * Builds inline buttons for the /start admin dashboard
 */
export function buildAdminDashboardInlineKeyboard(): TelegramInlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        { text: '📦 Нові замовлення', callback_data: 'menu:orders' },
        { text: '📊 Статистика', callback_data: 'menu:stats' },
      ],
      [
        { text: '🏷 Товари в наявності', callback_data: 'menu:products' },
        { text: '🔄 Оновити дані', callback_data: 'menu:refresh' },
      ],
    ],
  };
}

/**
 * Formats order summary card for Telegram display
 */
export function buildOrderSummaryCard(order: StoredOrder): string {
  const statusEmoji =
    order.status === 'completed'
      ? '🟢 Виконано'
      : order.status === 'shipped'
      ? '🟣 Відправлено'
      : order.status === 'confirmed'
      ? '🔵 Підтверджено'
      : order.status === 'cancelled'
      ? '⚪ Скасовано'
      : '🟡 Нове';

  const itemsText = (order.items || [])
    .map((item, idx) => {
      const title = escTelegramHtml(clipText(item.product?.title || 'Товар', 60));
      const variant = item.selectedVariant ? ` (${escTelegramHtml(item.selectedVariant)})` : '';
      return `  ${idx + 1}. ${title}${variant} — ${item.quantity} шт.`;
    })
    .join('\n');

  return (
    `📦 <b>Замовлення #${escTelegramHtml(order.orderId)}</b> [${statusEmoji}]\n` +
    `👤 <b>Клієнт:</b> ${escTelegramHtml(order.name)} (${escTelegramHtml(order.phone)})\n` +
    `📍 <b>Доставка:</b> ${escTelegramHtml(order.city || '')}, ${escTelegramHtml(order.warehouse || '')}\n` +
    `💰 <b>Сума:</b> <b>${order.total.toLocaleString('uk-UA')} ₴</b> (${order.paymentMethod === 'card' ? 'Картка' : 'Накладений'})\n` +
    (order.ttn ? `📮 <b>ТТН:</b> <code>${escTelegramHtml(order.ttn)}</code>\n` : '') +
    `🛍 <b>Склад замовлення:</b>\n${itemsText || '  (список порожній)'}\n` +
    `⏰ <i>${order.date || new Date(order.createdAt || Date.now()).toLocaleString('uk-UA')}</i>`
  );
}

/**
 * Calculates store statistics from orders list
 */
export function calculateOrderStats(orders: StoredOrder[]) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  const totalCount = orders.length;
  const todayOrders = orders.filter((o) => (o.createdAt || 0) >= startOfToday);
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const todayRevenue = todayOrders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);
  const averageCheck = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0;

  const newCount = orders.filter((o) => o.status === 'new').length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped').length;
  const completedCount = orders.filter((o) => o.status === 'completed').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  return {
    totalCount,
    todayCount: todayOrders.length,
    totalRevenue,
    todayRevenue,
    averageCheck,
    newCount,
    confirmedCount,
    shippedCount,
    completedCount,
    cancelledCount,
  };
}

/**
 * Central processing engine for incoming Telegram Bot Updates
 */
export async function processTelegramUpdate(
  update: TelegramUpdate,
  config: TelegramBotConfig
): Promise<TelegramBotActionResponse | null> {
  const { dataProvider, allowedChatIds } = config;

  // 1. Handle Callback Query
  if (update.callback_query) {
    const cb = update.callback_query;
    const data = cb.data || '';
    const senderChatId = cb.message?.chat.id;

    if (allowedChatIds && allowedChatIds.length > 0) {
      const isAllowed = allowedChatIds.some((id) => String(id) === String(senderChatId) || String(id) === String(cb.from.id));
      if (!isAllowed) {
        return {
          callbackQueryAnswer: {
            callback_query_id: cb.id,
            text: '⛔ Немає доступу до керування магазином',
            show_alert: true,
          },
        };
      }
    }

    // Status change button clicked: status:<newStatus>:<orderId>
    if (data.startsWith('status:')) {
      const [, targetStatus, orderId] = data.split(':') as [string, OrderStatus, string];
      if (targetStatus && orderId) {
        await dataProvider.updateOrderStatus(orderId, targetStatus);

        const statusLabel =
          targetStatus === 'confirmed'
            ? '✅ ПІДТВЕРДЖЕНО'
            : targetStatus === 'shipped'
            ? '🟣 ВІДПРАВЛЕНО'
            : targetStatus === 'cancelled'
            ? '❌ СКАСОВАНО'
            : targetStatus;

        const manager = cb.from.username ? `@${cb.from.username}` : cb.from.first_name || 'Менеджер';
        const timestamp = new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

        const originalText = cb.message?.text || '';
        const updatedText =
          `${originalText}\n\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Статус оновлено: <b>${statusLabel}</b>\n` +
          `👤 Обробив: ${escTelegramHtml(manager)} о ${timestamp}`;

        return {
          callbackQueryAnswer: {
            callback_query_id: cb.id,
            text: `Замовлення #${orderId} успішно ${statusLabel.toLowerCase()}!`,
            show_alert: false,
          },
          editMessage: {
            chat_id: senderChatId,
            message_id: cb.message?.message_id || 0,
            text: updatedText,
            parse_mode: 'HTML',
          },
        };
      }
    }

    // View order details: view:<orderId>
    if (data.startsWith('view:')) {
      const orderId = data.replace('view:', '');
      const orders = await dataProvider.getOrders();
      const order = orders.find((o) => o.orderId === orderId || o.id === orderId);

      if (!order) {
        return {
          callbackQueryAnswer: {
            callback_query_id: cb.id,
            text: `Замовлення #${orderId} не знайдено`,
            show_alert: true,
          },
        };
      }

      const card = buildOrderSummaryCard(order);
      return {
        callbackQueryAnswer: {
          callback_query_id: cb.id,
          text: `Замовлення #${orderId}`,
        },
        chat_id: senderChatId,
        text: card,
        parse_mode: 'HTML',
        reply_markup: buildOrderInlineKeyboard(order),
      };
    }

    // Menu shortcuts
    if (data === 'menu:orders') {
      const orders = await dataProvider.getOrders();
      const activeOrders = orders.filter((o) => o.status === 'new' || o.status === 'confirmed').slice(0, 5);

      if (activeOrders.length === 0) {
        return {
          callbackQueryAnswer: { callback_query_id: cb.id, text: 'Немає активних замовлень' },
          chat_id: senderChatId,
          text: '✨ <b>Усі замовлення оброблені!</b>\nНаразі немає нових замовлень, які очікують відправки.',
          parse_mode: 'HTML',
        };
      }

      const listText = activeOrders.map((o) => buildOrderSummaryCard(o)).join('\n\n━━━━━━━━━━━━━━━━━━━━\n\n');
      return {
        callbackQueryAnswer: { callback_query_id: cb.id, text: `Знайдено ${activeOrders.length} замовлень` },
        chat_id: senderChatId,
        text: `📋 <b>АКТИВНІ ЗАМОВЛЕННЯ ДЛЯ ОБРОБКИ:</b>\n\n${listText}`,
        parse_mode: 'HTML',
      };
    }

    if (data === 'menu:stats') {
      const orders = await dataProvider.getOrders();
      const stats = calculateOrderStats(orders);
      const text =
        `📊 <b>СТАТИСТИКА ПРОДАЖІВ DUNE / MOLAND</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📦 <b>Всього замовлень:</b> ${stats.totalCount}\n` +
        `🔥 <b>Замовлень сьогодні:</b> ${stats.todayCount}\n` +
        `💰 <b>Оборот за сьогодні:</b> <b>${stats.todayRevenue.toLocaleString('uk-UA')} ₴</b>\n` +
        `💳 <b>Загальний оборот:</b> <b>${stats.totalRevenue.toLocaleString('uk-UA')} ₴</b>\n` +
        `📈 <b>Середній чек:</b> ${stats.averageCheck.toLocaleString('uk-UA')} ₴\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🟡 Нові: <b>${stats.newCount}</b>\n` +
        `🔵 Підтверджені: <b>${stats.confirmedCount}</b>\n` +
        `🟣 Відправлені: <b>${stats.shippedCount}</b>\n` +
        `🟢 Виконані: <b>${stats.completedCount}</b>\n` +
        `⚪ Скасовані: <b>${stats.cancelledCount}</b>`;

      return {
        callbackQueryAnswer: { callback_query_id: cb.id, text: 'Статистика оновлена' },
        chat_id: senderChatId,
        text,
        parse_mode: 'HTML',
      };
    }

    if (data === 'menu:products') {
      const products = await dataProvider.getProducts();
      const inStock = products.filter((p) => p.available !== false).length;
      const sample = products.slice(0, 5).map((p) => `• <b>${escTelegramHtml(p.title)}</b> — ${p.price.toLocaleString('uk-UA')} ₴`).join('\n');

      return {
        callbackQueryAnswer: { callback_query_id: cb.id, text: 'Каталог товарів' },
        chat_id: senderChatId,
        text:
          `🏷 <b>КАТАЛОГ ТОВАРІВ DUNE / MOLAND</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Всього товарів у базі: <b>${products.length}</b>\n` +
          `В наявності: <b>${inStock}</b>\n\n` +
          `<b>Популярні позиції:</b>\n${sample}\n\n` +
          `<i>Повний каталог та редагування цін доступні в Admin Control Hub на сайті.</i>`,
        parse_mode: 'HTML',
      };
    }

    if (data === 'menu:refresh') {
      const orders = await dataProvider.getOrders();
      const stats = calculateOrderStats(orders);
      return {
        callbackQueryAnswer: { callback_query_id: cb.id, text: 'Дані оновлено!' },
        editMessage: {
          chat_id: senderChatId,
          message_id: cb.message?.message_id || 0,
          text:
            `⚡ <b>ПАНЕЛЬ КЕРУВАННЯ DUNE / MOLAND</b>\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `Нових замовлень: <b>${stats.newCount}</b>\n` +
            `Замовлень за сьогодні: <b>${stats.todayCount}</b> (${stats.todayRevenue.toLocaleString('uk-UA')} ₴)\n` +
            `Оновлено: <i>${new Date().toLocaleTimeString('uk-UA')}</i>`,
          parse_mode: 'HTML',
          reply_markup: buildAdminDashboardInlineKeyboard(),
        },
      };
    }
  }

  // 2. Handle Text Message
  if (update.message?.text) {
    const msg = update.message;
    const text = update.message.text.trim();
    const chatId = msg.chat.id;

    if (allowedChatIds && allowedChatIds.length > 0) {
      const isAllowed = allowedChatIds.some((id) => String(id) === String(chatId) || (msg.from && String(id) === String(msg.from.id)));
      if (!isAllowed) {
        return {
          chat_id: chatId,
          text: `⛔ Ваш Telegram ID (<code>${chatId}</code>) не має доступу до керування магазином. Додайте його в налаштуваннях сайту.`,
          parse_mode: 'HTML',
        };
      }
    }

    // /start command
    if (text.startsWith('/start')) {
      const orders = await dataProvider.getOrders();
      const stats = calculateOrderStats(orders);

      const welcomeText =
        `👋 <b>Вітаємо в системі керування магазином DUNE / MOLAND!</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `Ви підключені як адміністратор магазину.\n\n` +
        `📦 <b>Нових замовлень:</b> <b>${stats.newCount}</b>\n` +
        `💰 <b>Оборот за сьогодні:</b> <b>${stats.todayRevenue.toLocaleString('uk-UA')} ₴</b>\n` +
        `📦 <b>Всього замовлень:</b> ${stats.totalCount}\n\n` +
        `Оберіть дію в меню нижче:`;

      return {
        chat_id: chatId,
        text: welcomeText,
        parse_mode: 'HTML',
        reply_markup: buildAdminDashboardInlineKeyboard(),
      };
    }

    // /orders command or "📦 Замовлення"
    if (text === '/orders' || text.includes('Замовлення')) {
      const orders = await dataProvider.getOrders();
      const activeOrders = orders.filter((o) => o.status === 'new' || o.status === 'confirmed').slice(0, 5);

      if (activeOrders.length === 0) {
        return {
          chat_id: chatId,
          text: '✨ <b>Немає активних замовлень!</b> Усі замовлення опрацьовані.',
          parse_mode: 'HTML',
          reply_markup: buildMainMenuReplyKeyboard(),
        };
      }

      const listText = activeOrders.map((o) => buildOrderSummaryCard(o)).join('\n\n━━━━━━━━━━━━━━━━━━━━\n\n');
      return {
        chat_id: chatId,
        text: `📋 <b>АКТИВНІ ЗАМОВЛЕННЯ ДЛЯ ОБРОБКИ (${activeOrders.length}):</b>\n\n${listText}`,
        parse_mode: 'HTML',
        reply_markup: buildMainMenuReplyKeyboard(),
      };
    }

    // /stats command or "📊 Статистика"
    if (text === '/stats' || text.includes('Статистика')) {
      const orders = await dataProvider.getOrders();
      const stats = calculateOrderStats(orders);

      const statsText =
        `📊 <b>СТАТИСТИКА ПРОДАЖІВ DUNE / MOLAND</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📦 <b>Всього замовлень:</b> ${stats.totalCount}\n` +
        `🔥 <b>Замовлень сьогодні:</b> ${stats.todayCount}\n` +
        `💰 <b>Оборот за сьогодні:</b> <b>${stats.todayRevenue.toLocaleString('uk-UA')} ₴</b>\n` +
        `💳 <b>Загальний оборот:</b> <b>${stats.totalRevenue.toLocaleString('uk-UA')} ₴</b>\n` +
        `📈 <b>Середній чек:</b> ${stats.averageCheck.toLocaleString('uk-UA')} ₴\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🟡 Нові: <b>${stats.newCount}</b>\n` +
        `🔵 Підтверджені: <b>${stats.confirmedCount}</b>\n` +
        `🟣 Відправлені: <b>${stats.shippedCount}</b>\n` +
        `🟢 Виконані: <b>${stats.completedCount}</b>\n` +
        `⚪ Скасовані: <b>${stats.cancelledCount}</b>`;

      return {
        chat_id: chatId,
        text: statsText,
        parse_mode: 'HTML',
        reply_markup: buildMainMenuReplyKeyboard(),
      };
    }

    // /products command or "🏷 Товари"
    if (text === '/products' || text.includes('Товари')) {
      const products = await dataProvider.getProducts();
      const inStock = products.filter((p) => p.available !== false).length;
      const sample = products.slice(0, 6).map((p) => `• <b>${escTelegramHtml(p.title)}</b> — ${p.price.toLocaleString('uk-UA')} ₴`).join('\n');

      return {
        chat_id: chatId,
        text:
          `🏷 <b>КАТАЛОГ ТОВАРІВ DUNE / MOLAND</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Всього товарів у базі: <b>${products.length}</b>\n` +
          `В наявності: <b>${inStock}</b>\n\n` +
          `<b>Популярні позиції:</b>\n${sample}`,
        parse_mode: 'HTML',
        reply_markup: buildMainMenuReplyKeyboard(),
      };
    }

    // /ttn <orderId> <ttnNumber> command
    if (text.startsWith('/ttn')) {
      const parts = text.split(/\s+/);
      if (parts.length < 3) {
        return {
          chat_id: chatId,
          text:
            `ℹ️ <b>Формат додавання ТТН:</b>\n` +
            `<code>/ttn НОМЕР_ЗАМОВЛЕННЯ НОМЕР_ТТН</code>\n\n` +
            `<i>Приклад:</i> <code>/ttn M-101 20450912345678</code>`,
          parse_mode: 'HTML',
        };
      }

      const [, orderId, ttnNumber] = parts;
      await dataProvider.updateOrderTtn(orderId, ttnNumber);

      return {
        chat_id: chatId,
        text:
          `✅ <b>ТТН успішно збережено!</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `📦 Замовлення: <b>#${escTelegramHtml(orderId)}</b>\n` +
          `📮 Номер накладної: <code>${escTelegramHtml(ttnNumber)}</code>\n` +
          `Статус замовлення оновлено на: <b>🟣 Відправлено</b>`,
        parse_mode: 'HTML',
      };
    }

    // /help or "ℹ️ Допомога"
    if (text === '/help' || text.includes('Допомога')) {
      return {
        chat_id: chatId,
        text:
          `🤖 <b>КОМАНДИ КЕРУВАННЯ МАГАЗИНОМ DUNE / MOLAND:</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `/orders — Показати активні замовлення для обробки\n` +
          `/stats — Статистика продажів, доходу та середнього чеку\n` +
          `/products — Каталог та наявність товарів\n` +
          `/ttn [№Замовлення] [ТТН] — Додати номер накладної та позначити відправленим\n` +
          `/start — Головне меню панелі керування\n\n` +
          `<i>Під кожним новим замовленням доступні кнопки швидкої зміни статусу в 1 клік!</i>`,
        parse_mode: 'HTML',
        reply_markup: buildMainMenuReplyKeyboard(),
      };
    }
  }

  return null;
}
