'use client';
import { useState, useEffect, useCallback } from 'react';
import { ThemeData, AlertItem, THEMES } from './lib/data';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import KpiCard from './components/KpiCard';
import ChartCard from './components/ChartCard';
import DonutCard from './components/DonutCard';
import CompareTable from './components/CompareTable';
import OverviewPanel from './components/OverviewPanel';
import AlertPanel from './components/AlertPanel';
import InsightPanel from './components/InsightPanel';
import styles from './page.module.css';

const PAGE_TITLES: Record<string, string> = {
  dashboard: '테마별 비교',
  overview:  '전체 비교',
  alerts:    '에이전트 알림',
  insights:  'AI 인사이트',
};

function fmtPct(n: number) { return (n >= 0 ? '+' : '') + n.toFixed(2) + '%'; }
function calcRet(p: number[]) {
  if (p.length < 2) return 0;
  return parseFloat(((p[p.length-1] - p[0]) / p[0] * 100).toFixed(2));
}

export default function Home() {
  const [themes, setThemes]         = useState<ThemeData[]>(THEMES);
  const [alerts, setAlerts]         = useState<AlertItem[]>([]);
  const [activeTheme, setActiveTheme] = useState(0);
  const [activeTab, setActiveTab]   = useState('dashboard');
  const [updatedAt, setUpdatedAt]   = useState('로딩 중...');
  const [dataSource, setDataSource] = useState<'naver' | 'mock' | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [tRes, aRes] = await Promise.all([
        fetch('/api/etf?type=themes'),
        fetch('/api/etf?type=alerts'),
      ]);
      const tData = await tRes.json();
      const aData = await aRes.json();
      setThemes(tData.themes);
      setAlerts(aData.alerts ?? []);
      setDataSource(tData.source === 'naver' ? 'naver' : 'mock');
      const n = new Date();
      setUpdatedAt(`${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')} 기준`);
    } catch { setDataSource('mock'); }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  const theme = themes[activeTheme];
  const { k, t } = theme;
  const urgentAlerts = alerts.filter(a => a.severity !== 'info');

  // KPI 데이터
  const kRet1m = calcRet(k.month1);
  const tRet1m = calcRet(t.month1);

  return (
    <div className={styles.layout}>
      <Sidebar
        active={activeTab}
        alertCount={urgentAlerts.length}
        dataSource={dataSource}
        updatedAt={updatedAt}
        onChange={setActiveTab}
      />

      <div className={styles.content}>
        <div className={styles.inner}>
          {/* TopBar: 테마 탭은 dashboard에서만 */}
          <TopBar
            themes={themes.map(t => t.name)}
            activeTheme={activeTheme}
            pageTitle={PAGE_TITLES[activeTab] ?? ''}
            onThemeChange={activeTab === 'dashboard' ? setActiveTheme : () => {}}
          />

          {/* ── DASHBOARD ── */}
          {activeTab === 'dashboard' && (
            <div className={styles.dashboard}>
              {/* KPI 4칸 그리드 */}
              <div className={styles.kpiGrid}>
                <KpiCard
                  label="현재가"
                  kVal={k.price.toLocaleString() + '원'}
                  tVal={t.price.toLocaleString() + '원'}
                  kChange={fmtPct(k.change)}
                  tChange={fmtPct(t.change)}
                  kUp={k.change >= 0} tUp={t.change >= 0}
                  icon="₩"
                />
                <KpiCard
                  label="1개월 수익률"
                  kVal={fmtPct(kRet1m)}
                  tVal={fmtPct(tRet1m)}
                  winner={kRet1m >= tRet1m ? 'k' : 't'}
                  kUp={kRet1m >= 0} tUp={tRet1m >= 0}
                  icon="📈"
                />
                <KpiCard
                  label="순자산 (AUM)"
                  kVal={k.aum}
                  tVal={t.aum}
                  winner={k.aumRaw >= t.aumRaw ? 'k' : 't'}
                  icon="💰"
                />
                <KpiCard
                  label="총보수 / 괴리율"
                  kVal={k.expense + '%'}
                  tVal={t.expense + '%'}
                  kChange={'괴리 ' + (k.discount >= 0 ? '+' : '') + k.discount + '%'}
                  tChange={'괴리 ' + (t.discount >= 0 ? '+' : '') + t.discount + '%'}
                  winner={k.expense <= t.expense ? 'k' : 't'}
                  icon="⚖️"
                />
              </div>

              {/* 차트 + 도넛 */}
              <div className={styles.chartRow}>
                <div className={styles.chartMain}>
                  <ChartCard theme={theme} />
                </div>
                <div className={styles.chartSide}>
                  <DonutCard
                    kAum={k.aumRaw} tAum={t.aumRaw}
                    kLabel={k.aum} tLabel={t.aum}
                  />
                  {/* 거래량 요약 */}
                  <div className={styles.volSummary}>
                    <div className={styles.vsLabel}>오늘 거래량</div>
                    <div className={styles.vsRow}>
                      <span className={styles.vsK}>{k.vol}</span>
                      <span className={styles.vsSep}>vs</span>
                      <span className={styles.vsT}>{t.vol}</span>
                    </div>
                    <div className={styles.vsBar}>
                      <div className={styles.vsBarK} style={{
                        width: (k.volRaw / (k.volRaw + t.volRaw) * 100) + '%'
                      }}/>
                    </div>
                  </div>
                </div>
              </div>

              {/* 상세 비교 테이블 */}
              <CompareTable theme={theme} />
            </div>
          )}

          {activeTab === 'overview'  && <OverviewPanel themes={themes} />}
          {activeTab === 'alerts'    && <div style={{maxWidth:760}}><AlertPanel alerts={alerts} /></div>}
          {activeTab === 'insights'  && <InsightPanel themes={themes} />}
        </div>
      </div>
    </div>
  );
}
