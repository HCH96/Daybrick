# 접속 확인·안내 띠 (req-health) — r1

## A8. 상태 7가지와 띠 문구·누르면 가는 곳
- 테스트 내용: 상태별 띠 문구와 클릭 동작이 R40 표와 같은지
- 근거 요구사항: R40
- 수행 방법: types.ts `ServerStatus`, messages.ts `BANNER_TEXTS` 출력(onboarding.md와 같은 실행 스크립트), components/server/ServerBanner.tsx 읽음
- 예상 결과: 명세 표와 같음, 연결됨·연결 안 함은 띠 없음
- 실제 결과

| 상태 | 띠 문구 (실행 출력) | 누르면 |
|---|---|---|
| connected | 없음 | — |
| off | 없음 | — (서버 필요 화면은 ServerRequired) |
| login-needed | 로그인이 필요합니다. | 설정 |
| server-update | 서버 업데이트가 필요합니다. | 서버 업데이트 화면(`openUpdate`) |
| app-update | 앱을 업데이트하세요. | 설정 |
| paused | 서버가 일시정지됐습니다. | 재개 안내 팝업(`ResumeDialog`) |
| unreachable | 서버에 접속할 수 없습니다. | 설정 |

  - `BANNER_TEXTS` 키는 정확히 위 5개, `isBannerStatus`가 connected·off를 뺌. 문구는 명세 문장 끝에 마침표만 더해짐
  - "설정"은 `navigate("settings")`로 설정 화면을 엶(서버 연결 칸이 그 안에 있음)
- 판정: **통과**

## A18. 접속 확인이 시작을 막지 않음·간격·띠 숨김
- 테스트 내용: 시작 비차단, 재개 중 10초·접속 불가 3분, 팝업 닫아도 확인 계속, 띠 숨김은 상태별·이번 실행만
- 근거 요구사항: R37, R38, R41, R43, R44, L12
- 수행 방법: useHealthCheck.ts 전체, ServerProvider.tsx, App.tsx `AppScreens`, ResumeDialog.tsx 재개 부분 읽음
- 예상 결과: 충족
- 실제 결과
  - 확인은 `useEffect` 안 비동기 `run()`. 앱은 server.json만 읽으면 그려지고, 확인 결과 전에는 상태를 `connected`로 두어 띠도 없음
  - 상수 `RESUME_RETRY_MS = 10_000`, `UNREACHABLE_RETRY_MS = 3 * 60_000`. 재개 중이고 아직 paused·unreachable이면 10초, 그 밖 unreachable이면 3분 타이머
  - 재개 상태(`resuming`)는 앱 전체 Provider의 훅에 있어 팝업을 닫아도 타이머가 계속됨. 팝업에도 "이 창을 닫아도 확인은 계속됩니다" 문구
  - 숨김은 `dismissedBanners` 배열(상태별)이 React 상태로만 있고 server.json에 저장하지 않음
- 판정: **통과**

## A19. PAT로 재개
- 테스트 내용: 재개가 PAT로 관리 API를 부르고 PAT는 메모리에만
- 근거 요구사항: R42, R43
- 수행 방법: management.ts `requestResume`·`getProjectRunState`, management.rs `project_status`·`restore_project`, ResumeDialog.tsx 읽음
- 예상 결과: 충족
- 실제 결과
  - `GET /v1/projects/<ref>`로 상태를 보고 일시정지(INACTIVE·PAUSED)일 때만 `POST /v1/projects/<ref>/restore`. 이미 켜지는 중이면 기다리기만 함
  - PAT는 팝업의 `useState`에만 있고, 요청 성공 뒤 `setPat("")`로 비운 다음 `startResume()`. 파일 저장 없음
- 판정: **통과**
- 참고: 일시정지 상태 글자 `INACTIVE`는 코드 주석대로 추측이며 실제 일시정지 프로젝트로 확인하지 않음
