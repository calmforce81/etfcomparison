'use client';

import styles from './Header.module.css';

interface HeaderProps {
  updatedAt: string;
  alertCount: number;
  activeTab: 'dashboard' | 'alerts';
  onTabChange: (tab: 'dashboard' | 'alerts') => void;
  dataSource: 'naver' | 'mock' | null;
}

export default function Header({ updatedAt, alertCount, activeTab, onTabChange, dataSource }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logos}>
            <span className={styles.badgeK}>KODEX</span>
            <span className={styles.vs}>vs</span>
            <span className={styles.badgeT}>TIGER</span>
          </div>
          <div className={styles.titleBlock}>
            <h1 className={styles.title}>ETF 비교 대시보드</h1>
            <p className={styles.sub}>Samsung Asset Management · 내부 운용 모니터링</p>
          </div>
        </div>

        <div className={styles.right}>
          {dataSource && (
            <span className={dataSource === 'naver' ? styles.sourceLive : styles.sourceMock}>
              {dataSource === 'naver' ? '네이버 실시간' : 'Mock 데이터'}
            </span>
          )}
          <div className={styles.liveDot} />
          <span className={styles.liveTime}>{updatedAt}</span>
        </div>
      </div>

      <nav className={styles.nav}>
        <button
          className={activeTab === 'dashboard' ? styles.navActive : styles.navBtn}
          onClick={() => onTabChange('dashboard')}
        >
          비교 대시보드
        </button>
        <button
          className={activeTab === 'alerts' ? styles.navActive : styles.navBtn}
          onClick={() => onTabChange('alerts')}
        >
          에이전트 알림
          {alertCount > 0 && <span className={styles.badge}>{alertCount}</span>}
        </button>
      </nav>
    </header>
  );
}
