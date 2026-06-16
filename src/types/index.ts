export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  path: string;
}

export type ProductStatus = 'available' | 'reserved' | 'sold' | 'hidden';

/** Quantidade em estoque por loja: { "Shopping Total": 2, ... } */
export type StoreStock = Record<string, number>;

export interface Product {
  id: number;
  type: 'Jogo' | 'Console' | 'Acessório' | 'Colecionável' | 'Gift Card' | 'Outro';
  title: string;
  platform: string;
  brand: string;
  publisher: string;
  genre: string;
  media_format: string;
  region: string;
  condition: string;
  condition_detail: string;
  condition_notes: string;
  description: string;
  price_cents: number;
  compare_at_price_cents: number | null;
  stock: number;
  store_stock: StoreStock;
  sku: string;
  age_rating: string;
  photo_url: string;
  media: MediaItem[];
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  productId: number;
  title: string;
  platform: string;
  price_cents: number;
  photo_url: string;
  condition_detail: string;
  type: string;
}

export interface ProductAIAnalysis {
  type: Product['type'];
  title: string;
  platform: string;
  brand: string;
  publisher: string;
  genre: string;
  media_format: string;
  region: string;
  condition_detail: string;
  condition_notes: string;
  description: string;
  suggested_price_cents: number;
  compare_at_price_cents: number | null;
  sku: string;
  age_rating: string;
  confidence: number;
  review_notes: string[];
}
