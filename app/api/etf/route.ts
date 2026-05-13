import { NextResponse } from 'next/server';
import {
  fetchNaverEtfList,
  fetchNaverEtfHistory,
  calcDiscount,
  fmtMarketSum,
  fmtQuant,
  sliceHistory,
} from '@/app/lib/naverApi';
import { THEMES, ThemeData } from '@/app/lib/data';
import { generateAlerts } from '@/app/lib/agentAlerts';

const THEME_CODES = [
  {
    name: '반도체',
    k: { code: '091160', ticker: 'KODEX 반도체', expense: 0.45 },
    t: { code: '091230', ticker: 'TIGER 반도체', expense: 0.40 },
  },
  {
    name: '2차전지',
    k: { code: '305720', ticker: 'KODEX 2차전지산업', expense: 0.45 },
    t: { code: '305540', ticker: 'TIGER 2차전지테마', expense: 0.40 },
  },
  {
    name: '미국나스닥',
    k: { code: '379800', ticker: 'KODEX 미국나스닥100TR', expense: 0.05 },
    t: { code: '133690', ticker: 'TIGER 미국나스닥100', expense: 0.07 },
  },
  {
    name: '헬스케어',
    k: { code: '266410', ticker: 'KODEX 헬스케어', expense: 0.45 },
    t: { code: '143860', ticker: 'TIGER 헬스케어', expense: 0.40 },
  },
  {
    name: '배당',
    k: { code: '279530', ticker: 'KODEX 고배당', expense: 0.15 },
    t: { code: '210780', ticker: 'TIGER 고배당', expense: 0.20 },
  },
];

async function buildThemeData(): Promise<ThemeData[]> {
  const etfMap = await fetchNaverEtfList();

  const historyPromises = THEME_CODES.flatMap((theme) => [
    fetchNaverEtfHistory(theme.k.code, 70).catch(() => null),
    fetchNaverEtfHistory(theme.t.code, 70).catch(() => null),
  ]);
  const histories = await Promise.all(historyPromises);

  return THEME_CODES.map((theme, i) => {
    const kItem = etfMap.get(theme.k.code);
    const tItem = etfMap.get(theme.t.code);
    const kHist = histories[i * 2] ?? null;
    const tHist = histories[i * 2 + 1] ?? null;
    const mockTheme = THEMES[i];

    const buildEtf = (
      item: ReturnType<typeof etfMap.get>,
      meta: (typeof THEME_CODES)[0]['k'],
      hist: number[] | null,
      mock: ThemeData['k']
    ) => {
      if (!item) return mock;
      const prices = hist && hist.length > 5 ? hist : mock.month3;
      return {
        ticker: meta.ticker,
        code: meta.code,
        price: item.nowVal,
        change: item.changeRate,
        nav: item.nav ?? item.nowVal,
        aum: fmtMarketSum(item.marketSum),
        aumRaw: item.marketSum * 100000000,
        vol: fmtQuant(item.quant),
        expense: meta.expense,
        discount: calcDiscount(item.nowVal, item.nav),
        week1: sliceHistory(prices, '1W'),
        month1: sliceHistory(prices, '1M'),
        month3: sliceHistory(prices, '3M'),
      };
    };

    return {
      name: theme.name,
      k: buildEtf(kItem, theme.k, kHist, mockTheme.k),
      t: buildEtf(tItem, theme.t, tHist, mockTheme.t),
    };
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'themes';

  try {
    const themes = await buildThemeData();

    if (type === 'alerts') {
      const alerts = generateAlerts(themes);
      return NextResponse.json({ alerts, source: 'live' });
    }

    return NextResponse.json({
      themes,
      source: 'naver',
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[ETF API] 네이버 API 실패, Mock fallback:', err);

    if (type === 'alerts') {
      const alerts = generateAlerts(THEMES);
      return NextResponse.json({ alerts, source: 'mock' });
    }

    return NextResponse.json({
      themes: THEMES,
      source: 'mock',
      updatedAt: new Date().toISOString(),
    });
  }
}
