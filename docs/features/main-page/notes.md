# 메인 페이지 (main-page) 작업 노트
갱신: 2026-11-09

## 완료
- 이전 계획: 처음 6단계 + B안 5단계 + 제목 표시줄 T1~T3 (archive/plans/), 홈 개편 수정1 8단계 + AI 테스트 r1 통과 (archive/plan-home-revamp/). 사용자 테스트 r1은 대기
- 홈 다듬기 목업 승인 (L49), 수정 계획 승인 (L50)
- 1단계: 색 A안·지원 현황 칸 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 2단계: 다가오는 7일 계산 (빈 날 합치기) (`features/home/upcoming.ts`에 dayParts·groupUpcoming·gapLabel 순수 함수 추가)
- 수정 계획: 근거 기록 L49, 커밋 접두어 "메인 페이지 수정2"
- 관련 결정: D6, D11, D13, D19 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 기존 `buildUpcoming`·`UpcomingDay`·`UpcomingRow` 모양은 바꾸지 않는다. Node 예시 확인은 저장소 밖 임시 폴더에서 한다

## 확인할 문서 (경로는 docs/features/main-page/ 기준, 파일 통째로 읽기)
- ai/plan/step-02.md
- ai/spec/req-home-upcoming.md (R29, R33)
- ai/logs/L51.md
- ai/plan/structure.md의 "파일 목록"의 upcoming.ts 줄과 "데이터 모양" 절
- human/mockups/compare-home-cards.html의 cmp-v1-upcoming 구역 (날짜 열 글자와 "일정 없음" 줄 문구만, CSS는 보지 않음)
