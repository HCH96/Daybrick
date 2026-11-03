# 프로젝트 (projects) 작업 노트
갱신: 2026-11-04

## 완료
- 1단계: 데이터·공용 계산·메뉴 (자동 진행, 최종 테스트 대기)
- 2단계: 목록 카드·만들기·메뉴·완료 묶음 (자동 진행, 최종 테스트 대기)
- 3단계: 상세 머리·진행 판·뒤로가기 (자동 진행, 최종 테스트 대기)
- 4단계: 단계 칸·태스크 줄 (자동 진행, 최종 테스트 대기)
- 5단계: 단계 편집·골인 (자동 진행, 최종 테스트 대기)
- 6단계: 주간 투입 버블 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 7단계: 최근 활동 잔디 (`heat.ts` → 윗줄 왼쪽 빈 판을 `HeatPanel`로 채우기 + `useTopHighlight`로 버블 ↔ 잔디 서로 강조)
- 관련 결정: D3, D4, D9, D11, D17 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: step-07의 목업 구역 이름 `projects-top-heat`는 실제로는 `projects-heat`다. 윗줄 왼쪽 빈 판은 `ProjectsPage.tsx`의 `<section className="proj-panel" aria-hidden="true" />`. 시간 기록은 `features/projects/time.ts`의 `dayTotalsByProject`(프로젝트별 날짜 → 밀리초), 모닥불은 `campfire.ts`의 `fireByStreak`·`common/Campfire.tsx` — export만 grep. 버블 원은 `top/useBubbleSim`이 매 틱 `<g>`의 opacity를 직접 쓰므로, 흐림(0.3)·흰 테두리·반짝임은 `<g>` 안 원/테두리 요소나 바깥 `<g>`로 따로 얹는다.

## 확인할 문서 (경로는 docs/features/projects/ 기준, 파일 통째로 읽기)
- ai/plan/step-07.md
- ai/spec/req-list.md (R54–R59 줄)
- ai/spec/visual.md의 "최근 활동 잔디" 표 (grep으로 그 표만)
- ai/logs/L09.md
- human/mockups/projects.html의 projects-heat 구역, part-heat-states.html의 heat-by-bubble·heat-by-cell·heat-risk 구역 (CSS: projects.css에서 클래스 검색)
- ai/plan/structure.md의 "새 화면" 표 heat.ts·HeatPanel 줄, `HeatCell` 줄, 컴포넌트 구조 윗줄·useTopHighlight 줄
