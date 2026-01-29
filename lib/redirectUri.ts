/**
 * OAuth redirect_uri 결정 (NAVER_REDIRECT_URI | VERCEL_URL 기반)
 */

export function getRedirectUri(): string | null {
  const fromEnv = process.env.NAVER_REDIRECT_URI?.trim();
  if (fromEnv) return fromEnv;
  const v = process.env.VERCEL_URL?.trim();
  if (v) return `https://${v}/api/callback`;
  return null;
}
