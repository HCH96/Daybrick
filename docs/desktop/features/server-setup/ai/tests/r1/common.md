# 공통 (빌드·저장소 규칙) — r1

## A1. 프론트엔드 빌드·타입 검사
- 테스트 내용: `npm run build`, `npx tsc --noEmit` (apps/desktop)
- 근거 요구사항: 전체
- 수행 방법: apps/desktop에서 두 명령 실행, 끝부분 출력 확인
- 예상 결과: 오류 없이 성공
- 실제 결과: vite 빌드 `✓ built in 236ms` (320 모듈). 500kB 넘는 묶음 크기 경고 1건(오류 아님). `tsc --noEmit` 출력 없음, 종료 코드 0
- 판정: **통과**

## A2. Rust 컴파일 확인
- 테스트 내용: `cargo check` (apps/desktop/src-tauri)
- 근거 요구사항: 전체
- 수행 방법: `cargo check 2>&1 | tail -8`
- 예상 결과: 성공
- 실제 결과: `Finished dev profile … in 0.35s`, 경고·오류 없음
- 판정: **통과**

## A3. 설치 파일 빌드
- 테스트 내용: `npm run tauri build`
- 근거 요구사항: step-09
- 수행 방법: apps/desktop에서 실행(백그라운드), 로그 끝부분과 bundle 폴더 확인
- 예상 결과: src-tauri/target/release/bundle/에 설치 파일 생성
- 실제 결과: 종료 코드 0. 생성된 파일
  - `bundle/msi/Daybrick_0.1.0_x64_en-US.msi` (3.23 MiB)
  - `bundle/nsis/Daybrick_0.1.0_x64-setup.exe` (2.39 MiB)
  - 빌드 중 NSIS 도구를 GitHub에서 내려받음(첫 빌드라서)
- 판정: **통과**

## A15. 저장소에 키·주소 하드코딩 없음, .env 무시
- 테스트 내용: 추적되는 파일에 실제 키·주소가 없고 `.env`가 gitignore에 있는지
- 근거 요구사항: R36
- 수행 방법
  - `git grep -nE` 로 `<20자>.supabase.co`, `eyJ…`(20자 이상), `sb_secret_`/`sb_publishable_` 값, `sk-ant-`, `sbp_<hex>`, `GOCSPX-`, `apps.googleusercontent.com` 검색 (lock 파일 제외)
  - 루트 `.gitignore`에서 env 줄 확인, `git ls-files | grep .env`
- 예상 결과: 충족
- 실제 결과
  - 앱 코드(apps/, supabase/)에서 걸린 것은 입력 칸 안내 글자 `"….apps.googleusercontent.com"`, `"GOCSPX-…"`뿐 (값 아님)
  - 목업 HTML 2곳에 예시 값(`sb_publishable_7Hq2…`, `418820395561-k2v9…apps.googleusercontent.com`)이 있음. 모양이 실제 형식과 달라 꾸민 예시로 보임(추측, 실제 키인지 확인할 방법 없음). 앱 코드에는 들어가지 않음
  - `.gitignore`에 `.env`, `.env.*`, `!.env.example`. 추적되는 .env 파일 없음
- 판정: **통과**
