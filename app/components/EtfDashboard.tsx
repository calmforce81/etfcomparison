'use client';

import { useEffect, useMemo, useState } from 'react';
import type { EtfItem, RecentEtfItem } from '../lib/types';

type ApiStatus = 'loading' | 'live' | 'fallback' | 'error';

type EtfsResponse = {
  mode?: string;
  fetchedAt?: string;
  items: EtfItem[];
};

type RecentResponse = {
  mode?: string;
  fetchedAt?: string;
  items: RecentEtfItem[];
};

const WATCH_CODES = ['069500','102110','379800','143850','379810','133690','395160','396500'];
const RECENT_CODES = ['0183J0','0180V0','0174B0','0182R0','0182S0'];
const REFRESH_INTERVAL_MS = 1000 * 60 * 5;

const fmtT = (v: number) => `${(Number(v || 0) / 1e12).toFixed(2)}조`;
const fmtB = (v: number) => `${(Number(v || 0) / 1e9).toFixed(1)}억`;
const fmtM = (v: number) => `${(Number(v || 0) / 1e6).toFixed(2)}백만`;
const sum = <T extends Record<string, unknown>>(items: T[], key: keyof T) => items.reduce((acc, item) => acc + Number(item[key] || 0), 0);

function getBrandClass(brand: string) {
  if (brand === 'KODEX') return 'kodex';
  if (brand === 'TIGER') return 'tiger';
  return '';
}

function SourceActions({ item }: { item: { source: string } }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(item.source);
      alert('URL을 복사했습니다.');
    } catch {
      prompt('아래 URL을 복사해 브라우저 주소창에 붙여넣어 주세요.', item.source);
    }
  }

  return (
    <span className="source-actions">
      <a className="open-btn" href={item.source} target="_blank" rel="noopener noreferrer">보기 ↗</a>
      <button className="copy-btn" type="button" onClick={copy}>URL 복사</button>
    </span>
  );
}

