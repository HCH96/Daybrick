## 프로젝트
Daybrick: 개인용 일정·지원·집중 관리 데스크톱 앱.
전체 개요, 기능 목록, 개발 순서, 기능별 상태는 PROJECT.md를 참고할 것.

## 언어
- 모든 응답, 계획, 질문, 보고는 한국어로 작성한다.
- 문서(명세서, 계획, 테스트 문서 등)도 한국어로 작성한다.

## 기술 스택
- PC 앱: Tauri 2 + React + TypeScript (apps/desktop)
- 공유 웹: React, Vercel 배포, 읽기 전용 (apps/web)
- 안드로이드 보조 앱: Kotlin, 접근성 서비스로 앱 차단 (apps/android)
- 백엔드: Supabase (인증, DB, 실시간), 스키마는 supabase/

## 문서 규칙
문서는 플랫폼(앱)별로 나누고, 그 안에서 기능별 폴더에 모은다. 색인을 따라 내려가며 **필요한 파일만 통째로 읽는다.** 큰 파일 하나에 몰아 쓰지 않는다.
기능 폴더 안에서는 "주로 누가 읽는가"로 ai/와 human/을 나눈다. 각 문서의 양식은 해당 명령 파일(.claude/commands/)에 있고, 진행 기록·결정 양식은 docs/common/ai/formats/record-format.md에 있다.

```
docs/
  common/ai/                             모든 앱 공용: 기록 양식(formats/), 공용 작업 기록(logs/),
                                         앱 사이 약속(contracts/: Supabase 테이블·실시간 메시지·상태 값)
  <플랫폼>/                               desktop, android, web(시작할 때 만듦)
    index.md                             플랫폼 색인 (기능 허브 + 그 앱 공용 문서)
    common/ai/                           그 앱만 쓰는 공용 문서 (개발 환경, 릴리즈, 디자인 기준)
    features/<기능명>/
      index.md, notes.md                 기능 허브, 작업 노트
      ai/spec/  ai/plan/  ai/logs/       명세서, 구현 계획, 진행 기록
      ai/tests/<회차>/                    AI 테스트 보고서
      human/mockups/  human/tests/       목업, 사용자 테스트 체크리스트
      archive/                           끝난 작업의 보관 문서 (평소 읽지 않음)
```

### 읽는 순서
- 노트가 있으면 노트만 먼저 읽는다. 노트의 "확인할 문서"에 읽을 파일이 다 적혀 있다.
- 노트가 없으면 `DOCS_INDEX.md → 플랫폼 index.md → 기능 index.md → 하위 index(spec·plan·logs·mockups) → 필요한 파일` 순서로 내려간다. 색인을 건너뛰고 폴더 전체를 읽지 않는다. 한 앱의 여러 기능이 같이 쓰는 문서는 docs/<플랫폼>/common/에, 모든 앱이 같이 쓰는 문서는 docs/common/에 있다.
- 다른 기능의 문서가 필요하면 그 기능의 index.md에서 필요한 파일만 찾는다. 다른 플랫폼의 문서는 앱 사이 약속(docs/common/ai/contracts/)으로 충분하면 읽지 않는다.

### 크기 기준
- 색인 파일(index)은 40줄, 일반 파일은 150줄 안팎을 넘기지 않는다. 넘을 것 같으면 같은 폴더 안에서 파일을 나누고 색인에 올린다.
- 파일을 추가·삭제·이름 변경하면 같은 작업에서 그 폴더의 색인을 고친다. 기능 허브·플랫폼 색인·DOCS_INDEX.md는 그 아래 색인 파일이 바뀔 때만 고친다.

### 링크와 이동
- 문서(파일·폴더)를 옮기거나 이름을 바꿀 때는 `git mv`나 직접 이동 대신 `node .claude/scripts/move-doc.mjs <원래> <새 경로>`를 쓴다. 가리키는 링크와 글로 적힌 경로를 같이 고친다. 먼저 `--dry-run`으로 볼 수 있다. 색인의 설명 줄 정리와 이름만 적은 언급은 스크립트가 알려 주는 대로 직접 고친다.
- 커밋 전 훅(.githooks/pre-commit)이 `check-links.mjs`로 새로 깨진 링크를 막는다. 알려진 깨진 링크는 .claude/scripts/link-baseline.txt에 있고, 새로 깨진 링크를 이 목록에 넣어 덮지 않는다.
- 진행 기록·AI 테스트 보고서에는 다른 문서를 경로로 링크하지 않고 ID로 적는다 (record-format.md).

## 작업 방식
- 한 번에 플랫폼 하나의 기능 하나씩만 작업하고, 다른 기능의 노트는 읽지 않는다.
- 여러 앱에 걸친 기능(예: 집중 모드)은 앱 사이 약속을 docs/common/ai/contracts/에 먼저 적고, 각 앱의 기능 폴더는 그 약속을 구현하는 내용만 담는다. 약속을 바꾸면 양쪽 기능 노트에 알린다.
- 특정 기능에 속하지 않는 작업(문서 구조 정리 등)의 진행 기록은 docs/common/ai/logs/에 남긴다.
- 새 기능을 시작하기 전에 계획을 먼저 보여주고, 사용자가 승인한 뒤에 구현한다.
- 작업이 끝나면 해당 기능의 진행 기록을 남기고(양식은 record-format.md, 명령 없이 하는 작업도 같다), PROJECT.md에는 그 기능의 상태 한 줄만 갱신한다.
- 끝났다고 말하기 전에 빌드가 성공하는지 확인한다.
- 실제로 실행해서 확인한 것과 추측한 것을 구분해서 말한다.

## 코드 규칙
- TypeScript strict 모드 사용, any 사용 지양
- 컴포넌트와 파일은 작게 나눈다.
- 코드는 apps/ 아래 정해진 폴더에만 둔다.

## 명령어
PC 앱 (apps/desktop에서 실행)
- 의존성 설치: `npm install`
- 실행 (개발 모드, 창이 뜨고 코드 수정 시 자동 반영): `npm run tauri dev`
- 빌드 (설치 파일 생성, 결과물은 src-tauri/target/release/bundle/): `npm run tauri build`
- 프론트엔드만 빌드 (타입 검사 포함): `npm run build`
- 타입 검사만: `npx tsc --noEmit`
- Rust 쪽만 컴파일 확인 (apps/desktop/src-tauri에서): `cargo check`
- 테스트: 아직 테스트 도구 없음 (도입 후 작성)

문서 (프로젝트 루트에서)
- 링크 검사: `node .claude/scripts/check-links.mjs` (`--all` 전부 보기)
- 문서 이동: `node .claude/scripts/move-doc.mjs <원래> <새 경로> [--dry-run]`
- 커밋 전 링크 검사 켜기 (저장소를 새로 받았을 때 한 번): `git config core.hooksPath .githooks`

안드로이드 앱 (apps/android)
- 개발 환경을 정한 뒤 추가 (설치·빌드 절차는 docs/android/common/에 둔다)

## 금지 사항
- Supabase 키 등 비밀값을 코드에 직접 넣지 않는다. .env를 사용하고 .env는 커밋하지 않는다.
- 요청하지 않은 파일 삭제나 대규모 리팩터링은 하지 않는다.
