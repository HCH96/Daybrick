# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-27

## 완료
- 1단계: 페이지 틀과 탭 (자동 진행, 최종 테스트 대기)
- 2단계: 서버 구조 3번과 자동 생성 비밀값 (자동 진행, 최종 테스트 대기)
- 3단계: AI 호출 모듈과 설정 탭 (한도·기준 잔액·단가) (자동 진행, 최종 테스트 대기)
- 4단계: 프로필 (자동 진행, 최종 테스트 대기)
- 5단계: 규칙 실행기와 수집 함수 (기본 어댑터) (자동 진행, 최종 테스트 대기)
- 6단계: 수집 사이트 탭 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 7단계: 사이트 추가·시험 수집·어댑터 가이드 (`js-collect test`, 앱 형식 검사, 사이트 추가 창, 어댑터 새 버전 교체, 가이드 창)
- 관련 결정: D1–D16, D22–D32 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `SourcesTab`의 [어댑터 가이드]·[사이트 추가]는 지금 `disabled` 단추라 열 창을 연결하면서 `disabled`를 지운다. 저장 뒤에는 `reload()`로 표·카드를 다시 읽는다. 어댑터 카드에는 아직 교체 단추가 없다 (목업은 카드 안 [새 버전 올리기] 단추, step 파일은 ⋯ 메뉴 — 둘 중 하나로 넣는다). 서버 함수 `js-collect` 응답 실패 이유는 `api.ts`의 `COLLECT_REASONS`에 있다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-07.md
- ai/spec/req-sources.md
- ai/logs/L10.md
- human/mockups/part-add-site.html의 add-site-form·add-site-test·add-site-foot 구역 (CSS: common.css·manage.css에서 클래스 검색)
- human/mockups/part-adapter-guide.html의 adapter-guide-toc·adapter-guide-body 구역 (CSS: common.css·manage.css에서 클래스 검색)
- ai/plan/structure.md의 "3. 어댑터 규칙 형식 v1" 절
- supabase/functions/_shared/adapter.ts (`validateRule`과 필수 칸 — 앱 `adapterRule.ts`를 같게 만들 때), supabase/adapters/gamejob.json·nexon.json (가이드 예시)
