/**
 * GET /api/diag
 * 설정 확인용 (비밀값 노출 없음). redirect_uri·네이버 앱 등록 확인에 활용.
 */

import { getRedirectUri } from '@/lib/redirectUri';
import { NextResponse } from 'next/server';

export async function GET() {
  const redirectUri = getRedirectUri();
  const v = process.env.VERCEL_URL;
  const out = {
    redirect_uri: redirectUri ?? '(NAVER_REDIRECT_URI 미설정, VERCEL_URL 없음)',
    has_client_id: !!process.env.NAVER_CLIENT_ID,
    has_client_secret: !!process.env.NAVER_CLIENT_SECRET,
    has_supabase_url: !!process.env.NAVER_OAUTH_SUPABASE_URL,
    has_supabase_key: !!(
      process.env.NAVER_OAUTH_SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NAVER_OAUTH_SUPABASE_ANON_KEY
    ),
    vercel_url: v ?? null,
  };
  return NextResponse.json(out);
}
