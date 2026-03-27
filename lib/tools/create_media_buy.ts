import { adcpError, mediaBuyResponse } from '@adcp/client';
import { getProduct, insertMediaBuy } from '../db';
import type { AdcpMediaBuy, AdcpPackage } from '../schemas';

interface PackageInput {
  product_id: string;
  pricing_option_id: string;
  budget: number;
  [key: string]: unknown;
}

interface CreateInput {
  packages?: PackageInput[] | null;
  start_time?: string | null;
  end_time?: string | null;
  brand?: { domain?: string } | null;
  [key: string]: unknown;
}

export async function handleCreateMediaBuy(tenantId: string, input: CreateInput) {
  // Validation step 1: packages must exist and be non-empty
  if (!input.packages || !Array.isArray(input.packages) || input.packages.length === 0) {
    return adcpError('INVALID_REQUEST', { message: 'packages array is required and must not be empty' });
  }

  // Validation step 2: end_time must be after start_time (if both provided)
  if (input.start_time && input.end_time) {
    if (new Date(input.end_time) <= new Date(input.start_time)) {
      return adcpError('INVALID_REQUEST', { message: 'end_time must be after start_time' });
    }
  }

  // Validation step 3: each package.budget > 0
  for (const pkg of input.packages) {
    if (!pkg.budget || pkg.budget <= 0) {
      return adcpError('BUDGET_TOO_LOW', {
        message: `Package budget must be greater than 0`,
        field: 'packages[].budget',
      });
    }
  }

  // Validation step 4: each package.product_id exists in tenant products
  for (const pkg of input.packages) {
    const product = await getProduct(tenantId, pkg.product_id);
    if (!product) {
      return adcpError('PRODUCT_NOT_FOUND', {
        message: `Product '${pkg.product_id}' not found`,
        field: 'packages[].product_id',
      });
    }

    // Validation step 5: each package.pricing_option_id exists on that product
    const pricingOptions = product.pricing_options as Array<{ pricing_option_id: string }>;
    const validPricingOption = pricingOptions?.some(
      (po) => po.pricing_option_id === pkg.pricing_option_id
    );
    if (!validPricingOption) {
      return adcpError('INVALID_REQUEST', {
        message: `Pricing option '${pkg.pricing_option_id}' not found on product '${pkg.product_id}'`,
        field: 'packages[].pricing_option_id',
      });
    }
  }

  // Build media buy
  const mediaBuyId = `mb-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const packages: AdcpPackage[] = input.packages.map((pkg) => ({
    package_id: crypto.randomUUID(),
    product_id: pkg.product_id,
    budget: pkg.budget,
    pricing_option_id: pkg.pricing_option_id,
    paused: false,
    canceled: false,
  }));

  const totalBudget = packages.reduce((sum, p) => sum + (p.budget ?? 0), 0);

  const mediaBuy: AdcpMediaBuy = {
    media_buy_id: mediaBuyId,
    status: 'pending_activation',
    total_budget: totalBudget,
    packages,
    confirmed_at: now,
    created_at: now,
    updated_at: now,
  };

  await insertMediaBuy(tenantId, mediaBuyId, mediaBuy);

  return mediaBuyResponse(mediaBuy as never);
}
