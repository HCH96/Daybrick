# 지원 관리 계획 7단계: 본문 편집기

- 요구사항: R34–R35
- 목업: popup.html (popup-body)
- 경로 기준: `apps/desktop/src/` (Rust는 `apps/desktop/src-tauri/`)
- 공통 규칙: [index.md](index.md)의 "0. 결정 사항"과 "작은 규칙"

## 할 일
본문 편집기: Tiptap, 이미지 붙여 넣기

## 확인할 결과
`# 제목`, `- 목록`, `**굵게**`를 치는 즉시 서식이 바뀜. 캡처 이미지를 Ctrl+V 하면 보이고, 앱을 다시 켜도 남아 있음. `images/` 폴더에 파일이 생김

## 이 단계에서 만들거나 고칠 파일

### Rust / 설정
| 구분 | 파일 | 내용 | 단계 |
|---|---|---|---|
| 새로 | `src-tauri/src/storage.rs` | `load_applications`, `save_applications`(임시 파일에 쓴 뒤 바꿔치기), `save_image`(바이트를 그대로 받아 `images/`에 저장) | 1, 7 |
| 수정 | `src-tauri/Cargo.toml`, `tauri.conf.json` | 이미지 표시용 asset 프로토콜 켜기 (앱 데이터 폴더 `images/`만 허용) | 7 |
| 수정 | `package.json` | Tiptap 패키지 추가 | 7 |

화면 컴포넌트: pages/applications/detail/: MarkdownBody (각각 파일 + 필요하면 `.css`. 구조는 [structure.md](structure.md) "2. 컴포넌트 구조")
