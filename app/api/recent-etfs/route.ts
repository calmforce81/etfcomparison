import { NextResponse } from 'next/server';
import { fetchRecentEtfs } from '../../lib/k-etf';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await fetchRecentEtfs();

  return NextResponse.json({
    items,
    fetchedAt: new Date().toISOString(),
  });
}
