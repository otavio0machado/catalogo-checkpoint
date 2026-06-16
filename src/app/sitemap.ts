import type { MetadataRoute } from 'next';
import { getSupabaseAdmin } from '@/lib/supabase';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/loja`, changeFrequency: 'daily', priority: 0.9 },
  ];

  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from('products')
      .select('id, updated_at')
      .eq('status', 'available')
      .order('updated_at', { ascending: false })
      .limit(5000);

    const productRoutes: MetadataRoute.Sitemap = (data || []).map((p) => ({
      url: `${siteUrl}/produto/${p.id}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
