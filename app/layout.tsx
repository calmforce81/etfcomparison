import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'ETF 실시간 비교 대시보드',
  description: 'KODEX와 TIGER ETF를 실시간 API로 비교하는 대시보드'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
