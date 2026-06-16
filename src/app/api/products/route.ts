import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import {
  applyProductFilters,
  sanitizePublicProduct,
  PUBLIC_PRODUCT_SELECT,
} from '@/lib/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  try {
    const supabase = getSupabaseAdmin();
    const query = applyProductFilters(
      supabase
        .from('products')
        .select(PUBLIC_PRODUCT_SELECT)
        .eq('status', 'available')
        .order('created_at', { ascending: false }),
      {
        search: searchParams.get('search') || '',
        type: searchParams.get('type') || '',
        platform: searchParams.get('platform') || '',
        genre: searchParams.get('genre') || '',
        condition: searchParams.get('condition') || '',
      }
    );

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      (data || []).map((row) => sanitizePublicProduct(row as unknown as Record<string, unknown>))
    );
  } catch {
    return NextResponse.json({ error: 'Erro ao carregar produtos' }, { status: 500 });
  }
}
