import { GoogleGenAI } from '@google/genai';
import type { Product, ProductAIAnalysis } from '@/types';

let ai: GoogleGenAI | null = null;

const PRODUCT_TYPES: Product['type'][] = ['Jogo', 'Console', 'Acessório', 'Colecionável', 'Gift Card', 'Outro'];

function getAI(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY not set');
    ai = new GoogleGenAI({ apiKey: key });
  }
  return ai;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function normalizeType(value: unknown): Product['type'] {
  const raw = asString(value);
  return PRODUCT_TYPES.includes(raw as Product['type']) ? (raw as Product['type']) : 'Jogo';
}

export function normalizeProductAnalysis(value: Partial<ProductAIAnalysis>): ProductAIAnalysis {
  return {
    type: normalizeType(value.type),
    title: asString(value.title),
    platform: asString(value.platform),
    brand: asString(value.brand),
    publisher: asString(value.publisher),
    genre: asString(value.genre),
    media_format: asString(value.media_format),
    region: asString(value.region) || 'Brasil',
    condition_detail: asString(value.condition_detail),
    condition_notes: asString(value.condition_notes),
    description: asString(value.description),
    suggested_price_cents: Math.max(0, Math.round(asNumber(value.suggested_price_cents))),
    compare_at_price_cents:
      typeof value.compare_at_price_cents === 'number' && value.compare_at_price_cents > 0
        ? Math.round(value.compare_at_price_cents)
        : null,
    sku: asString(value.sku),
    age_rating: asString(value.age_rating),
    weight_kg: asNumber(value.weight_kg, 0.2),
    width_cm: asNumber(value.width_cm, 14),
    length_cm: asNumber(value.length_cm, 17),
    height_cm: asNumber(value.height_cm, 2),
    confidence: Math.max(0, Math.min(1, asNumber(value.confidence, 0))),
    review_notes: Array.isArray(value.review_notes) ? value.review_notes.map(asString).filter(Boolean) : [],
  };
}

export async function analyzeProductImage(
  imageBase64: string,
  mimeType: string
): Promise<ProductAIAnalysis> {
  const client = getAI();

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          {
            text: `Você é um catalogador profissional da Checkpoint Games, uma loja brasileira de games.
Analise a foto de UM produto e extraia os dados para um catálogo de venda pelo WhatsApp.

O produto pode ser jogo físico, console, controle, acessório, gift card, item retro ou colecionável.
Use português do Brasil. Estime somente o que for razoável pela foto. Quando tiver dúvida, preencha o campo com a melhor hipótese e adicione um aviso em "review_notes".

Retorne SOMENTE JSON válido com estes campos exatos:

{
  "type": "Jogo" | "Console" | "Acessório" | "Colecionável" | "Gift Card" | "Outro",
  "title": "nome comercial completo",
  "platform": "PS5, PS4, Xbox Series, Nintendo Switch, PC, Retro, Multiplataforma etc.",
  "brand": "marca visível ou provável",
  "publisher": "publisher/fabricante quando aplicável",
  "genre": "ação, aventura, corrida, controle, console, cabo, crédito digital etc.",
  "media_format": "Disco, Cartucho, Digital, Código, Console, Acessório, Colecionável",
  "region": "Brasil, US, Europeu, Japonês, Livre de região ou Outro",
  "condition_detail": "Novo, Novo - lacrado, Usado - excelente estado, Usado - marcas leves, Usado - mídia com detalhes ou Usado - sem caixa/manual",
  "condition_notes": "observações visíveis sobre disco, caixa, manual, riscos, lacre ou acessórios",
  "description": "descrição de venda em 2 ou 3 frases, clara e honesta",
  "suggested_price_cents": preço sugerido em centavos de Real para mercado brasileiro de usados,
  "compare_at_price_cents": preço de comparação em centavos, ou null,
  "sku": "sugestão de SKU curto começando com CHK-, se possível",
  "age_rating": "Livre, 10+, 12+, 14+, 16+, 18+ ou vazio",
  "weight_kg": peso estimado em kg,
  "width_cm": largura estimada em cm,
  "length_cm": comprimento estimado em cm,
  "height_cm": altura/espessura estimada em cm,
  "confidence": número entre 0 e 1,
  "review_notes": ["pontos que o humano deve revisar antes de publicar"]
}

Nunca invente estado perfeito se a foto não comprovar. Se a foto estiver ruim ou incompleta, reduza confidence e explique em review_notes.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Sem resposta da IA');
  return normalizeProductAnalysis(JSON.parse(text) as Partial<ProductAIAnalysis>);
}
