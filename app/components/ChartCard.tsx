'use client';
import { useState } from 'react';
import { ThemeData } from '../lib/data';
import styles from './ChartCard.module.css';

type Period = '1W' | '1M' | '3M';

const LABELS: Record<Period, string[]> = {
  '1W': ['5일','4일','3일','2일','전일','오늘'],
  '1M': ['4W','3W','2W','1W','3D','1D','오늘'],
  '3M': ['12W','10W','8W','6W','4W','3W','2W','1W','5D','2D','오늘'],
};

function calcRet(prices: number[]) {
  const b = prices[0];
  return prices.map(p => parseFloat(((p - b) / b * 100).toFixed(2)));
}
function buildPath(rets: number[], W: number, H: number, min: number, max: number) {
  const range = max - min || 1;
  const p = 10;
  return 'M' + rets.map((v, i) => {
    const x = (p + (i / (rets.length - 1)) * (W - p * 2)).toFixed(1);
    const y = (H - p - ((v - min) / range) * (H - p * 2)).toFixed(1);
    return `${x},${y}`;
  }).join(' L');
}

export default function ChartCard({ theme }: { theme: ThemeData }) {
  const [period, setPeriod] = useState<Period>('1M');
  const { k, t } = theme;

  const kData = period === '1W' ? k.week1 : period === '1M' ? k.month1 : k.month3;
  const tData = period === '1W' ? t.week1 : period === '1M' ? t.month1 : t.month3;
  const kR = calcRet(kData);
  const tR = calcRet(tData);
  const all = [...kR, ...tR];
  const min = Math.min(...all) - .4;
  const max = Math.max(...all) + .4;
  const W = 560; const H = 150;
  const kPath = buildPath(kR, W, H, min, max);
  const tPath = buildPath(tR, W, H, min, max);
  const labels = LABELS[period];
  const step = (W - 20) / (labels.length - 1);
  const kFin = kR[kR.length - 1];
  const tFin = tR[tR.length - 1];

  // 거래량 바
  const maxVol = Math.max(...k.volHistory, ...t.volHistory);

  return (
    <div className={styles.card}>
      {/* 수익률 차트 */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <span className={styles.title}>수익률 추이</span>
          <div className={styles.legend}>
            <span className={styles.legItem}><span className={styles.lineK}/>KODEX <b className={kFin >= 0 ? styles.up : styles.dn}>{kFin >= 0 ? '+' : ''}{kFin.toFixed(2)}%</b></span>
            <span className={styles.legItem}><span className={styles.lineT}/>TIGER <b className={tFin >= 0 ? styles.up : styles.dn}>{tFin >= 0 ? '+' : ''}{tFin.toFixed(2)}%</b></span>
          </div>
        </div>
        <div className={styles.periods}>
          {(['1W','1M','3M'] as Period[]).map(p => (
            <button key={p} className={period === p ? styles.pActive : styles.pBtn} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H + 22}`} width="100%" className={styles.svg} aria-label="수익률 차트">
        {(() => {
          const range = max - min || 1;
          const zy = H - 10 - ((0 - min) / range) * (H - 20);
          return zy > 2 && zy < H
            ? <line x1={10} y1={zy} x2={W-10} y2={zy} stroke="currentColor" strokeOpacity=".1" strokeWidth="1" strokeDasharray="4 3"/>
            : null;
        })()}
        {/* fill area KODEX */}
        <path d={`${kPath} L${(W-10).toFixed(1)},${H+22} L10,${H+22} Z`} fill="var(--sam-blue)" fillOpacity=".05"/>
        <path d={tPath} fill="none" stroke="var(--tiger)" strokeWidth="1.5" strokeDasharray="5 3" strokeLinecap="round"/>
        <path d={kPath} fill="none" stroke="var(--sam-blue)" strokeWidth="2.5" strokeLinecap="round"/>
        {labels.map((l, i) => (
          <text key={i} x={(10 + i * step).toFixed(1)} y={H + 16} fontSize="9.5" fill="currentColor" fillOpacity=".4" textAnchor="middle">{l}</text>
        ))}
      </svg>

      {/* 일별 거래량 */}
      <div className={styles.volSection}>
        <div className={styles.volTitle}>일별 거래량 <span>(최근 10거래일, 만주)</span></div>
        <div className={styles.volBars}>
          {k.volHistory.map((kv, i) => {
            const tv = t.volHistory[i];
            const kh = Math.max(3, (kv / maxVol) * 64);
            const th = Math.max(3, (tv / maxVol) * 64);
            return (
              <div key={i} className={styles.barGroup} title={`D-${9-i}: KODEX ${kv}만주 / TIGER ${tv}만주`}>
                <div className={styles.barK} style={{ height: kh }}/>
                <div className={styles.barT} style={{ height: th }}/>
              </div>
            );
          })}
        </div>
        <div className={styles.volDates}>
          {['D-9','','D-7','','D-5','','D-3','','D-1','오늘'].map((l,i) => (
            <div key={i} className={styles.volDate}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
