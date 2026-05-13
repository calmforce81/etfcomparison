'use client';
import styles from './TopBar.module.css';

interface Props {
  themes: string[];
  activeTheme: number;
  pageTitle: string;
  onThemeChange: (i: number) => void;
}

export default function TopBar({ themes, activeTheme, pageTitle, onThemeChange }: Props) {
  const today = new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit' });
  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <h2 className={styles.title}>{pageTitle}</h2>
        <span className={styles.date}>{today}</span>
      </div>
      <div className={styles.tabs}>
        {themes.map((name, i) => (
          <button
            key={name}
            className={i === activeTheme ? styles.tabActive : styles.tab}
            onClick={() => onThemeChange(i)}
          >{name}</button>
        ))}
      </div>
    </div>
  );
}
