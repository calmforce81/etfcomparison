'use client';
import { ThemeData } from '../lib/data';
import styles from './OverviewPanel.module.css';

interface Props { themes: ThemeData[]; }

function fmt(n: number) { return n.toLocaleString('ko-KR'); }
function fmtPct(n: number) { return (n > 0 ? '+' : '') + n.toFixed(2) + '%'; }
function calcRet(prices: number[]) {
  if (prices.length < 2) return 0;
  return parseFloat(((prices[prices.length - 1] - prices[0]) / prices[0] * 100).toFixed(2));
}

// KODEX/TIGER 전체 공식 AUM (2026.05.29 기준, 공시 데이터)
const KODEX_TOTAL_AUM = 201_458_900_000_000;  // 201.4조 (삼성자산운용 공시, 2026.05.29)
const TIGER_TOTAL_AUM = 421_000_000_000_000;  // 421조 (미래에셋 글로벌 기준, 2026.05 말)
const KODEX_TOTAL_COUNT = 236;                 // 전체 상품 수
const KODEX_MARKET_SHARE = 40;                 // 국내 시장 점유율(%)

export default function OverviewPanel({ themes }: Props) {
  // 대시보드 내 선택 테마 AUM 합계
  const dashKodex = themes.reduce((s, t) => s + t.k.aumRaw, 0);
  const dashTiger = themes.reduce((s, t) => s + t.t.aumRaw, 0);
  const fmtAum = (n: number) => n >= 1e12 ? (n/1e12).toFixed(1)+'조' : Math.round(n/1e8).toLocaleString()+'억';

  return (
    <div className={styles.wrap}>

      {/* 공식 AUM 안내 배너 */}
      <div className={styles.officialBanner}>
        <div className={styles.bannerIcon}>📢</div>
        <div className={styles.bannerText}>
          <span className={styles.bannerTitle}>KODEX 전체 순자산 201.4조 돌파 (2026.05.29 공시)</span>
          <span className={styles.bannerSub}>
            236개 상품 전체 합산 · 국내 ETF 시장 점유율 약 40% · 국내 운용업계 최초 달성
            &nbsp;|&nbsp; 아래 수치는 대시보드에 등록된 <strong>{themes.length}개 테마</strong>의 부분 합산입니다.
          </span>
        </div>
      </div>

      {/* 전체 요약 카드 */}
      <div className={styles.summaryRow}>
        <div className={`${styles.sumCard} ${styles.sumK}`}>
          <div className={styles.sumLabel}>KODEX 공식 전체 AUM</div>
          <div className={styles.sumVal}>{fmtAum(KODEX_TOTAL_AUM)}</div>
          <div className={styles.sumSub}>236개 상품 전체 · 2026.05.29 공시</div>
        </div>
        <div className={`${styles.sumCard} ${styles.sumK}`} style={{borderLeftColor:'var(--sam-blue-2)', opacity:0.8}}>
          <div className={styles.sumLabel}>대시보드 {themes.length}개 테마 AUM</div>
          <div className={styles.sumVal} style={{fontSize:'20px'}}>{fmtAum(dashKodex)}</div>
          <div className={styles.sumSub}>전체의 약 {(dashKodex/KODEX_TOTAL_AUM*100).toFixed(1)}% 해당</div>
        </div>
        <div className={styles.sumCard}>
          <div className={styles.sumLabel}>국내 시장 점유율</div>
          <div className={`${styles.sumVal} ${styles.kodexColor}`}>{KODEX_MARKET_SHARE}%</div>
          <div className={styles.sumSub}>국내 ETF 시장 1위</div>
        </div>
        <div className={styles.sumCard}>
          <div className={styles.sumLabel}>테마 수익률 우위</div>
          {(() => {
            let kWins = 0;
            themes.forEach(th => {
              if (calcRet(th.k.month1) > calcRet(th.t.month1)) kWins++;
            });
            const tWins = themes.length - kWins;
            return (
              <>
                <div className={`${styles.sumVal} ${kWins > tWins ? styles.kodexColor : styles.tigerColor}`}>
                  {kWins > tWins ? 'KODEX' : 'TIGER'}
                </div>
                <div className={styles.sumSub}>KODEX {kWins}승 / TIGER {tWins}승</div>
              </>
            );
          })()}
        </div>
      </div>

      {/* 테마별 전체 비교 테이블 */}
      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <span className={styles.tableTitle}>테마별 전체 비교</span>
          <div className={styles.legend}>
            <span className={styles.legK}><span className={styles.dot}/>KODEX</span>
            <span className={styles.legT}><span className={`${styles.dot} ${styles.dotT}`}/>TIGER</span>
          </div>
        </div>
        <div className={styles.scrollOuter}><table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>테마</th>
              <th className={styles.th}>현재가</th>
              <th className={styles.th}>일간 등락</th>
              <th className={styles.th}>1개월 수익률</th>
              <th className={styles.th}>AUM</th>
              <th className={styles.th}>총보수</th>
              <th className={styles.th}>괴리율</th>
              <th className={styles.th}>우위</th>
            </tr>
          </thead>
          <tbody>
            {themes.map(theme => {
              const { k, t } = theme;
              const kRet = calcRet(k.month1);
              const tRet = calcRet(t.month1);
              const kWinRet = kRet > tRet;
              const kWinChange = k.change > t.change;
              const kWinAum = k.aumRaw > t.aumRaw;
              const kWinExpense = k.expense < t.expense;
              const kScore = [kWinRet, kWinChange, kWinAum, kWinExpense].filter(Boolean).length;
              const overallWin = kScore >= 3 ? 'k' : 't';

              return (
                <tr key={theme.name} className={styles.trow}>
                  <td className={styles.tdTheme}>{theme.name}</td>
                  {/* KODEX/TIGER 현재가 */}
                  <td className={styles.tdDouble}>
                    <span className={styles.kVal}>{fmt(k.price)}</span>
                    <span className={styles.tVal}>{fmt(t.price)}</span>
                  </td>
                  {/* 등락 */}
                  <td className={styles.tdDouble}>
                    <span className={`${styles.kVal} ${k.change >= 0 ? styles.up : styles.dn}`}>{fmtPct(k.change)}</span>
                    <span className={`${styles.tVal} ${t.change >= 0 ? styles.up : styles.dn}`}>{fmtPct(t.change)}</span>
                  </td>
                  {/* 1개월 수익률 */}
                  <td className={styles.tdDouble}>
                    <span className={`${styles.kVal} ${kWinRet ? styles.winK : ''} ${kRet >= 0 ? styles.up : styles.dn}`}>{fmtPct(kRet)}</span>
                    <span className={`${styles.tVal} ${!kWinRet ? styles.winT : ''} ${tRet >= 0 ? styles.up : styles.dn}`}>{fmtPct(tRet)}</span>
                  </td>
                  {/* AUM */}
                  <td className={styles.tdDouble}>
                    <span className={`${styles.kVal} ${kWinAum ? styles.winK : ''}`}>{k.aum}</span>
                    <span className={`${styles.tVal} ${!kWinAum ? styles.winT : ''}`}>{t.aum}</span>
                  </td>
                  {/* 총보수 */}
                  <td className={styles.tdDouble}>
                    <span className={`${styles.kVal} ${kWinExpense ? styles.winK : ''}`}>{k.expense}%</span>
                    <span className={`${styles.tVal} ${!kWinExpense ? styles.winT : ''}`}>{t.expense}%</span>
                  </td>
                  {/* 괴리율 */}
                  <td className={styles.tdDouble}>
                    <span className={`${styles.kVal} ${k.discount > 0 ? styles.up : styles.dn}`}>{k.discount > 0 ? '+' : ''}{k.discount}%</span>
                    <span className={`${styles.tVal} ${t.discount > 0 ? styles.up : styles.dn}`}>{t.discount > 0 ? '+' : ''}{t.discount}%</span>
                  </td>
                  {/* 우위 */}
                  <td className={styles.tdWinner}>
                    {overallWin === 'k'
                      ? <span className={styles.chipK}>KODEX</span>
                      : <span className={styles.chipT}>TIGER</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table></div>
      </div>

      {/* 테마별 AUM 바 비교 */}
      <div className={styles.aumSection}>
        <div className={styles.tableTitle} style={{marginBottom: 16}}>테마별 AUM 비교</div>
        {themes.map(theme => {
          const total = theme.k.aumRaw + theme.t.aumRaw;
          const kPct = (theme.k.aumRaw / total * 100);
          const tPct = 100 - kPct;
          return (
            <div key={theme.name} className={styles.aumRow}>
              <div className={styles.aumLabel}>{theme.name}</div>
              <div className={styles.aumBar}>
                <div className={styles.aumBarK} style={{ width: kPct + '%' }}>
                  {kPct > 20 && <span className={styles.aumBarLabel}>{theme.k.aum}</span>}
                </div>
                <div className={styles.aumBarT} style={{ width: tPct + '%' }}>
                  {tPct > 20 && <span className={styles.aumBarLabel}>{theme.t.aum}</span>}
                </div>
              </div>
              <div className={styles.aumPcts}>
                <span className={styles.kPct}>{kPct.toFixed(0)}%</span>
                <span className={styles.tPct}>{tPct.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
