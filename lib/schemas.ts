// TypeScript types aligned with AdCP spec (from @adcp/client core.generated)

export type MediaBuyStatus = 'pending_activation' | 'active' | 'paused' | 'completed' | 'rejected' | 'canceled';

export interface AdcpProduct {
  product_id: string;
  name: string;
  description: string;
  publisher_properties: Array<{
    publisher_domain: string;
    selection_type: 'all' | 'by_id' | 'by_tag';
  }>;
  format_ids: Array<{ agent_url: string; id: string }>;
  delivery_type: 'guaranteed' | 'non_guaranteed';
  delivery_measurement: { provider: string; notes?: string };
  pricing_options: AdcpPricingOption[];
}

export interface AdcpPricingOption {
  pricing_option_id: string;
  pricing_model: 'cpm' | 'vcpm' | 'cpc' | 'cpcv' | 'cpv' | 'cpp' | 'cpa' | 'flat_rate' | 'time_based';
  currency: string;
  fixed_price?: number;
  min_spend_per_package?: number;
}

export interface AdcpPackage {
  package_id: string;
  product_id?: string;
  budget?: number;
  pricing_option_id?: string;
  paused?: boolean;
  canceled?: boolean;
}

export interface AdcpMediaBuy {
  media_buy_id: string;
  status: MediaBuyStatus;
  total_budget: number;
  packages: AdcpPackage[];
  confirmed_at?: string;
  created_at?: string;
  updated_at?: string;
}
