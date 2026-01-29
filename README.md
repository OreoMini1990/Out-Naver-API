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
3. **네이버 개발자센터** 앱 Callback URL에 `https://<이앱도메인>/api/callback` 등록.
4. **kakkaobot**:
   - `NAVER_OAUTH_BASE_URL` = `https://<이앱도메인>`
   - `NAVER_OAUTH_START_PATH` = `/api/start`

## 로컬

```bash
npm install
npm run dev
# http://localhost:3001/api/start?user_id=1&draft_id=2
```
