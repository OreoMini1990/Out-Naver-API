/**
 * GET /auth/start-debug
 * /api/start-debug 로 리다이렉트 (쿼리 유지).
 * 채팅 링크에서 /auth/start → /auth/start-debug 로 바꿔서 207 디버그용.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.toString();
  const url = new URL('/api/start-debug', request.nextUrl.origin);
  if (q) url.search = q;
  return NextResponse.redirect(url, 302);
}
