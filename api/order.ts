export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const order = req.body;
    if (!order || !order.orderId || !order.phone) {
      return res.status(400).json({ error: 'Invalid order payload' });
    }

    const botToken = process.env.TG_BOT_TOKEN || process.env.VITE_TG_BOT_TOKEN;
    const chatId = process.env.TG_CHAT_ID || process.env.VITE_TG_CHAT_ID;

    if (botToken && chatId) {
      const itemsText = (order.items || [])
        .map(
          (i: any, idx: number) =>
            `${idx + 1}. <b>${i.product?.title || 'Товар'}</b>\n   • Кількість: ${i.quantity} шт.\n   • Варіант: ${i.selectedVariant || 'Основний'}`
        )
        .join('\n');

      const message =
        `🔥 <b>НОВЕ ЗАМОВЛЕННЯ #${order.orderId}</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 <b>Клієнт:</b> ${order.name || 'Не вказано'}\n` +
        `📞 <b>Телефон:</b> <a href="tel:${order.phone}">${order.phone}</a>\n` +
        `📍 <b>Місто:</b> ${order.city}\n` +
        `🏢 <b>Відділення:</b> ${order.warehouse || 'Уточнюється'}\n` +
        `💳 <b>Оплата:</b> ${order.paymentMethod === 'cash_on_delivery' ? 'Накладений платіж' : 'Картка'}\n` +
        `${order.notes ? `💬 <b>Коментар:</b> ${order.notes}\n` : ''}` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `🛍 <b>Товари:</b>\n${itemsText}\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 <b>РАЗОМ: ${order.total?.toLocaleString('uk-UA')} ₴</b>`;

      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });
    }

    // Optional Google Sheets Webhook
    const sheetsWebhook = process.env.SHEETS_WEBHOOK_URL;
    if (sheetsWebhook) {
      fetch(sheetsWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      }).catch((e) => console.warn('Sheets webhook failed:', e));
    }

    return res.status(200).json({ success: true, orderId: order.orderId });
  } catch (err: any) {
    console.error('Order API error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
