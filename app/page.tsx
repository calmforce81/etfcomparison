'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThemeData, AlertItem, THEMES } from './lib/data';
import Header from './components/Header';
import ThemeTabs from './components/ThemeTabs';
import EtfCard from './components/EtfCard';
import CompareTable from './components/CompareTable';
import PerfChart from './components/PerfChart';
import AlertPanel from './components/AlertPanel';
import styles from './page.module.css';

export default function Home() {
  const [themes, setThemes] = useState<ThemeData[]>(THEMES);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [activeTheme, setActiveTheme] = useState(0);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'alerts'>('dashboard');
  const [updatedAt, setUpdatedAt] = useState('로딩 중...');
  const [dataSource, setDataSource] = useState<'naver' | 'mock' | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [themesRes, alertsRes] = await Promise.all([
        fetch('/api/etf?type=themes'),
        fetch('/api/etf?type=alerts'),
      ]);
      const themesData = await themesRes.json();
      const alertsData = await alertsRes.json();

      setThemes(themesData.themes);
      setAlerts(alertsData.alerts ?? []);
      setDataSource(themesData.source === 'naver' ? 'naver' : 'mock');

      const now = new Date();
      setUpdatedAt(
        `${String(now.getHours()).padStart(2, '0')}:` +
        `${String(now.getMinutes()).padStart(2, '0')}:` +
        `${String(now.getSeconds()).padStart(2, '0')} 기준`
      );
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
  const urgentAlerts = alerts.filter(
    (a) => a.severity === 'danger' || a.severity === 'warning'
  );

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
            <ThemeTabs
              themes={themes.map((t) => t.name)}
              active={activeTheme}
              onChange={setActiveTheme}
            />

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

        {activeTab === 'alerts' && (
          <div className={styles.alertsTab}>
            <AlertPanel alerts={alerts} />
          </div>
        )}
      </main>
    </div>
  );
}
