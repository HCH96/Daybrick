# 캘린더 9단계: 마무리·전체 빌드

- 요구사항: 전체 (R1–R48)
- 목업: 목업 목차의 8개 화면 전체 (`calendar.html`, `review.html`, `part-*.html`)
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- 목업과 나란히 놓고 색·간격·모서리·애니메이션 시간 차이를 고친다(mockup.md "목업에서 정한 것" 기준).
- 남은 `scheduler`·`SchedulerIcon`·placeholder 사용처 grep. 쓰이지 않게 된 `makePlaceholderPage`는 다른 곳에서 쓰는지 확인만 하고 지우지 않는다.
- 긴 제목(30자 이상) 말줄임, 일정이 없는 달, 6줄 달과 5줄 달, 창을 줄였을 때 칸 높이 확인.
- 순수 함수 Node 확인 결과를 모아 진행 기록에 남긴다.
- PROJECT.md 상태 줄과 기능 허브 상태를 "구현 완료 (테스트 대기)"로.

## 확인할 결과
- `npm run build`, `npx tsc --noEmit`, `cargo check`, `npm run tauri build` 모두 성공.
- 목업 8개 화면과 비교해 크게 다른 곳이 없다(다른 곳은 진행 기록에 적는다).
- 앱을 끄고 다시 켜도 개인 일정·옮긴 태스크 날짜가 남는다.
- 홈 → 캘린더, 깃발 → 프로젝트 → 뒤로가기, 플랜 ↔ 캘린더 반영이 모두 된다.

## 이 단계에서 만들거나 고칠 파일
- 1–8단계에서 만든 화면 파일 중 목업과 다른 곳
- `PROJECT.md`, `docs/desktop/features/calendar/index.md`
