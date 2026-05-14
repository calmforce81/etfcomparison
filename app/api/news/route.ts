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

// 테마별 검색 키워드
const THEME_KEYWORDS: Record<string, string> = {
  '전체':      'KODEX TIGER ETF 삼성자산운용',
  '반도체':    'KODEX 반도체 TIGER 반도체 ETF',
  '2차전지':   'KODEX 2차전지 TIGER 2차전지 ETF',
  '미국나스닥': 'KODEX 나스닥 TIGER 나스닥 ETF',
  '헬스케어':  'KODEX 헬스케어 TIGER 헬스케어 ETF',
  '배당':      'KODEX 고배당 TIGER 고배당 ETF',
};

// Google News RSS — 키 불필요, CORS 우회 위해 서버사이드에서 호출
async function fetchGoogleNewsRSS(keyword: string): Promise<NewsItem[]> {
  const encoded = encodeURIComponent(keyword);
  const url = `https://news.google.com/rss/search?q=${encoded}&hl=ko&gl=KR&ceid=KR:ko`;

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ETFBot/1.0)' },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Google News RSS ${res.status}`);

  const xml = await res.text();

  // <item> 파싱
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let idx = 0;

  while ((match = itemRegex.exec(xml)) !== null && idx < 10) {
    const block = match[1];

    const title    = stripTags(extractTag(block, 'title'));
    const link     = extractTag(block, 'link') || extractCdata(block, 'link');
    const pubDate  = extractTag(block, 'pubDate');
    const desc     = stripTags(extractTag(block, 'description'));
    // Google News 링크는 리다이렉트 URL — source 이름은 description 안에 있음
    const srcMatch = block.match(/<source[^>]*>([^<]+)<\/source>/);
    const source   = srcMatch ? srcMatch[1] : extractDomain(link);

    if (!title || !link) continue;

    items.push({
      id:          `gn-${idx}-${Date.now()}`,
      type:        'news',
      title,
      summary:     desc || '',
      url:         link,
      source,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    });
    idx++;
  }
  return items;
}

// 네이버 뉴스 검색 (API 키 있을 때만)
async function fetchNaverNews(keyword: string): Promise<NewsItem[]> {
  const id  = process.env.NAVER_CLIENT_ID;
  const sec = process.env.NAVER_CLIENT_SECRET;
  if (!id || !sec) return [];

  const res = await fetch(
    `https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(keyword)}&display=10&sort=date`,
    { headers: { 'X-Naver-Client-Id': id, 'X-Naver-Client-Secret': sec }, next: { revalidate: 300 } }
  );
  if (!res.ok) return [];
  const data = await res.json();

  return (data.items ?? []).map((it: {
    title: string; description: string; originallink: string; link: string; pubDate: string;
  }, i: number) => ({
    id:          `nv-${i}-${Date.now()}`,
    type:        'news' as const,
    title:       stripTags(it.title),
    summary:     stripTags(it.description),
    url:         it.originallink || it.link,
    source:      extractDomain(it.originallink || it.link),
    publishedAt: new Date(it.pubDate).toISOString(),
  }));
}

// 네이버 블로그 검색 (API 키 있을 때만)
async function fetchNaverBlog(keyword: string): Promise<NewsItem[]> {
  const id  = process.env.NAVER_CLIENT_ID;
  const sec = process.env.NAVER_CLIENT_SECRET;
  if (!id || !sec) return [];

  const res = await fetch(
    `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(keyword)}&display=8&sort=date`,
    { headers: { 'X-Naver-Client-Id': id, 'X-Naver-Client-Secret': sec }, next: { revalidate: 300 } }
  );
  if (!res.ok) return [];
  const data = await res.json();

  return (data.items ?? []).map((it: {
    title: string; description: string; link: string; bloggername: string; postdate: string;
  }, i: number) => ({
    id:          `nb-${i}-${Date.now()}`,
    type:        'blog' as const,
    title:       stripTags(it.title),
    summary:     stripTags(it.description),
    url:         it.link,
    source:      it.bloggername,
    publishedAt: it.postdate
      ? `${it.postdate.slice(0,4)}-${it.postdate.slice(4,6)}-${it.postdate.slice(6,8)}T00:00:00Z`
      : new Date().toISOString(),
  }));
}

// YouTube Data API v3 (키 있을 때만)
async function fetchYouTube(keyword: string): Promise<NewsItem[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword+' ETF')}&type=video&maxResults=6&order=date&key=${key}`,
    { next: { revalidate: 600 } }
  );
  if (!res.ok) return [];
  const data = await res.json();

  return (data.items ?? []).map((it: {
    id: { videoId: string };
    snippet: { title: string; description: string; channelTitle: string; publishedAt: string; thumbnails: { medium: { url: string } } };
  }, i: number) => ({
    id:          `yt-${i}-${Date.now()}`,
    type:        'youtube' as const,
    title:       it.snippet.title,
    summary:     it.snippet.description,
    url:         `https://www.youtube.com/watch?v=${it.id.videoId}`,
    source:      it.snippet.channelTitle,
    publishedAt: it.snippet.publishedAt,
    thumbnail:   it.snippet.thumbnails.medium.url,
  }));
}

// ── 유틸 ──
function extractTag(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`))||
            xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  return m ? m[1].trim() : '';
}
function extractCdata(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]>`));
  return m ? m[1].trim() : '';
}
function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '').replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();
}
function extractDomain(url: string): string {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const theme   = searchParams.get('theme') ?? '전체';
  const keyword = THEME_KEYWORDS[theme] ?? THEME_KEYWORDS['전체'];

  // Google News는 항상 실행, 네이버/유튜브는 키 있을 때만
  const [googleNews, naverNews, blogs, videos] = await Promise.allSettled([
    fetchGoogleNewsRSS(keyword),
    fetchNaverNews(keyword),
    fetchNaverBlog(keyword),
    fetchYouTube(keyword),
  ]);

  const news: NewsItem[] = [
    ...(naverNews.status === 'fulfilled' ? naverNews.value : []),
    ...(googleNews.status === 'fulfilled' ? googleNews.value : []),
  ];
  const blogItems  = blogs.status  === 'fulfilled' ? blogs.value  : [];
  const videoItems = videos.status === 'fulfilled' ? videos.value : [];

  // 중복 URL 제거
  const seen = new Set<string>();
  const deduped = [...news, ...blogItems, ...videoItems].filter(item => {
    if (seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });

  const hasNaverKey = !!(process.env.NAVER_CLIENT_ID);
  const hasYTKey    = !!(process.env.YOUTUBE_API_KEY);

  return NextResponse.json({
    theme,
    news:       deduped.filter(i => i.type === 'news'),
    blogs:      deduped.filter(i => i.type === 'blog'),
    videos:     deduped.filter(i => i.type === 'youtube'),
    fetchedAt:  new Date().toISOString(),
    sources: {
      news:    hasNaverKey ? '네이버 뉴스 API + Google News RSS' : 'Google News RSS (실시간)',
      blogs:   hasNaverKey ? '네이버 블로그 API' : '네이버 블로그 API 키 미설정',
      youtube: hasYTKey    ? 'YouTube Data API v3' : 'YouTube API 키 미설정',
    },
  });
}
