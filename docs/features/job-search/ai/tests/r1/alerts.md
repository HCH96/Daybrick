# r1 예약 실행·알림 (A40–A41, req-collect·req-gmail·req-alerts)

## A40 예약 작업과 예약 비밀값
- 테스트 내용: 예약 작업 3개 SQL·시각(일 21:00 UTC = 월 06:00 KST), 예약 비밀값이 틀리면 거절
- 근거 요구사항: R33, R64
- 수행 방법: 0004 전체 읽기, auth.ts `getCaller` 읽기. t2-flow에서 js-process·js-collect·js-gmail에 틀린·빈·맞는 머리글과 사용자 토큰으로 요청
- 예상 결과: 맞음
- 실제 결과:
  - `js-weekly-collect` `0 21 * * 0`(일 21:00 UTC = 월 06:00 KST), `js-continue` 7,22,37,52분(15분마다), `js-daily-mail` `0 22 * * *`(07:00 KST). 이름이 같으면 다시 등록돼 재실행 안전. 예약 함수 4개는 public·anon·authenticated 실행 권한 회수, vault 값이 없으면 부르지 않음
  - 머리글 틀림·없음·잘못된 사용자 토큰 → 401, 맞는 비밀값·올바른 사용자 토큰 → 200. 함수 비밀값이 비어 있으면 빈 머리글도 401. 세 함수 모두 같음
- 판정: 통과

## A41 알림 6종과 탭
- 테스트 내용: 누르면 열릴 탭, 수집 실패 알림 합치기
- 근거 요구사항: R80, R81
- 수행 방법: notify.ts·tabs.ts 읽기, t2-flow 전체에서 `daybrick_notify` 호출 인자 모음. 수집 실패 사이트로 js-collect run 두 번
- 예상 결과: 명세 표와 같음
- 실제 결과:

| 알림 | 탭 (실행 결과) |
|---|---|
| 수집 실패: 사이트C (이유 본문) | sources |
| 새 추천 공고 3개 (대기열을 다 비운 실행) | recommend |
| 메일 제안 4개 | mail |
| AI 하루·월 한도 80% / 초과 | settings |
| Anthropic 크레딧 부족 | settings |
| Gmail 연결 끊김 | settings |

  - 갈 곳은 모두 `{ page: "job-search", tab }`, 탭 id는 앱 tabs.ts의 id와 같음
  - 수집 실패는 두 번 실패해도 합치기 키 `js-collect-fail:<사이트 id>`로 한 행이 갱신됨(2번 합쳐짐)
- 판정: 통과
