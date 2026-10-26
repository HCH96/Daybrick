# 서버 연결 (server-setup) 명세서 색인

## 기능 개요
사용자마다 자기 Supabase 프로젝트와 Anthropic API 키를 Daybrick에 연결한다. 첫 실행 안내, 빈 서버 자동 세팅, 서버 구조 갱신, 로그인, 접속 확인과 일시정지 안내, 설정 화면을 만든다. notifications와 job-search의 선행 기능이다.

## 요구사항 (묶음 → 파일)
| 묶음 | R 범위 | 파일 |
|---|---|---|
| 첫 실행·설치 가이드 (+ 화면 구성) | R1–R10, R54 | [req-onboarding.md](req-onboarding.md) |
| 자동 세팅 (+ 화면 구성) | R11–R19 | [req-auto-setup.md](req-auto-setup.md) |
| 서버 구조 갱신 | R20–R27 | [req-migrations.md](req-migrations.md) |
| 로그인(Google)·계정·데이터 보호 | R28–R36, R51–R53 | [req-auth.md](req-auth.md) |
| 접속 확인·일시정지 (+ 화면 구성) | R37–R44 | [req-health.md](req-health.md) |
| 설정 화면 (+ 화면 구성) | R45–R50 | [req-settings.md](req-settings.md) |

## 나머지 파일
| 파일 | 내용 |
|---|---|
| [data.md](data.md) | 다룰 데이터와 저장 위치, 비밀값 규칙 |
| [scope.md](scope.md) | 제외, 나중에 고려할 것, 계획 단계에서 확인할 것 |
| [mockup.md](mockup.md) | 목업 경로(2026-10-26 승인)와 목업에서 정한 것 |
| [decisions.md](decisions.md) | 결정 사항 D1–D19 |

## 다른 문서
- 구현 계획: [../plan/index.md](../plan/index.md) (2026-10-26 승인). 관리 API·로그인 수신은 Rust에서, 계정 하나 허용은 첫 로그인 뒤 가입 막기, 자격 증명 관리자에는 refresh 토큰만 (D11–D17)
- 테스트 문서: (아직 없음)
- 진행 기록: [../logs/index.md](../logs/index.md)
