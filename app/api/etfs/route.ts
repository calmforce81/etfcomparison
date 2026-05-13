import { NextResponse } from 'next/server';
import { fetchEtfs } from '../../lib/k-etf';
import { WATCHLIST } from '../../lib/fallback';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedCodes = searchParams.get('codes')?.split(',').map((code) => code.trim()).filter(Boolean);
  const codes = requestedCodes?.length ? requestedCodes : WATCHLIST.map((item) => item.code);
  const items = await fetchEtfs(codes);

  return NextResponse.json({
    mode: 'live-server-fetch',
    fetchedAt: new Date().toISOString(),
    items
  });
}
