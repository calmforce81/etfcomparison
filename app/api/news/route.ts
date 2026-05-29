import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

export interface NewsItem {
  id: string;
  type: 'news' | 'blog' | 'youtube';
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  thumbnail?: string;
}

// 테마별 키워드 — 짧고 명확하게 (Google News 검색 최적화)
const THEME_KW: Record<string, string[]> = {
  '전체':      ['KODEX ETF', 'TIGER ETF', '삼성자산운용 ETF', '미래에셋 ETF'],
  '반도체':    ['KODEX 반도체 ETF', 'TIGER 반도체 ETF', '반도체 ETF 투자'],
  '2차전지':   ['KODEX 2차전지 ETF', 'TIGER 2차전지 ETF', '배터리 ETF'],
  '미국나스닥': ['KODEX 나스닥100 ETF', 'TIGER 나스닥100 ETF', '미국 나스닥 ETF'],
  '헬스케어':  ['KODEX 헬스케어 ETF', 'TIGER 헬스케어 ETF', '바이오 ETF'],
  '배당':      ['KODEX 고배당 ETF', 'TIGER 고배당 ETF', '배당 ETF 투자'],
  '삼성전자 레버리지': ['KODEX 삼성전자 단일종목 레버리지', 'TIGER 삼성전자 단일종목 레버리지', '삼성전자 레버리지 ETF'],
  'SK하이닉스 레버리지': ['KODEX SK하이닉스 단일종목 레버리지', 'TIGER SK하이닉스 단일종목 레버리지', 'SK하이닉스 레버리지 ETF'],
  '미국우주테크': ['TIGER 미국우주테크 ETF', 'ACE 미국우주테크액티브', '우주테크 ETF 스페이스X'],
};

// Google News RSS — 무인증, 한국어 최신순
async function fetchGoogleNews(keyword: string): Promise<NewsItem[]> {
  // when=7d 파라미터로 최근 7일 이내 뉴스만
  const q = encodeURIComponent(keyword);
  const url = `https://news.google.com/rss/search?q=${q}+when:7d&hl=ko&gl=KR&ceid=KR:ko`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ETFDashboard/1.0)' },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const xml = await res.text();

  const items: NewsItem[] = [];
  const rx = /<item>([\s\S]*?)<\/item>/g;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = rx.exec(xml)) && i < 8) {
    const b = m[1];
    const title     = stripTags(getTag(b, 'title'));
    const link      = getGoogleLink(b);
    const pubDate   = getTag(b, 'pubDate');
    const desc      = stripTags(getTag(b, 'description'));
    const srcM      = b.match(/<source[^>]*url="([^"]+)"[^>]*>([^<]+)<\/source>/);
    const source    = srcM ? srcM[2] : extractDomain(link);
    if (!title || !link) continue;
    items.push({
      id: `gn-${i}-${Date.now()}`,
      type: 'news',
      title,
      summary: desc.slice(0, 120),
      url: link,
      source,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    });
    i++;
  }
  return items;
}

// 네이버 금융 뉴스 RSS — 무인증, ETF 관련 최신 기사
async function fetchNaverFinanceNews(keyword: string): Promise<NewsItem[]> {
  const q = encodeURIComponent(keyword);
  // 네이버 금융 뉴스 검색 RSS
  const url = `https://finance.naver.com/news/news_search.nhn?q=${q}&x=0&y=0`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://finance.naver.com',
      },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const html = await res.text();

    // 기사 목록 파싱
    const items: NewsItem[] = [];
    const linkRx = /href="(\/news\/news_read\.nhn\?[^"]+)"[^>]*>\s*<dl>\s*<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd class="date">([^<]+)<\/dd>/g;
    let m: RegExpExecArray | null;
    let i = 0;
    while ((m = linkRx.exec(html)) && i < 6) {
      const path  = m[1];
      const title = stripTags(m[2]).trim();
      const date  = m[3].trim();
      if (!title) continue;
      items.push({
        id: `nf-${i}-${Date.now()}`,
        type: 'news',
        title,
        summary: '',
        url: `https://finance.naver.com${path}`,
        source: '네이버 금융',
        publishedAt: parseNaverDate(date),
      });
      i++;
    }
    return items;
  } catch { return []; }
}

