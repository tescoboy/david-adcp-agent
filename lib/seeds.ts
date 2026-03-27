import type { AdcpProduct } from './schemas';

// Seed products using exact AdCP spec field names (verified against core.generated.d.ts)
// Note: CPMPricingOption uses `fixed_price` (not `rate`) and `min_spend_per_package` (not `min_budget`)
export const SEED_PRODUCTS: AdcpProduct[] = [
  {
    product_id: 'display_standard',
    name: 'Standard Display',
    description: 'Standard display advertising across premium inventory',
    publisher_properties: [
      { publisher_domain: 'publisher.example.com', selection_type: 'all' },
    ],
    format_ids: [{ agent_url: 'https://formats.adcp.org/', id: 'display_300x250' }],
    delivery_type: 'non_guaranteed',
    delivery_measurement: { provider: 'publisher' },
    pricing_options: [
      {
        pricing_option_id: 'display_cpm',
        pricing_model: 'cpm',
        currency: 'USD',
        fixed_price: 5.0,
        min_spend_per_package: 500,
      },
    ],
  },
  {
    product_id: 'video_preroll',
    name: 'Video Pre-roll',
    description: 'Premium video pre-roll inventory',
    publisher_properties: [
      { publisher_domain: 'publisher.example.com', selection_type: 'all' },
    ],
    format_ids: [{ agent_url: 'https://formats.adcp.org/', id: 'video_preroll_15s' }],
    delivery_type: 'guaranteed',
    delivery_measurement: { provider: 'publisher' },
    pricing_options: [
      {
        pricing_option_id: 'video_cpm',
        pricing_model: 'cpm',
        currency: 'USD',
        fixed_price: 25.0,
        min_spend_per_package: 1000,
      },
    ],
  },
];
