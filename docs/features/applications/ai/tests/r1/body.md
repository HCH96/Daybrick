# r1 · 본문 (R34–R35)

## A16. 본문 이미지 저장 경로
- 근거: R35, D17, L13 남은 문제
- 수행 방법: `images.ts`, `bodyExtensions.ts`, `MarkdownBody.tsx`, `src-tauri/src/storage.rs`, `lib.rs`, `tauri.conf.json`, `Cargo.toml` 코드 읽기
- 예상 결과:
  - 이미지는 앱 데이터 폴더의 `images/`에 파일로 저장, 본문에는 `images/파일명` 상대 경로만 씀
  - 화면에 그릴 때 asset 주소로 바꾸고, asset 접근 범위는 `images/` 폴더로 한정
  - 카드가 바뀌면 편집기를 새로 만듦
- 실제 결과:
  - `save_image` 명령이 등록되어 있고, `images/<저장 시각 ms>.<확장자>`로 저장(같은 이름이면 `-1`, `-2`). 허용 확장자 png·jpg·jpeg·gif·webp
  - `resolveImageSrc`는 `images/`로 시작할 때만 `convertFileSrc`로 바꿈. `assetProtocol.scope`는 `$APPDATA/images/**`, `tauri` 의존성에 `protocol-asset` 기능 있음
  - `ApplicationDetailModal`이 `<MarkdownBody key={application.id}>`로 그림
  - 저장 실패 시 `console.error("이미지를 저장하지 못함")`만 하고 화면 안내 없음 (L13 남은 문제 그대로)
- 판정: 통과 (요구사항 위반 아님. 실패 안내는 개선 거리)
- 참고: 즉시 서식(R34), 붙여 넣은 이미지 표시와 재시작 후 유지는 사용자 테스트
