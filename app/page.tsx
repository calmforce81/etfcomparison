'use client';
import { useState, useEffect, useCallback } from 'react';
import { ThemeData, AlertItem, THEMES } from './lib/data';
import Header from './components/Header';
import ThemeTabs from './components/ThemeTabs';
import EtfCard from './components/EtfCard';
import CompareTable from './components/CompareTable';
import PerfChart from './components/PerfChart';
import AlertPanel from './components/AlertPanel';
import OverviewPanel from './components/OverviewPanel';
import styles from './page.module.css';

export default function Home() {
  const [themes, setThemes] = useState<ThemeData[]>(THEMES);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activeTheme, setActiveTheme] = useState(0);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'overview' | 'alerts'>('dashboard');
  const [updatedAt, setUpdatedAt] = useState('로딩 중...');
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
    } catch {
      setDataSource('mock');
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 30000);
    return () => clearInterval(id);
  }, [refresh]);

  const theme = themes[activeTheme];
  const urgentAlerts = alerts.filter(a => a.severity === 'danger' || a.severity === 'warning');

  return (
    <div className={styles.page}>
      <Header
        updatedAt={updatedAt}
        alertCount={urgentAlerts.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dataSource={dataSource}
      />
      <main className={styles.main}>
        {activeTab === 'dashboard' && (
          <div className={styles.dashboard}>
            <ThemeTabs themes={themes.map(t => t.name)} active={activeTheme} onChange={setActiveTheme} />
            <div className={styles.cards}>
              <EtfCard data={theme.k} brand="k" />
              <EtfCard data={theme.t} brand="t" />
            </div>
            <div className={styles.middle}>
              <CompareTable theme={theme} />
              <PerfChart theme={theme} />
            </div>
          </div>
        )}
        {activeTab === 'overview' && <OverviewPanel themes={themes} />}
        {activeTab === 'alerts' && (
          <div className={styles.alertsTab}><AlertPanel alerts={alerts} /></div>
        )}
      </main>
    </div>
  );
}
