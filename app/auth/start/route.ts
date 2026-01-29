/**
 * GET /auth/start
 * /api/start 로 리다이렉트 (쿼리 유지).
 * NAVER_OAUTH_START_PATH=/auth/start 로 쓰는 경우 대비.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.toString();
  const url = new URL('/api/start', request.nextUrl.origin);
  if (q) url.search = q;
  return NextResponse.redirect(url, 302);
}
