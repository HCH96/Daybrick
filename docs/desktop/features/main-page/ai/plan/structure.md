# 메인 페이지 수정2: 파일·데이터·컴포넌트 구조
경로 기준: `apps/desktop/src/`. 괄호는 만들거나 고치는 단계.

## 파일 목록
```
styles/theme.css                       (1)  고침: --bg, --surface, --surface-2, --border, --border-2, --track 값
pages/home/ApplicationsSummaryCard.tsx (1)  고침: 칸 style을 { "--tc": item.color }로 (softColor 바탕 안 씀)
pages/home/ApplicationsSummaryCard.css (1)  고침: 회색 칸 + 왼쪽 3px 띠 + 숫자만 상태색

features/home/upcoming.ts              (2)  고침: dayParts(dateKey, todayKey), groupUpcoming(days) 추가

pages/home/upcoming/
  UpcomingCard.tsx   (3)  고침: groupUpcoming 결과를 Day / Gap으로 그림
  UpcomingDay.tsx    (3)  고침: 왼쪽 날짜 열 + 오른쪽 칩 목록, 오늘은 연한 보라 바탕
  UpcomingRow.tsx    (3)  고침: 높이 36 칩 (색 띠·배지·점, 제목, 시각, 종류 아이콘)
  UpcomingGap.tsx    (3)  새: "11/11 – 11/13 · 일정 없음" 점선 줄
  Upcoming.css       (3)  다시 씀

pages/home/now/
  NowTimer.tsx       (4)  고침: 배치 다시 짜기, 프로젝트 색(--tc), 오늘 집중 막대
  Now.css            (4)  고침: .now-timer 부분 (목록 부분은 그대로)
```
문서 (5): `docs/desktop/features/main-page/ai/spec/files.md` (UpcomingGap 추가).

## 데이터 모양 (새로 저장하는 것 없음, 화면용 계산 결과만)
```ts
// upcoming.ts에 추가
interface DayParts { day: number; label: string; weekend: "sat" | "sun" | null } // label: "오늘" | "내일" | "토"
type UpcomingBlock =
  | { kind: "day"; day: UpcomingDay }                    // 항목 있는 날, 또는 오늘
  | { kind: "gap"; from: string; to: string };           // 이어진 빈 날 (from === to면 하루)
function groupUpcoming(days: readonly UpcomingDay[]): UpcomingBlock[];
function gapLabel(from: string, to: string): string;     // "11/11 – 11/13" 또는 "11/12"
```
기존 `UpcomingDay`, `UpcomingRow`, `buildUpcoming`은 그대로 쓴다.

## 컴포넌트 구조
```
UpcomingCard
  ├ UpcomingDay (kind "day")  ─ 날짜 열(dayParts) + UpcomingRow × n  (오늘이 비면 "일정 없음" 흐린 글자)
  └ UpcomingGap (kind "gap")
NowCard → NowTimer
  ├ 위: 색 점 + 묶음 이름 · 상태 배지
  ├ 제목
  ├ LiveTimes: 시계(H:MM + 초는 --tc) · 오늘 집중 막대와 글자 (1초마다 다시 그림)
  └ 버튼 줄: [일시정지/재개] [완료] (너비 나눔) + [중단] 아이콘
```

## C++ 비유
- `groupUpcoming`은 정렬된 배열을 한 번 훑으며 연속 구간을 묶는 run-length 묶기와 같다 (`std::vector<Block>` 반환, 입력은 const 참조).
- `--tc` 인라인 변수는 CSS에 넘기는 함수 인자 하나다. 같은 CSS가 인자에 따라 색만 바꾼다.