export default function EtfDashboard() {
  const [status, setStatus] = useState<ApiStatus>('loading');
  const [statusMessage, setStatusMessage] = useState('초기화 중');
  const [etfs, setEtfs] = useState<EtfItem[]>([]);
  const [recent, setRecent] = useState<RecentEtfItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadData(manual = false) {
    setIsRefreshing(true);
    setStatus('loading');
    setStatusMessage('데이터를 조회하고 있습니다.');

    try {
      const [etfRes, recentRes] = await Promise.all([
        fetch(`/api/etfs?codes=${encodeURIComponent(WATCH_CODES.join(','))}`, { cache: 'no-store' }),
        fetch(`/api/recent-etfs?codes=${encodeURIComponent(RECENT_CODES.join(','))}`, { cache: 'no-store' })
      ]);

      if (!etfRes.ok) throw new Error(`/api/etfs ${etfRes.status}`);
      if (!recentRes.ok) throw new Error(`/api/recent-etfs ${recentRes.status}`);

      const etfJson = await etfRes.json() as EtfsResponse;
      const recentJson = await recentRes.json() as RecentResponse;

      if (!Array.isArray(etfJson.items) || etfJson.items.length === 0) {
        throw new Error('ETF 응답 데이터가 비어 있습니다.');
      }

      setEtfs(etfJson.items);
      setRecent(Array.isArray(recentJson.items) ? recentJson.items : []);
      setStatus('live');
      setStatusMessage('서버 API에서 최신 ETF 데이터를 조회했습니다.');
      setLastUpdated(new Date(etfJson.fetchedAt || Date.now()));
    } catch (error) {
      setStatus(manual ? 'error' : 'fallback');
      setStatusMessage(error instanceof Error ? error.message : '데이터 조회 중 오류가 발생했습니다.');
      setLastUpdated(new Date());
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
    const timer = window.setInterval(() => loadData(), REFRESH_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, []);

  const filteredEtfs = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return etfs.filter((item) => {
      const matchFilter = filter === 'all' || item.group === filter;
      const searchText = `${item.name} ${item.index} ${item.code} ${item.brand} ${item.group}`.toLowerCase();
      return matchFilter && searchText.includes(q);
    });
  }, [etfs, filter, keyword]);

  const summary = useMemo(() => {
    const base = {
      KODEX: { aum: 0, transaction: 0, volume: 0, count: 0 },
      TIGER: { aum: 0, transaction: 0, volume: 0, count: 0 }
    };

    filteredEtfs.forEach((item) => {
      if (item.brand !== 'KODEX' && item.brand !== 'TIGER') return;
      base[item.brand].aum += item.aum;
      base[item.brand].transaction += item.transaction;
      base[item.brand].volume += item.volume;
      base[item.brand].count += 1;
    });

    return base;
  }, [filteredEtfs]);

  const groupValues = useMemo(() => {
    const groups = Array.from(new Set(etfs.map((item) => item.group)));
    return groups.map((group) => ({
      group,
      kodex: filteredEtfs.filter((item) => item.brand === 'KODEX' && item.group === group).reduce((acc, item) => acc + item.aum, 0) / 1e12,
      tiger: filteredEtfs.filter((item) => item.brand === 'TIGER' && item.group === group).reduce((acc, item) => acc + item.aum, 0) / 1e12
    }));
  }, [etfs, filteredEtfs]);

  const chartMetrics = [
    { label: 'AUM', unit: '조', kodex: summary.KODEX.aum / 1e12, tiger: summary.TIGER.aum / 1e12 },
    { label: '거래대금', unit: '천억', kodex: summary.KODEX.transaction / 1e11, tiger: summary.TIGER.transaction / 1e11 },
    { label: '거래량', unit: '백만', kodex: summary.KODEX.volume / 1e6, tiger: summary.TIGER.volume / 1e6 }
  ];
  const maxGroup = Math.max(...groupValues.flatMap((item) => [item.kodex, item.tiger]), 0.01);
  const statusTagClass = status === 'live' ? 'tag-live' : status === 'error' ? 'tag-error' : 'tag-fallback';
  const statusLabel = status === 'live' ? 'LIVE' : status === 'loading' ? 'LOADING' : status === 'error' ? 'ERROR' : 'FALLBACK';

  return (
    <main className="wrap">
      <section className="hero">
        <div className="eyebrow">ETF Market Intelligence · Next.js App</div>
        <h1>KODEX vs TIGER ETF 실시간 비교 대시보드</h1>
        <p>서버 API가 K-ETF 상세 페이지를 조회하고, 프론트는 API 결과를 받아 KODEX와 TIGER의 AUM, 거래대금, 거래량, 최근 상장 ETF를 비교합니다.</p>
        <div className="meta">
          <span>📅 조회일시 <b>{lastUpdated ? lastUpdated.toLocaleString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }) : '-'}</b></span>
          <span>🔗 출처: K-ETF 서버 연동</span>
          <span>{status === 'live' ? '🟢 실시간 API 연결' : '🟠 조회 대기/오류'}</span>
        </div>
      </section>

      <div className="toolbar">
        <div className="tabs" aria-label="비교군 필터">
          {['all', '대표지수', '반도체 테마'].map((item) => (
            <button key={item} className={`tab ${filter === item ? 'active' : ''}`} type="button" onClick={() => setFilter(item)}>
              {item === 'all' ? '전체 비교' : item}
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          <label className="search">🔎 <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="ETF명, 지수명, 종목코드 검색" /></label>
          <button className="refresh" type="button" disabled={isRefreshing} onClick={() => loadData(true)}>{isRefreshing ? '조회 중...' : '실시간 새로고침'}</button>
        </div>
      </div>

      <div className="status"><span><strong>데이터 상태:</strong> {statusMessage}</span><span className={`tag ${statusTagClass}`}>{statusLabel}</span></div>

      <section className="kpis">
        <div className="card kpi"><div className="label">총 AUM</div><div className="value">{fmtT(sum(filteredEtfs, 'aum'))}</div><div className="sub">조회 가능 ETF 기준</div></div>
        <div className="card kpi"><div className="label">총 거래대금</div><div className="value">{fmtB(sum(filteredEtfs, 'transaction'))}</div><div className="sub">최신 데이터 기준</div></div>
        <div className="card kpi"><div className="label">총 거래량</div><div className="value">{fmtM(sum(filteredEtfs, 'volume'))}</div><div className="sub">주식 수 기준</div></div>
        <div className="card kpi"><div className="label">비교 ETF 수</div><div className="value">{filteredEtfs.length}개</div><div className="sub">검색/필터 반영</div></div>
      </section>

      <section className="grid">
        <div className="card section">
          <h2>비교군 내 브랜드 핵심 지표</h2>
          <p className="desc">선택한 비교군 안에서 KODEX와 TIGER의 AUM, 거래대금, 거래량을 나란히 비교합니다.</p>
          <div className="chart">
            {chartMetrics.map((metric) => {
              const max = Math.max(metric.kodex, metric.tiger, 0.01);
              return (
                <div className="chart-row" key={metric.label}>
                  <div className="chart-label">{metric.label}</div>
                  <div>
                    <div className="smallbar-label">KODEX</div>
                    <div className="bar-wrap"><div className="bar" style={{ width: `${(metric.kodex / max) * 100}%`, background: 'var(--kodex)' }} /></div>
                    <div className="smallbar-label" style={{ marginTop: 8 }}>TIGER</div>
                    <div className="bar-wrap"><div className="bar" style={{ width: `${(metric.tiger / max) * 100}%`, background: 'var(--tiger)' }} /></div>
                  </div>
                  <div className="bar-value">{metric.kodex.toFixed(1)} / {metric.tiger.toFixed(1)}{metric.unit}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card section">
          <h2>브랜드 요약</h2>
          <p className="desc">브랜드별 규모와 유동성을 빠르게 파악할 수 있는 요약 카드입니다.</p>
          <div className="brand-cards">
            {(['KODEX', 'TIGER'] as const).map((brand) => (
              <div className="brand-card" key={brand}>
                <div className="brand-head"><span className="badge"><span className="dot" style={{ background: brand === 'KODEX' ? 'var(--kodex)' : 'var(--tiger)' }} />{brand}</span><span className={`pill ${brand.toLowerCase()}`}>{summary[brand].count}개</span></div>
                <div className="mini">
                  <div className="mini-row"><span>AUM</span><strong>{fmtT(summary[brand].aum)}</strong></div>
                  <div className="mini-row"><span>거래대금</span><strong>{fmtB(summary[brand].transaction)}</strong></div>
                  <div className="mini-row"><span>거래량</span><strong>{fmtM(summary[brand].volume)}</strong></div>
                </div>
              </div>
            ))}
          </div>
          <p className="note">※ K-ETF 페이지 구조가 변경되면 서버 파서 수정이 필요할 수 있습니다.</p>
        </div>
      </section>

      <section className="card section" style={{ marginTop: 18 }}>
        <h2>비교군별 KODEX vs TIGER AUM 비교</h2>
        <p className="desc">대표지수와 반도체 테마 기준으로 두 브랜드의 규모를 비교합니다.</p>
        <div className="split-chart">
          {groupValues.map((item) => (
            <div className="split-item" key={item.group}>
              <div className="chart-label">{item.group}</div>
              <div className="split-bars">
                <div><div className="smallbar-label">KODEX {item.kodex.toFixed(2)}조</div><div className="smallbar"><span style={{ width: `${(item.kodex / maxGroup) * 100}%`, background: 'var(--kodex)' }} /></div></div>
                <div><div className="smallbar-label">TIGER {item.tiger.toFixed(2)}조</div><div className="smallbar"><span style={{ width: `${(item.tiger / maxGroup) * 100}%`, background: 'var(--tiger)' }} /></div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card section" style={{ marginTop: 18 }}>
        <h2>최근 상장 ETF</h2>
        <p className="desc">서버 API가 지정된 최근 상장 후보 ETF를 K-ETF에서 조회합니다. 자동 신규상장 탐색은 KRX 데이터 연동 단계에서 확장합니다.</p>
        <div className="recent-grid">
          {recent.slice(0, 10).map((item) => (
            <div className="recent-card" key={item.code}>
              <span className={`pill ${getBrandClass(item.brand)}`}>{item.brand}</span>
              <div className="recent-name">{item.name}</div>
              <div className="recent-meta">{item.code} · {item.listingDate}<br />{item.theme}</div>
              <div className="recent-value">{fmtT(item.aum)}</div>
              <div className="recent-meta">거래대금 {fmtB(item.transaction)} · 거래량 {fmtM(item.volume)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="card section" style={{ marginTop: 18 }}>
        <h2>출처 바로가기</h2>
        <p className="desc">각 ETF의 K-ETF 원천 페이지로 이동합니다.</p>
        <div className="source-list">
          {[...filteredEtfs, ...recent].map((item) => (
            <div className="source-link" key={`${item.code}-${item.name}`}>
              <span><strong>{item.name}</strong><br /><small>{item.code}</small><span className="url-text">{item.source}</span></span>
              <SourceActions item={item} />
            </div>
          ))}
        </div>
      </section>

      <section className="card table-card">
        <h2 style={{ margin: '0 0 6px' }}>ETF 상세 리스트</h2>
        <p className="desc">비교군 탭과 검색어에 따라 리스트가 즉시 변경됩니다.</p>
        <table>
          <thead><tr><th>브랜드</th><th>ETF</th><th>비교군</th><th>추종 지수</th><th className="right">AUM</th><th className="right">거래대금</th><th className="right hide-sm">거래량</th><th className="right hide-sm">총보수</th><th>출처</th></tr></thead>
          <tbody>
            {filteredEtfs.length === 0 ? <tr><td colSpan={9} className="empty">검색 결과가 없습니다.</td></tr> : filteredEtfs.map((item) => (
              <tr key={item.code}>
                <td><span className={`pill ${getBrandClass(item.brand)}`}>{item.brand}</span></td>
                <td><div className="name">{item.name}</div><div className="code">{item.code}</div></td>
                <td><span className="pill">{item.group}</span></td>
                <td>{item.index}</td>
                <td className="right"><strong>{fmtT(item.aum)}</strong></td>
                <td className="right">{fmtB(item.transaction)}</td>
                <td className="right hide-sm">{fmtM(item.volume)}</td>
                <td className="right hide-sm">{item.fee}%</td>
                <td><SourceActions item={item} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
