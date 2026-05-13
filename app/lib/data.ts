export interface EtfData {
  ticker: string;
  code: string;
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
  volHistory: number[]; // 일별 거래량 (최근 10일, 단위: 만주)
}

export interface ThemeData {
  name: string;
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

export const THEMES: ThemeData[] = [
  {
    name: '반도체',
    k: {
      ticker: 'KODEX 반도체', code: '091160', price: 42150, change: 1.23,
      nav: 42080, aum: '8,420억', aumRaw: 842000000000, vol: '312만주', volRaw: 3120000,
      expense: 0.45, discount: 0.17,
      week1:  [41200,41500,41800,41600,42150],
      month1: [38200,39100,40300,39800,41200,40900,42150],
      month3: [34500,35800,37200,36500,38200,39100,40300,39800,41200,40900,42150],
      volHistory: [280,310,290,320,350,300,280,330,315,312],
    },
    t: {
      ticker: 'TIGER 반도체', code: '091230', price: 13870, change: 0.98,
      nav: 13910, aum: '5,180억', aumRaw: 518000000000, vol: '201만주', volRaw: 2010000,
      expense: 0.40, discount: -0.29,
      week1:  [13500,13600,13700,13750,13870],
      month1: [12600,12900,13200,13100,13500,13750,13870],
      month3: [11200,11800,12200,11900,12600,12900,13200,13100,13500,13750,13870],
      volHistory: [190,210,195,220,230,200,185,215,205,201],
    },
  },
  {
    name: '2차전지',
    k: {
      ticker: 'KODEX 2차전지산업', code: '305720', price: 9840, change: -0.61,
      nav: 9850, aum: '6,710억', aumRaw: 671000000000, vol: '489만주', volRaw: 4890000,
      expense: 0.45, discount: -0.10,
      week1:  [9950,9900,9870,9820,9840],
      month1: [10200,10050,9900,9780,9650,9720,9840],
      month3: [11200,10800,10500,10200,10050,9900,9780,9650,9720,9800,9840],
      volHistory: [450,480,510,470,500,520,490,480,495,489],
    },
    t: {
      ticker: 'TIGER 2차전지테마', code: '305540', price: 9120, change: -0.87,
      nav: 9130, aum: '4,230억', aumRaw: 423000000000, vol: '330만주', volRaw: 3300000,
      expense: 0.40, discount: -0.11,
      week1:  [9250,9200,9180,9100,9120],
      month1: [9600,9450,9280,9150,9050,9080,9120],
      month3: [10500,10200,9900,9600,9450,9280,9150,9050,9080,9100,9120],
      volHistory: [310,330,350,320,340,360,330,325,340,330],
    },
  },
  {
    name: '미국나스닥',
    k: {
      ticker: 'KODEX 미국나스닥100TR', code: '379800', price: 18240, change: 0.72,
      nav: 18220, aum: '12,850억', aumRaw: 1285000000000, vol: '55만주', volRaw: 550000,
      expense: 0.05, discount: 0.11,
      week1:  [17900,18000,18100,18150,18240],
      month1: [17100,17400,17600,17850,17950,18100,18240],
      month3: [15800,16200,16800,17100,17400,17600,17850,17950,18100,18180,18240],
      volHistory: [48,52,50,55,58,51,53,57,54,55],
    },
    t: {
      ticker: 'TIGER 미국나스닥100', code: '133690', price: 98750, change: 0.68,
      nav: 98600, aum: '9,620억', aumRaw: 962000000000, vol: '28만주', volRaw: 280000,
      expense: 0.07, discount: 0.15,
      week1:  [97200,97600,98000,98400,98750],
      month1: [92000,93500,94800,95900,96500,97800,98750],
      month3: [85000,87500,90000,92000,93500,94800,95900,96500,97800,98200,98750],
      volHistory: [25,27,26,28,30,26,27,29,27,28],
    },
  },
  {
    name: '헬스케어',
    k: {
      ticker: 'KODEX 헬스케어', code: '266410', price: 11380, change: 0.35,
      nav: 11370, aum: '2,140억', aumRaw: 214000000000, vol: '78만주', volRaw: 780000,
      expense: 0.45, discount: 0.09,
      week1:  [11200,11250,11300,11350,11380],
      month1: [10900,11000,11100,11050,11200,11300,11380],
      month3: [10200,10400,10600,10900,11000,11100,11050,11200,11300,11350,11380],
      volHistory: [72,80,75,82,85,78,74,80,77,78],
    },
    t: {
      ticker: 'TIGER 헬스케어', code: '143860', price: 17650, change: 0.23,
      nav: 17630, aum: '1,870억', aumRaw: 187000000000, vol: '42만주', volRaw: 420000,
      expense: 0.40, discount: 0.11,
      week1:  [17500,17530,17580,17620,17650],
      month1: [16800,17000,17100,17050,17200,17500,17650],
      month3: [15800,16000,16300,16800,17000,17100,17050,17200,17500,17600,17650],
      volHistory: [38,42,40,44,46,41,39,43,41,42],
    },
  },
  {
    name: '배당',
    k: {
      ticker: 'KODEX 고배당', code: '279530', price: 6230, change: 0.16,
      nav: 6220, aum: '3,890억', aumRaw: 389000000000, vol: '120만주', volRaw: 1200000,
      expense: 0.15, discount: 0.16,
      week1:  [6180,6190,6200,6210,6230],
      month1: [6050,6080,6120,6100,6150,6200,6230],
      month3: [5800,5880,5950,6050,6080,6120,6100,6150,6200,6210,6230],
      volHistory: [110,118,115,122,125,118,112,120,117,120],
    },
    t: {
      ticker: 'TIGER 고배당', code: '210780', price: 6870, change: 0.10,
      nav: 6860, aum: '2,560억', aumRaw: 256000000000, vol: '88만주', volRaw: 880000,
      expense: 0.20, discount: 0.15,
      week1:  [6820,6830,6840,6855,6870],
      month1: [6680,6700,6730,6710,6760,6820,6870],
      month3: [6400,6450,6520,6680,6700,6730,6710,6760,6820,6850,6870],
      volHistory: [82,88,85,90,92,86,83,88,86,88],
    },
  },
];

export const ALERTS: AlertItem[] = [
  { id:'1', type:'discount', theme:'반도체', message:'TIGER 반도체 괴리율 -0.29% — 임계치 초과', time:'09:32', severity:'warning' },
  { id:'2', type:'aum', theme:'2차전지', message:'KODEX 2차전지 AUM 전일 대비 -8.2% 급감', time:'10:15', severity:'danger' },
  { id:'3', type:'performance', theme:'미국나스닥', message:'KODEX 나스닥100TR 1개월 수익률 TIGER 대비 +0.34%p 우위', time:'11:00', severity:'info' },
  { id:'4', type:'new', theme:'전체', message:'TIGER 글로벌AI&반도체 신규 상장 감지 (12/2)', time:'어제', severity:'info' },
];
