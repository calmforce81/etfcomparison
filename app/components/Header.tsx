'use client';
import styles from './Header.module.css';

interface HeaderProps {
  updatedAt: string;
  alertCount: number;
  activeTab: 'dashboard' | 'overview' | 'alerts';
  onTabChange: (tab: 'dashboard' | 'overview' | 'alerts') => void;
  dataSource: 'naver' | 'mock' | null;
}

export default function Header({ updatedAt, alertCount, activeTab, onTabChange, dataSource }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logoMark}><span>SAM</span></div>
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
              {dataSource === 'naver' ? '● 네이버 실시간' : '○ Mock 데이터'}
            </span>
          )}
          <div className={styles.liveDot} />
          <span className={styles.liveTime}>{updatedAt}</span>
        </div>
      </div>
      <nav className={styles.nav}>
        {([
          { key: 'dashboard' as const, label: '테마별 비교', badge: undefined as number | undefined },
          { key: 'overview'  as const, label: '전체 비교',   badge: undefined as number | undefined },
          { key: 'alerts'    as const, label: '에이전트 알림', badge: alertCount as number | undefined },
        ]).map(({ key, label, badge }) => (
          <button
            key={key}
            className={activeTab === key ? styles.navActive : styles.navBtn}
            onClick={() => onTabChange(key)}
          >
            {label}
            {badge != null && badge > 0 && <span className={styles.badge}>{badge}</span>}
          </button>
        ))}
      </nav>
    </header>
  );
}
