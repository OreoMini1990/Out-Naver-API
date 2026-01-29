/**
 * GET /api/start
 * kakkaobot !질문 네이버 OAuth 시작
 * 쿼리: user_id (필수), draft_id, user_name (선택)
 * 홈·미들웨어·로그인과 완전 무관.
 */

import { getRedirectUri } from '@/lib/redirectUri';
import { createState } from '@/lib/state';
import { NextRequest, NextResponse } from 'next/server';

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
  if (!clientId) {
    return NextResponse.json(
      {
        error: 'config_error',
        message: 'NAVER_CLIENT_ID가 설정되지 않았습니다.',
      },
      { status: 500 }
    );
  }

  const redirectUri = getRedirectUri();
  if (!redirectUri) {
    return NextResponse.json(
      {
        error: 'config_error',
        message: 'NAVER_REDIRECT_URI 또는 VERCEL_URL이 필요합니다.',
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

  return NextResponse.redirect(authUrl.toString(), 302);
}
