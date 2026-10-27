# 구직 관리 (job-search) 명세서 색인

## 기능 개요
등록한 채용 사이트에서 공고를 주 1회 서버가 모으고, 필터를 통과한 공고를 AI가 프로필과 비교해 채점해 추천한다. 지원하면 지원 관리 카드를 만들고, Gmail 메일로 상태 변경을 제안한다.

## 먼저 있어야 하는 기능 (별도 명세)
- 서버 연결 `server-setup`: 로그인(Supabase Auth), 첫 실행 설정, 빈 Supabase 자동 세팅, 설치 가이드, 일시정지 감지·재개 안내
- 알림 `notifications`: 오른쪽 위 알림 아이콘, 안 읽은 개수 배지, 누르면 최근 알림 목록이 아래로 펼쳐짐
- 권장 순서: server-setup → notifications → job-search
- 지원 관리(applications) 변경: 카드 ↔ 서버 지원 건 연결, 상태 변경 시 서버 갱신, 승인된 메일 제안 반영 (job-search 계획 단계에 포함)

## 요구사항 (묶음 → 파일)
| 묶음 | R 범위 | 파일 |
|---|---|---|
| 페이지·추천 공고·상세 팝업 (+ 화면 구성) | R1–R16 | [req-recommend.md](req-recommend.md) |
| 프로필 (+ 화면 구성) | R17–R23 | [req-profile.md](req-profile.md) |
| 수집 사이트·어댑터 (+ 화면 구성) | R24–R32 | [req-sources.md](req-sources.md) |
| 공고 수집 | R33–R40 | [req-collect.md](req-collect.md) |
| 필터·항목 추출·적합도 채점 | R41–R53 | [req-analysis.md](req-analysis.md) |
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
| [decisions.md](decisions.md) | 결정 사항 D1–D21 |

## 다른 문서
- 구현 계획: [../plan/index.md](../plan/index.md) (2026-10-27 승인) — 15단계. 어댑터 규칙 형식 v1을 정하고(D16), Gmail은 앱이 직접 Google 인증을 열어 서버가 토큰을 암호화해 둔다(D18). 예약 실행은 pg_cron + 예약 비밀값(D19)
- 테스트 문서: (아직 없음)
- 진행 기록: [../logs/index.md](../logs/index.md)
