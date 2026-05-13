'use client';

import { AlertItem } from '../lib/data';
import styles from './AlertPanel.module.css';

interface AlertPanelProps {
  alerts: AlertItem[];
}

const ICON: Record<AlertItem['type'], string> = {
  discount: '⚡',
  aum: '📉',
  performance: '📈',
  new: '🆕',
};

export default function AlertPanel({ alerts }: AlertPanelProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>에이전트 알림 센터</h2>
        <span className={styles.count}>{alerts.length}건</span>
      </div>

      <div className={styles.desc}>
        괴리율 이상 감지 · 자금유입 급변 · 경쟁사 신규 상품 모니터링을 자동 수행합니다.
      </div>

      <div className={styles.list}>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`${styles.item} ${styles[alert.severity]}`}
          >
            <span className={styles.icon}>{ICON[alert.type]}</span>
            <div className={styles.content}>
              <div className={styles.message}>{alert.message}</div>
              <div className={styles.meta}>
                <span className={styles.theme}>{alert.theme}</span>
                <span className={styles.time}>{alert.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.footerItem}>
          <div className={styles.footerIcon}>📲</div>
          <div>
            <div className={styles.footerTitle}>슬랙 알림</div>
            <div className={styles.footerSub}>Webhook 연동 가능</div>
          </div>
        </div>
        <div className={styles.footerItem}>
          <div className={styles.footerIcon}>📧</div>
          <div>
            <div className={styles.footerTitle}>이메일 리포트</div>
            <div className={styles.footerSub}>일간·주간 자동 발송</div>
          </div>
        </div>
        <div className={styles.footerItem}>
          <div className={styles.footerIcon}>🗄️</div>
          <div>
            <div className={styles.footerTitle}>이력 DB 저장</div>
            <div className={styles.footerSub}>누적 분석 가능</div>
          </div>
        </div>
      </div>
    </div>
  );
}
