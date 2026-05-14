import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { metric, kVal, tVal, theme } = await request.json();

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({
      insight: '⚠️ Vercel 환경변수 미설정\n\nSettings → Environment Variables → ANTHROPIC_API_KEY 를 추가한 뒤 Redeploy 해주세요.',
    });
  }

  const prompt = `당신은 삼성자산운용 ETF 분석 전문가입니다.
다음 ETF 지표 데이터를 보고 실무 담당자에게 유용한 인사이트를 2-3문장으로 간결하게 작성하세요.
한국어로 작성하고 구체적 수치를 활용하세요. 투자 권유 문구는 제외하세요.

테마: ${theme}
지표: ${metric}
KODEX 값: ${kVal}
TIGER 값: ${tVal}

형식: 현황 1문장 + 주목 포인트 1문장 + 운용/마케팅 시사점 1문장`;

  // Anthropic API 호출 — 오류 상세 전부 로깅
  let rawStatus = 0;
  let rawBody = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',   // ← 최신 정식 모델 ID
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    rawStatus = res.status;
    rawBody   = await res.text();

    if (!res.ok) {
      console.error('[insight] Anthropic API error', rawStatus, rawBody);
      // 사용자에게 상태 코드와 요약 메시지 전달
      let hint = '';
      if (rawStatus === 401) hint = 'API 키가 유효하지 않습니다. Vercel 환경변수를 확인하세요.';
      else if (rawStatus === 429) hint = '요청 한도 초과입니다. 잠시 후 다시 시도하세요.';
      else if (rawStatus === 404) hint = '모델을 찾을 수 없습니다. API 키가 Haiku 4.5에 접근 가능한지 확인하세요.';
      else hint = `API 오류 (HTTP ${rawStatus}). Vercel 함수 로그를 확인하세요.`;
      return NextResponse.json({ insight: `❌ ${hint}` });
    }

    const data = JSON.parse(rawBody);
    const text = data?.content?.[0]?.text;
    if (!text) {
      console.error('[insight] 응답 파싱 실패', rawBody);
      return NextResponse.json({ insight: '⚠️ 응답 파싱 실패. Vercel 함수 로그를 확인하세요.' });
    }
    return NextResponse.json({ insight: text });

  } catch (err) {
    console.error('[insight] fetch 예외', err, 'status:', rawStatus, 'body:', rawBody);
    return NextResponse.json({ insight: `❌ 네트워크 오류: ${String(err)}` });
  }
}
