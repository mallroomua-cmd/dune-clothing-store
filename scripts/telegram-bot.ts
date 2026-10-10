/**
 * Standalone Telegram Bot Manager for DUNE / MOLAND Store
 * Run via: npm run bot
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { processTelegramUpdate, TelegramUpdate, TelegramBotConfig } from '../src/lib/telegram-bot-core.ts';
import {
  fetchOrdersFromSupabase,
  updateOrderStatusInSupabase,
  updateOrderTtnInSupabase,
  fetchProductsFromSupabase,
  isSupabaseConfigured,
  STORE_ID,
} from '../src/lib/supabase.ts';

// Load .env manually if running via node/jiti without vite
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const idx = trimmed.indexOf('=');
        if (idx > 0) {
          const k = trimmed.slice(0, idx).trim();
          const v = trimmed.slice(idx + 1).trim();
          if (!process.env[k]) {
            process.env[k] = v;
          }
        }
      }
    }
  }
} catch {
  // ignore
}

const botToken = process.env.TG_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN || '';
const adminChatId = process.env.TG_CHAT_ID || process.env.VITE_TELEGRAM_CHAT_ID || '';

if (!botToken) {
  console.error('\n❌ [Помилка запуску Telegram Бота]');
  console.error('Будь ласка, вкажіть TG_BOT_TOKEN або VITE_TELEGRAM_BOT_TOKEN у файлі .env');
  console.error('Приклад: TG_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz\n');
  process.exit(1);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🤖 DUNE / MOLAND TELEGRAM BOT MANAGER СТАРТУВАВ');
console.log(`📡 Підключення до Supabase: ${isSupabaseConfigured() ? '✓ Підключено' : '○ Не налаштовано'}`);
console.log(`🔐 Адміністраторський Chat ID: ${adminChatId || 'Всі чати'}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const config: TelegramBotConfig = {
  botToken,
  allowedChatIds: adminChatId ? [adminChatId] : undefined,
  storeId: STORE_ID,
  dataProvider: {
    async getOrders() {
      try {
        return await fetchOrdersFromSupabase(STORE_ID);
      } catch (e) {
        console.warn('[Bot] Supabase getOrders warning:', e);
        return [];
      }
    },
    async updateOrderStatus(orderId, status) {
      await updateOrderStatusInSupabase(orderId, status, STORE_ID);
      console.log(`[Bot] Замовлення #${orderId} оновлено -> статус: ${status}`);
    },
    async updateOrderTtn(orderId, ttn) {
      await updateOrderTtnInSupabase(orderId, ttn, STORE_ID);
      await updateOrderStatusInSupabase(orderId, 'shipped', STORE_ID);
      console.log(`[Bot] Замовлення #${orderId} оновлено -> ТТН: ${ttn}`);
    },
    async getProducts() {
      try {
        return await fetchProductsFromSupabase(STORE_ID);
      } catch {
        return [];
      }
    },
  },
};

let offset = 0;
let isRunning = true;

async function pollUpdates() {
  while (isRunning) {
    try {
      const url = `https://api.telegram.org/bot${botToken}/getUpdates?offset=${offset}&timeout=20`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result as TelegramUpdate[]) {
          offset = update.update_id + 1;

          try {
            const action = await processTelegramUpdate(update, config);

            if (action) {
              if (action.callbackQueryAnswer) {
                await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    callback_query_id: action.callbackQueryAnswer.callback_query_id,
                    text: action.callbackQueryAnswer.text,
                    show_alert: action.callbackQueryAnswer.show_alert ?? false,
                  }),
                });
              }

              if (action.editMessage) {
                await fetch(`https://api.telegram.org/bot${botToken}/editMessageText`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: action.editMessage.chat_id || adminChatId,
                    message_id: action.editMessage.message_id,
                    text: action.editMessage.text,
                    parse_mode: action.editMessage.parse_mode || 'HTML',
                    reply_markup: action.editMessage.reply_markup,
                  }),
                });
              }

              if (action.text && action.chat_id) {
                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    chat_id: action.chat_id,
                    text: action.text,
                    parse_mode: action.parse_mode || 'HTML',
                    reply_markup: action.reply_markup,
                  }),
                });
              }
            }
          } catch (handlerErr) {
            console.error('[Bot Error обробки update]:', handlerErr);
          }
        }
      } else if (!data.ok) {
        console.warn('[Bot Error]:', data.description);
        await new Promise((r) => setTimeout(r, 4000));
      }
    } catch (netErr) {
      console.warn('[Bot Network Reconnect]:', netErr);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

process.on('SIGINT', () => {
  console.log('\n🛑 Зупинка Telegram бота...');
  isRunning = false;
  process.exit(0);
});

process.on('SIGTERM', () => {
  isRunning = false;
  process.exit(0);
});

pollUpdates();
