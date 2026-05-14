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

const THEME_KEYWORDS: Record<string, string> = {
  '반도체':   'KODEX 반도체 TIGER 반도체 ETF',
  '2차전지':  'KODEX 2차전지 TIGER 2차전지 ETF',
  '미국나스닥':'KODEX 나스닥 TIGER 나스닥 ETF',
  '헬스케어': 'KODEX 헬스케어 TIGER 헬스케어 ETF',
  '배당':     'KODEX 고배당 TIGER 고배당 ETF',
  '전체':     'KODEX TIGER ETF 삼성자산운용 미래에셋',
};

// 네이버 뉴스 검색 API (OpenAPI 키 없이 사용 가능한 RSS)
async function fetchNaverNewsRSS(keyword: string): Promise<NewsItem[]> {
  const encoded = encodeURIComponent(keyword);
  const url = `https://news.naver.com/search/results.nhn?query=${encoded}&field=0&where=news`;

  // 네이버 금융 뉴스 RSS
  const rssUrl = `https://finance.naver.com/news/news_search.nhn?q=${encoded}`;

  try {
    const res = await fetch(
      `https://openapi.naver.com/v1/search/news.json?query=${encoded}&display=10&sort=date`,
      {
        headers: {
          'X-Naver-Client-Id':     process.env.NAVER_CLIENT_ID     ?? '',
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET ?? '',
        },
        next: { revalidate: 300 }, // 5분 캐시
      }
    );

    if (!res.ok) throw new Error('naver api fail');

    const data = await res.json();
    return (data.items ?? []).map((item: {
      title: string; description: string; link: string;
      originallink: string; pubDate: string;
    }, i: number) => ({
      id:          `news-${i}-${Date.now()}`,
      type:        'news' as const,
      title:       item.title.replace(/<[^>]+>/g, ''),
      summary:     item.description.replace(/<[^>]+>/g, ''),
      url:         item.originallink || item.link,
      source:      new URL(item.originallink || item.link).hostname.replace('www.', ''),
      publishedAt: item.pubDate,
      thumbnail:   undefined,
    }));
  } catch {
    // fallback: 샘플 뉴스
    return getMockNews(keyword);
  }
}

async function fetchNaverBlogRSS(keyword: string): Promise<NewsItem[]> {
  try {
    const encoded = encodeURIComponent(keyword);
    const res = await fetch(
      `https://openapi.naver.com/v1/search/blog.json?query=${encoded}&display=8&sort=date`,
      {
        headers: {
          'X-Naver-Client-Id':     process.env.NAVER_CLIENT_ID     ?? '',
          'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET ?? '',
        },
        next: { revalidate: 300 },
      }
    );
    if (!res.ok) throw new Error('blog api fail');
    const data = await res.json();
    return (data.items ?? []).map((item: {
      title: string; description: string; link: string;
      bloggername: string; postdate: string;
    }, i: number) => ({
      id:          `blog-${i}-${Date.now()}`,
      type:        'blog' as const,
      title:       item.title.replace(/<[^>]+>/g, ''),
      summary:     item.description.replace(/<[^>]+>/g, ''),
      url:         item.link,
      source:      item.bloggername,
      publishedAt: item.postdate,
    }));
  } catch {
    return getMockBlogs(keyword);
  }
}

async function fetchYouTube(keyword: string): Promise<NewsItem[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) return getMockYouTube(keyword);

  try {
    const encoded = encodeURIComponent(keyword + ' ETF 투자');
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encoded}&type=video&maxResults=6&order=date&key=${apiKey}`,
      { next: { revalidate: 600 } }
    );
    if (!res.ok) throw new Error('youtube fail');
    const data = await res.json();
    return (data.items ?? []).map((item: {
      id: { videoId: string };
      snippet: { title: string; description: string; channelTitle: string; publishedAt: string; thumbnails: { medium: { url: string } } };
    }, i: number) => ({
      id:          `yt-${i}-${Date.now()}`,
      type:        'youtube' as const,
      title:       item.snippet.title,
      summary:     item.snippet.description,
      url:         `https://www.youtube.com/watch?v=${item.id.videoId}`,
      source:      item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      thumbnail:   item.snippet.thumbnails.medium.url,
    }));
  } catch {
    return getMockYouTube(keyword);
  }
}

