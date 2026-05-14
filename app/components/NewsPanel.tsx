'use client';
import { useState, useEffect, useCallback } from 'react';
import styles from './NewsPanel.module.css';

interface NewsItem {
  id: string;
  type: 'news' | 'blog' | 'youtube';
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  thumbnail?: string;
}

const THEMES = ['전체','반도체','2차전지','미국나스닥','헬스케어','배당'];
const TYPE_TABS = [
  { key: 'all',     label: '전체' },
  { key: 'news',    label: '📰 뉴스' },
  { key: 'blog',    label: '✏️ 블로그' },
  { key: 'youtube', label: '▶ 유튜브' },
] as const;

function relativeTime(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    return `${Math.floor(h / 24)}일 전`;
  } catch { return iso; }
}

function typeIcon(type: string) {
  if (type === 'youtube') return '▶';
  if (type === 'blog')    return '✏️';
  return '📰';
}
function typeBg(type: string) {
  if (type === 'youtube') return styles.ytTag;
  if (type === 'blog')    return styles.blogTag;
  return styles.newsTag;
}

export default function NewsPanel() {
  const [theme, setTheme]         = useState('전체');
  const [typeFilter, setTypeFilter] = useState<'all'|'news'|'blog'|'youtube'>('all');
  const [allItems, setAllItems]   = useState<NewsItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [fetchedAt, setFetchedAt] = useState('');
  const [sources, setSources]     = useState<Record<string,string>>({});

  const load = useCallback(async (t: string) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/news?theme=${encodeURIComponent(t)}`);
      const data = await res.json();
      const combined: NewsItem[] = [
        ...(data.news   ?? []),
        ...(data.blogs  ?? []),
        ...(data.videos ?? []),
      ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
      setAllItems(combined);
      setFetchedAt(data.fetchedAt ?? '');
      setSources(data.sources ?? {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(theme); }, [theme, load]);

  const filtered = typeFilter === 'all'
    ? allItems
    : allItems.filter(i => i.type === typeFilter);

  const counts = {
    news:    allItems.filter(i => i.type === 'news').length,
    blog:    allItems.filter(i => i.type === 'blog').length,
    youtube: allItems.filter(i => i.type === 'youtube').length,
  };

  return (
    <div className={styles.wrap}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>ETF 뉴스 & 콘텐츠</h2>
          {fetchedAt && (
            <span className={styles.fetchTime}>
              🕐 {new Date(fetchedAt).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})} 조회
            </span>
          )}
        </div>
        <button className={styles.refreshBtn} onClick={() => load(theme)}>↻ 새로고침</button>
      </div>

      {/* 소스 뱃지 */}
      {Object.keys(sources).length > 0 && (
        <div className={styles.sourceBadges}>
          {Object.entries(sources).map(([k, v]) => (
            <span key={k} className={`${styles.srcBadge} ${v === 'Mock' ? styles.srcMock : styles.srcLive}`}>
              {v === 'Mock' ? '⚠' : '●'} {k}: {v}
            </span>
          ))}
        </div>
      )}

      {/* 테마 탭 */}
      <div className={styles.themeTabs}>
        {THEMES.map(t => (
          <button key={t}
            className={theme === t ? styles.themeActive : styles.themeTab}
            onClick={() => setTheme(t)}>
            {t}
          </button>
        ))}
      </div>

      {/* 타입 필터 */}
      <div className={styles.typeBar}>
        {TYPE_TABS.map(tab => (
          <button key={tab.key}
            className={typeFilter === tab.key ? styles.typeActive : styles.typeBtn}
            onClick={() => setTypeFilter(tab.key)}>
            {tab.label}
            {tab.key !== 'all' && (
              <span className={styles.cnt}>{counts[tab.key as keyof typeof counts]}</span>
            )}
          </button>
        ))}
      </div>

      {/* 콘텐츠 목록 */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>콘텐츠 불러오는 중...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>검색 결과가 없습니다</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(item => (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
              className={`${styles.card} ${item.type === 'youtube' ? styles.ytCard : ''}`}>
              {/* 유튜브 썸네일 */}
              {item.type === 'youtube' && item.thumbnail && (
                <div className={styles.thumb}>
                  <img src={item.thumbnail} alt="" className={styles.thumbImg} />
                  <div className={styles.playBtn}>▶</div>
                </div>
              )}
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={`${styles.typeTag} ${typeBg(item.type)}`}>
                    {typeIcon(item.type)} {item.type === 'youtube' ? 'YouTube' : item.type === 'blog' ? 'Blog' : 'News'}
                  </span>
                  <span className={styles.cardTime}>{relativeTime(item.publishedAt)}</span>
                </div>
                <div className={styles.cardTitle}>{item.title}</div>
                {item.summary && (
                  <div className={styles.cardSummary}>{item.summary.slice(0,80)}...</div>
                )}
                <div className={styles.cardSource}>{item.source}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
