# ETF Dashboard App

KODEX와 TIGER ETF를 비교하는 Next.js 앱입니다. 기존 단일 HTML을 실제 앱 구조로 분리했고, 서버 API Route가 K-ETF 상세 페이지를 조회해 프론트에 JSON으로 제공합니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 아래 주소를 엽니다.

```bash
http://localhost:3000
```

## 주요 구조

```txt
app/
  page.tsx
  layout.tsx
  globals.css
  components/
    EtfDashboard.tsx
  api/
    etfs/
      route.ts
    recent-etfs/
      route.ts
  lib/
    fallback.ts
    k-etf.ts
    types.ts
```

## API

### ETF 비교 데이터

```txt
GET /api/etfs?codes=069500,102110,379800
```

응답:

```json
{
  "mode": "live-server-fetch",
  "fetchedAt": "2026-05-13T00:00:00.000Z",
  "items": []
}
```

### 최근 상장 ETF 데이터

```txt
GET /api/recent-etfs?codes=0183J0,0180V0
```

현재는 최근 상장 후보 코드를 기반으로 K-ETF 상세 데이터를 조회합니다. 신규 상장 종목을 자동 탐색하려면 KRX 신규상장 데이터 또는 K-ETF 신규상장 목록 페이지 연동이 추가로 필요합니다.

## Vercel 배포

```bash
git init
git add .
git commit -m "init etf dashboard app"
git branch -M main
git remote add origin https://github.com/YOUR_ID/etf-dashboard-app.git
git push -u origin main
```

Vercel에서 GitHub 저장소를 Import하면 됩니다.

## 참고

- 프론트는 `/api/etfs`, `/api/recent-etfs`를 호출합니다.
- 서버 API는 `fetch()`로 K-ETF 상세 HTML을 가져오고 `cheerio`로 파싱합니다.
- K-ETF 페이지 구조가 변경되면 `app/lib/k-etf.ts`의 라벨 파서 수정이 필요합니다.
- KRX/증권사 API를 붙이면 개인/기관/외국인 수급까지 확장할 수 있습니다.
