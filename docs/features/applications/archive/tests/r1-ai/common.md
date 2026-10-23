# r1 · 공통 (빌드·코드 규칙)

## A1. 프론트엔드 빌드 (타입 검사 포함)
- 근거: step-10 확인할 결과, CLAUDE.md "끝났다고 말하기 전에 빌드 확인"
- 수행 방법: `apps/desktop`에서 `npm run build` (`tsc && vite build`)
- 예상 결과: 종료 코드 0, 타입 오류 없음
- 실제 결과: 종료 코드 0, 208개 모듈 변환, `dist/assets/index-*.js` 781.33kB. 500kB 초과 경고 1건
- 판정: 통과 (경고는 L13 남은 문제로 이미 기록됨)

## A2. Rust 컴파일 확인
- 근거: step-10 확인할 결과
- 수행 방법: `apps/desktop/src-tauri`에서 `cargo check`
- 예상 결과: 종료 코드 0
- 실제 결과: `Finished dev profile`, 종료 코드 0. 경고 없음
- 판정: 통과

## A3. 코드 규칙
- 근거: CLAUDE.md 코드 규칙·금지 사항
- 수행 방법:
  - `grep -rnE ":\s*any\b|as any|<any>|any\[\]" apps/desktop/src` (ts·tsx)
  - `grep -rniE "supabase|api[_-]?key|secret|password|token" apps/desktop/src`
  - `tsconfig.json`의 `strict` 확인, applications 관련 파일 줄 수 확인, `git status`
- 예상 결과: any 0건, 비밀값 0건, strict true, 코드는 apps/ 아래에만
- 실제 결과: any 0건, 비밀값 0건, `"strict": true`. 지원 관리 코드는 모두 `apps/desktop/src/features/applications`, `pages/applications`, `pages/home`, `src-tauri/src/storage.rs`에 있음. 가장 긴 파일은 `OptionPicker.tsx` 175줄, `reducer.ts` 148줄
- 판정: 통과
