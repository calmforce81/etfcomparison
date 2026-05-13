'use client';

import { useEffect, useMemo, useState } from 'react';
import type { EtfItem, RecentEtfItem } from '../lib/k-etf';

const LIVE_ETF_CODES = ['069500', '102110', '379800', '143850', '379810', '133690', '395160', '396500'];

type DataMode = 'loading' | 'live' | 'error';

function fmtT(value: number) {
  return `${(Number(value || 0) / 1e12).toFixed(2)}조`;
}

function fmtB(value: number) {
  return `${(Number(value || 0) / 1e9).toFixed(1)}억`;
}

function fmtM(value: number) {
  return `${(Number(value || 0) / 1e6).toFixed(2)}백만`;
}

function sum(data: EtfItem[], key: keyof Pick<EtfItem, 'aum' | 'transaction' | 'volume'>) {
  return data.reduce((acc, item) => acc + Number(item[key] || 0), 0);
}

function brandSummary(data: EtfItem[]) {
  const summary = {
    KODEX: { aum: 0, transaction: 0, volume: 0, count: 0 },
    TIGER: { aum: 0, transaction: 0, volume: 0, count: 0 },
  };

  data.forEach((item) => {
    if (item.brand !== 'KODEX' && item.brand !== 'TIGER') return;
    summary[item.brand].aum += item.aum;
    summary[item.brand].transaction += item.transaction;
    summary[item.brand].volume += item.volume;
    summary[item.brand].count += 1;
  });

  return summary;
}

