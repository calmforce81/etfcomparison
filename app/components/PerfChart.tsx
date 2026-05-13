'use client';

import { useState } from 'react';
import { ThemeData } from '../lib/data';
import styles from './PerfChart.module.css';

interface PerfChartProps {
  theme: ThemeData;
}

type Period = '1W' | '1M' | '3M';

const PERIOD_LABELS: Record<Period, string[]> = {
  '1W': ['5일전', '4일전', '3일전', '2일전', '전일', '현재'],
  '1M': ['4주전', '3주전', '2주전', '1주전', '3일전', '전일', '현재'],
  '3M': ['12W', '10W', '8W', '6W', '4W', '3W', '2W', '1W', '5D', '2D', '현재'],
};

function calcReturns(prices: number[]) {
  const base = prices[0];
  return prices.map((p) => parseFloat(((p - base) / base * 100).toFixed(2)));
}

function buildPath(returns: number[], W: number, H: number, min: number, max: number): string {
  const range = max - min || 1;
  const pad = 8;
  const pts = returns.map((v, i) => {
    const x = pad + (i / (returns.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / range) * (H - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return 'M' + pts.join(' L');
}

export default function PerfChart({ theme }: PerfChartProps) {
  const [period, setPeriod] = useState<Period>('1M');

  const k = theme.k;
  const t = theme.t;

  const kData = period === '1W' ? k.week1 : period === '1M' ? k.month1 : k.month3;
  const tData = period === '1W' ? t.week1 : period === '1M' ? t.month1 : t.month3;

  const kRet = calcReturns(kData);
  const tRet = calcReturns(tData);

  const allVals = [...kRet, ...tRet];
  const min = Math.min(...allVals) - 0.3;
  const max = Math.max(...allVals) + 0.3;

  const W = 640;
  const H = 180;

  const kPath = buildPath(kRet, W, H, min, max);
  const tPath = buildPath(tRet, W, H, min, max);

  const labels = PERIOD_LABELS[period];
  const step = (W - 16) / (labels.length - 1);

  const kFinal = kRet[kRet.length - 1];
  const tFinal = tRet[tRet.length - 1];

  return (
    <div className={styles.wrap}>
      <div className={styles.top}>
        <div className={styles.legend}>
          <span className={styles.legK}>
            <span className={styles.dot} />
            {k.ticker}
            <span className={`${styles.ret} ${kFinal >= 0 ? styles.up : styles.dn}`}>
              {kFinal >= 0 ? '+' : ''}{kFinal.toFixed(2)}%
            </span>
          </span>
          <span className={styles.legT}>
            <span className={`${styles.dot} ${styles.dotT}`} />
            {t.ticker}
            <span className={`${styles.ret} ${tFinal >= 0 ? styles.up : styles.dn}`}>
              {tFinal >= 0 ? '+' : ''}{tFinal.toFixed(2)}%
            </span>
          </span>
        </div>
        <div className={styles.periods}>
          {(['1W', '1M', '3M'] as Period[]).map((p) => (
            <button
              key={p}
              className={period === p ? styles.pActive : styles.pBtn}
              onClick={() => setPeriod(p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H + 24}`}
        width="100%"
        className={styles.chart}
        aria-label={`${theme.name} KODEX vs TIGER ${period} 수익률 차트`}
      >
        {/* zero line */}
        {(() => {
          const range = max - min || 1;
          const zeroY = H - 8 - ((0 - min) / range) * (H - 16);
          if (zeroY > 4 && zeroY < H) {
            return (
              <line
                x1={8} y1={zeroY} x2={W - 8} y2={zeroY}
                stroke="currentColor" strokeOpacity="0.1" strokeWidth="1"
                strokeDasharray="4 3"
              />
            );
          }
          return null;
        })()}

        {/* TIGER line (dashed) */}
        <path
          d={tPath}
          fill="none"
          stroke="var(--red-mid)"
          strokeWidth="1.5"
          strokeDasharray="5 3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.85"
        />

        {/* KODEX line */}
        <path
          d={kPath}
          fill="none"
          stroke="var(--blue-mid)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* x labels */}
        {labels.map((lbl, i) => (
          <text
            key={i}
            x={(8 + i * step).toFixed(1)}
            y={H + 18}
            fontSize="10"
            fill="currentColor"
            fillOpacity="0.4"
            textAnchor="middle"
          >
            {lbl}
          </text>
        ))}
      </svg>
    </div>
  );
}
