import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

// 개발/디버그 전용 — 키 존재 여부만 확인 (값 노출 안 함)
export async function GET() {
  const key = process.env.ANTHROPIC_API_KEY ?? '';
  return NextResponse.json({
    hasKey:    key.length > 0,
    keyLength: key.length,
    keyPrefix: key.length > 8 ? key.slice(0, 8) + '...' : '(empty)',
    keyValid:  key.startsWith('sk-ant-'),
  });
}
