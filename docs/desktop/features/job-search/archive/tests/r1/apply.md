# r1 지원하기·지원 관리 연동 (A30–A34, req-apply)

## A30 지원 카드 변환
- 테스트 내용: 상태 "지원 준비", 속성 6개, 본문 요약
- 근거 요구사항: R54
- 수행 방법: t1-pure에서 `buildCard`를 지원 관리 기본 속성(`createDefaultProperties`)으로 실행
- 예상 결과: 맞음
- 실제 결과: 상태 preparing(라벨 "지원 준비"). 제목 + 회사 "넥슨코리아"·직무 "클라이언트 개발"·공고 링크·경력 구분 "경력"(최소 3년)·고용 형태 "정규직". 본문에 "## 자격 요건", "## 우대 사항", "## 적합도 요약 82점 잘 맞음", 날짜가 모호한 일정. `jobLink.serverId` 연결
- 판정: 통과

## A31 일정 제안
- 테스트 내용: 정확한 날짜만 제안, "3월 중"은 본문으로
- 근거 요구사항: R55, R56
- 수행 방법: t1-pure에서 `suggestSchedule` (마감 11/08, 코딩테스트 11/10, 면접 "3월 중", 과제 2026-02-30, 기타 12/01)
- 예상 결과: 맞게 나뉨
- 실제 결과: 제안은 지원 마감(23:59)·코딩테스트(14:00) 2건. 면접 "3월 중"과 없는 날짜(2/30) 과제는 vague(본문)로. other 종류는 제안하지 않음
- 판정: 통과

## A32 서버 지원 건 요약·도메인
- 테스트 내용: 서버에는 요약 칸만, 채용 플랫폼이면 도메인 빈칸
- 근거 요구사항: R57
- 수행 방법: applyApi.ts `createServerApplication`, PostingPopup.tsx 호출부 읽기. t1-pure에서 `mailDomain`
- 예상 결과: 맞음
- 실제 결과: 넣는 칸은 posting_id·company·domain·card_id·status 5개뿐(카드 본문·속성 없음). careers.nexon.com → nexon.com, recruit.ncsoft.co.kr → ncsoft.co.kr, 게임잡·원티드 → null, 주소 없음·잘못된 주소 → null
- 판정: 통과

## A33 상태 동기화 대기 목록
- 테스트 내용: 오프라인 → 연결 뒤 반영, 삭제·종료 → closed
- 근거 요구사항: R58, R59
- 수행 방법: t1-pure에서 `diffLinks`·`withPending`, 메모리 저장(Tauri 밖)으로 `flushPending`을 실패하는 세션·성공하는 세션으로 차례로 실행
- 예상 결과: 경로 맞음
- 실제 결과: 상태 변경 → closed=false, 카드 삭제 → closed=true(이전 상태 유지), 종료로 변경 → closed=true, 새 카드는 보내지 않음. 같은 지원 건 대기는 마지막 하나만. 연결 안 됨이면 3건 그대로, 연결되면 3건 보내고 대기 0
- 판정: 통과

## A34 jobLink 없는 옛 카드 파일 (버전 2)
- 테스트 내용: 읽기 호환
- 근거 요구사항: D20
- 수행 방법: applications/storage.ts·types.ts, src-tauri storage.rs 읽기. t1-pure에서 jobLink 없는 카드로 `findSuggestionCard`·`diffLinks`
- 예상 결과: 호환됨
- 실제 결과: 파일 버전은 그대로 2, `jobLink`는 선택 칸이라 없는 파일도 형식 검사를 통과. Rust는 글자 그대로 읽고 써서 칸을 지우지 않음. 연결 없는 카드는 메일 제안 대상 찾기·상태 동기화에서 무시됨
- 판정: 통과
