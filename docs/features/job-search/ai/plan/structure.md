# 구직 관리 계획: 파일 목록과 데이터 모양
전체 구조가 필요할 때만 읽는다. 경로 기준은 [index.md](index.md) 맨 위.

## 1. 파일 목록
### 서버 (저장소 `supabase/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `migrations/0003_job_search.sql` | 2절 테이블·RLS·버킷 `job-search`·기본 설정 행(한도·단가)·기본 어댑터 자리 | 2 (5에서 어댑터 행) |
| `migrations/0004_job_search_cron.sql` | pg_cron 작업 3개(주간 수집, 처리 이어 하기, 하루 메일 확인), pg_net 호출 | 15 |
| `functions/_shared/ai.ts` | Claude 호출, 한도 검사(R73–R74), 호출 기록·비용(R72), 크레딧 부족 판정(R78) | 3 |
| `functions/_shared/auth.ts` | 사용자 토큰 또는 예약 비밀값으로 호출자 확인, 서비스 클라이언트 | 3 (15에서 넓힘) |
| `functions/_shared/adapter.ts` | 규칙 형식 검사·실행(목록·상세·이미지), 요청 간격 | 5 |
| `functions/_shared/dedupe.ts` | 같은 공고 판정 키(R35) | 5 |
| `functions/_shared/filters.ts` | 1차·2차 필터, 기술스택 자동 추림 (순수 함수) | 8 |
| `functions/_shared/prompts.ts` | 프로필·추출·채점·메일 분류 프롬프트와 출력 JSON 형식 | 4, 9, 14 |
| `functions/_shared/notify.ts` | `daybrick_notify` 호출 감싸기, 합치기 키 | 5 (15에서 모두 연결) |
| `functions/js-profile/index.ts` | 자료 읽기(PDF는 문서 블록) → Opus 초안 | 4 |
| `functions/js-collect/index.ts` | `run`(켜진 사이트 전체 또는 하나)·`test`(규칙+값, 저장 안 함) | 5, 7 |
| `functions/js-process/index.ts` | 처리 순서 R41, 미룬 작업 이어 하기, `force`(그래도 채점), `rescore` | 9 |
| `functions/js-gmail/index.ts` | `connect`(갱신 토큰 확인·암호화, `token.ts`)·`disconnect`·`check` | 13, 14 |
| `adapters/gamejob.json`, `adapters/nexon.json` | 기본 어댑터 원본 (SQL에 넣을 내용, 가이드 예시) | 5 |

### Rust (`apps/desktop/src-tauri/src/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `server/migrations.rs` | 3·4번 SQL, 함수 4개와 `_shared` 파일, 자동 생성 비밀값 목록 | 2, 3, 4, 5, 9, 13, 15 |
| `server/management.rs` | 없는 비밀값만 만들기(`list_secrets` 후 `set_secrets`) | 2 |
| `job_search.rs` | `job-search.json` 읽기·쓰기 (임시 파일 바꿔치기) | 10 |
| `server/oauth_listener.rs` | 그대로 재사용 (Gmail 콜백) | 13 |
| `lib.rs` | 명령 등록 | 2, 10 |

### 프론트 로직 (`features/job-search/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `types.ts` | 2절 타입 | 2 |
| `api.ts` | 테이블 읽기·쓰기, 서버 함수 호출 (ServerProvider 세션 사용) | 2 (단계마다 추가) |
| `JobSearchProvider.tsx`, `useJobSearch.ts` | 탭들이 같이 쓰는 데이터·새로고침 | 3 (단계마다 넓힘) |
| `messages.ts` | 오류·안내 문구 | 3 |
| `usage.ts` | 사용액 줄 계산(오늘 호출, 이번 달, 기준 이후, 예상 잔액) | 3 |
| `profileDraft.ts` | 초안 ↔ 편집 값, 버전 번호 | 4 |
| `adapterRule.ts` | 규칙 파일 형식 검사 (서버와 같은 규칙, 앱에서 먼저 알림) | 7 |
| `guideContent.ts` | 어댑터 가이드 본문·예시·프롬프트 틀 | 7 |
| `filterRules.ts` | 조건 종류·값 표시 이름 | 8 |
| `dday.ts`, `grade.ts`, `sortPostings.ts` | D-n·상시, 등급·색, 정렬·마감 지난 공고 빼기 | 10 |
| `localState.ts` | `job-search.json` 감싸기 (Tauri 밖이면 메모리) | 10 |
| `buildCard.ts`, `scheduleSuggest.ts` | 공고 → 지원 카드, 일정 제안 목록(정확한 날짜만) | 12 |
| `statusSync.ts` | 카드 상태 → 서버 지원 건, 대기 목록 반영 | 12 |
| `gmailConnect.ts` | Supabase Google 로그인(Gmail 권한) → `provider_refresh_token` → `js-gmail connect` (D18, 서버 호출은 `gmailApi.ts`) | 13 |
| `applySuggestion.ts` | 승인한 제안 → 카드 상태·세부 단계·결과·일정 | 14 |

