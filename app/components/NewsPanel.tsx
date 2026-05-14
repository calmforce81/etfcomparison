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

function relTime(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1)  return '방금';
    if (m < 60) return `${m}분 전`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}시간 전`;
    const d = Math.floor(h / 24);
    return d < 8 ? `${d}일 전` : new Date(iso).toLocaleDateString('ko-KR',{month:'short',day:'numeric'});
  } catch { return ''; }
}

export default function NewsPanel() {
  const [theme, setTheme]         = useState('전체');
  const [typeFilter, setTypeFilter] = useState<'all'|'news'|'blog'|'youtube'>('all');
  const [news,   setNews]         = useState<NewsItem[]>([]);
  const [blogs,  setBlogs]        = useState<NewsItem[]>([]);
  const [videos, setVideos]       = useState<NewsItem[]>([]);
  const [loading, setLoading]     = useState(false);
  const [fetchedAt, setFetchedAt] = useState('');
  const [sources, setSources]     = useState<Record<string,string>>({});

  const load = useCallback(async (t: string) => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/news?theme=${encodeURIComponent(t)}`);
      const data = await res.json();
      setNews(data.news   ?? []);
      setBlogs(data.blogs ?? []);
      setVideos(data.videos ?? []);
      setFetchedAt(data.fetchedAt ?? '');
      setSources(data.sources ?? {});
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(theme); }, [theme, load]);

  // 필터 적용
  const filtered =
    typeFilter === 'all'     ? [...news, ...blogs, ...videos].sort((a,b) => new Date(b.publishedAt).getTime()-new Date(a.publishedAt).getTime()) :
    typeFilter === 'news'    ? news :
    typeFilter === 'blog'    ? blogs :
    videos;

  // 활성 소스만 (미설정 항목 제외)
  const activeSources = Object.entries(sources).filter(([,v]) => !v.includes('미설정') && !v.includes('키 미설정'));

  return (
    <div className={styles.wrap}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>ETF 뉴스 &amp; 콘텐츠</h2>
          {fetchedAt && (
            <span className={styles.fetchTime}>
              🕐 {new Date(fetchedAt).toLocaleTimeString('ko-KR',{hour:'2-digit',minute:'2-digit',second:'2-digit'})} 조회
            </span>
          )}
        </div>
        <button className={styles.refreshBtn} onClick={() => load(theme)}>↻ 새로고침</button>
      </div>

      {/* 활성 소스 배지만 표시 */}
      {activeSources.length > 0 && (
        <div className={styles.sourceBadges}>
          {activeSources.map(([k, v]) => (
            <span key={k} className={styles.srcLive}>● {v}</span>
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
        {TYPE_TABS.map(tab => {
          const cnt = tab.key==='news' ? news.length : tab.key==='blog' ? blogs.length : tab.key==='youtube' ? videos.length : 0;
          // 데이터 없는 탭은 흐리게만 (숨기지 않음)
          return (
            <button key={tab.key}
              className={`${typeFilter===tab.key ? styles.typeActive : styles.typeBtn} ${tab.key!=='all'&&cnt===0 ? styles.typeEmpty : ''}`}
              onClick={() => setTypeFilter(tab.key)}>
              {tab.label}
              {tab.key !== 'all' && cnt > 0 && <span className={styles.cnt}>{cnt}</span>}
            </button>
          );
        })}
      </div>

      {/* 카드 */}
      {loading ? (
        <div className={styles.loading}><div className={styles.spinner}/><span>최신 콘텐츠 불러오는 중...</span></div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          {typeFilter==='blog' ? '네이버 블로그 API 키(NAVER_CLIENT_ID)를 Vercel에 추가하면 활성화됩니다.' :
           typeFilter==='youtube' ? 'YouTube API 키(YOUTUBE_API_KEY)를 Vercel에 추가하면 활성화됩니다.' :
           '검색 결과가 없습니다. 잠시 후 새로고침해 보세요.'}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(item => (
            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
              className={`${styles.card} ${item.type==='youtube' ? styles.ytCard : ''}`}>
              {item.type==='youtube' && item.thumbnail && (
                <div className={styles.thumb}>
                  <img src={item.thumbnail} alt="" className={styles.thumbImg}/>
                  <div className={styles.playBtn}>▶</div>
                </div>
              )}
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={`${styles.typeTag} ${
                    item.type==='youtube' ? styles.ytTag :
                    item.type==='blog'    ? styles.blogTag : styles.newsTag
                  }`}>
                    {item.type==='youtube' ? '▶ YouTube' : item.type==='blog' ? '✏️ Blog' : '📰 News'}
                  </span>
                  <span className={styles.cardTime}>{relTime(item.publishedAt)}</span>
                </div>
                <div className={styles.cardTitle}>{item.title}</div>
                {item.summary && <div className={styles.cardSummary}>{item.summary}</div>}
                <div className={styles.cardSource}>{item.source}</div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
