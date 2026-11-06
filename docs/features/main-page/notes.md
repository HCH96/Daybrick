# 메인 페이지 (main-page) 작업 노트
갱신: 2026-11-07

## 완료
- 이전 계획: 처음 6단계 + B안 5단계 + 제목 표시줄 T1~T3, 2차 AI·사용자 테스트 통과 (archive/plans/)
- 1단계: 카드 틀 6개·세 상태 (자동 진행, 최종 테스트 대기)
- 2단계: 다가오는 7일 (자동 진행, 최종 테스트 대기)
- 3단계: 상단 빠른 추가·요약 줄 (자동 진행, 최종 테스트 대기)
- 4단계: 지금 하는 것 (자동 진행, 최종 테스트 대기)
- 5단계: 이번 주 집중 (자동 진행, 최종 테스트 대기)
- 6단계: 프로젝트 진행·지원 현황 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 7단계: 새 추천 공고 (readOpenedAt 추가, features/home/newPostings.ts, jobs/NewPostingsCard·PostingRow·useHomeRecommend)
- 수정 계획: 근거 기록 L34, 커밋 접두어 "메인 페이지 수정1"
- 관련 결정: D1, D3, D4, D9, D10, D11, D12 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 카드 body는 props 없는 `ComponentType`이라 카드가 훅을 직접 부른다. 세 상태는 `CardState`(loading / error message / empty linkTo·message·description·hideButton)로 그린다. 새 추천 공고 body는 지금 `dashboardCards.tsx`의 임시 CardState 람다다. newPostings는 Node로 확인한다 (저장소 밖 임시 폴더에서 `npx rolldown <entry.ts> --file out.mjs --format esm --platform node` 후 `node`).

## 확인할 문서 (경로는 docs/features/main-page/ 기준, 파일 통째로 읽기)
- ai/plan/index.md
- ai/plan/step-07.md
- ai/spec/req-home-cards.md (R43–R47), ai/spec/req-home.md는 R27 줄만 grep
- ai/logs/L42.md
- human/mockups/dash.html의 dash-jobs 구역, part-empty.html의 empty-jobs-zero·empty-jobs-off 구역 (CSS: dash.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 newPostings.ts·useOpenedAt.ts·jobs/ 줄
