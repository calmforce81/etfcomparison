import { NextResponse } from 'next/server';
import { fetchRecentEtfs } from '../../lib/k-etf';
import { RECENT_SEED_CODES } from '../../lib/fallback';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const codes = searchParams.get('codes')?.split(',').map((code) => code.trim()).filter(Boolean) || RECENT_SEED_CODES;
  const items = await fetchRecentEtfs(codes);

  return NextResponse.json({
    mode: 'live-server-fetch',
    fetchedAt: new Date().toISOString(),
    items
  });
}
