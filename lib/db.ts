/**
 * Supabase naver_oauth_tokens 저장
 * kakkaobot 전용 Supabase (MediFirst와 무관)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NAVER_OAUTH_SUPABASE_URL;
  const key =
    process.env.NAVER_OAUTH_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NAVER_OAUTH_SUPABASE_ANON_KEY;
  if (!url || !key)
    throw new Error(
      'NAVER_OAUTH_SUPABASE_URL, NAVER_OAUTH_SUPABASE_SERVICE_ROLE_KEY(또는 ANON) 필요.'
    );
  _client = createClient(url, key);
  return _client;
}

export interface SaveTokenParams {
  userId: string;
  userName?: string | null;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  scope?: string | null;
}

export async function saveToken(params: SaveTokenParams): Promise<void> {
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const row: Record<string, unknown> = {
    user_id: params.userId,
    access_token: params.accessToken,
    refresh_token: params.refreshToken,
    expires_at: params.expiresAt,
    scope: params.scope ?? null,
    is_active: true,
    updated_at: now,
  };
  if (params.userName?.trim()) row.user_name = params.userName.trim();

  const { error } = await supabase
    .from('naver_oauth_tokens')
    .upsert(row, { onConflict: 'user_id' });

  if (error) throw new Error('토큰 저장 실패: ' + (error.message || error.code));
}
