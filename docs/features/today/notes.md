# 투데이 (today) 작업 노트
갱신: 2026-11-03

## 완료
- 1단계: 메뉴·저장소 틀 (자동 진행, 최종 테스트 대기)
- 2단계: 이번 주 진행 바·칸반 보기 (자동 진행, 최종 테스트 대기)
- 3단계: 타이머 동작·카드 글자 (자동 진행, 최종 테스트 대기)

## 다음 진행
- 4단계: 종료·강제 종료 복구, 태스크 감시 (1분 확인 시각 저장, 창 닫기 때 lastSeenAt 저장, 시작 때 복구, 실행 중 태스크 감시)
- 관련 결정: D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D12 (ai/spec/decisions.md에서 이 줄만 읽기)
- 주의: reducer `finish`는 `{ now, recordIds }`로 열린 구간을 now에서 닫는다 — 복구 때는 now에 `lastSeenAt`을 넣으면 된다(구간 시작보다 이르면 0초 이하라 버려짐). store의 `complete`·`stop`은 `finish` 뒤 `updateTask`를 부르므로, 감시 훅은 running이 이미 비었으면 넘어가면 된다. store는 `stateRef`로 최신 상태를 본다. `lastSeenAt`을 고치는 `touch` 동작은 아직 없다

## 확인할 문서 (경로는 docs/features/today/ 기준, 파일 통째로 읽기)
- ai/plan/step-04.md
- ai/spec/req-timer.md
- ai/logs/L07.md
- ai/plan/structure.md의 "공용 데이터 (features/today/)" 표 (새 파일 위치를 정할 때만)
