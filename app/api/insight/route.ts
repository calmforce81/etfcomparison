import { NextResponse } from 'next/server';

// 환경변수(process.env)를 런타임에 읽으려면 dynamic 렌더링 필수
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { metric, kVal, tVal, theme } = await request.json();

  const prompt = `당신은 삼성자산운용 ETF 분석 전문가입니다.
다음 ETF 지표 데이터를 보고 실무 담당자에게 유용한 인사이트를 2-3문장으로 간결하게 작성하세요.
한국어로 작성하고 구체적 수치를 활용하세요. 투자 권유 문구는 제외하세요.

테마: ${theme}
지표: ${metric}
KODEX 값: ${kVal}
TIGER 값: ${tVal}

형식: 현황 1문장 + 주목 포인트 1문장 + 운용/마케팅 시사점 1문장`;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      insight: '⚠️ Vercel 환경변수 미설정\n\nSettings → Environment Variables → ANTHROPIC_API_KEY 를 추가한 뒤 Redeploy 해주세요.',
    });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 350,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await res.json();
    const text = data.content?.[0]?.text ?? '인사이트를 생성할 수 없습니다.';
    return NextResponse.json({ insight: text });
  } catch {
    return NextResponse.json({ insight: '인사이트 생성 중 오류가 발생했습니다.' });
  }
}
