# 구직 관리 (job-search) 수정 계획 색인
- 종류: 수정 계획 (근거 기록: L33)
- 대상 R: R35, R41, R82–R93
- 영향받는 R: R4, R7, R9, R15–R16, R24, R28, R33, R39–R40, R46–R47, R53, R55, R80
- 커밋 접두어: 구직 관리 수정1

- 기능 명세서: [../../ai/spec/index.md](../../ai/spec/index.md) · 목업: [../../human/mockups/index.html](../../human/mockups/index.html) · 이전 계획: [../plan-initial/index.md](../plan-initial/index.md)
- 작성일: 2026-10-29 · 상태: 승인됨 (2026-10-29), 구현·AI 테스트 r2 완료 (보관)
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/src/`, 서버는 저장소 `supabase/`) · 파일 목록·데이터 모양: [structure.md](structure.md)
- 커밋 이름: "구직 관리 수정1 N단계: …"

## 결정 (계획 중 정함, D54–D57)
- 묶인 공고는 `stage = 'duplicate'` + `dup_of = 대표`. 대표 바꾸기 `js_switch_rep`는 분석(stage·filtered_by·hidden_at·추출·점수)을 **복사**, 묶음 풀기 `js_unbundle`는 `unbundled = true`·`stage = 'new'` (D54).
- 유사도(R84): 정리한 제목이 같음, 또는 2글자 묶음 Dice ≥ 0.8, 또는 정리한 추출 직무가 같음 — 사용자 결정 (D55).
- 소급 적용(R89)·norm_key 다시 계산: 서버 업데이트 뒤 첫 `js-process queue`에서 1회(`js_settings.dedupe_version`), 0007이 `js_postings_backup_0007`에 백업 — 사용자 결정 (D56).
- 작은 규칙 묶음 (D57): 지원한 공고는 묶인 쪽이 되지 않음, 숨김은 대표만, 풀린 공고는 판정 양쪽에서 빠짐, force는 중복 확인 건너뜀, 소급 대표는 지원함 > 채점 있음 > R86.

### 작은 규칙
- 바뀌는 기존 결정: D31(수집 저장 규칙), D38·D39(보관함 조건), D43(예약 이어 하기 조건). `js_ensure_defaults`는 D44대로 0007에서 다시 만든다.
- 목업은 고치지 않는다. 화면이 목업과 다른 곳은 step 파일의 "목업과 다른 점"에 있다.
- deno가 없어 서버 TS 타입 검사는 못 한다. 순수 함수는 Node로 실행해 확인한다.

## 단계
| 단계 | 이름 | 파일 | 요구사항 |
|---|---|---|---|
| 1 | 서버 구조 7번 (칸·stage·백업·SQL 함수) | [step-01.md](step-01.md) | data.md, R85, R87, R90, R93 |
| 2 | 수집 사이트 자사 여부 | [step-02.md](step-02.md) | R90 (R24, R28) |
| 3 | 정리 규칙·중복 판정 함수 | [step-03.md](step-03.md) | R35, R84, R86 |
| 4 | 수집 단계에서 묶기 | [step-04.md](step-04.md) | R35, R82, R86–R88 (R39) |
| 5 | 처리 단계 중복 확인·소급 적용 | [step-05.md](step-05.md) | R41, R83–R89 (R47, R53) |
| 6 | 목록·카드에 출처 표시 | [step-06.md](step-06.md) | R91 (R4, R7, R9, R15–R16, R46) |
| 7 | 상세 팝업 출처·따로 보기 | [step-07.md](step-07.md) | R92–R93 (R55) |

## 이번 계획에 넣지 않는 것
- 같은 사이트 안 재등록 묶기, 애매한 쌍을 AI에게 묻는 판정 (scope "나중에 고려할 것")
- 목업 수정, 손으로 묶음 만들기, 테스트 도구 도입
