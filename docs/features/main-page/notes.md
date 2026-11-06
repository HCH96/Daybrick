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
- 7단계: 새 추천 공고 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 8단계: 마무리 (목업 비교 정리, R27 쓰기 호출 grep 점검, `CardSize` wide 등 안 쓰는 코드 정리, files.md·extension.md 갱신)
- 수정 계획: 근거 기록 L34, 커밋 접두어 "메인 페이지 수정1"
- 관련 결정: D1, D3, D4, D9, D10, D11, D12, D13, D14, D15, D16, D17 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 화면 확인(창 크기·자정 넘김)은 하지 않고 테스트 메모로 남긴다. `npm run tauri build`는 step-08 확인할 결과에 있으니 `npm run build` 뒤에 돌린다. 새 파일은 pages/home/{upcoming,now,week,projects,jobs}/ 아래와 features/home/(upcoming·summary·weekFocus·projectRows·newPostings).ts다.

## 확인할 문서 (경로는 docs/features/main-page/ 기준, 파일 통째로 읽기)
- ai/plan/index.md
- ai/plan/step-08.md
- ai/spec/req-home.md, ai/spec/req-home-cards.md
- ai/logs/L43.md
- ai/spec/files.md, ai/spec/extension.md (고칠 문서)
- ai/plan/structure.md (새 파일 구조를 files.md에 옮길 때)
- human/mockups/dash.html의 dash-head·dash-summary·dash-upcoming·dash-now·dash-week·dash-projects·dash-apps·dash-jobs 구역 (CSS: dash.css·common.css에서 클래스 검색, 비교만)
