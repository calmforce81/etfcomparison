import type { EtfItem, RecentEtfItem } from './types';

export const WATCHLIST: Array<Pick<EtfItem, 'code' | 'name' | 'brand' | 'index' | 'group' | 'fee'>> = [
  { code: '069500', name: 'KODEX 200', brand: 'KODEX', index: 'KOSPI 200', group: '대표지수', fee: 0.15 },
  { code: '102110', name: 'TIGER200', brand: 'TIGER', index: 'KOSPI 200', group: '대표지수', fee: 0.05 },
  { code: '379800', name: 'KODEX S&P500', brand: 'KODEX', index: 'S&P 500', group: '대표지수', fee: 0.0062 },
  { code: '143850', name: 'TIGER S&P500', brand: 'TIGER', index: 'S&P 500', group: '대표지수', fee: 0.3 },
  { code: '379810', name: 'KODEX US NASDAQ100', brand: 'KODEX', index: 'NASDAQ 100', group: '대표지수', fee: 0.0062 },
  { code: '133690', name: 'TIGER NASDAQ100', brand: 'TIGER', index: 'NASDAQ 100', group: '대표지수', fee: 0.0068 },
  { code: '395160', name: 'KODEX AI반도체', brand: 'KODEX', index: 'FnGuide 시스템반도체지수', group: '반도체 테마', fee: 0.45 },
  { code: '396500', name: 'TIGER 반도체TOP10', brand: 'TIGER', index: 'FnGuide 반도체TOP10 지수', group: '반도체 테마', fee: 0.45 }
];

export const FALLBACK_ETFS: EtfItem[] = [
  { code:'069500', name:'KODEX 200', brand:'KODEX', index:'KOSPI 200', group:'대표지수', aum:25284930000000, transaction:3386516201771, volume:28193154, fee:0.15, source:'https://www.k-etf.com/en/etf/069500' },
  { code:'102110', name:'TIGER200', brand:'TIGER', index:'KOSPI 200', group:'대표지수', aum:10266495500000, transaction:894901185009, volume:7455770, fee:0.05, source:'https://www.k-etf.com/en/etf/102110' },
  { code:'379800', name:'KODEX S&P500', brand:'KODEX', index:'S&P 500', group:'대표지수', aum:9229275000000, transaction:310585169688, volume:12516177, fee:0.0062, source:'https://www.k-etf.com/en/etf/379800' },
  { code:'143850', name:'TIGER S&P500', brand:'TIGER', index:'S&P 500', group:'대표지수', aum:98156000000, transaction:787313864, volume:10628, fee:0.3, source:'https://www.k-etf.com/en/etf/143850' },
  { code:'379810', name:'KODEX US NASDAQ100', brand:'KODEX', index:'NASDAQ 100', group:'대표지수', aum:7639984000000, transaction:152238889123, volume:5298365, fee:0.0062, source:'https://www.k-etf.com/en/etf/379810' },
  { code:'133690', name:'TIGER NASDAQ100', brand:'TIGER', index:'NASDAQ 100', group:'대표지수', aum:10086918400000, transaction:163170141304, volume:849819, fee:0.0068, source:'https://www.k-etf.com/en/etf/133690' },
  { code:'395160', name:'KODEX AI반도체', brand:'KODEX', index:'FnGuide 시스템반도체지수', group:'반도체 테마', aum:2407272000000, transaction:224074903941, volume:5752781, fee:0.45, source:'https://www.k-etf.com/en/etf/395160' },
  { code:'396500', name:'TIGER 반도체TOP10', brand:'TIGER', index:'FnGuide 반도체TOP10 지수', group:'반도체 테마', aum:12429665500000, transaction:2137524572433, volume:44278531, fee:0.45, source:'https://www.k-etf.com/en/etf/396500' }
];

export const RECENT_SEED_CODES = ['0183J0', '0180V0', '0174B0', '0182R0', '0182S0'];

export const FALLBACK_RECENT: RecentEtfItem[] = [
  { code:'0183J0', name:'TIGER US SPACE TECH', brand:'TIGER', theme:'미국 우주테크', listingDate:'2026-04-14', index:'Akros U.S. Space Tech Index (PR)', aum:709852000000, transaction:151770205336, volume:12358674, fee:0.49, source:'https://www.k-etf.com/en/etf/0183J0' },
  { code:'0180V0', name:'ACE US Space Tech Active', brand:'ACE', theme:'미국 우주테크 액티브', listingDate:'2026-04-14', index:'FnGuide US Space Tech Index (Market Price)', aum:194996000000, transaction:48813015796, volume:4052898, fee:0.8, source:'https://www.k-etf.com/en/etf/0180V0' },
  { code:'0174B0', name:'KoAct Global AI Memory Semicon Active', brand:'KoAct', theme:'글로벌 AI 메모리반도체', listingDate:'2026-04-14', index:'Solactive Global AI Memory Semiconductor Index (PR)', aum:54731250000, transaction:12319408407, volume:838312, fee:0.5, source:'https://www.k-etf.com/en/etf/0174B0' },
  { code:'0182R0', name:'1Q K Semiconductor TOP2 Plus', brand:'1Q', theme:'국내 반도체 TOP2+', listingDate:'2026-04-14', index:'NICE K Semiconductor TOP2 MAX+ Index', aum:115680500000, transaction:43800714316, volume:3143230, fee:0.2, source:'https://www.k-etf.com/en/etf/0182R0' },
  { code:'0182S0', name:'1Q K반도체TOP2채권혼합50', brand:'1Q', theme:'반도체 TOP2 채권혼합', listingDate:'2026-04-14', index:'KEDI K반도체TOP2채권혼합 지수', aum:66875000000, transaction:16944276320, volume:1350843, fee:0.01, source:'https://www.k-etf.com/etf/0182S0' }
];
