import type { Product, ProductStatus } from '@/types';

export const PRODUCT_STATUSES: ProductStatus[] = ['available', 'reserved', 'sold', 'hidden'];

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
  'stock',
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
  'created_at',
  'updated_at',
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

export function sanitizePublicProduct(row: Record<string, unknown>): Partial<Product> {
  const parsed = parseMedia(row);
  return Object.fromEntries(
    PUBLIC_PRODUCT_FIELDS.map((field) => [field, parsed[field]])
  ) as Partial<Product>;
}

export function normalizeProductPayload(body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {
    ...body,
    updated_at: new Date().toISOString(),
  };

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
  return value.replace(/[%,()]/g, ' ').replace(/\s+/g, ' ').trim();
}
