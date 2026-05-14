'use client';
import { useState } from 'react';
import { ThemeData } from '../lib/data';
import styles from './DataTrustPanel.module.css';

function fmtTime(iso: string) {
  try {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}`;
  } catch { return iso; }
}

const FIELD_LABELS = ['price','nav','aum','vol','expense'] as const;
const FIELD_NAMES: Record<string, string> = {
  price:'현재가', nav:'NAV', aum:'순자산(AUM)', vol:'거래량', expense:'총보수',
};

export default function DataTrustPanel({ theme }: { theme: ThemeData }) {
  const [open, setOpen] = useState(false);
  const [activeField, setActiveField] = useState<string>('price');

  const kMeta = theme.k.meta[activeField as keyof typeof theme.k.meta];
  const tMeta = theme.t.meta[activeField as keyof typeof theme.t.meta];

  return (
    <div className={styles.wrap}>
      {/* 조회 시간 배지 + 펼치기 버튼 */}
      <div className={styles.bar}>
        <div className={styles.timeRow}>
          <span className={styles.clock}>🕐</span>
          <span className={styles.timeLabel}>데이터 조회</span>
          <span className={styles.timeVal}>{fmtTime(theme.fetchedAt)}</span>
          <span className={styles.timeSep}>·</span>
          <span className={styles.sourceTag}>
            {theme.k.meta.price.source === 'Mock 데이터' ? '⚠ Mock' : '● 실시간'}
          </span>
        </div>
        <button className={styles.toggleBtn} onClick={() => setOpen(o => !o)}>
          {open ? '신뢰도 정보 닫기 ↑' : '데이터 신뢰도 보기 ↓'}
        </button>
      </div>

      {open && (
        <div className={styles.panel}>
          {/* 종목 정보 헤더 */}
          <div className={styles.tickerRow}>
            <div className={`${styles.tickerCard} ${styles.kCard}`}>
              <div className={styles.tickerBrand}>KODEX</div>
              <div className={styles.tickerName}>{theme.k.ticker}</div>
              <div className={styles.tickerMeta}>
                <span className={styles.chip}>종목코드 {theme.k.code}</span>
                <span className={styles.chip}>ISIN {theme.k.isin}</span>
                <span className={styles.chip}>{theme.k.exchange}</span>
              </div>
            </div>
            <div className={`${styles.tickerCard} ${styles.tCard}`}>
              <div className={styles.tickerBrand}>TIGER</div>
              <div className={styles.tickerName}>{theme.t.ticker}</div>
              <div className={styles.tickerMeta}>
                <span className={styles.chip}>종목코드 {theme.t.code}</span>
                <span className={styles.chip}>ISIN {theme.t.isin}</span>
                <span className={styles.chip}>{theme.t.exchange}</span>
              </div>
            </div>
          </div>

          {/* 지표별 탭 */}
          <div className={styles.fieldTabs}>
            {FIELD_LABELS.map(f => (
              <button key={f}
                className={activeField === f ? styles.fieldTabActive : styles.fieldTab}
                onClick={() => setActiveField(f)}>
                {FIELD_NAMES[f]}
              </button>
            ))}
          </div>

          {/* 지표 상세 */}
          <div className={styles.metaGrid}>
            {[{brand:'KODEX', meta: kMeta, color:'k'}, {brand:'TIGER', meta: tMeta, color:'t'}].map(({brand, meta, color}) => (
              <div key={brand} className={`${styles.metaCard} ${styles['mc_'+color]}`}>
                <div className={styles.metaBrand}>{brand}</div>
                <div className={styles.metaRow}>
                  <span className={styles.metaKey}>출처</span>
                  <span className={styles.metaValue}>{meta.source}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaKey}>산출 방식</span>
                  <span className={styles.metaValue}>{meta.calcNote}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaKey}>단위</span>
                  <span className={styles.metaValue}>{meta.unit || '—'}</span>
                </div>
                <div className={styles.metaRow}>
                  <span className={styles.metaKey}>조회 시각</span>
                  <span className={styles.metaValue}>{fmtTime(meta.fetchedAt)}</span>
                </div>
                {meta.sourceUrl && (
                  <div className={styles.metaRow}>
                    <span className={styles.metaKey}>원본</span>
                    <a href={meta.sourceUrl} target="_blank" rel="noopener noreferrer" className={styles.metaLink}>
                      바로가기 ↗
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
