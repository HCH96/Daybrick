# 서버 연결 (server-setup) 작업 노트
갱신: 2026-10-26

## 완료
- 1단계: 설정 화면 틀과 연결 정보 저장 (자동 진행, 최종 테스트 대기)
- 2단계: 첫 실행 안내와 마법사 틀 (자동 진행, 최종 테스트 대기)
- 3단계: ② 주소·키 확인 (자동 진행, 최종 테스트 대기)
- 4단계: ③ 자동 세팅 입력과 사전 확인 (자동 진행, 최종 테스트 대기)
- 5단계: 서버 구조 1번과 자동 세팅 실행 (자동 진행, 최종 테스트 대기)
- 6단계: Google 로그인과 ④ 완료 (자동 진행, 최종 테스트 대기)
- 7단계: 접속 확인·안내 띠·재개 (자동 진행, 최종 테스트 대기)
- 8단계: 서버 업데이트·앱 업데이트 안내 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 9단계: 설정 서버 연결 칸과 관리 작업 (ServerSection 상태별 칸·ServerSectionConnected·로그인 필요 칸, 키 교체·자동 세팅 다시 실행 팝업, 연결 해제·바꾸기, 비밀값 마무리 점검)
- 관련 결정: D1–D20, D22, D25, D27, D29–D36 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: `pages/settings/ServerSection.tsx`에 8단계가 앱 업데이트 필요 칸(`AppUpdateNotice`, 주황 `settings-state--warn`, `settings-card__pad`)을 먼저 붙였다. 9단계에서 상태별 칸으로 나눌 때 그대로 살린다. 다시 실행 단계 목록은 `RunStepList`(`flow`)·`runSteps`를 재사용할 수 있다.

## 확인할 문서 (경로는 docs/features/server-setup/ 기준, 파일 통째로 읽기)
- ai/plan/step-09.md
- ai/plan/index.md (결정·작은 규칙 칸)
- ai/spec/req-settings.md
- ai/spec/req-auth.md (R32, R36)
- ai/logs/L13.md
- human/mockups/settings.html의 settings-server·settings-actions·settings-login 구역 (CSS: settings.css·common.css에서 클래스 검색)
- human/mockups/part-key-replace.html의 key-replace·rerun-setup 구역, part-confirm.html의 confirm-disconnect·confirm-switch 구역 (CSS: parts.css·common.css에서 클래스 검색)
- ai/plan/structure.md의 화면 표 9단계 줄, 3. 컴포넌트 구조
