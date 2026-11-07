# 폴리싱 대상 목록
`/polish <id>`로 하나씩 진행한다. 단위는 페이지 하나이고, 코드 범위 아래의 하위 화면(상세·팝업·모달·빈 상태)까지 함께 맡는다.
기준은 [design-direction.md](design-direction.md). 상태: 대기 / 진행 / 완료. 코드 경로는 `apps/desktop/src/` 기준.
**common을 먼저 끝낸다.** 다른 페이지는 공용 파일(`styles/`, `components/`)을 고치지 않는다.

| 순서 | id | 페이지 | 유형 | 코드 범위 | 기록 위치 | 상태 | 날짜 |
|---|---|---|---|---|---|---|---|
| 0 | common | 공통 기반 | 공통 | `styles/`, `components/` (아래 setup 몫 제외) | docs/common/ai/design/logs/ | 완료 | 2026-11-07 |
| 1 | home | Home | 한눈에 보기 | `pages/home/` | main-page | 완료 | 2026-11-07 |
| 2 | today | Today | 지금 실행 | `pages/today/` | today | 완료 | 2026-11-07 |
| 3 | calendar | Calendar | 시간 축 계획 | `pages/calendar/` | calendar | 완료 | 2026-11-07 |
| 4 | plan | Plan | 시간 축 계획 | `pages/plan/` | plan | 완료 | 2026-11-07 |
| 5 | projects | Projects | 쌓인 기록 | `pages/projects/` | projects | 완료 | 2026-11-07 |
| 6 | applications | Applications | 모음과 관리 | `pages/applications/` | applications | 완료 | 2026-11-07 |
| 7 | job-search | Job Search | 모음과 관리 | `pages/job-search/` | job-search | 완료 | 2026-11-08 |
| 8 | settings | Settings | 가끔 들르는 화면 | `pages/settings/` | server-setup | 완료 | 2026-11-08 |
| 9 | setup | 첫 실행 안내·연결 마법사·서버 화면 | 가끔 들르는 화면 | `pages/server-setup/`, `components/server/ServerUpdateScreen*`, `components/server/ServerRequired*` | server-setup | 대기 | |

기록 위치가 기능명이면 `docs/features/<기능명>/ai/logs/`에 남긴다.

## common에서 할 일
design-direction.md 1부 중 여러 페이지에 한 번에 걸리는 것만 한다. 페이지 제목처럼 각 페이지 파일에 있는 것은 그 페이지 차례에 한다.
- theme.css: 글자 크기·굵기·간격·모서리·움직임 곡선 토큰, 그림자 정리
- 글꼴: Pretendard Variable을 앱 안에 넣고 대체 글꼴 순서 적용, 숫자 tabular-nums
- 페이지 틀: AppLayout 본문 최대 1280px 가운데 정렬 (설정 880은 settings 차례에)
- 사이드바: 활성 메뉴, 줄 높이 34·간격 2, 로고 글자 굵기 600
- 공용 부품: Modal, Popover, ConfirmDialog, EmptyState, SegmentedControl, MiniCalendar, 알림 패널, 서버 배너·이어하기 창·업데이트 안내
- 아이콘: LineIcon 16px·선 1.5 기준 정리
