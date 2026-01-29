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
   - `NAVER_REDIRECT_URI` = `https://<이앱도메인>/api/callback` (예: `https://naver-oauth-xxx.vercel.app/api/callback`) — 붙여넣기 시 **끝 줄바꿈 제거**
   - `NAVER_OAUTH_SUPABASE_URL`, `NAVER_OAUTH_SUPABASE_SERVICE_ROLE_KEY` — **kakkaobot 서버와 동일한** Supabase 프로젝트(URL·키)여야 자동 등록이 됩니다.
   - `OAUTH_STATE_SECRET` (kakkaobot과 동일 권장)
   - (선택) `OAUTH_HOME_LINK` = 연동 완료 후 "돌아가기" 링크 (기본: medifirstall.vercel.app)
3. **네이버 개발자센터** 앱 **Callback URL**에 `https://<이앱도메인>/api/callback` 를 **그대로** 등록.  
   - `redirect_uri`와 **완전히 일치**해야 함. (프로토콜·도메인·경로· trailing slash 여부까지)
4. **kakkaobot**:
   - `NAVER_OAUTH_BASE_URL` = `https://<이앱도메인>`
   - `NAVER_OAUTH_START_PATH` = `/api/start`

## 연동 실패 / "로그인할 수 없음" / 네이버 207 시

1. **`/api/diag`** 접속 → `redirect_uri` 확인.  
2. **`/api/start-debug`** (또는 채팅 링크에서 `auth/start` → `auth/start-debug` 로 바꿔 접속) → **등록할 Callback URL** 복사.  
3. **네이버 앱** Callback URL에 위 값을 **그대로** 붙여넣기. **완전히 동일**해야 함.  
4. Vercel **환경 변수** `NAVER_REDIRECT_URI`를 쓰는 경우, `NAVER_REDIRECT_URI`와 네이버 앱 Callback URL이 같아야 함.  
5. 콜백 실패 시 표시되는 `error` / `error_description` 메시지 확인.

## 자동 등록이 안 될 때

1. **같은 Supabase인지 확인**: Vercel의 `NAVER_OAUTH_SUPABASE_URL`·`SUPABASE_SERVICE_ROLE_KEY`가 kakkaobot 서버 `.env`의 `SUPABASE_URL`·`SUPABASE_SERVICE_ROLE_KEY`와 **동일한 프로젝트**인지 확인. 다르면 토큰은 Vercel DB에만 있고 서버는 토큰을 못 찾습니다.
2. **서버 즉시 처리**: kakkaobot 서버가 떠 있는 PC/같은 네트워크에서 브라우저로 `http://<서버주소>:5002/api/naver-oauth/process-pending` 을 열면 대기 중인 질문을 한 번 즉시 처리합니다. 서버 로그에 `[백그라운드 재개]` 로그가 찍히는지 확인.

## 배포 후 연동 완료 문구가 안 바뀔 때

- **코드에는** "자동 등록이 안 되면…" 문구/링크가 이미 제거되어 있습니다.
- **그대로 보이면** → Vercel에 최신 빌드가 반영되지 않은 상태일 수 있습니다.
1. **Git push** 후 Vercel 자동 배포가 끝났는지 Vercel 대시보드에서 확인.
2. **수동 재배포**: Vercel 프로젝트 → Deployments → 최신 배포 옆 ⋮ → **Redeploy**.
3. **캐시**: 배포 후에도 이전 페이지가 보이면 시크릿 창으로 열거나 **강력 새로고침**(Ctrl+Shift+R) 후 다시 OAuth 연동 시도.

## 로컬

```bash
npm install
npm run dev
# http://localhost:3001/api/start?user_id=1&draft_id=2
```
