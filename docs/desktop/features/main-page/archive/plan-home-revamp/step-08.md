# 메인 페이지 수정1 8단계: 마무리

- 요구사항: 대상 R 전체 (R12–R15, R17, R22–R47) + 영향받는 R4, R16
- 목업: `dash.html` 전체, `part-now.html`, `part-empty.html` 전체 (비교만)
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- 화면 전체를 목업과 견주어 간격·색·글자 크기의 차이를 정리한다. 목업은 고치지 않는다.
- 자정 갱신 (R28): 홈을 연 채로 자정을 넘겨 날짜·7일·요약 줄·이번 주 집중이 새로 그려지는지 본다. 일요일→월요일이면 주가 바뀐다.
- R27 점검: 홈 코드에서 저장소에 쓰는 호출은 `addTask`와 타이머 함수(`requestStart`·`pause`·`resume`·`complete`·`stop`)뿐인지 grep으로 본다.
- 안 쓰게 된 코드 정리: `CardSize`의 `wide`, 옛 카드에서만 쓰던 import. 다른 화면도 쓰는 `EmptyState`는 남긴다.
- 명세 문서 갱신: `ai/spec/files.md`(새 파일 구조), `ai/spec/extension.md`(CardSize, 카드 6개).

## 확인할 결과
- `npx tsc --noEmit`, `npm run build`, `npm run tauri build` 성공.
- 1920×1080과 1200×800, 960×640에서 넘침·잘림·콘솔 오류 없음. 카드 안 스크롤과 본문 스크롤이 서로 막지 않는다 (R4).
- 다른 화면에서 태스크·일정·지원·타이머를 바꾸고 홈으로 오면 바로 반영된다 (R27).
- 1~7단계의 확인할 결과 중 사용자 확인이 남은 것을 한 번에 다시 본다.

## 이 단계에서 만들거나 고칠 파일
- 1~7단계 파일 중 고칠 곳이 생긴 파일
- `docs/desktop/features/main-page/ai/spec/files.md`, `extension.md`
