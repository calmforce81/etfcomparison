import { NextResponse } from 'next/server';
import { fetchEtfs } from '../../lib/k-etf';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codes = searchParams.get('codes')?.split(',').map((code) => code.trim()).filter(Boolean) ?? [];
  const items = await fetchEtfs(codes);

  return NextResponse.json({
    items,
    fetchedAt: new Date().toISOString(),
  });
}
