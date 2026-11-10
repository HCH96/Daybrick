# 자동 업데이트 완료 기준

- `npm run build`, `cargo check`, `npm run tauri build`가 성공하고 setup.exe와 .sig가 생긴다.
- 개발 모드에서는 확인 요청이 나가지 않는다 (R5, R15).
- 실제 확인: 새 버전 A를 직접 설치하고(R32), 손으로 GitHub에 올린 테스트 릴리즈 B(A보다 큰 번호)를 알림 → 설정 → 설치 → 재시작까지 받는다. 그 뒤에도 데이터가 그대로인지 본다 (R33). release 스크립트가 아직 없으므로 B는 손으로 올린다.
