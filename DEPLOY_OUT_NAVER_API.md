# out-naver-api.vercel.app 배포 안내

콜백 URL이 **https://out-naver-api.vercel.app/api/callback** 이라면, 아래 프로젝트가 이 폴더(`naver-oauth-app`)를 배포하는지 확인하세요.

## "자동 등록이 안 되면…" 문구가 계속 나올 때

**이 저장소의 코드에는 해당 문구가 없습니다.**  
그대로 보인다면 **Vercel에 최신 빌드가 반영되지 않은 상태**입니다.

### 1. Vercel에서 배포 소스 확인

1. [Vercel 대시보드](https://vercel.com/dashboard) → **out-naver-api** 프로젝트
2. **Settings** → **Git**  
   - **Repository**: 이 저장소(kakkaobot)인지 확인  
   - **Root Directory**: `naver-oauth-app` 인지 확인  
   - **Production Branch**: `main`(또는 사용 중인 브랜치) 확인

### 2. 최신 코드 배포

- **같은 저장소라면**: 로컬에서 `git push origin main` (또는 해당 브랜치) 후 Vercel이 자동 배포하는지 확인  
- **수동 재배포**: Vercel → **Deployments** → 최신 배포 옆 **⋮** → **Redeploy**

### 3. 배포 반영 여부 확인

연동 완료 후 나온 페이지에서 **우클릭 → 페이지 소스 보기** (또는 Ctrl+U).

- **`build-2025-no-process-pending`** 이 보이면 → 최신 배포 반영됨 (process-pending 안내 없음)
- 위 문구가 없고 **"자동 등록이 안 되면"** 이 보이면 → 아직 예전 빌드가 서빙 중 → 다시 Redeploy 또는 캐시/CDN 대기

### 4. 다른 저장소를 배포 중인 경우

out-naver-api가 **다른 Git 저장소**를 보고 있다면, 그 쪽 코드에 아직 "자동 등록이 안 되면…" 문구가 있을 수 있습니다.

- **옵션 A**: Vercel 프로젝트의 Git 연결을 **이 저장소 + Root Directory `naver-oauth-app`** 으로 변경  
- **옵션 B**: 그 저장소의 `app/api/callback/route.ts`를 이 폴더와 동일하게 수정한 뒤 push → Redeploy
