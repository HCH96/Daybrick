# r1 수집·규칙 (A11–A15, req-collect·req-sources)

## A11 규칙 실행기
- 테스트 내용: 예시 HTML/JSON에 규칙 실행 (POST·fields.body 포함), delayMs 간격
- 근거 요구사항: R25, R37, D30
- 수행 방법: t1-pure에서 supabase/adapters/gamejob.json·nexon.json을 `validateRule` → `readList`(가짜 응답), `readBodyHtml`. t2-flow에서 js-collect run의 상세 요청 간격 측정. HTML 파서는 deno-dom 대신 linkedom
- 예상 결과: 제목·회사·링크 추출, 기본 1500ms
- 실제 결과:
  - 게임잡(HTML, POST 폼): 2쪽 × 2개 = 4개. 첫 공고 id 101·제목·회사 "(주)넥슨코리아"·링크(base 붙음)·직무(onclick 정규식) 맞음. 폼 본문에 `condition%5Bduty%5D=1`·`page=2` 채움, Content-Type 폼·X-Requested-With 머리글
  - 넥슨(JSON, POST 객체): `"{page}"`가 숫자 1로, Content-Type json. 빈 쪽에서 멈춤(요청 3번). `fields.body`(contents) 읽힘, 없으면 null
  - 본문 HTML → 줄 글("자격 요건\nC++", script 제외)·이미지 절대 주소
  - delayMs 없으면 1500. 쪽 요청 사이 ≥1500ms, 상세 요청 사이 delayMs(300) 이상
- 판정: 통과

## A12 같은 공고 판정
- 테스트 내용: 사이트 안은 id(없으면 주소), 사이트 사이는 회사+정리한 제목
- 근거 요구사항: R35
- 수행 방법: t2-flow. 사이트 A 목록 8건(같은 id, 다른 사이트의 같은 회사·제목 "(주)넥슨코리아/게임 프로그래머!", 같은 사이트의 같은 회사·제목·다른 id, id 없는 같은 주소 2건 등)으로 js-collect run
- 예상 결과: 중복만 걸러짐
- 실제 결과: 새로 넣은 것은 id 3(같은 사이트, 회사·제목이 같아도 id가 다름), id 4, 주소 id 1건 — 3건. 같은 id 1, 다른 사이트와 정리 키가 같은 2·5는 걸러짐. 같은 주소 2건은 목록 단계(`itemKey`)에서 하나로 합쳐져 읽음 수가 7
- 판정: 통과

## A13 수집 실패 판정
- 테스트 내용: 0개 / 필수 칸 빠짐이 절반 초과면 실패(딱 절반은 성공)
- 근거 요구사항: R36
- 수행 방법: t1-pure에서 `judgeList`
- 예상 결과: 경계 맞음
- 실제 결과: 0개 실패, 4개 중 2개 빠짐 성공(null), 3개 중 2개 실패, 1개 중 1개 실패
- 판정: 통과

## A14 원문 재다운로드 안 함·이미지 저장
- 테스트 내용: 받은 원문은 다시 받지 않음, 이미지 본문은 Storage postings/에 저장
- 근거 요구사항: R38, R39
- 수행 방법: js-collect/index.ts 읽기(`fetchBodies`는 `body_text is null`만, `storeImages` 경로). t2-flow에서 run 뒤 bodies 다시 실행
- 예상 결과: 있으면 건너뜀
- 실제 결과: 원문이 있던 기존 공고 2건은 상세 요청 없음, 새 3건만 요청. 본문 글이 200자 미만+이미지 있는 공고는 `job-search` 버킷 `u1/postings/<공고 id>/1.png`에 올리고 image_paths 저장. bodies 다시 실행 → 요청 0·남은 0
- 판정: 통과

## A15 규칙 파일 형식 검사
- 테스트 내용: 빠진 키 이름 반환
- 근거 요구사항: R29, R32
- 수행 방법: t1-pure에서 서버 `validateRule`·앱 `checkRule`·`checkRuleText`·`missingVars`
- 예상 결과: 목록 맞음
- 실제 결과: 잘못된 규칙에 format·name·list.url·list.type·list.item·list.fields.link·detail.url 7개를 이 순서로 돌려줌. 앱도 같은 키·같은 순서(문구 끝맺음만 다름). list 없음, 잘못된 정규식(`list.fields.id.regex`), 사이트 값 빠짐(`dutyCode`), JSON 문법 오류도 알려 줌
- 판정: 통과
