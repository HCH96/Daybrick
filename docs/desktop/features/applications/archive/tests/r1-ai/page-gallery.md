# r1 · 페이지·갤러리 (R1–R6)

## A4. 새 카드 기본값
- 근거: R2, R31, 계획 작은 규칙(id는 `crypto.randomUUID()`)
- 수행 방법: `reducer.ts`의 `createApplication`을 직접 실행해 결과 확인
- 예상 결과: 상태 "지원 준비", 세부 단계 없음, 속성 값 없음, 제목·본문 빈칸, 일정 없음, id는 UUID
- 실제 결과: `status: "preparing"`, `stage: null`, `values: {}`, `title: ""`, `body: ""`, `events: []`, id는 36자 UUID (검사 3개 통과)
- 판정: 통과

## A5. 탭 필터·기본 탭·기본 보기
- 근거: R1, R4
- 수행 방법: `schedule.ts`의 `filterByTab` 실행(지원 준비·종료·결과 대기 카드 3개). `ApplicationsPage.tsx` 코드 읽기
- 예상 결과: 진행 중 = 종료가 아닌 카드, 종료 = 종료 카드, 전체 = 모두. 처음 보기는 갤러리, 처음 탭은 진행 중
- 실제 결과: 진행 중 `a,c`, 종료 `b`, 전체 3개. `useState<ApplicationsView>("gallery")`, `useState<GalleryTab>("active")` 확인. 탭 상태는 페이지가 들고 있어 달력을 다녀와도 유지됨
- 판정: 통과

## A6. 마감일 순 정렬
- 근거: R5
- 수행 방법: `sortByDeadline` 실행 (마감일 11/5, 없음, 없음, 10/25 카드 4개)
- 예상 결과: 마감일 가까운 순, 마감일 없는 카드는 맨 뒤(만든 순). 마감일 속성을 지웠으면 만든 순
- 실제 결과: `soon(10/25), late(11/5), none1, none2`. 마감일 속성 없이 정렬하면 만든 날 순서(`late, soon, none1, none2`)
- 판정: 통과
