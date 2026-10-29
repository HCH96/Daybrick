# 구직 관리 AI 테스트 r1 (2026-10-28)

## 테스트 환경
- Windows 11, Node 24.20 (`--experimental-transform-types`로 .ts 직접 실행), TypeScript 6.0.3, Rust cargo
- 이 PC에 Deno·Postgres 없음 → 서버 함수는 **대용 실행**(Deno·supabase-js·deno-dom 자리에 가짜 모듈, HTML은 linkedom), SQL은 **코드 읽기·글자 비교**만
- 임시 스크립트는 세션 임시 폴더에만 두고 저장소에 넣지 않음 (t1-pure 73건, t2-flow 59건, t3-sql 9건 확인 모두 통과)

## 방법
- 순수 함수: 서버·앱 모듈을 그대로 불러와 경계값을 넣고 결과 비교
- 서버 흐름: `Deno.serve`로 등록된 함수 처리기를 잡아 요청을 직접 보냄. DB는 메모리 표, Anthropic·Google·Gmail·사이트는 가짜 fetch
- 화면(tsx)은 실행하지 않고 해당 줄만 읽음 (A26·A28 일부)

## 결과 한눈에 보기
| ID | 판정 | 파일 | ID | 판정 | 파일 |
|---|---|---|---|---|---|
| A1 | 통과 | common.md | A22 | 통과 | analysis.md |
| A2 | 통과 | common.md | A23 | 통과 | analysis.md |
| A3 | 통과 | common.md | A24 | 통과 | analysis.md |
| A4 | 통과 | common.md | A25 | 통과 | recommend.md |
| A5 | 통과 | common.md | A26 | 통과 | recommend.md |
| A6 | 통과 | usage.md | A27 | 통과 | recommend.md |
| A7 | 통과 | usage.md | A28 | 통과 | recommend.md |
| A8 | 통과 | usage.md | A29 | 통과 | recommend.md |
| A9 | 통과 | usage.md | A30 | 통과 | apply.md |
| A10 | 통과 | usage.md | A31 | 통과 | apply.md |
| A11 | 통과 | collect.md | A32 | 통과 | apply.md |
| A12 | 통과 | collect.md | A33 | 통과 | apply.md |
| A13 | 통과 | collect.md | A34 | 통과 | apply.md |
| A14 | 통과 | collect.md | A35 | 통과 | gmail.md |
| A15 | 통과 | collect.md | A36 | 통과 | gmail.md |
| A16 | 통과 | analysis.md | A37 | 통과 | gmail.md |
| A17 | 통과 | analysis.md | A38 | 통과 | gmail.md |
| A18 | 통과 | analysis.md | A39 | 통과 | gmail.md |
| A19 | 통과 | analysis.md | A40 | 통과 | alerts.md |
| A20 | 통과 | analysis.md | A41 | 통과 | alerts.md |
| A21 | 통과 | analysis.md | A42 | 통과 | gmail.md |

**통과 42 · 실패 0 · 확인 불가 0**

## 실패 항목
없음.

## 참고 사항
- 실제 Deno·Supabase·Postgres에서 돌린 것이 아니다. SQL(RLS·예약 작업·js_refilter·0005 정리)은 읽기와 글자 비교로만 확인했고, HTML 파싱은 deno-dom 대신 linkedom으로 돌렸다. 실제 배포에서의 확인은 사용자 테스트 몫.
- 테스트를 짜는 중 5건이 처음에 틀렸으나 모두 테스트 쪽 가정 오류였다 (채점 입력에 본문 대신 제목·추출 항목이 들어감, 같은 주소 공고는 목록 단계에서 이미 하나로 합쳐짐, 가짜 DB에 state 기본값 누락 등). 코드 결함은 아니다.
