import { ThemeData, AlertItem } from './data';

/**
 * 실데이터 기반 에이전트 알림 자동 생성
 * 조건:
 *  - 괴리율 절댓값 > 0.3% → warning
 *  - 괴리율 절댓값 > 0.5% → danger
 *  - 두 ETF 1개월 수익률 차이 > 1%p → info
 *  - AUM 역전 (TIGER > KODEX) → info
 */
export function generateAlerts(themes: ThemeData[]): AlertItem[] {
  const alerts: AlertItem[] = [];
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  for (const theme of themes) {
    const { k, t } = theme;

    // 괴리율 이상 감지
    for (const [etf, brand] of [[k, 'KODEX'], [t, 'TIGER']] as const) {
      const abs = Math.abs(etf.discount);
      if (abs > 0.5) {
        alerts.push({
          id: `disc-${etf.code}-${Date.now()}`,
          type: 'discount',
          theme: theme.name,
          message: `${etf.ticker} 괴리율 ${etf.discount > 0 ? '+' : ''}${etf.discount}% — 임계치(±0.5%) 초과`,
          time: timeStr,
          severity: 'danger',
        });
      } else if (abs > 0.3) {
        alerts.push({
          id: `disc-${etf.code}-${Date.now()}`,
          type: 'discount',
          theme: theme.name,
          message: `${etf.ticker} 괴리율 ${etf.discount > 0 ? '+' : ''}${etf.discount}% — 임계치(±0.3%) 주의`,
          time: timeStr,
          severity: 'warning',
        });
      }
    }

    // 수익률 격차 감지
    const kRet1m = calcRet(k.month1);
    const tRet1m = calcRet(t.month1);
    const diff = Math.abs(kRet1m - tRet1m);
    if (diff > 1.0) {
      const winner = kRet1m > tRet1m ? 'KODEX' : 'TIGER';
      const loser = kRet1m > tRet1m ? 'TIGER' : 'KODEX';
      alerts.push({
        id: `perf-${theme.name}-${Date.now()}`,
        type: 'performance',
        theme: theme.name,
        message: `${winner} 1개월 수익률 ${loser} 대비 +${diff.toFixed(2)}%p 우위`,
        time: timeStr,
        severity: 'info',
      });
    }

    // AUM 역전 감지 (TIGER > KODEX)
    if (t.aumRaw > k.aumRaw) {
      alerts.push({
        id: `aum-${theme.name}-${Date.now()}`,
        type: 'aum',
        theme: theme.name,
        message: `TIGER ${theme.name} AUM(${t.aum}) > KODEX(${k.aum}) — 역전 감지`,
        time: timeStr,
        severity: 'warning',
      });
    }
  }

  // 최신순 정렬, 최대 10건
  return alerts.slice(0, 10);
}

function calcRet(prices: number[]): number {
  if (prices.length < 2) return 0;
  return (prices[prices.length - 1] - prices[0]) / prices[0] * 100;
}
