/**
 * GET /api/callback
 * 네이버 OAuth 콜백 → 토큰 교환 → Supabase naver_oauth_tokens 저장 → 완료 HTML
 * 홈·미들웨어·로그인과 완전 무관.
 */

import { saveToken, setDraftPendingSubmit } from '@/lib/db';
import { getRedirectUri } from '@/lib/redirectUri';
import { verifyState } from '@/lib/state';
import { NextRequest, NextResponse } from 'next/server';

function htmlErr(msg: string): string {
  const home = process.env.OAUTH_HOME_LINK || 'https://medifirstall.vercel.app';
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body><h2>연동 실패</h2><p>${msg}</p><p><a href="${home}">돌아가기</a></p><p style="margin-top:1.5rem;font-size:0.9em;color:#666">설정 확인: <a href="/api/diag">/api/diag</a> 에서 redirect_uri를 확인하고, 네이버 앱 Callback URL과 <strong>완전히 일치</strong>하는지 봐 주세요.</p></body></html>`;
}

function htmlOk(hadDraft: boolean): string {
  const home = process.env.OAUTH_HOME_LINK || 'https://medifirstall.vercel.app';
  const msg = hadDraft
    ? '연동이 완료되었습니다. 이전에 입력한 질문이 <strong>자동으로 등록</strong>됩니다. 잠시 후 카카오톡에서 안내를 확인해 주세요.'
    : '연동이 완료되었습니다. 카카오톡으로 돌아가서 <strong>!질문</strong>을 입력해 주세요.';
  const processUrl = (process.env.OAUTH_SERVER_PROCESS_URL || '').trim();
  let extra = '';
  if (hadDraft) {
    if (processUrl) {
      extra = `<p style="margin-top:1rem;font-size:0.9em;"><a href="${processUrl}">자동 등록이 안 되면 여기를 눌러 보세요</a></p>`;
    } else {
      extra = `<p style="margin-top:1rem;font-size:0.85em;color:#555;">자동 등록이 안 되면, kakkaobot 서버가 켜진 PC와 <strong>같은 네트워크</strong>에서 브라우저로 <code>http://서버주소:5002/api/naver-oauth/process-pending</code> 를 열어 보세요. (서버주소는 서버 PC IP 예: 192.168.0.15)</p>`;
    }
  }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>연동 완료</title><style>body{font-family:system-ui,sans-serif;max-width:420px;margin:60px auto;padding:24px;text-align:center;}h2{color:#03c75a;}a{color:#03c75a;}code{background:#eee;padding:2px 6px;font-size:0.9em;}</style></head><body><h2>네이버 계정 연동 완료</h2><p>${msg}</p>${extra}<p><a href="${home}">돌아가기</a></p></body></html>`;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const err = request.nextUrl.searchParams.get('error');
  const errDesc = request.nextUrl.searchParams.get('error_description');

  if (err) {
    const msg = errDesc ? `네이버 연동 오류: ${err} (${errDesc})` : `네이버 연동 오류: ${err}`;
    return new NextResponse(htmlErr(msg), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  if (!code || !state) {
    return new NextResponse(htmlErr('code 또는 state가 없습니다.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const payload = verifyState(state);
  if (!payload) {
    return new NextResponse(
      htmlErr('유효하지 않은 요청입니다. 링크를 다시 시도해 주세요.'),
      {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  const userId = String(payload.userId);
  const userName =
    (payload.userName && String(payload.userName).trim()) || null;

  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return new NextResponse(htmlErr('서버 설정 오류입니다. 관리자에게 문의하세요.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const redirectUri = getRedirectUri();
  if (!redirectUri) {
    return new NextResponse(htmlErr('NAVER_REDIRECT_URI 설정이 필요합니다.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  let tokenRes: Response;
  try {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      client_secret: clientSecret,
      code,
      state,
      redirect_uri: redirectUri,
    });
    tokenRes = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
  } catch {
    return new NextResponse(htmlErr('토큰 요청 중 오류가 발생했습니다.'), {
      status: 502,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  if (!tokenRes.ok) {
    let tokenErrMsg = '토큰 발급 실패. 다시 시도해 주세요.';
    try {
      const errBody = (await tokenRes.json()) as { error?: string; error_description?: string };
      if (errBody.error_description) tokenErrMsg = `토큰 발급 실패: ${errBody.error_description}`;
      else if (errBody.error) tokenErrMsg = `토큰 발급 실패: ${errBody.error}`;
    } catch {
      /* ignore */
    }
    return new NextResponse(htmlErr(tokenErrMsg), {
      status: 502,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  let data: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };
  try {
    data = (await tokenRes.json()) as typeof data;
  } catch {
    return new NextResponse(htmlErr('토큰 응답 파싱 실패.'), {
      status: 502,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const accessToken = data.access_token;
  const refreshToken = data.refresh_token;
  const expiresIn = data.expires_in ?? 3600;
  if (!accessToken || !refreshToken) {
    return new NextResponse(
      htmlErr('토큰 응답에 access_token 또는 refresh_token이 없습니다.'),
      {
        status: 502,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  try {
    await saveToken({
      userId,
      userName,
      accessToken,
      refreshToken,
      expiresAt,
      scope: data.scope ?? null,
    });
  } catch (e) {
    return new NextResponse(
      htmlErr(
        '토큰 저장 실패: ' + (e instanceof Error ? e.message : '알 수 없는 오류')
      ),
      {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      }
    );
  }

  const draftId = payload.draftId?.trim();
  if (draftId) {
    await setDraftPendingSubmit(userId, draftId);
  }
  const hadDraft = !!draftId;

  return new NextResponse(htmlOk(hadDraft), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
