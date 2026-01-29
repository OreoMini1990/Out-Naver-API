/**
 * GET /api/start-debug
 * redirect_uri / authorize URL 확인용. 네이버 207 해결 시 Callback URL 대조용.
 * 실제 로그인은 /auth/start 사용.
 */

import { getRedirectUri } from '@/lib/redirectUri';
import { createState } from '@/lib/state';
import { NextRequest, NextResponse } from 'next/server';

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function GET(request: NextRequest) {
  const userId =
    request.nextUrl.searchParams.get('user_id') ??
    request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json(
      { error: 'user_id_required', message: 'user_id가 필요합니다.' },
      { status: 400 }
    );
  }

  const clientId = process.env.NAVER_CLIENT_ID;
  const redirectUri = getRedirectUri();
  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error: 'config_error',
        message:
          'NAVER_CLIENT_ID, NAVER_REDIRECT_URI(또는 VERCEL_URL)이 필요합니다.',
      },
      { status: 500 }
    );
  }

  const draftId = (
    request.nextUrl.searchParams.get('draft_id') ??
    request.nextUrl.searchParams.get('draftId') ??
    ''
  ).trim() || null;
  const userName = (
    request.nextUrl.searchParams.get('user_name') ??
    request.nextUrl.searchParams.get('userName') ??
    ''
  ).trim() || null;

  const state = createState(String(userId), draftId, userName);
  const authUrl = new URL('https://nid.naver.com/oauth2.0/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('state', state);
  authUrl.searchParams.set('scope', 'cafe_write');

  const loginHref =
    request.nextUrl.origin +
    '/auth/start?' +
    request.nextUrl.searchParams.toString();

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>OAuth 디버그</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:720px;margin:24px auto;padding:20px;background:#f5f5f5;}
  h1{font-size:1.25rem;margin:0 0 1rem;}
  .box{background:#fff;border-radius:8px;padding:16px;margin-bottom:16px;overflow-wrap:break-word;}
  .label{font-weight:600;color:#333;margin-bottom:6px;}
  .value{font-family:monospace;font-size:0.9em;background:#f0f0f0;padding:8px;border-radius:4px;word-break:break-all;}
  .hint{font-size:0.9em;color:#666;margin-top:8px;}
  a.btn{display:inline-block;margin-top:12px;padding:10px 16px;background:#03c75a;color:#fff;text-decoration:none;border-radius:6px;}
  a.btn:hover{background:#02b350;}
</style>
</head><body>
<h1>네이버 OAuth 디버그 (207 해결용)</h1>
<div class="box">
  <div class="label">네이버 앱에 등록할 Callback URL (복사해서 그대로 붙여넣기)</div>
  <div class="value">${escapeHtml(redirectUri)}</div>
  <p class="hint">개발자센터 → 의료운영의 모든것 → API 설정 → Callback URL에 <strong>위 문자열과 100% 동일</strong>하게 등록하세요. 공백·줄바꿈 없이.</p>
</div>
<div class="box">
  <div class="label">client_id (참고)</div>
  <div class="value">${escapeHtml(clientId)}</div>
</div>
<div class="box">
  <div class="label">실제 로그인 시 사용하는 authorize URL (요약)</div>
  <div class="value">https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=...&redirect_uri=${escapeHtml(redirectUri)}&state=...&scope=cafe_write</div>
</div>
<p><a href="${escapeHtml(loginHref)}" class="btn">네이버 로그인 시도 (동일 쿼리)</a></p>
<p style="margin-top:16px;font-size:0.9em;"><a href="/api/diag">/api/diag</a> · <a href="/api/start-debug">/api/start-debug</a></p>
</body></html>`;

  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
