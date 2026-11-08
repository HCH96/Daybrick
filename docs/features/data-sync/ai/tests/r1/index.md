# data-sync AI 테스트 r1 (2026-11-08)

## 테스트 환경
- Windows 11 Pro, Node v24.20.0, 저장소 main (f820e91 기준)
- 실제 Supabase 서버·앱 실행 없이 코드 읽기, 빌드, Node 순수 함수 실행으로 판정

## 방법
- 빌드: tsc --noEmit, npm run build, cargo check, npm run tauri build
- 순수 함수: compare.ts·stableJson.ts를 임시 스크립트로 가져와 `node --experimental-strip-types` 실행
- 나머지: 0010 SQL, features/sync/*, sync.rs, 기능별 useAutoSave·store 연결부를 읽고 grep으로 확인

## 결과 한눈에 보기
| 항목 | 판정 | 파일 |
|---|---|---|
| A1, A2 | 통과 | [common.md](common.md) |
| A3, A4, A5, A6, A7, A8, A25 | 통과 | [storage.md](storage.md) |
| A12, A13, A14, A15, A16, A17, A18 | 통과 | [upload.md](upload.md) |
| A9, A10, A11, A19, A20, A21 | 통과 | [first-sync.md](first-sync.md) |
| A22, A23, A24 | 통과 | [safety.md](safety.md) |

합계: 통과 25 · 실패 0

## 실패 항목
없음

## 참고 사항
- SQL(A3–A6)은 문장을 읽어 판정했다. 실제 서버에 적용·재실행해 본 것은 아니다.
- 0010의 `drop policy if exists`는 정책을 다시 만들 때만 쓰며 행에는 영향이 없다.
- `npm run build`에 500kB 넘는 청크 경고가 있다 (빌드는 성공).
- 브라우저 미리보기용 `PREVIEW_SCHEMA_VERSION`이 5로 남아 있다. Tauri 앱에서는 Rust 값(10)을 쓰므로 판정에는 영향이 없다.
