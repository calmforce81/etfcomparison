'use client';
import { useState } from 'react';
import { ThemeData } from '../lib/data';
import styles from './InsightPanel.module.css';

interface SavedInsight {
  id: string;
  metric: string;
  kVal: string;
  tVal: string;
  theme: string;
  text: string;
  time: string;
}

function calcRet(p: number[]) {
  if (p.length < 2) return '0.00%';
  return ((p[p.length-1] - p[0]) / p[0] * 100).toFixed(2) + '%';
}

export default function InsightPanel({ themes }: { themes: ThemeData[] }) {
  const [activeTheme, setActiveTheme] = useState(0);
  const [loading, setLoading] = useState<string | null>(null);
  const [insights, setInsights] = useState<SavedInsight[]>([]);

  const theme = themes[activeTheme];
  const { k, t } = theme;

  const METRICS = [
    { key: 'price',   label: '현재가',       kVal: k.price.toLocaleString()+'원',   tVal: t.price.toLocaleString()+'원' },
    { key: 'change',  label: '일간 등락',     kVal: (k.change >= 0 ? '+' : '')+k.change+'%', tVal: (t.change >= 0 ? '+' : '')+t.change+'%' },
    { key: 'ret1m',   label: '1개월 수익률',  kVal: calcRet(k.month1),               tVal: calcRet(t.month1) },
    { key: 'aum',     label: '순자산(AUM)',   kVal: k.aum,                            tVal: t.aum },
    { key: 'vol',     label: '거래량',        kVal: k.vol,                            tVal: t.vol },
    { key: 'expense', label: '총보수',        kVal: k.expense+'%',                   tVal: t.expense+'%' },
    { key: 'discount',label: 'NAV 괴리율',   kVal: (k.discount>=0?'+':'')+k.discount+'%', tVal: (t.discount>=0?'+':'')+t.discount+'%' },
  ];

  const generate = async (m: typeof METRICS[0]) => {
    setLoading(m.key);
    try {
      const res = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric: m.label, kVal: m.kVal, tVal: m.tVal, theme: theme.name }),
      });
      const data = await res.json();
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      setInsights(prev => [{
        id: Date.now().toString(),
        metric: m.label, kVal: m.kVal, tVal: m.tVal,
        theme: theme.name, text: data.insight, time,
      }, ...prev].slice(0, 20));
    } finally {
      setLoading(null);
    }
  };

  const removeInsight = (id: string) => setInsights(prev => prev.filter(i => i.id !== id));

  return (
    <div className={styles.wrap}>
      {/* 왼쪽: 지표 선택 */}
      <div className={styles.left}>
        <div className={styles.leftHeader}>
          <div className={styles.sectionTitle}>테마 선택</div>
          <div className={styles.themeBtns}>
            {themes.map((th, i) => (
              <button key={th.name} className={i === activeTheme ? styles.themeBtnActive : styles.themeBtn}
                onClick={() => setActiveTheme(i)}>{th.name}</button>
            ))}
          </div>
        </div>

        <div className={styles.sectionTitle} style={{marginTop: 20}}>지표별 AI 인사이트 생성</div>
        <p className={styles.desc}>지표를 선택하면 Claude가 실시간 인사이트를 생성합니다</p>

        <div className={styles.metricList}>
          {METRICS.map(m => (
            <div key={m.key} className={styles.metricItem}>
              <div className={styles.metricInfo}>
                <div className={styles.metricLabel}>{m.label}</div>
                <div className={styles.metricVals}>
                  <span className={styles.valK}>{m.kVal}</span>
                  <span className={styles.sep}>/</span>
                  <span className={styles.valT}>{m.tVal}</span>
                </div>
              </div>
              <button
                className={`${styles.genBtn} ${loading === m.key ? styles.genBtnLoading : ''}`}
                onClick={() => generate(m)}
                disabled={loading !== null}
              >
                {loading === m.key ? (
                  <span className={styles.spinner}>⟳</span>
                ) : '인사이트 ↗'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽: 생성된 인사이트 목록 */}
      <div className={styles.right}>
        <div className={styles.insightHeader}>
          <div className={styles.sectionTitle}>생성된 인사이트</div>
          {insights.length > 0 && (
            <button className={styles.clearBtn} onClick={() => setInsights([])}>전체 삭제</button>
          )}
        </div>

        {insights.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>◎</div>
            <div className={styles.emptyText}>좌측에서 지표를 선택하면<br/>AI 인사이트가 여기에 표시됩니다</div>
          </div>
        ) : (
          <div className={styles.insightList}>
            {insights.map(ins => (
              <div key={ins.id} className={styles.insightCard}>
                <div className={styles.insightMeta}>
                  <span className={styles.insightTheme}>{ins.theme}</span>
                  <span className={styles.insightMetric}>{ins.metric}</span>
                  <span className={styles.insightTime}>{ins.time}</span>
                  <button className={styles.removeBtn} onClick={() => removeInsight(ins.id)}>✕</button>
                </div>
                <div className={styles.insightVals}>
                  <span className={styles.valK}>KODEX: {ins.kVal}</span>
                  <span className={styles.valT}>TIGER: {ins.tVal}</span>
                </div>
                <div className={styles.insightText}>{ins.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
