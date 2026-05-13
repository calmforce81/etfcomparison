# ETF 비교 대시보드

KODEX vs TIGER ETF 실시간 비교 플랫폼 — Samsung Asset Management 내부 운용 모니터링

## 기능

- 5개 테마(반도체·2차전지·미국나스닥·헬스케어·배당) 탭 전환
- KODEX / TIGER ETF 가격·NAV·괴리율·AUM·총보수 비교
- 1W·1M·3M 수익률 추이 차트 (SVG, 외부 라이브러리 없음)
- 30초 자동 갱신 (API 라우트 `/api/etf`)
- 에이전트 알림 센터 (괴리율 이상·AUM 급변·신상품 감지)
- 다크모드 지원
- 모바일 반응형

## 실행

```bash
npm install
npm run dev
```

## Vercel 배포

```bash
git add .
git commit -m "KODEX vs TIGER ETF comparison dashboard"
git push
```

Vercel에서 GitHub 저장소 연결 후 자동 배포됩니다.

## 실제 데이터 연동

`app/api/etf/route.ts`에서 Mock 데이터를 실제 API로 교체:

- **KRX OpenAPI**: https://openapi.krx.co.kr
- **네이버 금융**: `https://finance.naver.com/item/main.nhn?code=<종목코드>`
- **한국예탁결제원**: https://www.ksd.or.kr

## 구조

```
app/
  api/etf/route.ts     # API 라우트 (30초 갱신)
  components/
    Header.tsx         # 헤더 + 탭 네비게이션
    ThemeTabs.tsx      # 테마 선택 버튼
    EtfCard.tsx        # ETF 개별 카드
    CompareTable.tsx   # 비교 테이블
    PerfChart.tsx      # SVG 수익률 차트
    AlertPanel.tsx     # 에이전트 알림 패널
  lib/data.ts          # 데이터 타입 + 샘플 데이터
  page.tsx             # 메인 페이지
  globals.css          # 글로벌 스타일 + CSS 변수
```
