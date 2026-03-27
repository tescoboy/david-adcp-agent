export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { db, insertTenant, insertProduct } from '@/lib/db';
import { SEED_PRODUCTS } from '@/lib/seeds';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = body?.name;
    if (!name || typeof name !== 'string') {
      return Response.json({ error: 'name is required' }, { status: 400 });
    }

    const tenantId = `t-${crypto.randomUUID()}`;
    await insertTenant(tenantId, name);

    // Seed products for this tenant
    for (const product of SEED_PRODUCTS) {
      await insertProduct(tenantId, product.product_id, product);
    }

    const baseUrl = req.nextUrl.origin;
    return Response.json({
      tenant_id: tenantId,
      name,
      mcp_url: `${baseUrl}/api/${tenantId}/mcp`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error creating tenant:', msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const rows = await db`SELECT tenant_id, name, created_at FROM tenants ORDER BY created_at DESC`;
    return Response.json({ tenants: rows });
  } catch (err) {
    console.error('Error listing tenants:', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
