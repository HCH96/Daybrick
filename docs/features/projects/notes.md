# 프로젝트 (projects) 작업 노트
갱신: 2026-11-04

## 완료
- 1단계: 데이터·공용 계산·메뉴 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 목록 카드·만들기·메뉴·완료 묶음 (진행 중 카드 목록·끌기 순서·`…` 메뉴·만들기 창·완료 묶음, 카드 모닥불)
- 관련 결정: D1, D2, D3, D4, D5, D6, D9, D10, D11 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 1단계에서 store에 `addProject(NewProject)`·`updateProject`·`moveProject`·`deleteProject`·`setProjectsDoneOpen`이 이미 있다. 계산은 `features/projects/`의 progress·weeks·time·campfire를 import해서 쓴다 (시간 값은 밀리초). `ProjectsPage`는 지금 제목·`진행 중 N개`·빈 안내만 있다.

## 확인할 문서 (경로는 docs/features/projects/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/spec/req-list.md, ai/spec/req-project.md
- ai/spec/req-detail.md의 R27 줄만 (grep)
- ai/spec/visual.md의 모닥불 단계 표 (grep "모닥불 단계")
- ai/logs/L04.md
- human/mockups/projects.html의 projects-cards·projects-add·projects-done 구역, part-create.html의 create-stage·create-weekly 구역, part-campfire.html의 campfire-small 구역 (CSS: projects.css·parts.css·common.css에서 클래스 검색, 그림은 icons.js에서 id 검색)
- ai/plan/structure.md 1절의 "새 화면" 표 (새 파일 위치를 정할 때)
