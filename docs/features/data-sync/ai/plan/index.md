# 데이터 동기화 (data-sync) 구현 계획 색인

- 기능 명세서: [../spec/index.md](../spec/index.md) · 목업: 없음 (명세 req-settings.md의 화면 구성 + 지금 설정 화면의 줄·버튼 모양)
- 작성일: 2026-11-08 · 상태: 승인됨 (2026-11-08), 구현 대기
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/src/`, SQL은 저장소 `supabase/`) · 파일 목록·데이터 모양·컴포넌트 구조: [structure.md](structure.md)
- 커밋 이름: "데이터 동기화 N단계: …"

## 결정 (계획 중 정함, D6–D9)
- 서버 쓰기는 RPC `daybrick_sync_push` 하나로 한다. 리비전이 같을 때만 쓰고 rev +1, 다르면 충돌을 돌려준다. 읽기는 RLS select (D6).
- 자동 올리기는 로컬 저장 뒤 5초 모아서 바뀐 종류만 올린다 (D7).
- 기능은 저장 성공만 알리고(`notifySaved`), 올릴 내용은 동기화가 로컬 파일을 다시 읽어 만든다. "같음"은 키 정렬 JSON 해시로 비교한다 (D8).
- `SyncProvider`는 `ServerProvider` 안, 기능 Provider 바깥. 기능 store는 다시 읽기 함수를 등록한다 (D9).

### 작은 규칙
- 서버 테이블 `sync_documents`, kind는 `plan`·`calendar`·`applications`·`today`만 (check 제약).
- 로컬 상태 `sync.json`, 백업 `sync-backups/<종류>-<YYYYMMDD-HHmmss>.json` (앱 데이터 폴더).
- 기기 이름은 Windows `COMPUTERNAME`. 못 읽으면 "PC".
- "빈 데이터": 플랜은 카테고리·태스크·프로젝트가 모두 없음, 캘린더는 일정 없음, 지원 관리는 카드 없음, 투데이는 기록·도는 타이머 없음.
- 백업 폴더 열기는 Rust에서 opener 플러그인으로 한다 (JS 경로 권한을 늘리지 않음).
- 순수 함수(`features/sync/compare.ts`·`stableJson.ts`)는 Node로 실행해 확인한다. 테스트 도구는 아직 없다.

## 단계
| 단계 | 이름 | 파일 | 요구사항 |
|---|---|---|---|
| 1 | 서버 테이블·RPC (0010) | [step-01.md](step-01.md) | R3–R6, R8, R28 |
| 2 | 로컬 파일 기반 (sync.json·백업·parse 분리) | [step-02.md](step-02.md) | R11, R13, R21, R33 (바탕) |
| 3 | 판정·서버 호출 | [step-03.md](step-03.md) | R1, R2, R13, R15, R18, R22 |
| 4 | 켜기와 설정 구역 | [step-04.md](step-04.md) | R7, R17, R18, R27, R29, R32 |
| 5 | 자동 올리기 | [step-05.md](step-05.md) | R9–R12, R14, R24, R26, R30 |
| 6 | 선택창·받아오기·백업 | [step-06.md](step-06.md) | R15, R19–R23, R31, R33 |
| 7 | 계정 확인·안전 점검·전체 빌드 | [step-07.md](step-07.md) | R16, R25, R28, 전체 |

## 이번 계획에 넣지 않는 것
- scope.md 제외 항목: 웹·폰, QR, 본문 이미지(D2), PC 여러 대(D4), B안(D1), 서버 데이터 지우기, 로그인 풀림 원인 수정
- 오래된 백업 정리, 실시간 구독, 테스트 도구 도입
