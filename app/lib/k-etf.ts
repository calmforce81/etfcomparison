import * as cheerio from 'cheerio';
import type { EtfItem, RecentEtfItem } from './types';
import { FALLBACK_ETFS, FALLBACK_RECENT, WATCHLIST } from './fallback';

const BASE_URL = 'https://www.k-etf.com/en/etf';
const CACHE_TTL_MS = 1000 * 60 * 3;
const memoryCache = new Map<string, { expiresAt: number; html: string }>();

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.replace(/[,%\sA-Z가-힣]/gi, '').replace(/,/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function findValueByLabel($: cheerio.CheerioAPI, label: string): string {
  const nodes = $('body *').toArray();
  for (let i = 0; i < nodes.length; i += 1) {
    const text = $(nodes[i]).text().replace(/\s+/g, ' ').trim();
    if (text === label) {
      for (let j = i + 1; j < Math.min(i + 6, nodes.length); j += 1) {
        const value = $(nodes[j]).text().replace(/\s+/g, ' ').trim();
        if (value && value !== label) return value;
      }
    }
  }
  return '';
}

function inferBrand(name: string): string {
  const upper = name.toUpperCase();
  if (upper.includes('KODEX')) return 'KODEX';
  if (upper.includes('TIGER')) return 'TIGER';
  if (upper.includes('ACE')) return 'ACE';
  if (upper.includes('KOACT')) return 'KoAct';
  if (upper.includes('1Q')) return '1Q';
  return '기타';
}

function inferGroup(name: string, index: string): string {
  const text = `${name} ${index}`.toLowerCase();
  if (text.includes('반도체') || text.includes('semicon')) return '반도체 테마';
  return '대표지수';
}

async function fetchHtml(url: string): Promise<string> {
  const cached = memoryCache.get(url);
  if (cached && cached.expiresAt > Date.now()) return cached.html;

  const response = await fetch(url, {
    headers: {
      'user-agent': 'Mozilla/5.0 ETF Dashboard Bot',
      accept: 'text/html,application/xhtml+xml'
    },
    next: { revalidate: 180 }
  });

  if (!response.ok) {
    throw new Error(`K-ETF fetch failed: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  memoryCache.set(url, { html, expiresAt: Date.now() + CACHE_TTL_MS });
  return html;
}

export async function fetchKetfDetail(code: string): Promise<EtfItem> {
  const source = `${BASE_URL}/${encodeURIComponent(code)}`;
  const fallback = FALLBACK_ETFS.find((item) => item.code === code);
  const seed = WATCHLIST.find((item) => item.code === code);
  const html = await fetchHtml(source);
  const $ = cheerio.load(html);

  const h1Name = $('h1').first().text().replace(/\s+/g, ' ').trim();
  const pageTitle = $('title').text().replace(/^K-ETF\s*-\s*/i, '').trim();
  const name = h1Name || pageTitle || fallback?.name || seed?.name || code;
  const brand = findValueByLabel($, 'Brand') || fallback?.brand || seed?.brand || inferBrand(name);
  const index = findValueByLabel($, 'Benchmark Index') || fallback?.index || seed?.index || '-';
  const fee = toNumber(findValueByLabel($, 'Total Fee')) || fallback?.fee || seed?.fee || 0;
  const aum = toNumber(findValueByLabel($, 'Market Capitalization')) || fallback?.aum || 0;
  const transaction = toNumber(findValueByLabel($, 'Transaction Amount')) || fallback?.transaction || 0;
  const volume = toNumber(findValueByLabel($, 'Trading Volume')) || fallback?.volume || 0;

  return {
    code,
    name,
    brand,
    index,
    group: seed?.group || fallback?.group || inferGroup(name, index),
    aum,
    transaction,
    volume,
    fee,
    source,
    fetchedAt: new Date().toISOString()
  };
}

export async function fetchEtfs(codes: string[]): Promise<EtfItem[]> {
  const uniqueCodes = Array.from(new Set(codes.filter(Boolean)));
  const settled = await Promise.allSettled(uniqueCodes.map((code) => fetchKetfDetail(code)));
  return settled.map((result, index) => {
    if (result.status === 'fulfilled') return result.value;
    const code = uniqueCodes[index];
    const fallback = FALLBACK_ETFS.find((item) => item.code === code);
    if (fallback) return { ...fallback, fetchedAt: new Date().toISOString() };
    return null;
  }).filter((item): item is EtfItem => Boolean(item));
}

export async function fetchRecentEtfs(seedCodes: string[] = []): Promise<RecentEtfItem[]> {
  const codes = seedCodes.length ? seedCodes : FALLBACK_RECENT.map((item) => item.code);
  const settled = await Promise.allSettled(codes.map((code) => fetchKetfDetail(code)));
  return settled.map((result, index) => {
    const fallback = FALLBACK_RECENT.find((item) => item.code === codes[index]);
    if (result.status === 'fulfilled') {
      const item = result.value;
      return {
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
        fetchedAt: item.fetchedAt
      };
    }
    return fallback ? { ...fallback, fetchedAt: new Date().toISOString() } : null;
  }).filter((item): item is RecentEtfItem => Boolean(item));
}
