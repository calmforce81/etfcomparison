'use client';
import { ThemeData } from '../lib/data';
import styles from './CompareTable.module.css';

function fmt(n: number) { return n.toLocaleString('ko-KR'); }
function fmtChange(n: number) { return (n > 0 ? '+' : '') + n.toFixed(2) + '%'; }

export default function CompareTable({ theme }: { theme: ThemeData }) {
  const k = theme.k; const t = theme.t;
  const kRet1m = ((k.month1[k.month1.length-1] - k.month1[0]) / k.month1[0] * 100);
  const tRet1m = ((t.month1[t.month1.length-1] - t.month1[0]) / t.month1[0] * 100);

  const rows = [
    { label:'현재가',       kv: fmt(k.price)+'원',   tv: fmt(t.price)+'원',   winner: null },
    { label:'일간 등락',    kv: fmtChange(k.change), tv: fmtChange(t.change), winner: k.change > t.change ? 'k' : 't' },
    { label:'1개월 수익률', kv: kRet1m.toFixed(2)+'%', tv: tRet1m.toFixed(2)+'%', winner: kRet1m > tRet1m ? 'k' : 't' },
    { label:'순자산(AUM)',  kv: k.aum,               tv: t.aum,               winner: k.aumRaw > t.aumRaw ? 'k' : 't' },
    { label:'총보수',       kv: k.expense+'%',       tv: t.expense+'%',       winner: k.expense < t.expense ? 'k' : 't' },
    { label:'NAV 괴리율',  kv: (k.discount>0?'+':'')+k.discount+'%', tv: (t.discount>0?'+':'')+t.discount+'%', winner: null },
  ] as const;

  return (
    <div className={styles.wrap}>
      <div className={styles.scrollOuter}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.thLabel}>지표</th>
              <th className={`${styles.thVal} ${styles.kCol}`}>{k.ticker}</th>
              <th className={`${styles.thVal} ${styles.tCol}`}>{t.ticker}</th>
              <th className={styles.thWinner}>우위</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.label} className={styles.row}>
                <td className={styles.rowLabel}>{row.label}</td>
                <td className={`${styles.rowVal} ${row.winner==='k' ? styles.winK : ''}`}>{row.kv}</td>
                <td className={`${styles.rowVal} ${row.winner==='t' ? styles.winT : ''}`}>{row.tv}</td>
                <td className={styles.rowWinner}>
                  {row.winner==='k' ? <span className={styles.chipK}>KODEX</span>
                  : row.winner==='t' ? <span className={styles.chipT}>TIGER</span>
                  : <span className={styles.dash}>—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
