/**
 * OAuth state 생성/검증 (HMAC)
 * kakkaobot naverOAuth와 동일 형식
 */

import * as crypto from 'crypto';

const SECRET =
  process.env.OAUTH_STATE_SECRET || 'default-secret-change-in-production';

export function createState(
  userId: string,
  draftId: string | null = null,
  userName: string | null = null
): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  const iat = Math.floor(Date.now() / 1000);
  const payload: Record<string, unknown> = { userId, nonce, iat };
  if (draftId) payload.draftId = draftId;
  if (userName?.trim()) payload.userName = userName.trim();

  const payloadStr = JSON.stringify(payload);
  const hmac = crypto.createHmac('sha256', SECRET);
  hmac.update(payloadStr);
  const sig = hmac.digest('hex');
  return Buffer.from(payloadStr).toString('base64url') + '.' + sig;
}

export interface StatePayload {
  userId: string;
  draftId?: string;
  userName?: string;
}

export function verifyState(state: string | null): StatePayload | null {
  try {
    if (!state) return null;
    const [b64, sig] = state.split('.');
    if (!b64 || !sig) return null;
    const payload = JSON.parse(
      Buffer.from(b64, 'base64url').toString()
    ) as Record<string, unknown>;
    const verify: Record<string, unknown> = {
      userId: payload.userId,
      nonce: payload.nonce,
      iat: payload.iat,
    };
    if (payload.draftId) verify.draftId = payload.draftId;
    if (payload.userName) verify.userName = payload.userName;
    const hmac = crypto.createHmac('sha256', SECRET);
    hmac.update(JSON.stringify(verify));
    if (hmac.digest('hex') !== sig) return null;
    const iat = Number(payload.iat);
    if (Math.floor(Date.now() / 1000) - iat > 600) return null;
    return {
      userId: String(payload.userId),
      draftId: payload.draftId != null ? String(payload.draftId) : undefined,
      userName: payload.userName != null ? String(payload.userName) : undefined,
    };
  } catch {
    return null;
  }
}
