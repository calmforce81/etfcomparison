import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ETF 실시간 비교 대시보드',
  description: 'KODEX vs TIGER ETF comparison dashboard',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
