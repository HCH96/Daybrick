# 서버 연결 계획: 파일 목록과 데이터 모양
전체 구조가 필요할 때만 읽는다.

## 1. 파일 목록
### Rust (`apps/desktop/src-tauri/src/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `server/mod.rs` | 하위 모듈 묶음 | 1 |
| `server/config.rs` | `server.json` 읽기·쓰기·지우기 (applications와 같은 임시 파일 바꿔치기) | 1 |
| `server/anthropic.rs` | 키 확인: `GET /v1/models` (요금 없음) | 4 |
| `server/management.rs` | 관리 API(`api.supabase.com/v1`): PAT 접근 확인, 빈 프로젝트 검사, SQL 실행, 함수 배포, 비밀값, 인증 설정, 프로젝트 상태·재개 | 4, 5, 6, 7 |
| `server/migrations.rs` | 단계 목록 `[(번호, include_str!(SQL))]`, 함수 묶음, 최신 번호 | 5 |
| `server/oauth_listener.rs` | 127.0.0.1 임시 포트에서 콜백 한 번 받고 `code` 돌려줌 | 6 |
| `server/credentials.rs` | 자격 증명 관리자에 refresh 토큰 저장·읽기·삭제 (`keyring`) | 6 |
| `lib.rs` | 명령 등록 | 1, 4, 5, 6 |
| `Cargo.toml` | `reqwest`(rustls·json·multipart), `keyring`(windows-native) | 4, 6 |

### 서버 (저장소 `supabase/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `migrations/0001_server_setup.sql` | `daybrick_schema_versions`, `daybrick_server_state`, RLS, 공개 RPC `daybrick_schema_version()` | 5 |
| `functions/_shared/cors.ts` | CORS 머리글·OPTIONS 응답 | 5 |
| `functions/health/index.ts` | 로그인 사용자 확인, 서버 상태 읽기, 번호·키 등록일·이메일 반환 | 5 |
| `functions/ai-key-check/index.ts` | 비밀값 키로 모델 목록 조회, 성공 여부만 반환 | 5 |

### 프론트 로직 (`features/server/`)
| 파일 | 하는 일 | 단계 |
|---|---|---|
| `types.ts` | 아래 2절의 타입 | 1 |
| `config.ts` | Rust `server.json` 명령 감싸기 (Tauri 밖이면 메모리) | 1 |
| `ServerProvider.tsx`, `useServer.ts` | 연결 정보·상태·세션·동작 공유 | 1 (7·9에서 넓힘) |
| `validate.ts` | 주소 형식·프로젝트 id 뽑기, 키 형식(`eyJ…`/`sb_publishable_…`) | 3 |
| `supabaseClient.ts` | 주소·키로 클라이언트 만들기 (세션 저장은 메모리 어댑터) | 3 |
| `probe.ts` | 접속해 보기 → `ProbeResult` | 3 |
| `messages.ts` | 원인별 오류·안내 문구 | 3 (이후 추가) |
| `management.ts` | Rust 관리 API·키 확인 명령 감싸기 | 4 |
| `setupRunner.ts` | 실행 단계 정의, 차례 실행, 실패 단계부터 다시 | 5 |
| `googleLogin.ts` | 수신기 시작 → 브라우저 열기 → code 교환 → 허용 계정 확인 | 6 |
| `session.ts` | refresh 토큰 저장·복원, 로그아웃 | 6 |
| `health.ts`, `useHealthCheck.ts` | 상태 판정, 시작 시·주기 확인 | 7 |
| `serverUpdate.ts` | 빠진 단계 적용 + 함수 재배포 | 8 |

