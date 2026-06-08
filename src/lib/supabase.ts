import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let admin: SupabaseClient | null = null;
let publicClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!admin) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Supabase env vars not set');
    admin = createClient(url, key);
  }
  return admin;
}

export function getSupabasePublic(): SupabaseClient {
  if (!publicClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Supabase env vars not set');
    publicClient = createClient(url, key);
  }
  return publicClient;
}

export function getMediaUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const client = getSupabasePublic();
  const { data } = client.storage.from('product-media').getPublicUrl(path);
  return data.publicUrl;
}
