const CAPABILITIES = {
  adcp: { major_versions: [2] },
  supported_protocols: ['media_buy'],
  account: {
    supported_billing: ['operator'],
    require_operator_auth: false,
    required_for_products: false,
  },
};

export function handleGetAdcpCapabilities() {
  return {
    content: [{ type: 'text' as const, text: JSON.stringify(CAPABILITIES) }],
    structuredContent: CAPABILITIES,
  };
}