export default function EtfDashboard() {
  const [etfs, setEtfs] = useState<EtfItem[]>([]);
  const [recent, setRecent] = useState<RecentEtfItem[]>([]);
  const [filter, setFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [mode, setMode] = useState<DataMode>('loading');
  const [message, setMessage] = useState('데이터를 조회하고 있습니다.');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function loadData() {
    setMode('loading');
    setMessage('데이터를 조회하고 있습니다.');

    try {
      const [etfRes, recentRes] = await Promise.all([
        fetch(`/api/etfs?codes=${encodeURIComponent(LIVE_ETF_CODES.join(','))}`, { cache: 'no-store' }),
        fetch('/api/recent-etfs?days=30', { cache: 'no-store' }),
      ]);

      if (!etfRes.ok || !recentRes.ok) {
        throw new Error('API 응답이 정상적이지 않습니다.');
      }

      const etfPayload = (await etfRes.json()) as { items: EtfItem[] };
      const recentPayload = (await recentRes.json()) as { items: RecentEtfItem[] };

      setEtfs(etfPayload.items);
      setRecent(recentPayload.items);
      setMode('live');
      setMessage('API 데이터가 반영되었습니다.');
      setLastUpdated(new Date());
    } catch (error) {
      setMode('error');
      setMessage(error instanceof Error ? error.message : '데이터 조회에 실패했습니다.');
      setLastUpdated(new Date());
    }
  }

  useEffect(() => {
    void loadData();
    const id = window.setInterval(() => {
      void loadData();
    }, 5 * 60 * 1000);

    return () => window.clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    return etfs.filter((item) => {
      const groupMatch = filter === 'all' || item.group === filter;
      const text = `${item.name} ${item.code} ${item.brand} ${item.group} ${item.index}`.toLowerCase();
      return groupMatch && text.includes(q);
    });
  }, [etfs, filter, keyword]);

  const summary = brandSummary(filtered);
  const groups = Array.from(new Set(etfs.map((item) => item.group)));

  return (
    <main className="wrap">
      <section className="hero">
        <div className="eyebrow">ETF Market Intelligence · App</div>
        <h1>KODEX vs TIGER ETF 비교 대시보드</h1>
        <p>비교군 기준으로 KODEX와 TIGER를 나란히 비교합니다. 서버 API를 통해 ETF 데이터와 최근 상장 ETF를 조회합니다.</p>
        <div className="meta">
          <span>📅 조회일시 <b>{lastUpdated ? lastUpdated.toLocaleString('ko-KR') : '-'}</b></span>
          <span>🔗 출처: K-ETF / API</span>
          <span>{mode === 'live' ? '🟢 API 연결' : mode === 'loading' ? '🟠 조회 중' : '🔴 오류'}</span>
        </div>
      </section>

      <section className="status">
        <span><strong>데이터 상태:</strong> {message}</span>
        <button className="refresh" type="button" onClick={() => void loadData()}>새로고침</button>
      </section>

      <section className="toolbar">
        <div className="tabs">
          {['all', '대표지수', '반도체 테마'].map((item) => (
            <button key={item} className={`tab ${filter === item ? 'active' : ''}`} type="button" onClick={() => setFilter(item)}>
              {item === 'all' ? '전체 비교' : item}
            </button>
          ))}
        </div>
        <label className="search">🔎 <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="ETF명, 지수명, 종목코드 검색" /></label>
      </section>

      <section className="kpis">
        <div className="card kpi"><div className="label">총 AUM</div><div className="value">{fmtT(sum(filtered, 'aum'))}</div><div className="sub">조회 가능 ETF 기준</div></div>
        <div className="card kpi"><div className="label">총 거래대금</div><div className="value">{fmtB(sum(filtered, 'transaction'))}</div><div className="sub">최신 데이터 기준</div></div>
        <div className="card kpi"><div className="label">총 거래량</div><div className="value">{fmtM(sum(filtered, 'volume'))}</div><div className="sub">주식 수 기준</div></div>
        <div className="card kpi"><div className="label">비교 ETF 수</div><div className="value">{filtered.length}개</div><div className="sub">데이터 조회 가능 항목</div></div>
      </section>

      <section className="grid">
        <div className="card section">
          <h2>브랜드 핵심 지표</h2>
          {[
            { label: 'AUM', unit: '조', kodex: summary.KODEX.aum / 1e12, tiger: summary.TIGER.aum / 1e12 },
            { label: '거래대금', unit: '천억', kodex: summary.KODEX.transaction / 1e11, tiger: summary.TIGER.transaction / 1e11 },
            { label: '거래량', unit: '백만', kodex: summary.KODEX.volume / 1e6, tiger: summary.TIGER.volume / 1e6 },
          ].map((item) => {
            const max = Math.max(item.kodex, item.tiger, 0.01);
            return (
              <div className="chart-row" key={item.label}>
                <div className="chart-label">{item.label}</div>
                <div>
                  <div className="smallbar-label">KODEX</div>
                  <div className="bar-wrap"><div className="bar kodex" style={{ width: `${(item.kodex / max) * 100}%` }} /></div>
                  <div className="smallbar-label">TIGER</div>
                  <div className="bar-wrap"><div className="bar tiger" style={{ width: `${(item.tiger / max) * 100}%` }} /></div>
                </div>
                <div className="bar-value">{item.kodex.toFixed(1)} / {item.tiger.toFixed(1)}{item.unit}</div>
              </div>
            );
          })}
        </div>

        <div className="card section">
          <h2>브랜드 요약</h2>
          <div className="brand-cards">
            {(['KODEX', 'TIGER'] as const).map((brand) => (
              <div className="brand-card" key={brand}>
                <div className="brand-head"><strong>{brand}</strong><span className={`pill ${brand.toLowerCase()}`}>{summary[brand].count}개</span></div>
                <div className="mini-row"><span>AUM</span><strong>{fmtT(summary[brand].aum)}</strong></div>
                <div className="mini-row"><span>거래대금</span><strong>{fmtB(summary[brand].transaction)}</strong></div>
                <div className="mini-row"><span>거래량</span><strong>{fmtM(summary[brand].volume)}</strong></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="card section">
        <h2>비교군별 AUM</h2>
        {groups.map((group) => {
          const kodex = filtered.filter((item) => item.brand === 'KODEX' && item.group === group).reduce((acc, item) => acc + item.aum, 0) / 1e12;
          const tiger = filtered.filter((item) => item.brand === 'TIGER' && item.group === group).reduce((acc, item) => acc + item.aum, 0) / 1e12;
          const max = Math.max(kodex, tiger, 0.01);
          return (
            <div className="split-item" key={group}>
              <div className="chart-label">{group}</div>
              <div className="split-bars">
                <div className="smallbar-label">KODEX {kodex.toFixed(2)}조</div>
                <div className="smallbar"><span className="kodex" style={{ width: `${(kodex / max) * 100}%` }} /></div>
                <div className="smallbar-label">TIGER {tiger.toFixed(2)}조</div>
                <div className="smallbar"><span className="tiger" style={{ width: `${(tiger / max) * 100}%` }} /></div>
              </div>
            </div>
          );
        })}
      </section>

      <section className="card section">
        <h2>최근 상장 ETF</h2>
        <div className="recent-grid">
          {recent.map((item) => (
            <div className="recent-card" key={item.code}>
              <span className="pill">{item.brand}</span>
              <div className="recent-name">{item.name}</div>
              <div className="recent-meta">{item.code} · {item.listingDate}<br />{item.theme}</div>
              <div className="recent-value">{fmtT(item.aum)}</div>
              <a href={item.source} target="_blank" rel="noreferrer" className="link">출처 보기 ↗</a>
            </div>
          ))}
        </div>
      </section>

      <section className="card table-card">
        <h2>ETF 상세 리스트</h2>
        <table>
          <thead><tr><th>브랜드</th><th>ETF</th><th>비교군</th><th>추종 지수</th><th>AUM</th><th>거래대금</th><th>거래량</th><th>총보수</th><th>출처</th></tr></thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.code}>
                <td><span className={`pill ${item.brand.toLowerCase()}`}>{item.brand}</span></td>
                <td><strong>{item.name}</strong><div className="code">{item.code}</div></td>
                <td>{item.group}</td>
                <td>{item.index}</td>
                <td>{fmtT(item.aum)}</td>
                <td>{fmtB(item.transaction)}</td>
                <td>{fmtM(item.volume)}</td>
                <td>{item.fee}%</td>
                <td><a href={item.source} target="_blank" rel="noreferrer" className="link">보기 ↗</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
