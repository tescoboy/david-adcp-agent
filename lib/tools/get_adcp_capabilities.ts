import { capabilitiesResponse } from '@adcp/client';

export function handleGetAdcpCapabilities() {
  return capabilitiesResponse({
    adcp: { major_versions: [2] },
    supported_protocols: ['media_buy'],
    account: {
      supported_billing: ['operator'],
      require_operator_auth: false,
      required_for_products: false,
    },
  });
}
