# 지원 관리 수정1 5단계: 마무리

- 요구사항: 대상 R 전체 (R5, R8, R13, R21, R24, R25, R33, R38–R40)
- 목업: 없음
- 경로 기준: `apps/desktop/src/`

## 할 일
- `npm run build`, `apps/desktop/src-tauri`에서 `cargo check`.
- `applied`·`appliedDate`·`deadline` 역할·`sortByDeadline`이 코드에 남지 않았는지 grep으로 확인.
- 남은 주석·안내 문구에서 "마감일"·"지원일" 표현을 "지원 마감"으로 정리.

## 확인할 결과
- 빌드와 `cargo check` 성공.
- grep 결과 옛 이름이 남지 않음 (옮기기 코드 `migrate.ts` 안의 v1 이름은 예외).
- 1~4단계 확인할 결과를 한 번에 다시 볼 수 있는 상태 (재시작 후 데이터 유지 포함).

## 이 단계에서 만들거나 고칠 파일
- 1~4단계에서 고친 파일 중 남은 정리가 필요한 곳만
