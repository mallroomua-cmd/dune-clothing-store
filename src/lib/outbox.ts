import { dbGet, dbSet } from './db';

const OUTBOX_KEY = 'shopify_pending_orders';

export async function sendOrderPayload(payload: any): Promise<boolean> {
  try {
    const res = await fetch('/api/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function enqueuePendingOrder(payload: any): Promise<void> {
  const queue = (await dbGet<any[]>(OUTBOX_KEY)) || [];
  if (!queue.some((item) => item.orderId === payload.orderId)) {
    queue.push(payload);
  }
  await dbSet(OUTBOX_KEY, queue);
}

export async function flushOutbox(): Promise<void> {
  const queue = (await dbGet<any[]>(OUTBOX_KEY)) || [];
  if (!queue.length) return;

  const remaining: any[] = [];
  for (const order of queue) {
    const ok = await sendOrderPayload(order);
    if (!ok) remaining.push(order);
  }
  await dbSet(OUTBOX_KEY, remaining);
}

export function startOutboxWorker(): () => void {
  flushOutbox();
  const handleOnline = () => flushOutbox();
  window.addEventListener('online', handleOnline);
  const interval = setInterval(flushOutbox, 45_000);

  return () => {
    window.removeEventListener('online', handleOnline);
    clearInterval(interval);
  };
}
