'use client';
import styles from './KpiCard.module.css';

interface Props {
  label: string;
  kVal: string;
  tVal: string;
  kChange?: string;
  tChange?: string;
  kUp?: boolean;
  tUp?: boolean;
  winner?: 'k' | 't' | null;
  icon?: string;
}

export default function KpiCard({ label, kVal, tVal, kChange, tChange, kUp, tUp, winner, icon }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <div className={styles.body}>
        <div className={styles.half}>
          <div className={styles.brand}>
            <span className={styles.dotK}/>KODEX
            {winner === 'k' && <span className={styles.win}>↑</span>}
          </div>
          <div className={`${styles.val} ${winner === 'k' ? styles.valK : ''}`}>{kVal}</div>
          {kChange && <div className={`${styles.change} ${kUp ? styles.up : styles.dn}`}>{kChange}</div>}
        </div>
        <div className={styles.divider}/>
        <div className={styles.half}>
          <div className={styles.brand}>
            <span className={styles.dotT}/>TIGER
            {winner === 't' && <span className={styles.winT}>↑</span>}
          </div>
          <div className={`${styles.val} ${winner === 't' ? styles.valT : ''}`}>{tVal}</div>
          {tChange && <div className={`${styles.change} ${tUp ? styles.up : styles.dn}`}>{tChange}</div>}
        </div>
      </div>
    </div>
  );
}
