import { adcpError } from '@adcp/client';
import { getMediaBuy, updateMediaBuy } from '../db';
import type { AdcpMediaBuy, AdcpPackage } from '../schemas';

interface UpdateInput {
  media_buy_id: string;
  paused?: boolean;
  canceled?: boolean;
  packages?: Array<{ package_id: string; paused?: boolean; canceled?: boolean; budget?: number }>;
  [key: string]: unknown;
}

export async function handleUpdateMediaBuy(tenantId: string, input: UpdateInput) {
  console.log('[update_media_buy] input:', JSON.stringify(input));
  const result = await getMediaBuy(tenantId, input.media_buy_id);
  if (!result) {
    return adcpError('MEDIA_BUY_NOT_FOUND', {
      message: `Media buy '${input.media_buy_id}' not found`,
      field: 'media_buy_id',
    });
  }

  // If already canceled, reject all modifications
  if (result.is_canceled) {
    return adcpError('NOT_CANCELLABLE', {
      message: 'This media buy has already been canceled and cannot be modified',
    });
  }

  const mediaBuy = result.data as unknown as AdcpMediaBuy;
  let isCanceled = false;

  if (input.canceled === true) {
    // Cancel the media buy
    isCanceled = true;
    mediaBuy.status = 'canceled';
    mediaBuy.packages = mediaBuy.packages.map((p) => ({ ...p, canceled: true }));
  } else if (typeof input.paused === 'boolean') {
    // Pause or resume
    mediaBuy.status = input.paused ? 'paused' : 'active';
    mediaBuy.packages = mediaBuy.packages.map((p) => ({
      ...p,
      paused: input.paused,
    }));
  }

  // Apply per-package updates
  if (input.packages && Array.isArray(input.packages)) {
    for (const pkgUpdate of input.packages) {
      const idx = mediaBuy.packages.findIndex(
        (p: AdcpPackage) => p.package_id === pkgUpdate.package_id
      );
      if (idx !== -1) {
        const pkg = mediaBuy.packages[idx];
        if (pkgUpdate.canceled === true) {
          mediaBuy.packages[idx] = { ...pkg, canceled: true };
        } else if (typeof pkgUpdate.paused === 'boolean') {
          mediaBuy.packages[idx] = { ...pkg, paused: pkgUpdate.paused };
        }
        if (typeof pkgUpdate.budget === 'number') {
          mediaBuy.packages[idx] = { ...mediaBuy.packages[idx], budget: pkgUpdate.budget };
        }
      }
    }
    // Recalculate total_budget
    mediaBuy.total_budget = mediaBuy.packages.reduce((sum, p) => sum + (p.budget ?? 0), 0);
  }

  mediaBuy.revision = (mediaBuy.revision ?? 1) + 1;
  mediaBuy.updated_at = new Date().toISOString();
  await updateMediaBuy(input.media_buy_id, mediaBuy, isCanceled);

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(mediaBuy) }],
    structuredContent: { media_buy: mediaBuy },
  };
}
