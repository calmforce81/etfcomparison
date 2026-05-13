export interface RecentEtfItem {
  code: string;
  name: string;
  brand: string;
  theme: string;
  listingDate: string;
  index: string;
  aum: number;
  transaction: number;
  volume: number;
  fee: number;
  source: string;
  fetchedAt?: string;
}

const FALLBACK_RECENT: RecentEtfItem[] = [
  {
    code: '0183J0',
    name: 'TIGER US SPACE TECH',
    brand: 'TIGER',
    theme: '미국 우주테크',
    listingDate: '2026-04-14',
    index: 'Akros U.S. Space Tech Index (PR)',
    aum: 709852000000,
    transaction: 151770205336,
    volume: 12358674,
    fee: 0.49,
    source: 'https://www.k-etf.com/en/etf/0183J0',
  },
];

async function fetchKetfDetail(code: string) {
  return {
    code,
    name: 'Sample ETF',
    brand: 'KODEX',
    group: '대표지수',
    index: 'KOSPI 200',
    aum: 1000000000,
    transaction: 200000000,
    volume: 100000,
    fee: 0.15,
    source: `https://www.k-etf.com/en/etf/${code}`,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchRecentEtfs(
  seedCodes: string[] = [],
): Promise<RecentEtfItem[]> {
  const codes = seedCodes.length
    ? seedCodes
    : FALLBACK_RECENT.map((item) => item.code);

  const settled = await Promise.allSettled(
    codes.map((code) => fetchKetfDetail(code)),
  );

  const items: RecentEtfItem[] = [];

  settled.forEach((result, index) => {
    const fallback = FALLBACK_RECENT.find(
      (item) => item.code === codes[index],
    );

    if (result.status === 'fulfilled') {
      const item = result.value;

      items.push({
        code: item.code,
        name: item.name,
        brand: item.brand,
        theme: fallback?.theme || item.group,
        listingDate: fallback?.listingDate || '-',
        index: item.index,
        aum: item.aum,
        transaction: item.transaction,
        volume: item.volume,
        fee: item.fee,
        source: item.source,
        fetchedAt: item.fetchedAt,
      });

      return;
    }

    if (fallback) {
      items.push({
        ...fallback,
        fetchedAt: new Date().toISOString(),
      });
    }
  });

  return items;
}
