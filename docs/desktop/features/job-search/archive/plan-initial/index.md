# 구직 관리 (job-search) 구현 계획 색인
- 기능 명세서: [../spec/index.md](../../ai/spec/index.md) · 목업: [../../human/mockups/index.html](../../human/mockups/index.html)
- 작성일: 2026-10-27 · 상태: 승인됨 (2026-10-27), 구현 대기
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/src/`, 서버는 저장소 `supabase/`) · 파일 목록·데이터 모양: [structure.md](structure.md)
- 커밋 이름: "구직 관리 N단계: …"
- 3단계부터는 사용자의 테스트용 Supabase·Anthropic 키로 확인한다 (API 비용이 조금 든다).

## 결정 (계획 중 정함, D14–D21)
- 테이블은 `js_` 접두어·본인 행만(RLS), 비공개 버킷 `job-search`. 서버 구조 3번(0003), 예약 실행은 4번(0004) (D14).
- 서버 함수 4개 `js-profile`·`js-collect`·`js-process`·`js-gmail`, 공용 `_shared/`. AI 호출은 모두 `_shared/ai.ts`를 거친다 (D15).
- 어댑터 규칙 형식 v1: structure.md 3절 (D16). 처리 함수는 한 번에 정해진 개수만 처리 (D17).
- Gmail: 앱이 직접 Google 인증, 코드 교환·토큰 암호화는 `js-gmail`, 해제 때 권한 취소 (D18).
- 예약 실행: pg_cron + pg_net + 예약 비밀값. 자동 생성 비밀값은 서버 업데이트 때 없으면 추가 (D19).
- 지원 관리 카드에 선택 칸 `jobLink`, 파일 버전 2 유지 (D20). 로컬 `job-search.json` (D21).

### 작은 규칙
- 모델 id: `claude-haiku-5-5`(추출·인젝션·메일 분류), `claude-opus-5-5`(채점·프로필). 구조화 출력(JSON)만 받는다.
- 페이지 id `job-search`, 탭 id `recommend`·`profile`·`filters`·`sources`·`mail`·`settings`. 알림 `source`는 `job-search`.
- 단가표에 캐시 읽기·캐시 쓰기 칸을 추가한다 (목업 "계획 단계에서 정할 것"). 비용 = 각 토큰 수 × 단가 합.
- 수집 요청 간격 기본 1500ms(규칙 `delayMs`로 바꿈), 처리 함수 한 번에 기본 5개.
- 오류 문구는 `features/job-search/messages.ts` 한 곳. 키·토큰 값은 어떤 문구·기록에도 넣지 않는다.
- 추측으로 정한 것(넥슨 읽기 경로, 무료 플랜 예약 실행·시간 제한, Gmail 갱신 토큰, deno-dom 동작)은 해당 단계 처음에 실제로 확인하고, 다르면 진행 기록에 적는다.

## 단계
| 단계 | 이름 | 파일 | 요구사항 |
|---|---|---|---|
| 1 | 페이지 틀과 탭 | [step-01.md](step-01.md) | R1–R3 |
| 2 | 서버 구조 3번과 자동 생성 비밀값 | [step-02.md](step-02.md) | data.md, R79 |
| 3 | AI 호출 모듈과 설정 탭(한도·잔액·단가) | [step-03.md](step-03.md) | R71–R79 |
| 4 | 프로필 | [step-04.md](step-04.md) | R17–R22 |
| 5 | 규칙 실행기와 수집 함수 | [step-05.md](step-05.md) | R25–R27, R35–R40 |
| 6 | 수집 사이트 탭 | [step-06.md](step-06.md) | R24, R31, R34 |
| 7 | 사이트 추가·시험 수집·어댑터 가이드 | [step-07.md](step-07.md) | R28–R30, R32 |
| 8 | 필터 탭 | [step-08.md](step-08.md) | R42–R45, R47 |
| 9 | 처리 함수 (필터·추출·채점) | [step-09.md](step-09.md) | R41, R44, R48–R53, R74, R78 |
| 10 | 추천 공고 탭 | [step-10.md](step-10.md) | R4–R8, R23, R75 |
| 11 | 상세 팝업·걸러진 공고·보관함 | [step-11.md](step-11.md) | R9–R16, R46, R49 |
| 12 | 지원하기·일정 제안 (지원 관리 수정) | [step-12.md](step-12.md) | R54–R59 |
| 13 | Gmail 연결·해제 | [step-13.md](step-13.md) | R60–R63, R70 |
| 14 | 메일 확인·메일 제안 탭 | [step-14.md](step-14.md) | R64–R69 |
| 15 | 예약 실행과 알림 | [step-15.md](step-15.md) | R33, R36, R74, R80–R81 |

## 이번 계획에 넣지 않는 것
- 자소서·면접 준비, 푸시·OS 알림, 남은 크레딧 조회, 코드 어댑터, Claude 외 AI, Batch API, 지원 관리 전체 서버 동기화, 직접 만든 카드 연결, 테스트 도구 도입.

## 수정 계획
- [fix-rule-ext.md](fix-rule-ext.md): 규칙 v1에 칸 틀·세션 준비·여러 본문 (L30 후속, 완료: L31)
