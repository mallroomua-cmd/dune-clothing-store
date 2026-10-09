import { OrderDetails } from '../types';

/**
 * Sends order notification directly to Telegram manager bot/channel
 */
export async function sendTelegramOrderNotification(
  order: OrderDetails,
  botToken: string,
  chatId: string
): Promise<{ success: boolean; error?: string }> {
  if (!botToken.trim() || !chatId.trim()) {
    return { success: false, error: 'Telegram Bot Token або Chat ID не налаштовані' };
  }

  const itemsList = order.items
    .map(
      (item, idx) =>
        `${idx + 1}. <b>${item.product.title}</b>\n   • Кількість: ${item.quantity} шт.\n   • Ціна: ${item.product.price.toLocaleString('uk-UA')} ₴`
    )
    .join('\n\n');

  const deliveryName =
    order.deliveryMethod === 'nova_poshta'
      ? '📦 Нова Пошта'
      : order.deliveryMethod === 'ukrposhta'
      ? '📫 Укрпошта'
      : '🚚 Кур’єр';

  const paymentName =
    order.paymentMethod === 'cash_on_delivery'
      ? '💵 Накладений платіж (при отриманні)'
      : '💳 Оплата картою';

  const message =
    `🔥 <b>НОВЕ ЗАМОВЛЕННЯ З САЙТУ</b>\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 <b>Клієнт:</b> ${order.name}\n` +
    `📞 <b>Телефон:</b> <a href="tel:${order.phone}">${order.phone}</a>\n` +
    `📍 <b>Місто:</b> ${order.city}\n` +
    `🏢 <b>Відділення/адреса:</b> ${order.warehouse || 'Уточнюється'}\n` +
    `🚚 <b>Служба доставки:</b> ${deliveryName}\n` +
    `💳 <b>Спосіб оплати:</b> ${paymentName}\n` +
    `${order.notes ? `💬 <b>Коментар:</b> <i>${order.notes}</i>\n` : ''}` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `🛍 <b>СПИСОК ТОВАРІВ:</b>\n\n${itemsList}\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 <b>РАЗОМ ДО СПЛАТИ:</b> <b>${order.total.toLocaleString('uk-UA')} ₴</b>\n` +
    `⏰ <i>Час замовлення: ${new Date().toLocaleString('uk-UA')}</i>`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await res.json();
    if (!data.ok) {
      return { success: false, error: data.description || 'Помилка Telegram API' };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Мережева помилка при зверненні до Telegram' };
  }
}
