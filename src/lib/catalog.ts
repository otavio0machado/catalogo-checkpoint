import { LISTED_PRODUCTS } from '@/data/listed-products';
import type { Product } from '@/types';

interface CatalogFilters {
  search?: string;
  type?: string;
  platform?: string;
  genre?: string;
  condition?: string;
}

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function productKey(product: Product): string {
  return normalizeText(product.sku || product.title).replace(/[^a-z0-9]+/g, '');
}

function matchesSearch(product: Product, search: string): boolean {
  if (!search) return true;
  const needle = normalizeText(search);
  const haystack = normalizeText(
    [
      product.title,
      product.platform,
      product.brand,
      product.publisher,
      product.genre,
      product.sku,
      product.description,
    ]
      .filter(Boolean)
      .join(' ')
  );
  return haystack.includes(needle);
}

export function filterListedProducts(filters: CatalogFilters = {}): Product[] {
  const { search = '', type = '', platform = '', genre = '', condition = '' } = filters;

  return LISTED_PRODUCTS.filter((product) => {
    if (type && product.type !== type) return false;
    if (platform && product.platform !== platform) return false;
    if (genre && product.genre !== genre) return false;
    if (condition && product.condition !== condition) return false;
    return matchesSearch(product, search);
  });
}

export function mergeWithListedProducts(products: Product[], filters: CatalogFilters = {}): Product[] {
  const existing = new Set(products.map(productKey));
  const fallback = filterListedProducts(filters).filter((product) => !existing.has(productKey(product)));
  return [...products, ...fallback];
}

export function getListedProductById(id: number): Product | null {
  return LISTED_PRODUCTS.find((product) => product.id === id) || null;
}
