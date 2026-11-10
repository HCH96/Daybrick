# 구직 관리 5단계: 규칙 실행기와 수집 함수 (기본 어댑터)

- 요구사항: R25–R27, R35–R40 (R33 예약 실행과 R36 알림 연결은 15단계)
- 목업: 없음 (가이드 예시는 7단계)
- 경로 기준: 저장소 `supabase/`
- 공통 규칙: [index.md](index.md)의 결정 D16, [structure.md](structure.md) 3절 규칙 형식

## 할 일
- 시작 전에 확인(추측 검증):
  - 게임잡 목록·상세가 서버 함수에서 HTML로 읽히는지 (계획 때 목록 요청은 200, `GI_No` 확인).
  - 넥슨 `careers.nexon.com/recruit`는 단순 요청에 403이었다. 공개 JSON 경로나 다른 주소를 찾는다. 없으면 기본 어댑터를 게임잡 하나로 할지 사용자에게 묻는다.
  - 두 사이트의 이용약관·robots 규칙, deno-dom이 Edge 함수에서 동작하는지.
- `_shared/adapter.ts`: 형식 검사(필수 칸, `format: 1`) → 목록 쪽 읽기 → 항목 칸 뽑기(`sel`·`attr`·`regex`·`base`) → 상세 읽기(본문 텍스트·이미지 주소). 요청 사이 `delayMs` (R37).
- `_shared/dedupe.ts`: 같은 사이트는 `ext_id`(없으면 주소), 다른 사이트는 회사+제목 정리 키 `norm_key`(공백·기호 제거, 소문자) (R35).
- `js-collect` `run`: 켜진 사이트(또는 지정한 하나)를 차례로 수집.
  - 새 공고만 저장하고, 이미 있는 공고는 원문을 다시 받지 않는다 (R39).
  - 이미지 본문은 Storage `job-search/<user_id>/postings/`에 저장 (R38).
  - 새 공고는 `stage: new` (R40, 처리는 9단계).
- 실패 판정 (R36): 0개이거나 제목·링크가 빠진 공고가 절반을 넘으면 `js_collect_runs`·`js_sites.last_result`에 실패와 이유. `_shared/notify.ts`는 함수만 만들고 15단계에서 모두 연결한다.
- 기본 어댑터 `adapters/gamejob.json`·`nexon.json`과, 사용자 행으로 넣는 RPC `js_ensure_defaults()` (R26–R27).

## 확인할 결과
- 개발자 도구에서 `js-collect run`을 부르면 `js_postings`에 게임잡 공고가 쌓이고(제목·회사·링크 채워짐), `js_collect_runs`에 성공 한 줄.
- 바로 한 번 더 부르면 새 공고 0개, 기존 행 수 그대로.
- 목록 선택자를 일부러 틀리게 한 사이트 → "수집 실패: 읽은 공고 0개"로 기록.
- 이미지 공고가 있으면 Storage에 이미지가 저장되고 `image_paths`가 채워진다 (없으면 진행 기록에 "확인 못 함").
- `cargo check` 성공 (함수 묶음 포함).

## 이 단계에서 만들거나 고칠 파일
- `supabase/functions/_shared/adapter.ts`, `_shared/dedupe.ts`, `_shared/notify.ts`, `functions/js-collect/index.ts`
- `supabase/adapters/gamejob.json`, `nexon.json`, `migrations/0003_job_search.sql`(기본 어댑터 RPC)
- `src-tauri/src/server/migrations.rs`
