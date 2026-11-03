# 프로젝트 (projects) 작업 노트
갱신: 2026-11-04

## 완료
- 1단계: 데이터·공용 계산·메뉴 (자동 진행, 최종 테스트 대기)
- 2단계: 목록 카드·만들기·메뉴·완료 묶음 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 3단계: 상세 머리·진행 판·뒤로가기 (방문 기록 `{ page, sub? }`, 카드 누르면 상세, 머리·깃발 트랙·큰 모닥불·누적)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D9, D10, D11, D12, D13 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 시간 값은 `useProjectClock()`(ProjectsPage에서 한 번 부름)의 `clock.byProject.get(id) ?? EMPTY_TIME`(누적·이번 주·마지막 작업일, 분 단위로 내린 밀리초)과 `clock.todayKey`를 넘겨 쓴다. 그림은 `common/ProjectIcons.tsx`의 `FlagDoneArt`·`FlagTodoArt`·`FinishArt`·`RunnerArt`, 모닥불은 `<Campfire fire size={60} />`. `CardMenu`(props: anchor·project·taskCount·onClose)는 삭제 뒤 목록으로 가는 콜백이 아직 없으니 상세에서 쓸 때 더한다. 카드 클릭은 `ProjectCard`에 onClick을 더해 `ProjectList`에서 넘긴다.

## 확인할 문서 (경로는 docs/features/projects/ 기준, 파일 통째로 읽기)
- ai/plan/step-03.md
- ai/spec/req-detail.md, ai/spec/req-project.md
- ai/logs/L05.md
- human/mockups/detail.html의 detail-head·detail-progress 구역, detail-weekly.html의 weekly-progress 구역, part-campfire.html의 campfire-levels 구역 (CSS: detail.css·common.css에서 클래스 검색)
- ai/plan/structure.md 1절의 "고치는 공용 파일" 표(useHistory·navigation 줄)와 "새 화면" 표의 detail/·common/ 줄
