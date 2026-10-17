export type WorthLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'JACKPOT';

export interface ThriftScanResult {
  id: string;
  timestamp: number;
  brand: string;
  item_name: string;
  category: string;
  estimated_era: string;
  worth_level: WorthLevel;
  worth_reason: string;
  authenticity_clues: string[];
  estimated_price_idr: {
    low: number;
    average: number;
    high: number;
  };
  search_keyword_global: string;
  search_keyword_local: string;
  /** Optional compressed thumbnail data URL for Personal Archive display */
  thumbnail?: string;
}

export interface MarketListing {
  title: string;
  source: string;
  price: string;
  link: string;
  thumbnail?: string;
}
