'use client';

import styles from './ThemeTabs.module.css';

interface ThemeTabsProps {
  themes: string[];
  active: number;
  onChange: (idx: number) => void;
}

export default function ThemeTabs({ themes, active, onChange }: ThemeTabsProps) {
  return (
    <div className={styles.wrap}>
      {themes.map((name, i) => (
        <button
          key={name}
          className={i === active ? styles.active : styles.tab}
          onClick={() => onChange(i)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
