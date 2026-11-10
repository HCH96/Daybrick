# 알림 (notifications) 구현 계획 색인
- 기능 명세서: [../spec/index.md](../../ai/spec/index.md) · 목업: [../../human/mockups/index.html](../../human/mockups/index.html)
- 작성일: 2026-10-26 · 상태: 승인됨 (2026-10-26), 구현 대기
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/src/`, 서버는 저장소 `supabase/`) · 파일 목록·데이터 모양: [structure.md](structure.md)
- 커밋 이름: "알림 N단계: …"
- 화면 단계(2–5)는 개발 모드 콘솔의 `daybrickNotify(...)`로, 서버 단계(6–8)는 사용자의 테스트용 Supabase 프로젝트와 SQL 편집기로 확인한다.

## 결정 (계획 중 정함, D8–D12)
- 로컬 알림은 Rust 명령으로 앱 데이터 폴더 `notifications.json`에 저장하고, 쓸 때는 임시 파일을 바꿔치기한다 (지원 관리와 같은 방식) (D8).
- 보내기는 `features/notifications/notify.ts`의 `notify(input)` 하나로 한다. Provider가 뜨기 전에 온 알림은 줄에 세워 둔다 (D9).
- 갈 곳 이동은 `navigate`를 고치지 않고 열기 요청 Context(`openTarget`/`usePageIntent`)로 한다 (D10).
- 서버 알림 정리는 pg_cron 없이 앱이 받아 올 때 하고, 서버 합치기는 SQL 함수 `daybrick_notify`와 부분 고유 인덱스로 한다 (D11).
- 실시간은 `user_id`로 걸러 구독하고, `SUBSCRIBED`가 될 때마다 전체를 다시 받는다 (D12).

### 작은 규칙
- 알림은 `origin: "local"|"server"`로 출처를 구분한다. 로컬 id는 `local-` 접두어, 서버 id는 uuid.
- 목록은 두 출처를 합쳐 `updatedAt` 최신순으로 정렬하고 50개까지 보여준다. 배지는 안 읽은 알림 전체를 센다.
- 보낸 기능 이름: `source`가 PageId면 `PAGE_LABELS`, 아니면 "Daybrick".
- 상대 시각: 방금 / N분 전 / N시간 전(오늘) / 어제 / M월 D일. 패널이 열려 있는 동안 1분마다 다시 그린다.
- 종 버튼은 `data-tauri-drag-region`이 없는 `<button>`이다. 창 끌기와 겹치지 않는지 진행 기록에 적는다.
- `daybrickNotify`는 개발 모드에서만 연다 (배포 빌드에 넣지 않음).
- 추측한 것(실시간 무료 한도: 동시 연결 200개, 월 메시지 200만 건)은 7단계에서 문서로 확인해 기록한다.

## 단계
| 단계 | 이름 | 파일 | 요구사항 |
|---|---|---|---|
| 1 | 데이터·로컬 저장·보내기 함수 | [step-01.md](step-01.md) | R21, R22, R24, R27, R28 |
| 2 | 종 아이콘·배지 | [step-02.md](step-02.md) | R1–R5 |
| 3 | 펼침 패널과 알림 행 | [step-03.md](step-03.md) | R6–R13, R20, R23, R26 |
| 4 | 확인·필터·모두 확인 | [step-04.md](step-04.md) | R14, R15, R18–R20 |
| 5 | 갈 곳 이동 | [step-05.md](step-05.md) | R16, R17, R25 |
| 6 | 서버 구조 0002 | [step-06.md](step-06.md) | R29, R36 |
| 7 | 서버 알림 받기·실시간·사본 | [step-07.md](step-07.md) | R30–R32, R34, R35 |
| 8 | 서버 확인 기록·오프라인 | [step-08.md](step-08.md) | R33 |

## 이번 계획에 넣지 않는 것
- 푸시·OS 알림·소리, 알림 하나씩 지우기·검색, 기능별 알림 끄기, 폰 앱·공유 웹, 일정 알림, 테스트 도구 도입.
- job-search의 알림 보내기(R80–R81)와, 화면이 `usePageIntent`로 탭·팝업을 실제로 여는 처리는 각 기능에서 한다.
