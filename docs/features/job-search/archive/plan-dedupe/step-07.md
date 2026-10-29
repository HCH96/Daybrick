# 구직 관리 수정1 7단계: 상세 팝업 출처·따로 보기

- 요구사항: R92, R93 (영향: R55 지원하기는 대표 링크)
- 목업: `popup.html` (popup-head), `popup-warn.html` (popup-warn-alert 아래 머리) — CSS: popup.css·common.css에서 클래스 검색
- 경로 기준: [index.md](index.md) 맨 위
- 공통 규칙: D39, D40, D54, D57

## 할 일
- `bundleApi.ts`: `unbundlePosting(session, postingId)` → rpc `js_unbundle`. 실패는 `postgrestError`로.
- `postingApi.ts`의 `loadPostingDetail` 뒤 `loadBundleSources([id])`로 팝업 출처를 읽는다 (`PostingDetail.sources`).
- 새 `pages/job-search/popup/PopupSources.tsx`: 묶인 공고가 있을 때만 머리 아래 "출처" 블록. 줄마다 사이트 이름 ↗(누르면 그 공고 링크를 기존 외부 링크 열기 방식으로), 대표 줄에 "(대표)", 각 줄 오른쪽 [따로 보기]. 누르면 확인 없이 실행 → 성공 문구 "따로 볼게요. 다음 처리 뒤 별도 공고로 보여요." → `onChanged`(목록·개수·열린 목록 다시 읽기, D39). 대표를 풀었으면 팝업을 닫는다(대표가 바뀜).
- 지원한 공고 팝업은 [따로 보기]를 끈다 (D57: 지원한 공고는 묶음에서 움직이지 않음).
- 대표의 `body_text`가 아직 없으면(4단계 대표 바뀜 직후) 원문 칸에 "원문을 받는 중이에요. 다음 수집 처리 뒤 보여요." (`messages.ts`).
- [지원하기]는 지금처럼 팝업 공고(대표)의 링크를 쓴다 (R92) — 바꿀 코드 없음, 확인만.

## 목업과 다른 점
- `popup.html`·`popup-warn.html` 머리에 출처 블록이 없다 → 제목·회사·링크 줄 아래, 점수 상자 위에 명세 화면 구성 그림대로 ("출처  스마일게이트 채용 ↗ (대표) / 게임잡 ↗ [따로 보기]"). 인젝션 경고줄은 그대로 맨 위.

## 확인할 결과
- `npx tsc --noEmit`, `npm run build` 성공.
- 묶인 공고가 있는 카드의 팝업에 출처가 사이트 수만큼 보이고, 각 ↗가 그 사이트의 공고를 연다. 묶인 공고가 없으면 블록이 없다.
- 묶인 공고 [따로 보기] → 출처 줄이 사라지고, [지금 평가] 뒤 그 공고가 별도 카드로 나온다. 다시 수집·평가해도 다시 묶이지 않는다 (`unbundled` true).
- 대표 [따로 보기] → 팝업이 닫히고, 남은 공고가 새 대표로 같은 점수로 보인다(AI 호출 없음). 풀린 옛 대표는 처리 뒤 별도 카드.
- **이전 테스트 r1 8번(빈칸)** 다시: 팝업에 제목·회사·링크, 점수·등급, 강점·부족한 점 근거, 추출 항목, 원문, 이미지 크게 보기·Esc.
- **이전 테스트 r1 11번(빈칸)** 다시: 묶음 팝업에서 [지원하기] → 만든 카드의 공고 링크가 대표(자사) 링크이고, 일정 제안 창 동작은 전과 같음. 지원한 공고 팝업의 [따로 보기]는 꺼져 있음.

## 이 단계에서 만들거나 고칠 파일
- `features/job-search/bundleApi.ts`, `postingApi.ts`, `messages.ts`
- 새 `pages/job-search/popup/PopupSources.tsx`, 수정 `PostingPopup.tsx`, `PopupHead.tsx`, `SourceView.tsx`(원문 받는 중), `PostingPopup.css`
