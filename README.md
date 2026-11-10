# Daybrick

개인용 일정·지원·집중 관리 데스크톱 앱입니다.
캘린더 계획, 일정, 취업 지원 현황, 집중 타이머를 한곳에서 관리합니다.

> 개인 프로젝트로 개발 중입니다. 기능과 화면은 계속 바뀔 수 있습니다.

## 주요 기능

| 기능 | 설명 |
|---|---|
| 홈 | 오늘 할 일, 다가오는 일정, 지원 마감, 집중 시간을 한 화면에 요약 |
| 플랜 | 날짜별로 할 일을 계획 |
| 캘린더 | 일정을 등록하고 관리 |
| 지원 관리 | 지원한 회사와 전형 단계·일정을 정리 |
| 구직 관리 | 채용 사이트 공고를 모아 내 프로필 기준으로 AI가 점수를 매겨 추천. Gmail의 전형 결과 메일을 읽어 지원 현황 갱신을 제안 |
| 투데이 | 집중 타이머로 공부 시작·종료를 기록하고 집중 시간을 관리 |
| 프로젝트 | 할 일을 프로젝트 단위로 묶어 관리 |
| 알림·백그라운드 실행 | 창을 닫아도 트레이에서 실행되며 일정·마감 알림 |

앞으로 추가할 기능:
- **집중 모드:** 타이머가 도는 동안 안드로이드 폰에서 지정한 앱(유튜브 등)을 차단
- **공유 웹:** 공부 통계를 보여 주는 공개 페이지와, 지원 현황을 친구에게 보여 주는 링크 공유 페이지

## 구성

```
apps/desktop   PC 앱 (Tauri 2 + React + TypeScript)
apps/web       공유 웹 (React, Vercel 배포, 읽기 전용) - 지금은 안내·개인정보처리방침 페이지만 있음
apps/android   안드로이드 보조 앱 (Kotlin, 예정)
supabase/      DB 마이그레이션, 서버 함수, 채용 사이트 수집 규칙
docs/          앱(플랫폼)별·기능별 명세서·구현 계획·진행 기록·목업
```

## 데이터와 서버

Daybrick은 공용 서버를 쓰지 않습니다. 각 사용자가 **자기 Supabase 프로젝트**를 만들어 연결하고, 데이터는 그 프로젝트에만 저장됩니다.
앱 안의 서버 연결 마법사가 DB 준비와 서버 함수 배포를 도와줍니다.

- 앱에는 anon(또는 publishable) 키만 넣습니다. secret / service_role 키는 앱이 받지 않습니다.
- 구직 관리의 AI 채점에 쓰는 Anthropic API 키와 Gmail 연결용 Google 클라이언트 정보는 사용자의 Supabase 프로젝트에 비밀값으로 저장됩니다.
- 로그인 토큰은 Windows 자격 증명 관리자에 저장됩니다.

## 개발 환경에서 실행

필요한 것: Node.js, Rust, [Tauri 2 사전 준비](https://tauri.app/start/prerequisites/) (Windows 기준으로 개발)

```bash
cd apps/desktop
npm install
npm run tauri dev
```

| 명령 (apps/desktop에서) | 하는 일 |
|---|---|
| `npm run tauri dev` | 개발 모드 실행 (코드 수정 시 자동 반영) |
| `npm run tauri build` | 설치 파일 만들기 (`src-tauri/target/release/bundle/`) |
| `npm run build` | 프론트엔드만 빌드 (타입 검사 포함) |

## 문서

기능별 상태는 [PROJECT.md](PROJECT.md), 문서 목록은 [DOCS_INDEX.md](DOCS_INDEX.md)에서 볼 수 있습니다.
이 프로젝트는 Claude Code와 함께 개발하고 있고, 명세서 → 구현 계획 → 구현 → 테스트 순서로 기능마다 문서를 남깁니다.

## 라이선스

[MIT](LICENSE)
