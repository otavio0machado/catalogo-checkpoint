import type { MediaItem, Product, ProductStatus, StoreStock } from '@/types';

export const PRODUCT_STATUSES: ProductStatus[] = ['available', 'reserved', 'sold', 'hidden'];

/** Lojas físicas onde os produtos podem estar em estoque. */
export const STORES = ['Shopping Total', 'Shopping Wallig', 'Shopping Bourbon'] as const;

/**
 * Campos devolvidos pela API pública. Mantém apenas o necessário para a
 * vitrine — não expõe estoque por loja agregado, dimensões de envio nem SKU
 * interno na listagem. Também serve como lista de colunas no `select`.
 */
const PUBLIC_PRODUCT_FIELDS: (keyof Product)[] = [
  'id',
  'type',
  'title',
  'platform',
  'brand',
  'publisher',
  'genre',
  'media_format',
  'region',
  'condition',
  'condition_detail',
  'condition_notes',
  'includes',
  'description',
  'price_cents',
  'compare_at_price_cents',
  'store_stock',
  'age_rating',
  'players',
  'online_support',
  'warranty_notes',
  'photo_url',
  'media',
  'status',
  'created_at',
  'updated_at',
];

/** Colunas do `select` para consultas públicas (evita trazer dados internos). */
export const PUBLIC_PRODUCT_SELECT = PUBLIC_PRODUCT_FIELDS.join(',');

/**
 * Colunas que o cliente pode gravar. Tudo fora desta lista (id, created_at,
 * colunas desconhecidas) é descartado para evitar mass assignment.
 */
const WRITABLE_PRODUCT_FIELDS: (keyof Product)[] = [
  'type',
  'title',
  'platform',
  'brand',
  'publisher',
  'genre',
  'media_format',
  'region',
  'condition',
  'condition_detail',
  'condition_notes',
  'includes',
  'description',
  'price_cents',
  'compare_at_price_cents',
  'stock',
  'store_stock',
  'sku',
  'age_rating',
  'players',
  'online_support',
  'warranty_notes',
  'weight_kg',
  'width_cm',
  'length_cm',
  'height_cm',
  'photo_url',
  'media',
  'status',
];

export function parseMedia<T extends Record<string, unknown>>(row: T): T {
  const mutable = row as T & { media?: unknown };

  if (typeof mutable.media === 'string') {
    try {
      mutable.media = JSON.parse(mutable.media);
    } catch {
      mutable.media = [];
    }
  }
  if (!Array.isArray(mutable.media)) mutable.media = [];
  return mutable;
}

/**
 * Normaliza o estoque por loja em um objeto com todas as lojas conhecidas,
 * garantindo quantidades inteiras não-negativas. Aceita objeto ou string JSON.
 */
export function parseStoreStock(value: unknown): StoreStock {
  let raw: unknown = value;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = {};
    }
  }
  const source = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const result: StoreStock = {};
  for (const store of STORES) {
    const qty = Math.floor(Number(source[store]));
    result[store] = Number.isFinite(qty) && qty > 0 ? qty : 0;
  }
  return result;
}

/** Soma das quantidades por loja. */
export function totalStoreStock(storeStock: StoreStock): number {
  return STORES.reduce((sum, store) => sum + (storeStock[store] || 0), 0);
}

/** Constrói a lista de MediaItem a partir de um produto (array, string JSON ou photo_url). */
export function extractMediaItems(product: Partial<Product> | undefined | null): MediaItem[] {
  if (!product) return [];
  const { media } = product;
  if (Array.isArray(media) && media.length > 0) return media as MediaItem[];
  if (typeof media === 'string') {
    try {
      const parsed = JSON.parse(media);
      if (Array.isArray(parsed)) return parsed as MediaItem[];
    } catch {
      // string inválida — cai para photo_url
    }
  }
  if (product.photo_url) return [{ url: product.photo_url, type: 'image', path: '' }];
  return [];
}

export function sanitizePublicProduct(row: Record<string, unknown>): Partial<Product> {
  const parsed = parseMedia(row);
  return Object.fromEntries(
    PUBLIC_PRODUCT_FIELDS.map((field) => [field, parsed[field]])
  ) as Partial<Product>;
}

export function normalizeProductPayload(body: Record<string, unknown>) {
  // Allowlist: só colunas graváveis entram no payload (evita mass assignment
  // de id/created_at ou colunas arbitrárias controladas pelo cliente).
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  for (const field of WRITABLE_PRODUCT_FIELDS) {
    if (field in body) payload[field] = body[field];
  }

  if ('media' in body) {
    const mediaItems = Array.isArray(body.media) ? body.media : [];
    const firstMedia = mediaItems[0];
    const firstMediaUrl =
      firstMedia && typeof firstMedia === 'object' && 'url' in firstMedia
        ? String(firstMedia.url || '')
        : '';

    const explicitPhotoUrl = typeof body.photo_url === 'string' ? body.photo_url : '';
    payload.media = JSON.stringify(mediaItems);
    payload.photo_url = explicitPhotoUrl || firstMediaUrl;
  }

  if ('store_stock' in body) {
    const storeStock = parseStoreStock(body.store_stock);
    payload.store_stock = storeStock;
    // O estoque total é derivado da soma das quantidades por loja.
    payload.stock = totalStoreStock(storeStock);
  }

  if ('condition_detail' in body && typeof body.condition_detail === 'string') {
    payload.condition = body.condition_detail.startsWith('Novo') ? 'Novo' : 'Usado';
  }

  if ('compare_at_price_cents' in body && !body.compare_at_price_cents) {
    payload.compare_at_price_cents = null;
  }

  return payload;
}

export function parseProductId(id: string): number | null {
  const parsed = Number(id);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function parseProductStatus(status: string | null): ProductStatus | '' | null {
  if (status === null || status === '') return '';
  return PRODUCT_STATUSES.includes(status as ProductStatus) ? (status as ProductStatus) : null;
}

export function sanitizeSearchTerm(value: string): string {
  // Remove caracteres que têm significado sintático no filtro `.or()` do
  // PostgREST (vírgula separa condições; parênteses agrupam; `%`/`*` são
  // curingas; `:` `.` `\` `"` podem alterar a expressão). Sobra texto plano
  // para casar via ilike.
  return value
    .replace(/[%,()*:\\".]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

/** Colunas pesquisáveis pela busca textual. */
const SEARCHABLE_COLUMNS = ['title', 'platform', 'brand', 'publisher', 'genre', 'sku', 'description'];

export interface ProductFilters {
  search?: string;
  type?: string;
  platform?: string;
  genre?: string;
  condition?: string;
}

/**
 * Aplica os filtros de catálogo (tipo/plataforma/gênero/condição/busca) a uma
 * query Supabase já iniciada. Centraliza a lógica antes duplicada nas rotas e
 * na página da loja.
 */
export function applyProductFilters<T extends {
  eq: (column: string, value: string) => T;
  or: (filter: string) => T;
}>(query: T, filters: ProductFilters): T {
  const search = sanitizeSearchTerm(filters.search || '');
  if (filters.type) query = query.eq('type', filters.type);
  if (filters.platform) query = query.eq('platform', filters.platform);
  if (filters.genre) query = query.eq('genre', filters.genre);
  if (filters.condition) query = query.eq('condition', filters.condition);
  if (search) {
    query = query.or(SEARCHABLE_COLUMNS.map((column) => `${column}.ilike.%${search}%`).join(','));
  }
  return query;
}
