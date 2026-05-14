// ── 데이터 신뢰도 메타 ──
export interface DataMeta {
  source: string;         // 출처 (예: 네이버 금융 etfItemList API)
  sourceUrl: string;      // 원본 URL
  fetchedAt: string;      // 조회 시각 (ISO)
  calcNote: string;       // 산출 방식 설명
  unit: string;           // 단위
}

export interface EtfData {
  ticker: string;
  code: string;           // 종목코드
  isin: string;           // ISIN 코드
  exchange: string;       // 상장 거래소
  price: number;
  change: number;
  nav: number;
  aum: string;
  aumRaw: number;
  vol: string;
  volRaw: number;
  expense: number;
  discount: number;
  month1: number[];
  week1: number[];
  month3: number[];
  volHistory: number[];
  // 신뢰도 메타
  meta: {
    price:   DataMeta;
    nav:     DataMeta;
    aum:     DataMeta;
    vol:     DataMeta;
    expense: DataMeta;
  };
}

export interface ThemeData {
  name: string;
  fetchedAt: string;      // 테마 데이터 조회 시각
  k: EtfData;
  t: EtfData;
}

export interface AlertItem {
  id: string;
  type: 'discount' | 'aum' | 'performance' | 'new';
  theme: string;
  message: string;
  time: string;
  severity: 'info' | 'warning' | 'danger';
}

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

// ── Mock 메타 팩토리 ──
function mockMeta(overrides: Partial<DataMeta> = {}): DataMeta {
  return {
    source: 'Mock 데이터',
    sourceUrl: '',
    fetchedAt: new Date().toISOString(),
    calcNote: '샘플 데이터',
    unit: '',
    ...overrides,
  };
}

