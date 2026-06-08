import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase';
import { normalizeProductPayload, parseProductId, parseMedia } from '@/lib/products';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const productId = parseProductId(id);
  if (!productId) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    return NextResponse.json(parseMedia(data));
  } catch {
    return NextResponse.json({ error: 'Erro ao carregar produto' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const productId = parseProductId(id);
  if (!productId) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const body = await request.json();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('products')
      .update(normalizeProductPayload(body))
      .eq('id', productId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(parseMedia(data));
  } catch {
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const { id } = await params;
  const productId = parseProductId(id);
  if (!productId) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: product } = await supabase
      .from('products')
      .select('media')
      .eq('id', productId)
      .single();

    if (product?.media) {
      const paths: string[] = [];
      try {
        const mediaItems = typeof product.media === 'string' ? JSON.parse(product.media) : product.media;
        for (const item of mediaItems) {
          if (item.path) paths.push(item.path);
        }
      } catch {
        // Ignore malformed media metadata; deleting the row is still the priority.
      }
      if (paths.length > 0) {
        await supabase.storage.from('product-media').remove(paths);
      }
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erro ao excluir produto' }, { status: 500 });
  }
}
