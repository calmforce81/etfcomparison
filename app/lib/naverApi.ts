/**
 * 네이버 금융 ETF API fetcher
 *
 * 사용하는 엔드포인트:
 * 1. etfItemList  : 전종목 현재가·NAV·거래량·수익률 (무료, 인증 불필요)
 *    GET https://finance.naver.com/api/sise/etfItemList.nhn
 *
 * 2. 일별 시세    : 특정 종목 과거 가격 (XML, OHLCV)
 *    GET https://fchart.stock.naver.com/sise.nhn?symbol={code}&timeframe=day&count=70&requestType=0
 *
 * 주의: 네이버 비공개 API이므로 서버사이드(Next.js API route)에서만 호출.
 *       브라우저 직접 호출은 CORS 차단됨.
 */

export interface NaverEtfItem {
  itemcode: string;       // 종목코드
  itemname: string;       // 종목명
  nowVal: number;         // 현재가
  changeVal: number;      // 전일 대비 변동
  changeRate: number;     // 등락률(%)
  nav: number;            // NAV
  threeMonthEarnRate: number; // 3개월 수익률
  quant: number;          // 거래량
  amonut: number;         // 거래대금(백만)
  marketSum: number;      // 시가총액(억)
  risefall: string;       // 1=상한,2=상승,3=보합,4=하락,5=하한
}

const NAVER_ETF_LIST_URL =
  'https://finance.naver.com/api/sise/etfItemList.nhn?etfType=0&targetColumn=market_sum&sortOrder=desc';

const NAVER_CHART_BASE =
  'https://fchart.stock.naver.com/sise.nhn?timeframe=day&requestType=0';

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Referer: 'https://finance.naver.com/',
};

/** 전체 ETF 목록을 가져와 종목코드→데이터 맵으로 반환 */
export async function fetchNaverEtfList(): Promise<Map<string, NaverEtfItem>> {
  const res = await fetch(NAVER_ETF_LIST_URL, {
    headers: HEADERS,
    next: { revalidate: 30 }, // 30초 ISR 캐시
  });

  if (!res.ok) throw new Error(`네이버 ETF 목록 API 실패: ${res.status}`);

  const json = await res.json();
  const items: NaverEtfItem[] = json?.result?.etfItemList ?? [];

  const map = new Map<string, NaverEtfItem>();
  for (const item of items) {
    map.set(item.itemcode, item);
  }
  return map;
}

/** 특정 종목의 일별 종가 배열을 반환 (최근 count 영업일) */
export async function fetchNaverEtfHistory(
  code: string,
  count = 70
): Promise<number[]> {
  const url = `${NAVER_CHART_BASE}&symbol=${code}&count=${count}`;
  const res = await fetch(url, {
    headers: HEADERS,
    next: { revalidate: 3600 }, // 1시간 캐시 (히스토리는 자주 안 변함)
  });

  if (!res.ok) throw new Error(`네이버 차트 API 실패: ${code} ${res.status}`);

  // XML 응답: <item data="20240101|시가|고가|저가|종가|거래량"/>
  const xml = await res.text();
  const matches = [...xml.matchAll(/data="([^"]+)"/g)];

  return matches
    .map((m) => {
      const parts = m[1].split('|');
      return parseInt(parts[4], 10); // 종가
    })
    .filter((v) => !isNaN(v) && v > 0);
}

/** NAV 괴리율 계산 */
export function calcDiscount(price: number, nav: number): number {
  if (!nav) return 0;
  return parseFloat(((price / nav - 1) * 100).toFixed(2));
}

/** 시가총액(억) → 표시 문자열 */
export function fmtMarketSum(sum: number): string {
  if (sum >= 10000) return `${(sum / 10000).toFixed(1)}조`;
  return `${sum.toLocaleString('ko-KR')}억`;
}

/** 거래량 → 표시 문자열 */
export function fmtQuant(q: number): string {
  if (q >= 10000) return `${Math.round(q / 10000)}만주`;
  return `${q.toLocaleString('ko-KR')}주`;
}

/** 히스토리에서 기간별 슬라이스 추출 */
export function sliceHistory(
  prices: number[],
  period: '1W' | '1M' | '3M'
): number[] {
  const n = prices.length;
  if (period === '1W') return prices.slice(Math.max(n - 6, 0));
  if (period === '1M') return prices.slice(Math.max(n - 22, 0));
  return prices.slice(Math.max(n - 65, 0));
}

/** 거래량 히스토리에서 최근 10거래일 슬라이스 (단위: 만주) */
export function sliceVolHistory(volumes: number[]): number[] {
  const recent = volumes.slice(-10);
  return recent.map(v => Math.round(v / 10000));
}