// 네이버 API (키 있을 때)
async function fetchNaverAPI(keyword: string): Promise<{ news: NewsItem[]; blogs: NewsItem[] }> {
  const id  = process.env.NAVER_CLIENT_ID;
  const sec = process.env.NAVER_CLIENT_SECRET;
  if (!id || !sec) return { news: [], blogs: [] };

  const headers = { 'X-Naver-Client-Id': id, 'X-Naver-Client-Secret': sec };

  const [nr, br] = await Promise.allSettled([
    fetch(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(keyword)}&display=10&sort=date`, { headers, cache:'no-store' }),
    fetch(`https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(keyword)}&display=8&sort=date`,  { headers, cache:'no-store' }),
  ]);

  const news: NewsItem[] = [];
  const blogs: NewsItem[] = [];

  if (nr.status === 'fulfilled' && nr.value.ok) {
    const d = await nr.value.json();
    for (const [i, it] of (d.items ?? []).entries()) {
      news.push({ id:`nv-${i}`, type:'news', title:stripTags(it.title), summary:stripTags(it.description).slice(0,120),
        url:it.originallink||it.link, source:extractDomain(it.originallink||it.link), publishedAt:new Date(it.pubDate).toISOString() });
    }
  }
  if (br.status === 'fulfilled' && br.value.ok) {
    const d = await br.value.json();
    for (const [i, it] of (d.items ?? []).entries()) {
      blogs.push({ id:`nb-${i}`, type:'blog', title:stripTags(it.title), summary:stripTags(it.description).slice(0,120),
        url:it.link, source:it.bloggername,
        publishedAt: it.postdate?.length===8
          ? `${it.postdate.slice(0,4)}-${it.postdate.slice(4,6)}-${it.postdate.slice(6)}T00:00:00Z`
          : new Date().toISOString() });
    }
  }
  return { news, blogs };
}

// YouTube (키 있을 때)
async function fetchYouTube(keyword: string): Promise<NewsItem[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];
  try {
    const q = encodeURIComponent(keyword + ' ETF 2025');
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${q}&type=video&maxResults=6&order=date&key=${key}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const d = await res.json();
    return (d.items ?? []).map((it: {
      id:{videoId:string}; snippet:{title:string;description:string;channelTitle:string;publishedAt:string;thumbnails:{medium:{url:string}}};
    }, i: number) => ({
      id:`yt-${i}`, type:'youtube' as const,
      title:it.snippet.title, summary:it.snippet.description.slice(0,120),
      url:`https://www.youtube.com/watch?v=${it.id.videoId}`,
      source:it.snippet.channelTitle, publishedAt:it.snippet.publishedAt,
      thumbnail:it.snippet.thumbnails.medium.url,
    }));
  } catch { return []; }
}

// ── 유틸 ──
function getTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i'));
  return m ? m[1].trim() : '';
}
function getGoogleLink(block: string): string {
  // Google News 링크는 <link/> 다음 텍스트노드 or <link> 태그
  const m = block.match(/<link\/>\s*(https?:\/\/[^\s<]+)/);
  if (m) return m[1];
  const m2 = block.match(/<link[^>]*>(https?:\/\/[^<]+)<\/link>/);
  return m2 ? m2[1] : '';
}
function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g,'').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#39;/g,"'").trim();
}
function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.',''); } catch { return ''; }
}
function parseNaverDate(s: string): string {
  // "2025.05.14 10:32" or "10:32" (오늘)
  if (/^\d{4}\.\d{2}\.\d{2}/.test(s)) {
    return new Date(s.replace(/\./g,'-').replace(' ','T')+':00').toISOString();
  }
  return new Date().toISOString();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const theme = searchParams.get('theme') ?? '전체';
  const keywords = THEME_KW[theme] ?? THEME_KW['전체'];

  // 키워드별 병렬 fetch (첫 번째 키워드는 Google News + 네이버 금융, 나머지는 Google News만)
  const [mainGN, naverFin, extraGN, naverAPI, ytItems] = await Promise.allSettled([
    fetchGoogleNews(keywords[0]),
    fetchNaverFinanceNews(keywords[0]),
    keywords[1] ? fetchGoogleNews(keywords[1]) : Promise.resolve([]),
    fetchNaverAPI(keywords[0]),
    fetchYouTube(keywords[0]),
  ]);

  const rawNews: NewsItem[] = [
    ...(naverAPI.status==='fulfilled' ? naverAPI.value.news : []),
    ...(mainGN.status==='fulfilled'   ? mainGN.value : []),
    ...(naverFin.status==='fulfilled' ? naverFin.value : []),
    ...(extraGN.status==='fulfilled'  ? extraGN.value : []),
  ];
  const rawBlogs:  NewsItem[] = naverAPI.status==='fulfilled' ? naverAPI.value.blogs : [];
  const rawVideos: NewsItem[] = ytItems.status==='fulfilled'  ? ytItems.value        : [];

  // 중복 URL 제거 + 최신순 정렬
  const dedup = (arr: NewsItem[]) => {
    const seen = new Set<string>();
    return arr
      .filter(i => { if(seen.has(i.url)) return false; seen.add(i.url); return true; })
      .sort((a,b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  };

  const hasNaver = !!process.env.NAVER_CLIENT_ID;
  const hasYT    = !!process.env.YOUTUBE_API_KEY;

  return NextResponse.json({
    theme,
    news:      dedup(rawNews).slice(0, 12),
    blogs:     dedup(rawBlogs).slice(0, 8),
    videos:    dedup(rawVideos).slice(0, 6),
    fetchedAt: new Date().toISOString(),
    sources: {
      news:    hasNaver ? '네이버 뉴스 API + Google News RSS' : 'Google News RSS (실시간, 최근 7일)',
      blogs:   hasNaver ? '네이버 블로그 API' : '네이버 블로그 — NAVER_CLIENT_ID 추가 시 활성화',
      youtube: hasYT    ? 'YouTube Data API v3' : 'YouTube — YOUTUBE_API_KEY 추가 시 활성화',
    },
  });
}
