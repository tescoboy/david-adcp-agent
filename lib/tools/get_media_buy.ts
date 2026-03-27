import { adcpError } from '@adcp/client';
import { getMediaBuy } from '../db';

interface GetMediaBuyInput {
  media_buy_id: string;
}

export async function handleGetMediaBuy(tenantId: string, input: GetMediaBuyInput) {
  const result = await getMediaBuy(tenantId, input.media_buy_id);
  if (!result) {
    return adcpError('MEDIA_BUY_NOT_FOUND', {
      message: `Media buy '${input.media_buy_id}' not found`,
      field: 'media_buy_id',
    });
  }

  const mediaBuy = result.data;
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(mediaBuy) }],
    structuredContent: { media_buy: mediaBuy },
  };
}
