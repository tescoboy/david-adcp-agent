import { neon } from '@neondatabase/serverless';

function getDb() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

export const db = getDb();

export async function queryTenant(tenantId: string) {
  const rows = await db`SELECT tenant_id, name FROM tenants WHERE tenant_id = ${tenantId}`;
  return rows[0] ?? null;
}

export async function insertTenant(tenantId: string, name: string) {
  await db`INSERT INTO tenants (tenant_id, name) VALUES (${tenantId}, ${name})`;
}

export async function insertProduct(tenantId: string, productId: string, data: object) {
  const dataStr = JSON.stringify(data);
  await db`
    INSERT INTO products (product_id, tenant_id, data)
    VALUES (${productId}, ${tenantId}, ${dataStr}::jsonb)
    ON CONFLICT (product_id, tenant_id) DO NOTHING
  `;
}

export async function getProducts(tenantId: string) {
  const rows = await db`SELECT data FROM products WHERE tenant_id = ${tenantId}`;
  return rows.map((r) => r.data as Record<string, unknown>);
}

export async function getProduct(tenantId: string, productId: string) {
  const rows = await db`
    SELECT data FROM products WHERE product_id = ${productId} AND tenant_id = ${tenantId}
  `;
  return rows[0]?.data as Record<string, unknown> | undefined;
}

export async function insertMediaBuy(tenantId: string, mediaBuyId: string, data: object) {
  const dataStr = JSON.stringify(data);
  await db`
    INSERT INTO media_buys (media_buy_id, tenant_id, data, is_canceled)
    VALUES (${mediaBuyId}, ${tenantId}, ${dataStr}::jsonb, false)
  `;
}

export async function getMediaBuy(tenantId: string, mediaBuyId: string) {
  const rows = await db`
    SELECT data, is_canceled FROM media_buys
    WHERE media_buy_id = ${mediaBuyId} AND tenant_id = ${tenantId}
  `;
  if (!rows[0]) return null;
  return {
    data: rows[0].data as Record<string, unknown>,
    is_canceled: rows[0].is_canceled as boolean,
  };
}

export async function updateMediaBuy(mediaBuyId: string, data: object, isCanceled: boolean) {
  const dataStr = JSON.stringify(data);
  await db`
    UPDATE media_buys
    SET data = ${dataStr}::jsonb, is_canceled = ${isCanceled}
    WHERE media_buy_id = ${mediaBuyId}
  `;
}
