# 구직 관리 수정1 3단계: 정리 규칙·중복 판정 함수

- 요구사항: R35 (L33에서 변경), R84, R86
- 목업: 없음
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D31, D52, D53, D55

## 할 일
`supabase/functions/_shared/dedupe.ts`에 순수 함수만 둔다 (DB·네트워크 없음). 기존 `normalizeText`·`extId`는 그대로.
- `cleanTitle(title, company)`: R35 표 순서대로 — 앞뒤 말머리 `[…]`·`(…)` 반복 제거 → 상투어(채용, 모집, 신입/경력, 신입, 경력, 정규직, 계약직, 상반기, 하반기, 수시, 공채) 제거 → 제목 안의 회사 이름(정리한 값, 법인 표기 뺀 것) 제거 → `normalizeText`. 결과가 빈 글자면 원래 제목의 `normalizeText`를 쓴다 (제목이 상투어뿐일 때 모두 같은 키가 되는 것 막기).
- `normKey(company, title)`: `정리(회사)|cleanTitle(제목, 회사)`. 수집 단계는 회사가 정확히 같을 때만(D52).
- `companyMatch(a, b)`: 정리한 회사가 같거나 한쪽이 다른 쪽으로 시작. 짧은 쪽이 2글자 미만이면 false.
- `sameDeadline(a, b)`: 둘 다 null이거나 `YYYY-MM-DD`가 같음 (시간은 보지 않음).
- `dice(a, b)`: 2글자 묶음 겹침 `2·|A∩B| / (|A|+|B|)` (중복 묶음은 개수로). 한쪽이 2글자 미만이면 같을 때만 1.
- `titleSimilar(a, b)`: 정리한 제목이 같거나 `dice ≥ 0.8`, 또는 추출 직무(`fields.role`을 `normalizeText`)가 둘 다 있고 같음 (D55).
- `isSameJob(a, b)`: 다른 사이트 && `companyMatch` && `sameDeadline` && `titleSimilar`. 입력은 `{ siteId, company, title, role, deadline }`.
- `pickRep(list)`: 지원함 → (소급일 때) 채점 있음 → `ownSite` → `collectedAt` 빠른 순 → id 순. 소급 여부는 인자로.

## 확인할 결과 (Node로 실행해 결과 표를 진행 기록에 남긴다)
| 입력 | 기대 |
|---|---|
| `cleanTitle("[스마일게이트RPG] 클라이언트 개발자 경력 채용", "스마일게이트RPG")` | `클라이언트개발자` |
| `cleanTitle("스마일게이트 서버 개발자", "스마일게이트")` | `서버개발자` |
| `cleanTitle("신입 채용", "넥슨")` | 빈 글자가 아님 (원래 제목 정리값) |
| `normKey("넥슨", "서버 개발자")` vs `normKey("넥슨게임즈", "서버 개발자")` | 다름 |
| 회사 스마일게이트 / 스마일게이트RPG, 마감 둘 다 11/15, 제목 `서버 개발자` / `[스마일게이트] 서버 개발자 경력 채용` | 같은 공고 |
| 위와 같고 마감 10/31 / 11/01 | 다름 |
| 제목 `서버 개발자` / `서버개발자(MMORPG)` (직무 다름) | 다름 (Dice 0.8 미만) |
| 같은 사이트끼리 | 다름 |
| `pickRep`: 게임잡(먼저 수집) + 자사(나중) | 자사 |
| `pickRep`: 둘 다 자사 아님 | 먼저 수집된 쪽 |

- 파일에 TypeScript 문법 오류가 없다 (Node 타입 제거 실행으로 확인, deno 타입 검사는 못 함).
- `js-collect/index.ts`가 쓰는 `normKey`·`extId` 이름·인자가 그대로라 4단계 전에도 수집이 깨지지 않는다.

## 이 단계에서 만들거나 고칠 파일
- `supabase/functions/_shared/dedupe.ts`
