import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { isAuthenticated } from '@/lib/auth';
import { normalizeProductPayload, parseProductId, parseMedia, sanitizePublicProduct } from '@/lib/products';
import { getListedProductById } from '@/lib/catalog';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseProductId(id);
  if (!productId) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  const authenticated = await isAuthenticated();

  try {
    const supabase = getSupabaseAdmin();

    let query = supabase
      .from('products')
      .select('*')
      .eq('id', productId);

    if (!authenticated) query = query.eq('status', 'available');

    const { data, error } = await query.single();

    if (error || !data) {
      const listedProduct = getListedProductById(productId);
      if (listedProduct) {
        return NextResponse.json(
          authenticated
            ? listedProduct
            : sanitizePublicProduct(listedProduct as unknown as Record<string, unknown>)
        );
      }
      return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
    }

    const parsed = parseMedia(data);
    return NextResponse.json(authenticated ? parsed : sanitizePublicProduct(parsed));
  } catch {
    const listedProduct = getListedProductById(productId);
    if (listedProduct) {
      return NextResponse.json(
        authenticated
          ? listedProduct
          : sanitizePublicProduct(listedProduct as unknown as Record<string, unknown>)
      );
    }
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
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
      .select('media, photo_url')
      .eq('id', productId)
      .single();

    if (product) {
      const paths: string[] = [];
      if (product.media) {
        try {
          const mediaItems = typeof product.media === 'string' ? JSON.parse(product.media) : product.media;
          for (const item of mediaItems) {
            if (item.path) paths.push(item.path);
          }
        } catch {
          // Ignore malformed media metadata; deleting the row is still the priority.
        }
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