### 화면
| 파일 | 단계 |
|---|---|
| `pages/settings/SettingsPage.tsx`(+css), `ServerSection.tsx`, `ServerSectionOff.tsx` | 1 |
| `pages/server-setup/WelcomeScreen.tsx`(+css) | 2 |
| `pages/server-setup/wizard/WizardShell·WizardProgress·WizardGuide·WizardFooter.tsx`(+css), `guides.ts`, `useWizard.ts`, `PrepareStep.tsx` | 2 |
| `wizard/KeysStep.tsx`, `HelpToggle.tsx`, `CheckResultLine.tsx`, `SecretInput.tsx` | 3 |
| `wizard/SetupInputStep.tsx`, `RedirectUrlRow.tsx` | 4 |
| `wizard/SetupRunStep.tsx`, `RunStepList.tsx` | 5 |
| `wizard/LoginStep.tsx`, `GoogleButton.tsx`, `DoneStep.tsx` | 6 |
| `components/server/ServerBanner.tsx`(+css), `ResumeDialog.tsx`, `ServerRequired.tsx` | 7 |
| `components/server/ServerUpdateScreen.tsx`, `AppUpdateNotice.tsx` | 8 |
| `pages/settings/ServerSectionConnected.tsx`, `KeyReplaceDialog.tsx`, `RerunSetupDialog.tsx` | 9 |
| 수정: `app/types.ts`·`pageLabels.ts`·`pages.ts`, `Sidebar.tsx`, `NavIcons.tsx` | 1 |
| 수정: `App.tsx` (1·2·7·8), `AppLayout.tsx` (7, 띠 자리), `package.json` (3, `@supabase/supabase-js`) | |

## 2. 데이터 모양
```ts
// server.json (앱 데이터 폴더)
interface ServerConfig { version: 1; connection: { url: string; anonKey: string; connectedAt: string } | null;
  welcomeDismissed: boolean; lastCheck: { status: ServerStatus; at: string } | null; }
type ServerStatus = "connected" | "off" | "login-needed" | "server-update" | "app-update"
  | "paused" | "unreachable";
type ProbeResult = { kind: "ok"; schema: number | null }      // null = Daybrick 구조 없음
  | { kind: "bad-url" | "bad-key" | "unreachable" | "paused" };
type RunStepId = "auth" | "schema" | "functions" | "secrets" | "account" | "verify";
type RunStepState = "wait" | "run" | "done" | "fail";
```
서버 테이블 (1번 단계)
- `daybrick_schema_versions(version int pk, applied_at timestamptz, app_version text)`: 로그인 사용자 읽기만.
- `daybrick_server_state(user_id uuid pk → auth.users, anthropic_key_registered_at timestamptz)`: 본인 행만.
- `daybrick_schema_version()`: security definer, anon·authenticated 실행 가능, 최대 번호만 반환.

## 3. 컴포넌트 구조
```
App
 └ ServerProvider
    ├ 연결 흐름 중 → TitleBar + (WelcomeScreen | WizardShell)
    │     WizardShell = WizardProgress + [단계 화면 | WizardGuide] + WizardFooter
    │     단계: Prepare → Keys → (SetupInput → SetupRun | Login) → Done
    ├ 서버 업데이트 중 → ServerUpdateScreen
    └ 평소 → AppLayout
          ├ TitleBar
          ├ ServerBanner → ResumeDialog / ServerUpdateScreen / Settings
          ├ Sidebar (맨 아래 Settings)
          └ 화면 … SettingsPage → ServerSection (Off | Connected | 로그인 필요)
```

## C++ 비유
- `ServerProvider`: 앱 전체가 참조하는 싱글턴 객체. 다른 점은 값이 바뀌면 그 값을 쓰는 화면이 자동으로 다시 그려진다는 것.
- Rust 명령(`#[tauri::command]`): 프론트가 이름으로 부르는 외부 함수(FFI). 인자·반환값은 JSON으로 복사돼 오간다.
- `include_str!`: 빌드 때 파일 내용을 문자열 상수로 박아 넣는 것. `#include`로 리소스를 넣는 것과 비슷.
- `setupRunner`: 단계 객체 배열을 돌며 `run()`을 부르는 상태 기계. 실패하면 그 인덱스를 기억했다가 거기서 다시 시작.
