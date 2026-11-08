# 메인 페이지 수정2 2단계: 다가오는 7일 계산 (빈 날 합치기)

- 요구사항: R29, R33
- 목업: `compare-home-cards.html` cmp-v1-upcoming 구역 (날짜 열 글자와 "일정 없음" 줄 문구만 참고)
- 경로 기준: [index.md](index.md) 맨 위

## 할 일
- `features/home/upcoming.ts`에 화면 없는 함수를 더한다 (D19). 모양은 [structure.md](structure.md)의 데이터 모양.
  - `dayParts(dateKey, todayKey)`: 날짜 숫자, "오늘"·"내일"·요일 한 글자, 토·일 표시.
  - `groupUpcoming(days)`: 앞에서부터 훑어 항목 없는 날이 이어지면 gap 하나로 묶는다. 오늘(`isToday`)은 비어도 day로 남긴다.
  - `gapLabel(from, to)`: "11/11 – 11/13", 하루면 "11/12".
- 기존 `buildUpcoming`과 `UpcomingDay`·`UpcomingRow` 모양은 바꾸지 않는다 (요약 줄 `nextEvent`가 쓴다).

## 확인할 결과
- `npx tsc --noEmit` 성공.
- Node로 예시 데이터 확인 (오늘 11/9 월):
  - 오늘 2개, 내일 1개, 11/11~13 없음, 11/14 1개, 11/15 1개 → day(9), day(10), gap(11/11–11/13), day(14), day(15)
  - 오늘 없음, 11/12만 있음 → day(9, 빈 오늘), gap(11/10–11/11), day(12), gap(11/13–11/15)
  - 11/12 하루만 빔 → gapLabel "11/12"
  - `dayParts`: 11/9 → 9·"오늘", 11/10 → 10·"내일", 11/14 → 14·"토"·sat

## 이 단계에서 만들거나 고칠 파일
- `features/home/upcoming.ts`
