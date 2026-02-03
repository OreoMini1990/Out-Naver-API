/**
 * Supabase naver_oauth_tokens 저장
 * kakkaobot 전용 Supabase (MediFirst와 무관)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const url =
    process.env.NAVER_OAUTH_SUPABASE_URL || process.env.SUPABASE_URL;
  const key =
    process.env.NAVER_OAUTH_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NAVER_OAUTH_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;
  if (!url || !key)
    throw new Error(
      'NAVER_OAUTH_SUPABASE_URL(또는 SUPABASE_URL), NAVER_OAUTH_SUPABASE_SERVICE_ROLE_KEY(또는 SUPABASE_SERVICE_ROLE_KEY) 필요.'
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

/** user_id 기존 행 삭제 후 신규 저장 (uq_naver_oauth_tokens_one_active 제약 오류 방지) */
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

  await supabase.from('naver_oauth_tokens').delete().eq('user_id', params.userId);
  const { error } = await supabase.from('naver_oauth_tokens').insert(row);
  if (error) throw new Error('토큰 저장 실패: ' + (error.message || error.code));
}

/**
 * 연동 직후 대기 중인 질문 즉시 처리용.
 * scheduled_at = now 로 바꿔, 서버 워커가 다음 주기에 바로 처리하도록 함.
 * (scheduled_at 컬럼 없으면 status·updated_at만 갱신)
 */
export async function setDraftPendingSubmit(
  userId: string,
  draftId: string
): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('cafe_post_drafts')
      .update({
        status: 'pending_submit',
        updated_at: now,
        scheduled_at: now,
      })
      .eq('draft_id', draftId)
      .eq('user_id', userId)
      .select('draft_id');
    if (error) return false;
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}
