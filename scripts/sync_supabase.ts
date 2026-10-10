import fs from 'node:fs';
import path from 'node:path';

// Load .env
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

import { getSupabaseClient, productToRow, STORE_ID } from '../src/lib/supabase.ts';
import { SAMPLE_PRODUCTS } from '../src/lib/sample-data.ts';

async function sync() {
  const client = getSupabaseClient();
  if (!client) {
    console.error('Supabase client not initialized');
    process.exit(1);
  }

  console.log(`Syncing ${SAMPLE_PRODUCTS.length} products to Supabase (store_id="${STORE_ID}")...`);

  const rows = SAMPLE_PRODUCTS.map((p) => productToRow(p, STORE_ID));

  // Upsert in batches of 20
  for (let i = 0; i < rows.length; i += 20) {
    const batch = rows.slice(i, i + 20);
    const { error } = await client.from('products').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Batch ${Math.floor(i / 20) + 1} error:`, error);
      process.exit(1);
    }
    console.log(`✓ Batch ${Math.floor(i / 20) + 1} synced (${batch.length} items)`);
  }

  const { count, error: countErr } = await client
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('store_id', STORE_ID);

  if (countErr) {
    console.error('Count error:', countErr);
  } else {
    console.log(`🎉 Supabase products count for "${STORE_ID}": ${count}`);
  }
}

sync().catch((e) => {
  console.error('Sync failure:', e);
  process.exit(1);
});
