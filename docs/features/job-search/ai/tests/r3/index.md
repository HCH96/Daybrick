# 구직 관리 AI 테스트 r3 (수정2: 일괄 처리·직군 거르기·재등록·애매한 쌍)

- 날짜: 2026-10-30 · 대상: 커밋 31b341d (수정2 1–10단계, 근거 L44, 구현 L45–L55)
- 환경: Windows 11, Node v24.20.0(타입 제거 실행), npm·vite, cargo. deno·Supabase 접속·Anthropic 호출 없음
- 방법: A1은 빌드 명령을 실제로 실행했다. 서버 TS는 임시 tsconfig로 tsc 검사했다. A3·A4·A14·A15·A19는 순수 함수를 Node로 실행했다. A6–A9·A13·A15는 저장소의 `js-process/batch.ts`·`batchResult.ts`·`familyBackfill.ts`·`dedupe.ts`·`_shared/ai.ts`를 **메모리 DB 흉내 + fetch 흉내**로 실행했다(실제 DB·Batch API 아님). A11·A12·A16·A20의 앱 순수 함수도 Node로 실행했다(TZ=Asia/Seoul). 나머지는 코드·SQL 읽기로 판정했다. 임시 스크립트는 저장소 밖 임시 폴더에 두었다

## 결과 한눈에 보기
| ID | 항목 | 판정 | 파일 |
|---|---|---|---|
| A1 | build·tsc·cargo check·서버 TS 검사 | 통과 | [common.md](common.md) |
| A2 | 0008 SQL·FILTER_KINDS | 통과 | [common.md](common.md) |
| A3 | 1차 비개발 낱말 (8건 실행) | 통과 | [filter.md](filter.md) |
| A4 | 2차 개발 직군만·칩 (8건 실행) | 통과 | [filter.md](filter.md) |
| A5 | 추출 프롬프트·스키마 직군 | 통과 | [filter.md](filter.md) |
| A13 | 직군 채우기·옮기기 (10건 실행) | 통과 | [filter.md](filter.md) |
| A6 | batch 순서·40개·30MB·100초 | 통과 | [batch-submit.md](batch-submit.md) |
| A7 | 두 번 맡기지 않음·[그래도 채점] | 통과 | [batch-submit.md](batch-submit.md) |
| A8 | 예상 비용·월 한도·할인·하루 한도 | 통과 | [batch-submit.md](batch-submit.md) |
| A9 | 결과 저장 (15건 실행) | 통과 | [batch-result.md](batch-result.md) |
| A10 | js_cron_continue | 통과 | [batch-result.md](batch-result.md) |
| A11 | [지금 평가]·바로 호출·결과 문구 | 통과 | [batch-result.md](batch-result.md) |
| A12 | 상태 줄 문구 | 통과 | [batch-result.md](batch-result.md) |
| A20 | 회귀: 새 추천 알림·채점 대기·사용액 줄 | 통과 | [batch-result.md](batch-result.md) |
| A14 | isRelisted·재등록 묶기 | 통과 | [dedupe.md](dedupe.md) |
| A15 | pairKind·애매한 쌍 판정 | 통과 | [dedupe.md](dedupe.md) |
| A18 | 팝업 출처 칩·따로 보기 | 통과 | [dedupe.md](dedupe.md) |
| A19 | 회귀: r2 묶기 순수 함수 | 통과 | [dedupe.md](dedupe.md) |
| A16 | 흐름 줄 집계·SourceNames 없음 | 통과 | [recommend.md](recommend.md) |
| A17 | new 표시 | 통과 | [recommend.md](recommend.md) |

합계: 통과 20 · 실패 0

## 실패 항목
없음

## 참고 사항
- A13: 직군 채우기 중에 **채점 일괄에 맡겨진(batch_id) 옛 추출 공고**는 옮기기에서 빠진다. 그 뒤 채점 결과가 오면 `scored`가 되고, 직군이 art여도 추천에 남을 수 있다. 서버 업데이트 직후 첫 실행에서만 생길 수 있다(코드 추적, 실행으로 재현하지는 않음). 사용자가 필터 다시 적용(`js_refilter`)을 하면 옮겨진다.
- A17: new 기준은 공고의 `collected_at`이다. 일괄 처리로 채점이 몇 시간 늦어지면, 수집과 채점 사이에 탭을 열었던 공고는 추천에 처음 나올 때 new가 붙지 않는다. 조건 자체는 R8 문장대로다.
- A6: 앱 [지금 수집]은 일괄을 바로 부르지 않는다. 다음 예약(15분마다)이 원문 받기를 마친 뒤 맡긴다(D71대로).
- A20: 새 추천 알림은 "결과를 저장함"에 더해 "진행 중 일괄 없음·멈춤 없음·held 0"일 때만 간다(기존 D43 조건 유지).
- 실제 Supabase SQL 실행, Deno 실행, 실제 Batch API 응답 모양은 확인하지 않았다. 사용자 테스트로 넘긴다.
