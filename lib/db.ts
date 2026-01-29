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

/** scope 컬럼 없어도 동작. ON CONFLICT 미사용 → user_id unique 제약 없어도 동작 */
export async function saveToken(params: SaveTokenParams): Promise<void> {
  const supabase = getSupabase();
  const now = new Date().toISOString();
  const base: Record<string, unknown> = {
    access_token: params.accessToken,
    refresh_token: params.refreshToken,
    expires_at: params.expiresAt,
    is_active: true,
    updated_at: now,
  };
  if (params.userName?.trim()) base.user_name = params.userName.trim();

  const { data: existing } = await supabase
    .from('naver_oauth_tokens')
    .select('user_id')
    .eq('user_id', params.userId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('naver_oauth_tokens')
      .update(base)
      .eq('user_id', params.userId);
    if (error) throw new Error('토큰 저장 실패: ' + (error.message || error.code));
    return;
  }

  const insertRow = { ...base, user_id: params.userId };
  const { error } = await supabase
    .from('naver_oauth_tokens')
    .insert(insertRow);
  if (error) throw new Error('토큰 저장 실패: ' + (error.message || error.code));
}

/**
 * 연동 직후 대기 중인 질문 자동 등록용.
 * cafe_post_drafts 해당 건을 pending_submit 으로 바꿔, 서버 processPendingSubmits 가 처리하도록 함.
 * 실패 시 예외 없이 false 반환 (베스트 에포트).
 */
export async function setDraftPendingSubmit(
  userId: string,
  draftId: string
): Promise<boolean> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('cafe_post_drafts')
      .update({
        status: 'pending_submit',
        updated_at: new Date().toISOString(),
      })
      .eq('draft_id', draftId)
      .eq('user_id', userId);
    return !error;
  } catch {
    return false;
  }
}
