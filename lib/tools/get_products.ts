import { getProducts } from '../db';

export async function handleGetProducts(tenantId: string) {
  const rows = await getProducts(tenantId);
  const payload = { products: rows };
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(payload) }],
    structuredContent: payload,
  };
}
