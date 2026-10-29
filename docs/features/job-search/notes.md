# 구직 관리 (job-search) 작업 노트
갱신: 2026-10-29

## 완료
- 이전 계획 15단계 + AI 테스트 r1 통과, 사용자 테스트 r1 진행 중 (archive/plan-initial/, 이후 수정 L20–L32)
- 수정 계획: 수정1 7단계 (승인, L34)
- 1단계: 서버 구조 7번 (칸·stage·백업·SQL 함수) (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 수집 사이트 자사 여부 (api.ts own_site 읽기·setSiteOwn·addSite, 사이트 표 자사 스위치, 추가 창 체크)
- 수정 계획: 근거 기록 L33, 커밋 접두어 "구직 관리 수정1"
- 관련 결정: D32, D33, D34, D54, D57, D58 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `parseSite`는 이미 `own_site`를 읽는다(1단계). `loadSources`의 select 칸 목록에 `own_site`만 더하면 된다.

## 확인할 문서 (경로는 docs/features/job-search/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/spec/req-sources.md
- ai/logs/L35.md
- human/mockups/sources.html의 sources-table 구역, part-add-site.html의 add-site-form 구역 (CSS: manage.css·common.css에서 클래스 검색)
