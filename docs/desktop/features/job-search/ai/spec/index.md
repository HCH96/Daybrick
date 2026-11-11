# 구직 관리 (job-search) 명세서 색인

## 기능 개요
등록한 채용 사이트에서 공고를 주 1회 서버가 모으고, 필터를 통과한 공고를 AI가 프로필과 비교해 채점해 추천한다. 지원하면 지원 관리 카드를 만들고, Gmail 메일로 상태 변경을 제안한다. 다른 사이트에 올라온 같은 공고는 대표 하나로 묶어 보여준다.

## 먼저 있어야 하는 기능 (별도 명세)
- 서버 연결 `server-setup`: 로그인(Supabase Auth), 첫 실행 설정, 빈 Supabase 자동 세팅, 설치 가이드, 일시정지 감지·재개 안내
- 알림 `notifications`: 오른쪽 위 알림 아이콘, 안 읽은 개수 배지, 누르면 최근 알림 목록이 아래로 펼쳐짐
- 권장 순서: server-setup → notifications → job-search
- 지원 관리(applications) 변경: 카드 ↔ 서버 지원 건 연결, 상태 변경 시 서버 갱신, 승인된 메일 제안 반영 (job-search 계획 단계에 포함)

## 요구사항 (묶음 → 파일)
| 묶음 | R 범위 | 파일 |
|---|---|---|
| 페이지·추천 공고·상세 팝업 (+ 화면 구성) | R1–R16, R91–R93 | [req-recommend.md](req-recommend.md) |
| 프로필 (+ 화면 구성) | R17–R23 | [req-profile.md](req-profile.md) |
| 수집 사이트·어댑터 (+ 화면 구성) | R24–R32, R90 | [req-sources.md](req-sources.md) |
| 공고 수집 | R33–R40, R82 | [req-collect.md](req-collect.md) |
| 중복 공고 묶기·재등록·애매한 쌍 | R83–R89, R111–R115 | [req-dedupe.md](req-dedupe.md) |
| 필터·항목 추출·적합도 채점·직군 거르기 | R41–R53, R94–R101 | [req-analysis.md](req-analysis.md) |
| 일괄 처리 (Batch API) | R102–R110 | [req-batch.md](req-batch.md) |
| 지원하기·일정 제안 | R54–R59 | [req-apply.md](req-apply.md) |
| Gmail 연동·메일 제안 | R60–R70 | [req-gmail.md](req-gmail.md) |
| AI 사용량·한도 | R71–R79 | [req-usage.md](req-usage.md) |
| 보내는 알림 | R80–R81 | [req-alerts.md](req-alerts.md) |

## 나머지 파일
| 파일 | 내용 |
|---|---|
| [ai-rules.md](ai-rules.md) | AI 프롬프트 규칙: 원문 취급, 인젝션 검사, 채점 기준, 자료에 없는 내용 금지 |
| [data.md](data.md) | 다룰 데이터와 저장 위치 |
| [scope.md](scope.md) | 제외, 다른 기능으로 넘긴 것, 나중에 고려할 것, 계획 단계에서 확인할 것 |
| [mockup.md](mockup.md) | 목업 경로(2026-10-27 승인)와 목업에서 정한 것 |
| [decisions.md](decisions.md) | 결정 사항 D1–D92 |

## 다른 문서
- 수정 계획 2: [../plan/index.md](../plan/index.md) (2026-10-30 승인) — 수정2 명세(L44) 10단계. 주간 처리는 `js-process batch`가 결과 확인·맡기기를 하고 공고는 `batch_id`로 표시(D70–D71), 기존 공고 직군은 첫 일괄 때 백업과 함께 일괄로 채움(D75)
- 수정2 명세 (L44): 직군 거르기, Batch API 일괄 처리, 재등록·애매한 쌍 묶기, 출처 표시·new 배지·흐름 줄 수정 (R94–R115, D64–D69)
- 수정 계획 1: [../../archive/plan-dedupe/index.md](../../archive/plan-dedupe/index.md) (2026-10-29 승인, 보관) — 중복 공고 묶기 7단계(근거 L33). 묶인 공고는 `stage duplicate`+`dup_of`, 대표 바꾸기는 분석 복사(D54). 유사도는 정리 제목 같음·Dice 0.8·직무 같음(D55), 소급은 첫 처리 때 백업과 함께(D56)
- 처음 구현 계획: [../../archive/plan-initial/index.md](../../archive/plan-initial/index.md) (2026-10-27 승인) — 15단계. 어댑터 규칙 형식 v1을 정하고(D16), Gmail은 앱이 직접 Google 인증을 열어 서버가 토큰을 암호화해 둔다(D18). 예약 실행은 pg_cron + 예약 비밀값(D19)
- 테스트 문서 (r3, 수정2): AI 테스트 [../tests/r3/](../tests/r3/) · 사용자 테스트 [../../human/tests/r3-user-test.md](../../human/tests/r3-user-test.md) (r1·r2는 [../../archive/tests/](../../archive/tests/))
- 진행 기록: [../logs/index.md](../logs/index.md)
