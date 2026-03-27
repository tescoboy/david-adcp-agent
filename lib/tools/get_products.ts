import { productsResponse } from '@adcp/client';
import { getProducts } from '../db';
import type { AdcpProduct } from '../schemas';

export async function handleGetProducts(tenantId: string) {
  // Always return all products for the tenant — never filter to empty
  const rows = await getProducts(tenantId);
  const products = rows as unknown as AdcpProduct[];
  return productsResponse({ products: products as never });
}
