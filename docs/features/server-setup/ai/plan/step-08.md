# 서버 연결 8단계: 서버 업데이트·앱 업데이트 안내

- 요구사항: R23–R25, R27
- 목업: server-update.html (server-update-run, app-update)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙 (D15, D16)

## 할 일
- `serverUpdate.ts`: 서버 번호 다음부터 최신까지 `apply_migrations` → `deploy_functions`. 진행 표시와 실패·다시 시도는 `setupRunner`와 같은 방식(재사용).
- `ServerUpdateScreen`: 서버/앱 번호, PAT 칸, [업데이트], 단계 목록. 끝나면 PAT를 버리고 상태를 다시 확인 (R23).
- `AppUpdateNotice`: "앱을 업데이트하세요" 설명. 서버 기능은 쓰지 않는다 (R24).
- 업데이트가 끝날 때까지 `ServerProvider`가 서버 기능을 막는다(`server-update`/`app-update` 상태에서는 클라이언트를 내주지 않음). 로컬 화면은 그대로 (R25).
- 마법사 연결: ② 결과가 "낮은 번호"면 로그인 뒤 이 화면, "높은 번호"면 `AppUpdateNotice`.
- 이후 기능용 안내(R27): `migrations.rs` 머리 주석에 "새 단계 파일 추가, 배포한 파일은 고치지 않음" 규칙을 적는다.

## 확인할 결과
- 확인용 임시 2번 단계(빈 테이블 하나 만드는 SQL)를 넣고 빌드 → 앱을 켜면 주황 "서버 업데이트가 필요합니다" 띠 → 화면에서 PAT 입력·[업데이트] → 번호 2, 띠 사라짐. 확인 뒤 임시 단계를 지우고 대시보드에서 그 테이블·2번 행을 지운다.
- 2번 SQL에 일부러 오류를 넣으면 실패 표시, 번호는 1 그대로, 테이블도 생기지 않는다 (R26).
- 서버 번호를 앱보다 높게 만들면(대시보드 SQL로 99번 행 추가) 앱 업데이트 안내가 뜨고 설정 칸 상태도 같다. 확인 뒤 행 삭제.
- `npm run build`, `cargo check` 성공.

## 이 단계에서 만들거나 고칠 파일
- `features/server/serverUpdate.ts`, `setupRunner.ts`, `ServerProvider.tsx`
- `components/server/ServerUpdateScreen.tsx`(+css), `AppUpdateNotice.tsx`
- `pages/server-setup/wizard/useWizard.ts`, `App.tsx`, `src-tauri/src/server/migrations.rs`
