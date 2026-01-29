/**
 * OAuth redirect_uri 결정 (NAVER_REDIRECT_URI | VERCEL_URL 기반)
 */

export function getRedirectUri(): string | null {
  if (process.env.NAVER_REDIRECT_URI) return process.env.NAVER_REDIRECT_URI;
  const v = process.env.VERCEL_URL;
  if (v) return `https://${v}/api/callback`;
  return null;
}
