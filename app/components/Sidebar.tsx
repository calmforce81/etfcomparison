'use client';
import styles from './Sidebar.module.css';

const NAV = [
  { icon: '▦', key: 'dashboard', label: '테마별 비교' },
  { icon: '◈', key: 'overview',  label: '전체 비교' },
  { icon: '◉', key: 'alerts',    label: '에이전트 알림' },
  { icon: '◎', key: 'insights',  label: 'AI 인사이트' },
];

interface Props {
  active: string;
  alertCount: number;
  dataSource: 'naver' | 'mock' | null;
  updatedAt: string;
  onChange: (key: string) => void;
}

export default function Sidebar({ active, alertCount, dataSource, updatedAt, onChange }: Props) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <rect width="20" height="20" rx="5" fill="#1428A0"/>
            <path d="M4 14 L10 6 L16 14" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>
        <div>
          <div className={styles.logoTitle}>KODEX</div>
          <div className={styles.logoSub}>Samsung Asset Mgmt</div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionLabel}>모니터링</div>
        {NAV.map(item => (
          <button
            key={item.key}
            className={`${styles.navItem} ${active === item.key ? styles.navActive : ''}`}
            onClick={() => onChange(item.key)}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span className={styles.navLabel}>{item.label}</span>
            {item.key === 'alerts' && alertCount > 0 && (
              <span className={styles.badge}>{alertCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.spacer} />

      <div className={styles.status}>
        <div className={`${styles.statusDot} ${dataSource === 'naver' ? styles.dotLive : styles.dotMock}`} />
        <div>
          <div className={styles.statusLabel}>
            {dataSource === 'naver' ? '네이버 실시간' : dataSource === 'mock' ? 'Mock 데이터' : '연결 중...'}
          </div>
          <div className={styles.statusTime}>{updatedAt}</div>
        </div>
      </div>
    </aside>
  );
}