// ── THEMES Mock 데이터 ──
export const THEMES: ThemeData[] = [
  {
    name: '반도체', fetchedAt: new Date().toISOString(),
    k: {
      ticker: 'KODEX 반도체', code: '091160', isin: 'KR7091160005', exchange: 'KRX',
      price: 42150, change: 1.23, nav: 42080,
      aum: '8,420억', aumRaw: 842000000000,
      vol: '312만주', volRaw: 3120000,
      expense: 0.45, discount: 0.17,
      week1:  [41200,41500,41800,41600,42150],
      month1: [38200,39100,40300,39800,41200,40900,42150],
      month3: [34500,35800,37200,36500,38200,39100,40300,39800,41200,40900,42150],
      volHistory: [280,310,290,320,350,300,280,330,315,312],
      meta: {
        price:   mockMeta({ source:'네이버 금융', calcNote:'당일 체결 기준 현재가', unit:'원' }),
        nav:     mockMeta({ source:'한국거래소(KRX)', calcNote:'전일 종가 기준 순자산가치 / 발행좌수', unit:'원' }),
        aum:     mockMeta({ source:'한국거래소(KRX)', calcNote:'NAV × 상장좌수 합산 (억원 단위)', unit:'억원' }),
        vol:     mockMeta({ source:'네이버 금융', calcNote:'당일 장중 누적 체결량 (주 단위)', unit:'주' }),
        expense: mockMeta({ source:'운용사 공시', calcNote:'연간 총보수율 (운용+판매+수탁+사무관리)', unit:'%/년' }),
      },
    },
    t: {
      ticker: 'TIGER 반도체', code: '091230', isin: 'KR7091230006', exchange: 'KRX',
      price: 13870, change: 0.98, nav: 13910,
      aum: '5,180억', aumRaw: 518000000000,
      vol: '201만주', volRaw: 2010000,
      expense: 0.40, discount: -0.29,
      week1:  [13500,13600,13700,13750,13870],
      month1: [12600,12900,13200,13100,13500,13750,13870],
      month3: [11200,11800,12200,11900,12600,12900,13200,13100,13500,13750,13870],
      volHistory: [190,210,195,220,230,200,185,215,205,201],
      meta: {
        price:   mockMeta({ source:'네이버 금융', calcNote:'당일 체결 기준 현재가', unit:'원' }),
        nav:     mockMeta({ source:'한국거래소(KRX)', calcNote:'전일 종가 기준 순자산가치 / 발행좌수', unit:'원' }),
        aum:     mockMeta({ source:'한국거래소(KRX)', calcNote:'NAV × 상장좌수 합산 (억원 단위)', unit:'억원' }),
        vol:     mockMeta({ source:'네이버 금융', calcNote:'당일 장중 누적 체결량 (주 단위)', unit:'주' }),
        expense: mockMeta({ source:'운용사 공시', calcNote:'연간 총보수율 (운용+판매+수탁+사무관리)', unit:'%/년' }),
      },
    },
  },
  {
    name: '2차전지', fetchedAt: new Date().toISOString(),
    k: {
      ticker: 'KODEX 2차전지산업', code: '305720', isin: 'KR7305720002', exchange: 'KRX',
      price: 9840, change: -0.61, nav: 9850,
      aum: '6,710억', aumRaw: 671000000000,
      vol: '489만주', volRaw: 4890000,
      expense: 0.45, discount: -0.10,
      week1:  [9950,9900,9870,9820,9840],
      month1: [10200,10050,9900,9780,9650,9720,9840],
      month3: [11200,10800,10500,10200,10050,9900,9780,9650,9720,9800,9840],
      volHistory: [450,480,510,470,500,520,490,480,495,489],
      meta: {
        price:   mockMeta({ source:'네이버 금융', calcNote:'당일 체결 기준 현재가', unit:'원' }),
        nav:     mockMeta({ source:'한국거래소(KRX)', calcNote:'전일 종가 기준 순자산가치 / 발행좌수', unit:'원' }),
        aum:     mockMeta({ source:'한국거래소(KRX)', calcNote:'NAV × 상장좌수 합산 (억원 단위)', unit:'억원' }),
        vol:     mockMeta({ source:'네이버 금융', calcNote:'당일 장중 누적 체결량 (주 단위)', unit:'주' }),
        expense: mockMeta({ source:'운용사 공시', calcNote:'연간 총보수율 (운용+판매+수탁+사무관리)', unit:'%/년' }),
      },
    },
    t: {
      ticker: 'TIGER 2차전지테마', code: '305540', isin: 'KR7305540004', exchange: 'KRX',
      price: 9120, change: -0.87, nav: 9130,
      aum: '4,230억', aumRaw: 423000000000,
      vol: '330만주', volRaw: 3300000,
      expense: 0.40, discount: -0.11,
      week1:  [9250,9200,9180,9100,9120],
      month1: [9600,9450,9280,9150,9050,9080,9120],
      month3: [10500,10200,9900,9600,9450,9280,9150,9050,9080,9100,9120],
      volHistory: [310,330,350,320,340,360,330,325,340,330],
      meta: {
        price:   mockMeta({ source:'네이버 금융', calcNote:'당일 체결 기준 현재가', unit:'원' }),
        nav:     mockMeta({ source:'한국거래소(KRX)', calcNote:'전일 종가 기준 순자산가치 / 발행좌수', unit:'원' }),
        aum:     mockMeta({ source:'한국거래소(KRX)', calcNote:'NAV × 상장좌수 합산 (억원 단위)', unit:'억원' }),
        vol:     mockMeta({ source:'네이버 금융', calcNote:'당일 장중 누적 체결량 (주 단위)', unit:'주' }),
        expense: mockMeta({ source:'운용사 공시', calcNote:'연간 총보수율 (운용+판매+수탁+사무관리)', unit:'%/년' }),
      },
    },
  },
  {
    name: '미국나스닥', fetchedAt: new Date().toISOString(),
    k: {
      ticker: 'KODEX 미국나스닥100TR', code: '379800', isin: 'KR7379800003', exchange: 'KRX',
      price: 18240, change: 0.72, nav: 18220,
      aum: '12,850억', aumRaw: 1285000000000,
      vol: '55만주', volRaw: 550000,
      expense: 0.05, discount: 0.11,
      week1:  [17900,18000,18100,18150,18240],
      month1: [17100,17400,17600,17850,17950,18100,18240],
      month3: [15800,16200,16800,17100,17400,17600,17850,17950,18100,18180,18240],
      volHistory: [48,52,50,55,58,51,53,57,54,55],
      meta: {
        price:   mockMeta({ source:'네이버 금융', calcNote:'당일 체결 기준 현재가 (원화 환산)', unit:'원' }),
        nav:     mockMeta({ source:'한국거래소(KRX)', calcNote:'Nasdaq-100 TR Index 추종, USD 기준 NAV를 당일 환율로 환산', unit:'원' }),
        aum:     mockMeta({ source:'한국거래소(KRX)', calcNote:'NAV × 상장좌수 합산 (억원 단위)', unit:'억원' }),
        vol:     mockMeta({ source:'네이버 금융', calcNote:'당일 장중 누적 체결량 (주 단위)', unit:'주' }),
        expense: mockMeta({ source:'운용사 공시', calcNote:'연간 총보수율 (해외 지수 ETF 특성상 낮은 보수)', unit:'%/년' }),
      },
    },
    t: {
      ticker: 'TIGER 미국나스닥100', code: '133690', isin: 'KR7133690008', exchange: 'KRX',
      price: 98750, change: 0.68, nav: 98600,
      aum: '9,620억', aumRaw: 962000000000,
      vol: '28만주', volRaw: 280000,
      expense: 0.07, discount: 0.15,
      week1:  [97200,97600,98000,98400,98750],
      month1: [92000,93500,94800,95900,96500,97800,98750],
      month3: [85000,87500,90000,92000,93500,94800,95900,96500,97800,98200,98750],
      volHistory: [25,27,26,28,30,26,27,29,27,28],
      meta: {
        price:   mockMeta({ source:'네이버 금융', calcNote:'당일 체결 기준 현재가 (원화 환산)', unit:'원' }),
        nav:     mockMeta({ source:'한국거래소(KRX)', calcNote:'Nasdaq-100 Index 추종, USD 기준 NAV를 당일 환율로 환산', unit:'원' }),
        aum:     mockMeta({ source:'한국거래소(KRX)', calcNote:'NAV × 상장좌수 합산 (억원 단위)', unit:'억원' }),
        vol:     mockMeta({ source:'네이버 금융', calcNote:'당일 장중 누적 체결량 (주 단위)', unit:'주' }),
        expense: mockMeta({ source:'운용사 공시', calcNote:'연간 총보수율 (해외 지수 ETF)', unit:'%/년' }),
      },
    },
  },
  {
    name: '헬스케어', fetchedAt: new Date().toISOString(),
    k: {
      ticker: 'KODEX 헬스케어', code: '266410', isin: 'KR7266410007', exchange: 'KRX',
      price: 11380, change: 0.35, nav: 11370,
      aum: '2,140억', aumRaw: 214000000000,
      vol: '78만주', volRaw: 780000,
      expense: 0.45, discount: 0.09,
      week1:  [11200,11250,11300,11350,11380],
      month1: [10900,11000,11100,11050,11200,11300,11380],
      month3: [10200,10400,10600,10900,11000,11100,11050,11200,11300,11350,11380],
      volHistory: [72,80,75,82,85,78,74,80,77,78],
      meta: {
        price:   mockMeta({ source:'네이버 금융', calcNote:'당일 체결 기준 현재가', unit:'원' }),
        nav:     mockMeta({ source:'한국거래소(KRX)', calcNote:'전일 종가 기준 순자산가치 / 발행좌수', unit:'원' }),
        aum:     mockMeta({ source:'한국거래소(KRX)', calcNote:'NAV × 상장좌수 합산 (억원 단위)', unit:'억원' }),
        vol:     mockMeta({ source:'네이버 금융', calcNote:'당일 장중 누적 체결량 (주 단위)', unit:'주' }),
        expense: mockMeta({ source:'운용사 공시', calcNote:'연간 총보수율 (운용+판매+수탁+사무관리)', unit:'%/년' }),
      },
    },
    t: {
      ticker: 'TIGER 헬스케어', code: '143860', isin: 'KR7143860001', exchange: 'KRX',
      price: 17650, change: 0.23, nav: 17630,
      aum: '1,870억', aumRaw: 187000000000,
      vol: '42만주', volRaw: 420000,
      expense: 0.40, discount: 0.11,
      week1:  [17500,17530,17580,17620,17650],
      month1: [16800,17000,17100,17050,17200,17500,17650],
      month3: [15800,16000,16300,16800,17000,17100,17050,17200,17500,17600,17650],
      volHistory: [38,42,40,44,46,41,39,43,41,42],
      meta: {
        price:   mockMeta({ source:'네이버 금융', calcNote:'당일 체결 기준 현재가', unit:'원' }),
        nav:     mockMeta({ source:'한국거래소(KRX)', calcNote:'전일 종가 기준 순자산가치 / 발행좌수', unit:'원' }),
        aum:     mockMeta({ source:'한국거래소(KRX)', calcNote:'NAV × 상장좌수 합산 (억원 단위)', unit:'억원' }),
        vol:     mockMeta({ source:'네이버 금융', calcNote:'당일 장중 누적 체결량 (주 단위)', unit:'주' }),
        expense: mockMeta({ source:'운용사 공시', calcNote:'연간 총보수율 (운용+판매+수탁+사무관리)', unit:'%/년' }),
      },
    },
  },
  {
    name: '배당', fetchedAt: new Date().toISOString(),
    k: {
      ticker: 'KODEX 고배당', code: '279530', isin: 'KR7279530005', exchange: 'KRX',
      price: 6230, change: 0.16, nav: 6220,
      aum: '3,890억', aumRaw: 389000000000,
      vol: '120만주', volRaw: 1200000,
      expense: 0.15, discount: 0.16,
      week1:  [6180,6190,6200,6210,6230],
      month1: [6050,6080,6120,6100,6150,6200,6230],
      month3: [5800,5880,5950,6050,6080,6120,6100,6150,6200,6210,6230],
      volHistory: [110,118,115,122,125,118,112,120,117,120],
      meta: {
        price:   mockMeta({ source:'네이버 금융', calcNote:'당일 체결 기준 현재가', unit:'원' }),
        nav:     mockMeta({ source:'한국거래소(KRX)', calcNote:'전일 종가 기준 순자산가치 / 발행좌수', unit:'원' }),
        aum:     mockMeta({ source:'한국거래소(KRX)', calcNote:'NAV × 상장좌수 합산 (억원 단위)', unit:'억원' }),
        vol:     mockMeta({ source:'네이버 금융', calcNote:'당일 장중 누적 체결량 (주 단위)', unit:'주' }),
        expense: mockMeta({ source:'운용사 공시', calcNote:'연간 총보수율 (배당 ETF 특성상 낮은 보수)', unit:'%/년' }),
      },
    },
    t: {
      ticker: 'TIGER 고배당', code: '210780', isin: 'KR7210780002', exchange: 'KRX',
      price: 6870, change: 0.10, nav: 6860,
      aum: '2,560억', aumRaw: 256000000000,
      vol: '88만주', volRaw: 880000,
      expense: 0.20, discount: 0.15,
      week1:  [6820,6830,6840,6855,6870],
      month1: [6680,6700,6730,6710,6760,6820,6870],
      month3: [6400,6450,6520,6680,6700,6730,6710,6760,6820,6850,6870],
      volHistory: [82,88,85,90,92,86,83,88,86,88],
      meta: {
        price:   mockMeta({ source:'네이버 금융', calcNote:'당일 체결 기준 현재가', unit:'원' }),
        nav:     mockMeta({ source:'한국거래소(KRX)', calcNote:'전일 종가 기준 순자산가치 / 발행좌수', unit:'원' }),
        aum:     mockMeta({ source:'한국거래소(KRX)', calcNote:'NAV × 상장좌수 합산 (억원 단위)', unit:'억원' }),
        vol:     mockMeta({ source:'네이버 금융', calcNote:'당일 장중 누적 체결량 (주 단위)', unit:'주' }),
        expense: mockMeta({ source:'운용사 공시', calcNote:'연간 총보수율', unit:'%/년' }),
      },
    },
  },
];

export const ALERTS: AlertItem[] = [
  { id:'1', type:'discount', theme:'반도체',    message:'TIGER 반도체 괴리율 -0.29% — 임계치 초과', time:'09:32', severity:'warning' },
  { id:'2', type:'aum',      theme:'2차전지',   message:'KODEX 2차전지 AUM 전일 대비 -8.2% 급감',    time:'10:15', severity:'danger'  },
  { id:'3', type:'performance',theme:'미국나스닥',message:'KODEX 나스닥100TR 1개월 수익률 TIGER 대비 +0.34%p 우위', time:'11:00', severity:'info' },
  { id:'4', type:'new',      theme:'전체',      message:'TIGER 글로벌AI&반도체 신규 상장 감지 (12/2)', time:'어제', severity:'info'  },
];