// ── Mock fallback ──
function getMockNews(keyword: string): NewsItem[] {
  const theme = keyword.split(' ')[0];
  const now = new Date();
  return [
    { id:'mn1', type:'news', title:`${theme} ETF 거래량 급증… 기관 매수세 집중`, summary:'외국인과 기관이 동반 순매수에 나서며 거래대금이 크게 늘었다.', url:'https://finance.naver.com', source:'네이버 금융', publishedAt: new Date(now.getTime()-3600000).toISOString() },
    { id:'mn2', type:'news', title:`KODEX vs TIGER ${theme} 수익률 비교 분석`, summary:'두 상품의 추종 지수 차이와 수익률 격차 원인을 분석했다.', url:'https://finance.naver.com', source:'한국경제', publishedAt: new Date(now.getTime()-7200000).toISOString() },
    { id:'mn3', type:'news', title:`${theme} 테마 ETF 순자산 변동 현황`, summary:'최근 한 달간 자금 유입·유출 동향을 정리했다.', url:'https://finance.naver.com', source:'머니투데이', publishedAt: new Date(now.getTime()-86400000).toISOString() },
  ];
}
function getMockBlogs(keyword: string): NewsItem[] {
  const theme = keyword.split(' ')[0];
  const now = new Date();
  return [
    { id:'mb1', type:'blog', title:`[ETF 비교] ${theme} KODEX vs TIGER 어떤 게 나을까`, summary:'두 상품의 보수율, 괴리율, 수익률을 직접 비교해봤습니다.', url:'https://blog.naver.com', source:'투자연구소', publishedAt: new Date(now.getTime()-172800000).toISOString() },
    { id:'mb2', type:'blog', title:`${theme} ETF 포트폴리오 구성 전략`, summary:'장기 투자 관점에서 섹터 ETF 비중 배분 방법을 다룹니다.', url:'https://blog.naver.com', source:'ETF마스터', publishedAt: new Date(now.getTime()-259200000).toISOString() },
  ];
}
function getMockYouTube(keyword: string): NewsItem[] {
  const theme = keyword.split(' ')[0];
  const now = new Date();
  return [
    { id:'my1', type:'youtube', title:`${theme} ETF 완전 분석 - KODEX vs TIGER 비교`, summary:'두 상품의 구성 종목, 수익률, 보수를 영상으로 비교합니다.', url:'https://youtube.com', source:'ETF인사이트', publishedAt: new Date(now.getTime()-86400000).toISOString(), thumbnail:'' },
    { id:'my2', type:'youtube', title:`지금 ${theme} ETF 사도 될까? 전문가 의견`, summary:'시장 환경과 밸류에이션 관점에서 투자 시점을 분석합니다.', url:'https://youtube.com', source:'주식읽어드립니다', publishedAt: new Date(now.getTime()-172800000).toISOString(), thumbnail:'' },
  ];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const theme = searchParams.get('theme') ?? '전체';
  const keyword = THEME_KEYWORDS[theme] ?? THEME_KEYWORDS['전체'];

  const [news, blogs, videos] = await Promise.all([
    fetchNaverNewsRSS(keyword),
    fetchNaverBlogRSS(keyword),
    fetchYouTube(keyword),
  ]);

  return NextResponse.json({
    theme,
    news,
    blogs,
    videos,
    fetchedAt: new Date().toISOString(),
    sources: {
      news:    process.env.NAVER_CLIENT_ID ? '네이버 뉴스 API' : 'Mock',
      blogs:   process.env.NAVER_CLIENT_ID ? '네이버 블로그 API' : 'Mock',
      youtube: process.env.YOUTUBE_API_KEY ? 'YouTube Data API v3' : 'Mock',
    },
  });
}
