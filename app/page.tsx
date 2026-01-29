/**
 * OAuth 전용 앱. 페이지 없음.
 * kakkaobot !질문 연동: /api/start, /api/callback 만 사용.
 */
export default function Home() {
  return (
    <div style={{ fontFamily: 'system-ui', padding: 24, textAlign: 'center' }}>
      <p>OAuth 전용 앱입니다. /api/start, /api/callback 만 사용합니다.</p>
    </div>
  );
}
