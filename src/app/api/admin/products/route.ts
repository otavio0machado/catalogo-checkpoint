import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  normalizeProductPayload,
  parseProductStatus,
  parseMedia,
  applyProductFilters,
} from '@/lib/products';

export async function GET(request: Request) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = parseProductStatus(searchParams.get('status'));

    if (status === null) {
      return NextResponse.json({ error: 'Status inválido' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    query = applyProductFilters(query, {
      search: searchParams.get('search') || '',
      type: searchParams.get('type') || '',
      platform: searchParams.get('platform') || '',
      genre: searchParams.get('genre') || '',
      condition: searchParams.get('condition') || '',
    });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json((data || []).map(parseMedia));
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
