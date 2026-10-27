# 구직 관리 15단계: 예약 실행과 알림

- 요구사항: R33, R36(알림), R74(80% 알림·이어 하기), R78(알림), R80–R81
- 목업: 없음 (알림 화면은 notifications 기능)
- 경로 기준: 저장소 `supabase/`, `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정 D19, notifications [extension.md](../../../notifications/ai/spec/extension.md)

## 할 일
- `0004_job_search_cron.sql`: pg_cron·pg_net 켜기, 예약 비밀값을 vault에 넣는 RPC, 작업 3개.
  - 주간 수집 (R33): 월요일 06:00 KST(= 일요일 21:00 UTC) → `js-collect run` → 끝나면 `js-process` 부르기.
  - 처리 이어 하기 (R74): 15분마다 `waiting`·`new` 공고가 있을 때만 `js-process`.
  - 메일 확인 (R64): 하루 한 번 07:00 KST → `js-gmail check`.
- `_shared/auth.ts`: `x-daybrick-cron` 머리글이 `DAYBRICK_CRON_SECRET`와 같으면 서비스 역할로 사용자(계정 하나)를 대신 처리한다.
- 예약 작업은 2단계에서 vault에 넣은 `daybrick_cron_secret`을 읽어 머리글에 싣는다. 시작 전에 무료 플랜에서 pg_cron·pg_net·vault가 되는지 확인하고 다르면 기록한다.
- `_shared/notify.ts`로 모든 알림 연결 (R80). 갈 곳 `page: "job-search"`, `tab`:

| 알림 | 중요도 | 합치기 키 | tab |
|---|---|---|---|
| 수집 실패: 사이트, 이유 | warning | `js-collect-fail:<site_id>` | sources |
| 새 추천 공고 N개 | info | 없음 | recommend |
| 메일 제안 N개 | info | `js-mail` | mail |
| AI 한도 80% / 초과 | warning | `js-limit:<day|month>` | settings |
| 크레딧 부족 오류 | warning | `js-credit` | settings |
| Gmail 연결 끊김 | warning | `js-gmail-broken` | settings |

- `JobSearchTabs`의 `usePageIntent("job-search", …)`로 `tab` 열기 (R81).

## 확인할 결과
- Supabase `cron.job`에 작업 3개가 보인다. 주간 수집 시각을 2분 뒤로 잠시 바꾸면 저절로 수집·처리되고, 앱 종 아이콘에 "새 추천 공고 N개"가 온다. 확인 뒤 시각을 되돌린다.
- 알림을 누르면 구직 관리의 해당 탭이 열린다.
- 사이트 하나를 일부러 실패시키면 "수집 실패" 알림이 오고, 다시 실패해도 같은 알림이 갱신된다(합치기).
- 하루 한도를 지금 호출 수의 80% 바로 위로 두면 한도 알림이 온다.
- 앱을 끈 채 예약 실행이 돌았어도, 앱을 켜면 그 알림을 받는다.
- 예약 비밀값 없이 함수를 부르면 401.
- `npm run build`, `cargo check` 성공.

## 이 단계에서 만들거나 고칠 파일
- `supabase/migrations/0004_job_search_cron.sql`, `functions/_shared/auth.ts`, `_shared/notify.ts`, `_shared/ai.ts`, `js-collect`·`js-process`·`js-gmail`의 `index.ts`
- `src-tauri/src/server/migrations.rs`
- 수정: `pages/job-search/JobSearchTabs.tsx`
