# naver-oauth-app

**kakkaobot `!질문` 네이버 OAuth 전용 앱.**  
MediFirst 홈·미들웨어·로그인과 **완전 분리**. API 라우트만 제공.

## API

- **시작**: `GET /api/start?user_id=...&draft_id=...&user_name=...`
- **콜백**: `GET /api/callback` (네이버 redirect)

## 배포 (Vercel, 별도 프로젝트)

1. **Vercel** 새 프로젝트 생성 → 이 폴더(`naver-oauth-app`)를 **Root Directory**로 연결.
2. **환경 변수** 설정:
   - `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET`
   - `NAVER_REDIRECT_URI` = `https://<이앱도메인>/api/callback` (예: `https://naver-oauth-xxx.vercel.app/api/callback`)
   - `NAVER_OAUTH_SUPABASE_URL`, `NAVER_OAUTH_SUPABASE_SERVICE_ROLE_KEY` (kakkaobot Supabase)
   - `OAUTH_STATE_SECRET` (kakkaobot과 동일 권장)
   - (선택) `OAUTH_HOME_LINK` = 연동 완료 후 "돌아가기" 링크 (기본: medifirstall.vercel.app)
3. **네이버 개발자센터** 앱 **Callback URL**에 `https://<이앱도메인>/api/callback` 를 **그대로** 등록.  
   - `redirect_uri`와 **완전히 일치**해야 함. (프로토콜·도메인·경로· trailing slash 여부까지)
4. **kakkaobot**:
   - `NAVER_OAUTH_BASE_URL` = `https://<이앱도메인>`
   - `NAVER_OAUTH_START_PATH` = `/api/start`

## 연동 실패 / "로그인할 수 없음" 시

1. **`/api/diag`** 접속 → `redirect_uri` 확인.  
2. **네이버 앱** Callback URL이 위 `redirect_uri`와 **완전히 동일**한지 확인.  
3. Vercel **환경 변수** `NAVER_REDIRECT_URI`를 쓰는 경우, `NAVER_REDIRECT_URI`와 네이버 앱 Callback URL이 같아야 함.  
4. 콜백 실패 시 표시되는 `error` / `error_description` 메시지 확인.

## 로컬

```bash
npm install
npm run dev
# http://localhost:3001/api/start?user_id=1&draft_id=2
```
