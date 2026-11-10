# 서버 연결 7단계: 접속 확인·안내 띠·재개

- 요구사항: R37–R44
- 목업: banners.html (banners-kinds, banners-need), part-resume.html (resume, resume-wait)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙 (D17)

## 할 일
- `health.ts`: 상태 판정. 로그인돼 있으면 `health` 함수, 아니면 공개 RPC. 번호 비교로 `server-update`/`app-update`, 세션 없음·만료면 `login-needed`, 나머지는 `probe.ts`의 오류 구분 재사용.
- `useHealthCheck`: 앱이 그려진 뒤 비동기로 확인(시작을 막지 않음, R38). 결과와 시각을 `server.json`의 `lastCheck`에 저장. `unreachable`이면 3분마다 다시 확인(R44). 재개 중이면 10초마다.
- `ServerProvider`에 상태·`recheck()` 추가.
- `AppLayout`: 제목 표시줄 바로 아래 띠 자리(전체 폭 40px, 본문을 밀어냄).
- `ServerBanner`: 상태별 아이콘·문구·밑줄 링크·[×]. [×]는 이번 실행 동안만 숨김(메모리). 누르면 설정 / 재개 팝업 / 서버 업데이트(8단계)로.
- Rust `management.rs`: `restore_project(pat, ref)`, `project_status(pat, ref)`.
- `ResumeDialog`(560px): 이유, [Supabase 대시보드에서 재개 ↗], PAT 칸 + [여기서 재개], 재개 중 진행 표시. 켜지면 "연결됨"으로 바꾸고 띠를 없앤다. 닫아도 확인은 계속 (R43).
- `ServerRequired`: 서버가 필요한 화면에 넣을 "서버 연결 필요" 표시 + [설정 열기]. 지금 쓰는 화면은 없고 이후 기능이 쓴다.

## 확인할 결과
- 연결된 상태로 네트워크를 끄고 앱을 켜면 사이드바·홈은 바로 쓸 수 있고, 잠시 뒤 빨강 "서버에 접속할 수 없습니다" 띠가 본문을 밀어내며 뜬다. 네트워크를 켜면 3분 안에 띠가 사라진다.
- [×]로 숨기면 이번 실행 동안 다시 안 뜨고, 앱을 다시 켜면 다시 뜬다.
- 연결 안 함 상태면 띠가 없다. 로그아웃 상태면 주황 "로그인이 필요합니다".
- (일시정지 프로젝트가 있을 때) 주황 띠 → 재개 팝업 → PAT로 재개 → 진행 표시 후 띠가 사라진다. 없으면 이 항목은 확인 못 함으로 기록.
- Supabase 대시보드 로그에 앱을 켤 때마다 DB 읽기 요청이 남는다 (R39).
- `npm run build`, `cargo check` 성공.

## 이 단계에서 만들거나 고칠 파일
- `features/server/health.ts`, `useHealthCheck.ts`, `ServerProvider.tsx`, `config.ts`, `messages.ts`, `management.ts`
- `src-tauri/src/server/management.rs`, `lib.rs`
- `components/server/ServerBanner.tsx`(+css), `ResumeDialog.tsx`(+css), `ServerRequired.tsx`(+css)
- `components/layout/AppLayout.tsx`(+css), `App.tsx`
