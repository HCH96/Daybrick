# r1 공통 (빌드·회귀)

## A1 타입 검사·프론트 빌드·cargo check
- 근거: 전체
- 수행 방법: apps/desktop에서 `npx tsc --noEmit`, `npm run build`, apps/desktop/src-tauri에서 `cargo check` (출력 끝부분만 봄)
- 예상 결과: 모두 성공
- 실제 결과: tsc 종료 코드 0, 오류 없음. vite 빌드 "built in 347ms" (청크 500kB 초과 경고만). cargo check "Finished `dev` profile".
- 판정: 통과

## A2 설치 파일 빌드
- 근거: 8단계
- 수행 방법: apps/desktop에서 `npm run tauri build`, 결과 폴더 `ls`
- 예상 결과: 설치 파일 생성
- 실제 결과: 종료 코드 0. `src-tauri/target/release/bundle/msi/Daybrick_0.1.0_x64_en-US.msi` (3.45 MiB), `bundle/nsis/Daybrick_0.1.0_x64-setup.exe` (2.59 MiB) 생성, 파일 시각 2026-11-07 02:58.
- 판정: 통과

## A20 회귀: 본문 스크롤·고정 영역·카드 안 스크롤·지원 현황 개수
- 근거: R4, R42
- 수행 방법
  - `components/layout/AppLayout.css`: `.app-layout`(height 100%, 세로 flex), `.app-layout__body`(flex 1, min-height 0), `.app-layout__sidebar`(flex-shrink 0, overflow hidden), `.app-layout__main`(overflow-y auto, `scrollbar-width: none`, `::-webkit-scrollbar` 숨김) 확인
  - `git log`/`git diff 8f63214~1 HEAD`로 `components/layout`, `features/applications/summary.ts`가 이번 수정에서 바뀌지 않았음 확인
  - `pages/home/DashboardCard.tsx`·`.css`: large 카드만 `.dashboard-card__scroll`(absolute, inset 0, overflow auto)로 감싸 카드 안에서 스크롤
  - `pages/home/ApplicationsSummaryCard.tsx`: 기존 `summarizeApplications`(종료 제외, 세부 단계 개수) 결과를 그대로 그림
- 예상 결과: 모두 맞음
- 실제 결과: 본문 스크롤 바 숨김 유지, 제목 표시줄·사이드바는 본문 스크롤 밖이라 고정, 큰 카드는 안에서 스크롤. 지원 현황은 기존 함수 그대로 사용, 그 함수는 바뀌지 않음.
- 판정: 통과
