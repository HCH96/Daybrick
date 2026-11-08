# 데이터 동기화 (data-sync) 명세서 색인

## 기능 개요
PC 앱의 로컬 JSON(플랜·캘린더·지원 관리·투데이)을 사용자 본인 Supabase에 기능별 한 행(JSONB)으로 올린다. 로컬 파일은 계속 원본이고 서버는 나중에 웹·폰이 읽을 복사본이다. 이번 범위는 PC → 서버 올리기와 재설치 때의 복구까지.

## 요구사항 (묶음 → 파일)
| 묶음 | R 범위 | 파일 |
|---|---|---|
| 대상·서버 저장 | R1–R8 | [req-storage.md](req-storage.md) |
| 올리기 | R9–R16 | [req-upload.md](req-upload.md) |
| 처음 켜기·서버와 다를 때 | R17–R23 | [req-first-sync.md](req-first-sync.md) |
| 로그인 풀림·끄기 안전 | R24–R28 | [req-safety.md](req-safety.md) |
| 설정 화면 (+ 화면 구성) | R29–R33 | [req-settings.md](req-settings.md) |

## 나머지 파일
| 파일 | 내용 |
|---|---|
| [data.md](data.md) | 서버 테이블, 로컬 동기화 상태, 백업 파일 |
| [scope.md](scope.md) | 제외, 나중에 고려할 것, 계획 단계에서 확인할 것 |
| mockup.md | (아직 없음) |
| [decisions.md](decisions.md) | 결정 사항 D1–D10 |

## 다른 문서
- 구현 계획: [../plan/index.md](../plan/index.md) (2026-11-08 승인). 서버 쓰기는 RPC `daybrick_sync_push`(리비전 비교), 자동 올리기는 저장 뒤 5초, 같음 판정은 키 정렬 JSON 해시 (D6–D8)
- 테스트 문서: (아직 없음)
- 진행 기록: [../logs/index.md](../logs/index.md)
- 선행 기능: [server-setup 명세](../../../server-setup/ai/spec/index.md) (세션·서버 구조 번호·RLS 규칙)