### 화면 (`pages/job-search/`, css는 같은 이름)
| 파일 | 단계 |
|---|---|
| `JobSearchPage.tsx`, `JobSearchTabs.tsx`, `JobSearchDisconnected.tsx`, `TabPlaceholder.tsx` | 1 |
| `settings/JobSettingsTab.tsx`, `LimitsPanel.tsx`, `BalancePanel.tsx`, `PricesPanel.tsx`, `recommend/UsageLine.tsx` | 3 |
| `profile/ProfileTab.tsx`, `SourcePanel.tsx`, `ProfileEditor.tsx`, `ProfileField.tsx`, `SkillChips.tsx`, `ExperienceList.tsx` | 4 |
| `sources/SourcesTab.tsx`, `SiteTable.tsx`, `SiteRowMenu.tsx`, `AdapterCards.tsx` | 6 |
| `sources/AddSiteDialog.tsx`, `TestResult.tsx`, `AdapterGuideDialog.tsx`, `CodeBox.tsx` | 7 |
| `filters/FiltersTab.tsx`, `FlowLine.tsx`, `FilterPanel.tsx`, `FilterRow.tsx`, `FilterAddRow.tsx` | 8 |
| `recommend/RecommendTab.tsx`, `CollectStatusLine.tsx`, `RecommendToolbar.tsx`, `PostingGrid.tsx`, `PostingCard.tsx` | 10 |
| `popup/PostingPopup.tsx`, `PopupHead.tsx`, `ScoreBox.tsx`, `ReasonList.tsx`, `FieldTable.tsx`, `SourceView.tsx`, `ImageZoom.tsx`, `InjectionAlert.tsx`, `PopupFoot.tsx`, `recommend/FilteredList.tsx`, `ArchivedList.tsx` | 11 |
| `popup/ScheduleSuggestDialog.tsx` | 12 |
| `settings/GmailPanel.tsx` | 13 |
| `mail/MailTab.tsx`, `SuggestionCard.tsx`, `DoneList.tsx` | 14 |
| 수정: `app/types.ts`·`pageLabels.ts`·`pages.ts`, `components/icons/NavIcons.tsx` (돋보기) | 1 |
| 수정: `features/applications/types.ts`·`reducer.ts`·`store.tsx` | 12 |
| 수정: `features/server/serverUpdate.ts`·`rerunSetup.ts`·`setupRunner.ts` (자동 생성 비밀값) | 2 |

## 2. 데이터 모양
서버 테이블 (모두 `user_id uuid → auth.users`, RLS 본인 행만. `js_gmail_tokens`만 서비스 역할 전용)
- `js_settings(user_id pk, daily_limit int=100, monthly_limit_usd numeric=10, prices jsonb, profile_version int)`
- `js_balance_records(id, user_id, amount_usd, set_at)`: 마지막 행이 기준 (R76)
- `js_ai_calls(id, user_id, at, model, task, input_tokens, output_tokens, cache_read, cache_write, cost_usd, ok)`
- `js_profile_sources(id, user_id, name, kind 'pdf'|'md'|'text', storage_path, text, created_at)`
- `js_profiles(id, user_id, version int, data jsonb, sources jsonb, saved_at)` / `js_profile_drafts(user_id pk, data jsonb, created_at)`
- `js_adapters(id, user_id, name, rule jsonb, version int, builtin bool)`
- `js_sites(id, user_id, name, url, adapter_id, vars jsonb, enabled, last_result jsonb, last_at)`
- `js_collect_runs(id, user_id, site_id, at, count, ok, reason)`
- `js_postings(id, user_id, site_id, ext_id, url, company, title, duty, norm_key, body_text, image_paths text[], collected_at, stage, filtered_by jsonb, hidden_at, applied_at)`
  - `stage`: `new` → `filtered1` | `extracted` → `filtered2` | `suspect` | `scored` / `waiting`(한도)
