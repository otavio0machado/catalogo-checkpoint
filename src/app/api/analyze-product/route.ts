import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { analyzeProductImage } from '@/lib/ai';

export async function POST(request: Request) {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { imageBase64, mimeType } = await request.json();

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: 'Imagem não fornecida' }, { status: 400 });
    }

    const analysis = await analyzeProductImage(imageBase64, mimeType);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Erro na análise de produto:', error);
    const missingKey = error instanceof Error && error.message.includes('GEMINI_API_KEY');
    return NextResponse.json(
      { error: missingKey ? 'GEMINI_API_KEY não configurada' : 'Erro ao analisar produto com IA' },
      { status: missingKey ? 500 : 502 }
    );
  }
}
