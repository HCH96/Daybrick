# r2 공통 (빌드·색·코드 규칙)

## A1. 프론트엔드 빌드
- 테스트 내용: 타입 검사 포함 빌드
- 근거 요구사항: 전체
- 수행 방법: apps/desktop에서 `npm run build 2>&1 | tail -15`
- 예상 결과: 성공
- 실제 결과: `✓ built in 378ms`. 오류 없음. 청크 500kB 초과 경고만 있음(기존)
- 판정: 통과

## A2. Rust 컴파일 확인
- 테스트 내용: `cargo check`
- 근거 요구사항: 계획 5단계
- 수행 방법: apps/desktop/src-tauri에서 `cargo check 2>&1 | tail -5`
- 예상 결과: 성공
- 실제 결과: `Finished dev profile ... in 0.40s`, 종료 코드 0
- 판정: 통과

## A3. theme.css 바탕·테두리 A안 값
- 테스트 내용: 바탕·테두리 토큰이 R19 표·A안과 같고, 보라·글자색은 그대로인지
- 근거 요구사항: R19
- 수행 방법: `grep -nE "--(bg|surface|...):" styles/theme.css`, `git diff 23da8fd~1 HEAD -- styles/theme.css`
- 예상 결과: --bg #131316, --surface #1f1f24, --surface-2 #29292f, --border #2e2e35, --border-2 #3c3c45, --track #34343c, --accent #a68cff, --text #ededf2, --muted #9b9ba8
- 실제 결과: 아홉 값 모두 같음. diff에서 바뀐 줄은 bg·surface·surface-2·border·border-2·track 여섯 개뿐이고 accent·text·muted는 바뀌지 않음
- 판정: 통과

## A4. 수정2 홈 CSS 규칙
- 테스트 내용: 수정2에서 고친 CSS(Upcoming.css, Now.css, ApplicationsSummaryCard.css)에 직접 쓴 색·굵기 700·4배수 아닌 크기·간격이 없는지
- 근거 요구사항: R19 (계획의 작은 규칙)
- 수행 방법: 두 CSS 전체 읽기, `git diff 23da8fd~1 HEAD -- <세 CSS>`의 추가 줄에서 `px`·`#hex`·`rgb`·`font-weight`·`700` 검색
- 예상 결과: 위반 없음
- 실제 결과:
  - 색: 추가 줄에 hex·rgb·hsl 없음. 모두 theme 토큰(var(--…))이고, 색 인라인은 `--tc`(타이머·지원 현황)와 `--c`(칩 띠·깃발). `transparent`·`color-mix(var(--tc) 8%, transparent)`만 있음
  - 굵기: `--fw-medium`·`--fw-semibold`만 씀. 700 없음
  - 크기·간격: 간격은 `--space-*` 토큰. 추가된 px은 48·36·12·4·64·44(4배수), 띠 3px·테두리 1px·포커스 2px·letter-spacing -1px·container 기준 271px(선 굵기·기준값). 글자 크기는 `--fs-*` 토큰
- 판정: 통과
