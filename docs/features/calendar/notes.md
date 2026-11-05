# 캘린더 (calendar) 작업 노트
갱신: 2026-11-05

## 완료
- 1단계: 메뉴 교체·개인 일정 저장소 (자동 진행, 최종 테스트 대기)
- 2단계: 월 달력 틀·달 넘김 (자동 진행, 최종 테스트 대기)
- 3단계: 칩 4종과 칸 배치 (자동 진행, 최종 테스트 대기)
- 4단계: +N 목록·칩 누르기 (자동 진행, 최종 테스트 대기)
- 5단계: 개인 일정 입력·편집 (자동 진행, 최종 테스트 대기)
- 6단계: 드래그로 옮기기 (자동 진행, 최종 테스트 대기)
- 7단계: 회고 패널 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 8단계: 플랜 연동 (플랜 주간 달력에 개인 일정 층·점선 막대/칩, 시간 없는 일정 날 칸 어둡게, 누르면 캘린더 편집 팝오버)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14, D15, D16, D17 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: 편집 팝오버는 `pages/calendar/personal/PersonalEditPopover.tsx`(props: eventId·anchor(HTMLElement)·onClose)를 그대로 연다. 개인 일정 항목은 `features/calendar/items.ts`의 `buildCalItems`(kind "personal")로 모을 수 있다.
- 주의: 플랜 쪽 막대 줄 배치는 `features/calendar/monthLayout.ts`의 막대 규칙을 쓴다(export만 grep). 개인 일정 칩 모양 CSS는 `pages/calendar/chips/Chips.css`의 `.cal-chip--personal`(클래스만 검색).

## 확인할 문서 (경로는 docs/features/calendar/ 기준, 파일 통째로 읽기)
- ai/plan/step-08.md
- ai/spec/req-plan-link.md (R31–R34)
- ai/logs/L10.md
- human/mockups/part-chips.html의 chips-board 구역 (개인 일정 칩만, CSS: calendar.css에서 `.ch.p` 검색)
- ai/plan/structure.md의 `pages/plan/calendar/` 줄 (새 파일 위치를 정할 때만)
