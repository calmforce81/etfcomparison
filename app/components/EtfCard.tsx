'use client';

import { EtfData } from '../lib/data';
import styles from './EtfCard.module.css';

interface EtfCardProps {
  data: EtfData;
  brand: 'k' | 't';
}

function fmt(n: number) {
  return n.toLocaleString('ko-KR');
}

function fmtChange(n: number) {
  return (n > 0 ? '+' : '') + n.toFixed(2) + '%';
}

export default function EtfCard({ data, brand }: EtfCardProps) {
  const isUp = data.change >= 0;
  const discountUp = data.discount >= 0;

  return (
    <div className={`${styles.card} ${brand === 'k' ? styles.k : styles.t}`}>
      <div className={styles.top}>
        <div>
          <div className={styles.ticker}>{data.ticker}</div>
          <div className={styles.code}>{data.code}</div>
        </div>
        <span className={`${styles.brandBadge} ${brand === 'k' ? styles.badgeK : styles.badgeT}`}>
          {brand === 'k' ? 'KODEX' : 'TIGER'}
        </span>
      </div>

      <div className={styles.priceRow}>
        <span className={styles.price}>{fmt(data.price)}<span className={styles.won}>원</span></span>
        <span className={`${styles.change} ${isUp ? styles.up : styles.dn}`}>
          {isUp ? '▲' : '▼'} {fmtChange(Math.abs(data.change))}
        </span>
      </div>

      <div className={styles.grid}>
        <div className={styles.stat}>
          <span className={styles.label}>NAV</span>
          <span className={styles.val}>{fmt(data.nav)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>괴리율</span>
          <span className={`${styles.val} ${discountUp ? styles.up : styles.dn}`}>
            {discountUp ? '+' : ''}{data.discount}%
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>순자산</span>
          <span className={styles.val}>{data.aum}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>총보수</span>
          <span className={styles.val}>{data.expense}%</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.label}>거래량</span>
          <span className={styles.val}>{data.vol}</span>
        </div>
      </div>
    </div>
  );
}
