import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processTelegramUpdate, TelegramUpdate, TelegramBotConfig } from '../src/lib/telegram-bot-core.ts';
import {
  fetchOrdersFromSupabase,
  updateOrderStatusInSupabase,
  updateOrderTtnInSupabase,
  fetchProductsFromSupabase,
  STORE_ID,
} from '../src/lib/supabase.ts';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: 'DUNE Telegram Webhook Endpoint active' });
  }

  const botToken = process.env.TG_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN;
  const adminChatId = process.env.TG_CHAT_ID || process.env.VITE_TELEGRAM_CHAT_ID;

  if (!botToken) {
    console.warn('[Telegram Webhook] TG_BOT_TOKEN is not set');
    return res.status(200).json({ ok: false, error: 'TG_BOT_TOKEN not configured' });
  }

  const update = req.body as TelegramUpdate;
  if (!update || !update.update_id) {
    return res.status(200).json({ ok: true });
  }

  const config: TelegramBotConfig = {
    botToken,
    allowedChatIds: adminChatId ? [adminChatId] : undefined,
    storeId: STORE_ID,
    dataProvider: {
      async getOrders() {
        return await fetchOrdersFromSupabase(STORE_ID);
      },
      async updateOrderStatus(orderId, status) {
        await updateOrderStatusInSupabase(orderId, status, STORE_ID);
      },
      async updateOrderTtn(orderId, ttn) {
        await updateOrderTtnInSupabase(orderId, ttn, STORE_ID);
        await updateOrderStatusInSupabase(orderId, 'shipped', STORE_ID);
      },
      async getProducts() {
        return await fetchProductsFromSupabase(STORE_ID);
      },
    },
  };

  try {
    const action = await processTelegramUpdate(update, config);

    if (action) {
      // 1. Answer callback query if present
      if (action.callbackQueryAnswer) {
        await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: action.callbackQueryAnswer.callback_query_id,
            text: action.callbackQueryAnswer.text,
            show_alert: action.callbackQueryAnswer.show_alert ?? false,
          }),
        }).catch((e) => console.error('[Telegram] Failed answering callback query:', e));
      }

      // 2. Edit existing message if requested
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
        }).catch((e) => console.error('[Telegram] Failed editing message:', e));
      }

      // 3. Send new message if requested
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
        }).catch((e) => console.error('[Telegram] Failed sending message:', e));
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err: unknown) {
    console.error('[Telegram Webhook Error]:', err);
    return res.status(200).json({ ok: false, error: String(err) });
  }
}
