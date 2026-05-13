'use client';
import { useState } from 'react';
import { ThemeData } from '../lib/data';
import styles from './PerfChart.module.css';

type Period = '1W' | '1M' | '3M';

const PERIOD_LABELS: Record<Period, string[]> = {
  '1W': ['5일전','4일전','3일전','2일전','전일','현재'],
  '1M': ['4W','3W','2W','1W','3D','1D','현재'],
  '3M': ['12W','10W','8W','6W','4W','3W','2W','1W','5D','2D','현재'],
};

const VOL_LABELS = ['D-9','D-8','D-7','D-6','D-5','D-4','D-3','D-2','D-1','오늘'];

function calcReturns(prices: number[]) {
  const base = prices[0];
  return prices.map(p => parseFloat(((p - base) / base * 100).toFixed(2)));
}
function buildPath(returns: number[], W: number, H: number, min: number, max: number) {
  const range = max - min || 1;
  const pad = 8;
  return 'M' + returns.map((v, i) => {
    const x = (pad + (i / (returns.length - 1)) * (W - pad * 2)).toFixed(1);
    const y = (H - pad - ((v - min) / range) * (H - pad * 2)).toFixed(1);
    return `${x},${y}`;
  }).join(' L');
}

export default function PerfChart({ theme }: { theme: ThemeData }) {
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
  const W = 640; const H = 160;
  const kPath = buildPath(kRet, W, H, min, max);
  const tPath = buildPath(tRet, W, H, min, max);
  const labels = PERIOD_LABELS[period];
  const step = (W - 16) / (labels.length - 1);
  const kFinal = kRet[kRet.length - 1];
  const tFinal = tRet[tRet.length - 1];

  // 거래량 바 계산
  const kVol = k.volHistory;
  const tVol = t.volHistory;
  const maxVol = Math.max(...kVol, ...tVol);

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
          {(['1W','1M','3M'] as Period[]).map(p => (
            <button key={p} className={period === p ? styles.pActive : styles.pBtn} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
      </div>

      {/* 수익률 라인 차트 */}
      <svg viewBox={`0 0 ${W} ${H + 24}`} width="100%" className={styles.chart} aria-label={`${theme.name} 수익률 차트`}>
        {(() => {
          const range = max - min || 1;
          const zeroY = H - 8 - ((0 - min) / range) * (H - 16);
          return zeroY > 4 && zeroY < H
            ? <line x1={8} y1={zeroY} x2={W-8} y2={zeroY} stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="4 3"/>
            : null;
        })()}
        <path d={tPath} fill="none" stroke="var(--tiger)" strokeWidth="1.5" strokeDasharray="5 3" strokeLinecap="round" strokeLinejoin="round" opacity="0.85"/>
        <path d={kPath} fill="none" stroke="var(--samsung-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {labels.map((lbl, i) => (
          <text key={i} x={(8 + i * step).toFixed(1)} y={H + 18} fontSize="10" fill="currentColor" fillOpacity="0.4" textAnchor="middle">{lbl}</text>
        ))}
      </svg>

      {/* 일별 거래량 */}
      <div className={styles.chartSection}>
        <div className={styles.sectionTitle}>일별 거래량 (최근 10거래일, 단위: 만주)</div>
        <div className={styles.volBars}>
          {kVol.map((kv, i) => {
            const tv = tVol[i];
            const kH = Math.max(4, (kv / maxVol) * 72);
            const tH = Math.max(4, (tv / maxVol) * 72);
            return (
              <div key={i} className={styles.barGroup}>
                <div className={`${styles.bar} ${styles.barK}`} style={{ height: kH }} title={`KODEX ${kv}만주`}/>
                <div className={`${styles.bar} ${styles.barT}`} style={{ height: tH }} title={`TIGER ${tv}만주`}/>
              </div>
            );
          })}
        </div>
        <div className={styles.barLabels}>
          {VOL_LABELS.map(l => <div key={l} className={styles.barLabel}>{l}</div>)}
        </div>
      </div>
    </div>
  );
}
