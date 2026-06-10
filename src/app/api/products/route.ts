import { NextResponse } from 'next/server';
import type { Product } from '@/types';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isAuthenticated } from '@/lib/auth';
import {
  normalizeProductPayload,
  parseMedia,
  sanitizePublicProduct,
  sanitizeSearchTerm,
} from '@/lib/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = sanitizeSearchTerm(searchParams.get('search') || '');
  const type = searchParams.get('type') || '';
  const platform = searchParams.get('platform') || '';
  const genre = searchParams.get('genre') || '';
  const condition = searchParams.get('condition') || '';

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('products')
      .select('*')
      .eq('status', 'available')
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (platform) query = query.eq('platform', platform);
    if (genre) query = query.eq('genre', genre);
    if (condition) query = query.eq('condition', condition);
    if (search) {
      query = query.or(
        `title.ilike.%${search}%,platform.ilike.%${search}%,brand.ilike.%${search}%,publisher.ilike.%${search}%,genre.ilike.%${search}%,sku.ilike.%${search}%,description.ilike.%${search}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const supabaseProducts = (data || []).map((row) => parseMedia(row)) as Product[];
    return NextResponse.json(
      supabaseProducts.map((product) => sanitizePublicProduct(product as unknown as Record<string, unknown>))
    );
  } catch {
    return NextResponse.json({ error: 'Erro ao carregar produtos' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('products')
      .insert(normalizeProductPayload(body))
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(parseMedia(data), { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erro ao criar produto' }, { status: 500 });
  }
}
