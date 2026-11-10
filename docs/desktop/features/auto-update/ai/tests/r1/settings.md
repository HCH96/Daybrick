# 설정 화면 (req-settings)

## A13 화면 문구
- 테스트 내용: 설정 업데이트 줄과 확인 창의 문구가 명세와 같은지
- 근거 요구사항: R11, R12, R15, R17, R22, R23
- 수행 방법: pages/settings/UpdateRow.tsx(`ResultText`, `UpdateRow`), components/updater/UpdateDialogs.tsx 읽기
- 예상 결과: "확인 중…", "최신 버전이에요", "업데이트를 확인하지 못했어요. 인터넷 연결을 확인해 주세요.", "개발 모드에서는 업데이트할 수 없어요", "타이머가 실행 중이에요. 기록을 저장하고 설치할까요?", [기록 저장하고 설치]/[나중에 설치], "업데이트를 받지 못했어요. 다시 시도해 주세요.", "업데이트 파일을 확인하지 못해 설치하지 않았어요.", "설치하고 다시 시작", "업데이트 확인"
- 실제 결과: 열 문구가 모두 글자 그대로 있음. 버튼은 checking일 때 "확인 중…", 아니면 "업데이트 확인". 확인 창은 message·confirmLabel·cancelLabel로 세 문구를 씀
- 판정: 통과

## A14 알림에서 설정 "앱" 칸으로 이동
- 테스트 내용: 설정 화면이 이동 의도의 tab으로 스크롤하는지
- 근거 요구사항: R8
- 수행 방법: pages/settings/SettingsPage.tsx의 `sections`, `usePageIntent` 부분 grep
- 예상 결과: usePageIntent("settings")로 intent.tab 칸까지 스크롤
- 실제 결과: `usePageIntent("settings", (intent) => …)`에서 `intent.tab`이 칸 id 목록에 있으면 `scrollTo(intent.tab)`. 칸 목록에 `{ id: "app", label: "앱" }`이 있어 알림 target의 tab `app`과 맞음
- 판정: 통과
