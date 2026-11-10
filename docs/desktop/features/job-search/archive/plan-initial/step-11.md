# 구직 관리 11단계: 상세 팝업·걸러진 공고·보관함

- 요구사항: R9–R16, R46, R49 (R14의 [지원하기] 동작은 12단계)
- 목업: popup.html (popup-head, -score, -reasons, -fields, -source, -foot), popup-warn.html (popup-warn-alert, -score, -image, -foot), part-image-zoom.html (image-zoom), filtered.html (filtered-head, -rows), archived.html (archived-head, -rows)
- 경로 기준: `apps/desktop/src/`
- 공통 규칙: [index.md](index.md)의 결정·작은 규칙, 공용 `components/common/Modal.tsx`

## 할 일
- `PostingPopup` (1040px, 창 높이에 맞춤, R10):
  - `PopupHead`: 회사·사이트·수집일 / 제목 20px / 경력·형태·근무지·마감 칩, 오른쪽 [원문 보기](브라우저로 열기)·X.
  - 본문 2열. 왼쪽 `ScoreBox`(점수·등급·한 줄 요약) + `ReasonList`(강점 초록 선·부족한 점 주황 선, 항목마다 "공고"·"프로필" 근거 줄, 없으면 "해당 내용 없음") (R12). 오른쪽 `FieldTable`(이름·값, 날짜 아래 흐린 "원문: …", 없는 항목 "—") + `SourceView`(텍스트 원문 또는 300px 이미지와 "크게 보기").
  - `PopupFoot`: [지원 안 함] [지원하기] (R14).
- 인젝션 의심 (R13, R49): 맨 위 `InjectionAlert`(빨간 경고줄 + 의심 문장 인용), 점수 자리에 "채점 안 함", 아래 [지원 안 함] [그래도 채점] → `js-process force`.
- `ImageZoom` (R11): 창 전체를 어둡게 덮고 크게 보기, −/+ 확대, X·Esc 닫기. 이미지는 Storage 서명 주소로 읽는다.
- 지원 안 함 (R15): 공고 `hidden_at` 기록 → 목록에서 빠지고 보관함으로.
- `FilteredList` (R46): 카드 자리를 목록으로 바꾸고 맨 위 [← 추천 공고]. 단계 고르기(전체/1차/2차/인젝션 의심). 걸린 조건 칩(1차 회색, 2차 파랑, 인젝션 빨강 + 의심 문장). 줄마다 [그래도 채점]. 줄을 누르면 팝업.
- `ArchivedList` (R15–R16): 보관한 공고와 [되돌리기]. 마감 지난 공고는 남겨 두되 [되돌리기]를 끈다.
- R16: 지원·지원 안 함 공고는 `hidden_at`·`applied_at`이 있어 다시 수집돼도(같은 공고 판정) 새 행이 생기지 않고 추천에도 안 나온다. 5단계 중복 판정이 이를 지키는지 확인한다.

## 확인할 결과
- 텍스트 공고 카드를 누르면 팝업 2열이 목업처럼 나오고, 강점·부족한 점마다 근거 두 줄이 보인다.
- 이미지 공고 → 오른쪽에 이미지, "크게 보기" → 어두운 덮개, +/−와 Esc가 동작한다.
- [지원 안 함] → 카드가 사라지고 보관함 숫자가 1 오른다. 보관함 [되돌리기] → 추천 목록에 다시 보인다.
- [걸러진 공고] → 걸린 조건 칩이 단계별 색으로 보인다. [그래도 채점] → 잠시 뒤 추천 목록에 그 공고가 점수와 함께 나온다.
- 인젝션 의심 공고 팝업 → 빨간 경고줄과 의심 문장, "채점 안 함", [그래도 채점] 단추.
- 지원 안 함 공고가 있는 사이트를 다시 수집해도 그 공고가 추천에 다시 나오지 않는다.
- `npm run build` 성공.

## 이 단계에서 만들거나 고칠 파일
- `pages/job-search/popup/PostingPopup.tsx`(+css), `PopupHead.tsx`, `ScoreBox.tsx`, `ReasonList.tsx`, `FieldTable.tsx`, `SourceView.tsx`, `ImageZoom.tsx`(+css), `InjectionAlert.tsx`, `PopupFoot.tsx`
- `pages/job-search/recommend/FilteredList.tsx`, `ArchivedList.tsx`(+css)
- 수정: `pages/job-search/recommend/RecommendTab.tsx`, `RecommendToolbar.tsx`, `features/job-search/api.ts`