- `js_extractions(posting_id pk, user_id, fields jsonb, suspect bool, suspect_quotes text[])`
- `js_scores(posting_id pk, user_id, profile_version, score, grade, strengths jsonb, gaps jsonb, summary)`
- `js_filters(id, user_id, stage 1|2, kind, value jsonb, enabled)`: 종류 `title-include`·`title-exclude`·`company-exclude`·`skill-include`·`skill-exclude`·`max-years`·`employment`·`skill-overlap`
- `js_applications(id, user_id, posting_id, company, domain, card_id, status, closed bool)`
- `js_mail_suggestions(id, user_id, application_id, subject, sender, received_at, category, from_status, to_status, stage, schedule jsonb, quote, state 'pending'|'approved'|'rejected', handled_at)`
- `js_gmail_tokens(user_id pk, cipher text, iv text, email, last_checked_at, broken_at)` / 앱이 읽는 `js_gmail_status` 보기(연결 여부·이메일·마지막 확인만)

```ts
// job-search.json (앱 데이터 폴더, D21)
interface JobSearchLocal { version: 1; recommendOpenedAt: string | null;
  pendingStatus: { serverId: string; status: StatusId; closed: boolean; at: string }[]; }
// 지원 관리 카드 (D20): Application에 선택 칸 추가, 파일 version 2 그대로
interface Application { /* 기존 */ jobLink?: { serverId: string } | null }
```

## 3. 어댑터 규칙 형식 v1 (D16)
```json
{ "format": 1, "name": "gamejob", "vars": ["dutyCode"], "delayMs": 1500,
  "list": { "url": "https://…?duty={dutyCode}&page={page}", "pages": 3, "type": "html",
    "item": "CSS 선택자 또는 JSON 경로($.data.list[*])",
    "fields": { "id": { "sel": "a", "attr": "href", "regex": "GI_No=(\\d+)" },
      "title": { "sel": ".tit" }, "company": { "sel": ".corp" },
      "link": { "sel": "a", "attr": "href", "base": "https://www.gamejob.co.kr" },
      "duty": { "sel": ".duty", "optional": true }, "deadline": { "sel": ".date", "optional": true } } },
  "detail": { "url": "{link}", "type": "html", "body": "CSS 선택자", "images": "img 선택자(src)" } }
```
- 필수 칸: `format`, `name`, `list.url`, `list.item`, `fields.title`, `fields.link`. `{변수}`는 `vars`·`page`·목록 칸 값으로 바꾼다.
- 키 이름은 목업 가이드 그림의 예시(list.item 등)를 이 형식으로 확정한다.

## 4. 컴포넌트 구조
```
JobSearchPage ─ (연결 안 됨) JobSearchDisconnected
              └ JobSearchProvider ─ JobSearchTabs (usePageIntent "job-search")
   ├ RecommendTab ─ UsageLine · CollectStatusLine · RecommendToolbar
   │    ├ PostingGrid ─ PostingCard ×N   |  FilteredList  |  ArchivedList
   │    └ PostingPopup ─ InjectionAlert · PopupHead · ScoreBox · ReasonList
   │          · FieldTable · SourceView(→ImageZoom) · PopupFoot → ScheduleSuggestDialog
   ├ ProfileTab ─ SourcePanel · ProfileEditor ─ ProfileField · SkillChips · ExperienceList
   ├ FiltersTab ─ FlowLine · FilterPanel ×2 ─ FilterRow ×N · FilterAddRow
   ├ SourcesTab ─ SiteTable(SiteRowMenu) · AdapterCards · AddSiteDialog(TestResult) · AdapterGuideDialog
   ├ MailTab ─ SuggestionCard ×N · DoneList
   └ JobSettingsTab ─ GmailPanel · LimitsPanel · BalancePanel · PricesPanel
```

## C++ 비유
- 어댑터 규칙 파일은 데이터로 된 설정이고, `adapter.ts`는 그 설정을 읽어 도는 인터프리터다. 새 사이트를 추가해도 인터프리터(서버 함수)를 다시 컴파일·배포하지 않는다.
- 공고의 `stage`는 상태 기계의 현재 상태다. `js-process`는 큐에서 몇 개씩 꺼내 다음 상태로 넘기는 작업 루프이고, 한도에 걸리면 `waiting`에 두고 루프를 끝낸다.
- `_shared/ai.ts`는 모든 AI 호출이 거치는 래퍼 함수다. 호출 전 한도 검사, 호출 후 기록을 RAII처럼 한 곳에서 처리한다.
- `pendingStatus`는 보내지 못한 쓰기를 모아 둔 재시도 큐다 (알림의 `pendingAcks`와 같은 방식).
