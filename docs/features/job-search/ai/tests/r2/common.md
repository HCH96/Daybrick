# r2 AI 테스트: 빌드·서버 구조 (A1–A2)

## A1. 빌드·타입 검사·Rust 컴파일
- 테스트 내용: 수정1 1–7단계 뒤 PC 앱 프론트엔드·Rust가 빌드되는지
- 근거 요구사항: 1–7단계 (수정1 전체)
- 수행 방법: `apps/desktop`에서 `npx tsc --noEmit`, `npm run build`, `apps/desktop/src-tauri`에서 `cargo check` (실제 실행)
- 예상 결과: 모두 성공
- 실제 결과: tsc 종료 코드 0, vite 빌드 성공(466 모듈, 289ms), cargo check `Finished dev profile`. 경고는 기존의 "500 kB 넘는 청크" 하나뿐
- 판정: **통과**
- 참고: 서버 함수(Deno TS)는 deno가 없어 타입 검사를 못 했다. 대신 A3·A6·A7에서 Node 타입 제거 실행으로 `_shared/dedupe.ts`·`js-process/dedupe.ts`가 문법 오류 없이 불러와짐을 확인했다.

## A2. 서버 구조 0007
- 테스트 내용: 새 칸·stage·백업 표·다시 실행 안전성·own_site 기본값과 보존
- 근거 요구사항: R85, R87, R90, R93, L35 테스트 메모
- 수행 방법: `supabase/migrations/0007_job_search_dedupe.sql` 전체 읽기, `migrations.rs`에 0007 포함 확인(grep), 0004의 `js_cron_continue`와 비교 (DB에 실제 적용은 하지 않음 — 코드 판정)
- 예상 결과: 규칙대로 정의됨
- 실제 결과:
  | 확인 | 결과 |
  |---|---|
  | `js_sites.own_site` | 칸이 없을 때만 `add column … default false` 후 기본 넥슨(`builtin and name='nexon'`) 사이트만 true |
  | `js_postings.dup_of`(자기 참조, on delete set null)·`unbundled`(기본 false)·색인 | `add column if not exists`, `create index if not exists` |
  | stage `duplicate` | stage가 들어간 check 제약을 모두 지우고 `js_postings_stage_check`로 다시 만듦 (다시 실행해도 같은 결과) |
  | `js_settings.dedupe_version` | `int not null default 0`, `if not exists` |
  | 백업 표 `js_postings_backup_0007` | `to_regclass`가 null일 때만 만들고 그때 한 번 id·stage·norm_key를 복사 → 두 번째 실행은 덮지 않음. RLS 켜고 본인 읽기만 |
  | 두 번 실행 안전 | 모든 문이 `if not exists`/`create or replace`/`drop policy if exists`/조건 블록 |
  | 기본값 | `js_ensure_defaults`의 기본 목록에 게임잡 `own:false`, 넥슨 `own:true` |
  | 사용자가 바꾼 own_site 보존 | ① 0007 재실행: 칸이 이미 있으면 update 블록을 건너뜀 ② `js_ensure_defaults`: own_site는 처음 넣는 insert에서만 쓰고, 이미 기본 어댑터가 있으면 어댑터 규칙 update만 함 → 덮어쓰지 않음 |
  | `migrations.rs` | 0007이 `include_str!`로 들어 있음 |
- 판정: **통과**
