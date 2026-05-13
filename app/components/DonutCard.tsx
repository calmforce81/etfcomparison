'use client';
import styles from './DonutCard.module.css';

interface Props {
  kAum: number;
  tAum: number;
  kLabel: string;
  tLabel: string;
}

export default function DonutCard({ kAum, tAum, kLabel, tLabel }: Props) {
  const total = kAum + tAum;
  const kPct = total > 0 ? (kAum / total) * 100 : 50;
  const tPct = 100 - kPct;

  // SVG 도넛
  const R = 42; const r = 28; const cx = 56; const cy = 56;
  const circ = 2 * Math.PI * ((R + r) / 2);
  const kDash = (kPct / 100) * circ;
  const tDash = (tPct / 100) * circ;
  const strokeW = R - r;
  const sr = (R + r) / 2;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>AUM 비중</span>
        <span className={styles.sub}>순자산 기준</span>
      </div>
      <div className={styles.body}>
        <svg width="112" height="112" viewBox="0 0 112 112" className={styles.donut}>
          {/* background ring */}
          <circle cx={cx} cy={cy} r={sr} fill="none" stroke="var(--border)" strokeWidth={strokeW + 2}/>
          {/* TIGER arc */}
          <circle
            cx={cx} cy={cy} r={sr} fill="none"
            stroke="var(--tiger)" strokeWidth={strokeW}
            strokeDasharray={`${tDash} ${circ - tDash}`}
            strokeDashoffset={-kDash}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          {/* KODEX arc */}
          <circle
            cx={cx} cy={cy} r={sr} fill="none"
            stroke="var(--sam-blue)" strokeWidth={strokeW}
            strokeDasharray={`${kDash - 2} ${circ - kDash + 2}`}
            strokeDashoffset="0"
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
          />
          <text x={cx} y={cy - 5} textAnchor="middle" fontSize="13" fontWeight="800" fill="var(--text)">{kPct.toFixed(0)}%</text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="var(--text-3)">KODEX</text>
        </svg>
        <div className={styles.legend}>
          <div className={styles.legItem}>
            <span className={styles.dotK}/>
            <div>
              <div className={styles.legLabel}>KODEX</div>
              <div className={styles.legVal}>{kLabel}</div>
              <div className={styles.legPct}>{kPct.toFixed(1)}%</div>
            </div>
          </div>
          <div className={styles.legItem}>
            <span className={styles.dotT}/>
            <div>
              <div className={styles.legLabel}>TIGER</div>
              <div className={styles.legVal}>{tLabel}</div>
              <div className={styles.legPct}>{tPct.toFixed(1)}%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
