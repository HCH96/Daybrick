# 구직 관리 수정2 8단계: 같은 사이트 재등록 묶기

- 요구사항: R111, R112 (영향: R16 지원·지원 안 함 공고, R88 숨김·지원 묶음)
- 목업: 없음
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D31, D53, D54, D57, D59, D60, D66, D76

## 할 일
- `_shared/dedupe.ts`: 순수 함수 `isRelisted(newJob, oldJob, listedExtIds)` — 같은 사이트, 회사 정리 이름이 정확히 같고 `cleanTitle`이 같으며, `oldJob.extId`가 이번 목록(`listedExtIds`)에 없을 때 참. 둘 다 목록에 있으면 거짓 (D66).
- `js-collect/index.ts` `saveNew` (D76):
  - 판정은 이 사이트의 목록 읽기가 성공했을 때만 한다 (`judgeList` 통과, 실패한 사이트는 판정하지 않음).
  - 새 공고마다 같은 사이트·같은 norm_key·`unbundled = false`인 기존 공고를 찾아 `isRelisted`.
  - 기존 공고가 다른 묶음의 묶인 공고면(`dup_of` 있음) 새 공고는 그 대표 아래 `duplicate`로 저장 (원문 받지 않음).
  - 기존 공고(또는 그 묶음)가 지원한 공고면 새 공고를 기존 공고 아래 `duplicate`로 저장 (D57: 지원한 묶음은 대표를 바꾸지 않음) → 추천에 안 나옴.
  - 그 밖이면 새 공고를 일반 공고로 저장한 뒤 `js_switch_rep(user, 기존, 새)` → 새 공고가 대표, 추출·점수·숨김을 복사 (R112). 새 공고는 원문을 받는다(대표라서).
  - 다른 사이트 판정(R82)보다 먼저 한다. 재등록으로 묶이면 다른 사이트 판정은 하지 않는다.
  - `js-collect run` 응답 `sites[].bundled`에 재등록으로 묶인 수도 넣는다.

## 확인할 결과
- `cargo check` 성공, [서버 업데이트] 성공.
- Node로 `isRelisted` 실행: (1) 기존 ext 목록에 없음 → 참, (2) 기존·새 공고 모두 목록에 있음 → 거짓, (3) 제목 "(경력)"만 다름 → 참 (`cleanTitle`), (4) 회사 "넥슨"/"넥슨게임즈" → 거짓.
- SQL 시험 행으로 확인: 기존 공고 `O(사이트 A, ext "100", scored 75)`를 두고 목록에 "100"이 없고 같은 제목의 "200"이 있게 수집 → 새 공고 N(ext "200")이 대표, `O.stage duplicate, dup_of N`, N은 점수 75로 추천에 한 장. O를 지원 안 함으로 보냈었다면 N도 보관함 쪽(추천에 안 나옴).
- 기존 수집에서 묶이지 않던 공고가 갑자기 묶이지 않는다: 다시 [지금 수집] 해도 `bundled`가 0 (목록에 둘 다 있으므로).

## 이 단계에서 만들거나 고칠 파일
- `supabase/functions/_shared/dedupe.ts`
- `supabase/functions/js-collect/index.ts`
