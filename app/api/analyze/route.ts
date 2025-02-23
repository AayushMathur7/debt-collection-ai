import { analyzeDebtors } from '@/lib/openai';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { debtors } = await req.json();
    return await analyzeDebtors(debtors);
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to analyze debtors' }),
      { status: 500 }
    );
  }
} 