# 투데이: 타이머 카드 모양·애니메이션 (R40–R47)
출처: 사용자 시안 Bar.dc.html(달리는 중), Pause.dc.html(일시정지), Goal.dc.html(골인) (2026-11-03).
배치·크기·애니메이션은 시안대로, 색·글꼴은 앱 토큰으로 바꾼다 (D5). 픽셀 좌표와 keyframes는 목업에 그대로 옮겨 두었다:
- 캐릭터: human/mockups/sprites.js (run1·run2·sit·cheer는 시안 좌표, stand는 목업에서 새로 그림)
- 카드·트랙·keyframes: human/mockups/timer.css, 장면 마크업: part-timer.html, part-timer-goal.html

## 카드
| 항목 | 값 |
|---|---|
| 크기 | 440×250 (오른쪽 칸 너비를 채움), padding 22, 위·아래 칸 간격 18 |
| 모서리 | 앱 패널과 같은 12px (시안 16px) |
| 배경·테두리 | --sidebar, --border (시안 #1C1D22) |
| 글자 | 기본 --text, 보조 --muted (시안 #EDEDEF / #9A9BA2), 글꼴은 앱 기본(맑은 고딕) |
| 카테고리 줄 | 13px --muted, 색 점 8px |
| 제목 | 17px 굵게, 한 줄 말줄임 |
| 큰 숫자 | 고정폭 글꼴(앱 --mono) 56px, 자간 -0.03em |
| 보조 문구 | 13px --muted |
| 버튼 | 높이 44, 모서리 10, 간격 8. 일시정지·재개 --accent / --on-accent, 완료 --green-soft / --green, 중단 --surface-2 / --neutral |

## 트랙 (160×130, 제목·숫자를 가리지 않음)
- 바닥선 y=113.5, 길이 0~142, 굵기 3. 지나온 길 카테고리 색 실선, 남은 길 --border-2 점선(4 4).
- 눈금 9개(x 14, 28, 43, 57, 71, 85, 99, 114, 128). 평소 --border-2, 골인 때 카테고리 색 50%.
- 깃발: 기둥 #5e5f66, 꼭지 #6b6c74, 천 --border-2. 골인 때 기둥이 위로 길어지고(y 38~113) 천은 카테고리 색, 꼭지 금색 #f2c94c.
- 캐릭터 가로 위치: 중심 = 진행률 × 142, 왼쪽 끝 = 중심 − 21 (0~100 사이로 자름). 골인이면 깃발 앞 left 92.
- 픽셀 구름 2개(#26272d). 캐릭터는 14×16 그리드를 3배(42×48), crispEdges.
- 캐릭터 색: 머리 #3B2A20, 피부 #F2C9A0(그림자 #D9A97E), 볼 #F29B8B, 상의 카테고리 색 + 명암, 바지 #4B5563, 신발 #E5E7EB(밑창 #8B8D94).
- 툴팁: --text 배경, --bg 글자, 고정폭 12px. 마우스 올림·포커스 때만 보인다.

## 상태별 장면
| 상태 | 캐릭터 | 움직임 (keyframes) |
|---|---|---|
| 달리는 중 | run1·run2 교차 | dbRunA·dbRunB 0.36s, dbBob 3px 0.36s, 먼지 dbDust 0.72s, 구름 dbCloud 9s 좌우 |
| 일시정지 | sit (눈 감음) | dbBreath 3s(scaleY 1→1.04), z z Z dbZ 3s를 1초 간격, 구름 멈춤, 지나온 길 60% |
| 골인 | cheer (두 팔, ^ ^) | dbJump 0.9s 16px, dbShadow, 깃발 dbWave 0.8s, 색종이 8개 dbConf 1.5~2.2s 하루 종일 반복 |
| 골인 + 일시정지 | 깃발 앞 sit | 일시정지와 같음, 깃발 멈춤, 색종이 없음 |
| 빈 상태 | stand | 움직임 없음, 지나온 길 60%, 색은 --accent |
| 공통 | - | 큰 숫자 콜론 dbBlink 2s (일시정지·빈 상태 없음) |

- 색종이 색: 카테고리 색, --accent, 금색 #f2c94c, --text.
- R47: 앱에서는 `@media (prefers-reduced-motion: reduce)`로 반복 움직임을 끈다. 목업은 PC 설정과 상관없이 보이도록 `.reduce-motion` 클래스로만 걸어 두었다.
