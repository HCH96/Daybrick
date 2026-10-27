//! 앱이 가진 서버 구조 단계(SQL)와 서버 함수 묶음 (R21, D15).
//! 파일 원본은 저장소 `supabase/`에 있고, 빌드 때 `include_str!`로 포함한다.
//! 이 파일의 마지막 단계 번호가 앱의 최신 서버 구조 번호다.
//!
//! 이후 기능(notifications, job-search 등)이 서버 구조를 바꿀 때의 규칙 (R27, D2):
//! 1. `supabase/migrations/NNNN_<기능>.sql` 새 파일을 만들고, 아래 `MIGRATIONS` 끝에 다음 번호로 더한다.
//!    번호는 1부터 빠짐없이 차례로 쓴다. 단계 SQL은 `begin … 번호 기록 … commit` 한 묶음으로 적용된다 (D16).
//! 2. 이미 배포한 단계 파일(앱 버전에 실려 나간 번호)은 고치지 않는다. 고칠 것이 있으면 새 번호로 덧붙인다.
//! 3. 서버 함수는 `supabase/functions/<이름>/`에 두고 `FUNCTIONS`에 더한다. 함수는 번호 없이 매번 묶음 전체를 다시 배포한다.
//! 4. 새 테이블은 `user_id`와 본인 행만 허용하는 RLS를 가진다 (D5).
//!
//! 번호를 더한 앱을 켜면 접속 확인이 "서버 업데이트 필요"를 알리고, 서버 업데이트 화면이 빠진 단계를 적용한다.

/// 서버 구조 단계: (번호, SQL). 번호는 1부터 빠짐없이 차례로.
pub const MIGRATIONS: &[(u32, &str)] = &[
    (
        1,
        include_str!("../../../../../supabase/migrations/0001_server_setup.sql"),
    ),
    (
        2,
        include_str!("../../../../../supabase/migrations/0002_notifications.sql"),
    ),
    (
        3,
        include_str!("../../../../../supabase/migrations/0003_job_search.sql"),
    ),
];

/// 앱이 무작위 값으로 만들어 두는 서버 함수 비밀값 (job-search D19).
/// 서버 업데이트·자동 세팅 때 서버에 없는 것만 만들고, 이미 있으면 값을 바꾸지 않는다.
pub const GENERATED_SECRETS: &[&str] = &["DAYBRICK_CRON_SECRET", "GMAIL_TOKEN_KEY"];

/// vault에도 같은 값을 넣는 비밀값과 vault 이름 (예약 작업이 SQL에서 읽음, job-search 15단계)
pub const VAULT_COPIES: &[(&str, &str)] = &[("DAYBRICK_CRON_SECRET", "daybrick_cron_secret")];

/// 서버 함수 하나: 배포 이름(slug), 진입 파일, 함께 올릴 원본 파일들 (경로는 `supabase/functions/` 기준)
pub struct EdgeFunction {
    pub slug: &'static str,
    pub entrypoint: &'static str,
    pub files: &'static [(&'static str, &'static str)],
}

const CORS: (&str, &str) = (
    "_shared/cors.ts",
    include_str!("../../../../../supabase/functions/_shared/cors.ts"),
);

/// 구직 관리 공용: 호출자 확인·서비스 클라이언트 (js- 함수 묶음에 함께 올린다)
const AUTH: (&str, &str) = (
    "_shared/auth.ts",
    include_str!("../../../../../supabase/functions/_shared/auth.ts"),
);

/// 구직 관리 공용: Claude 호출·한도 검사·호출 기록 (js- 함수 묶음에 함께 올린다)
const AI: (&str, &str) = (
    "_shared/ai.ts",
    include_str!("../../../../../supabase/functions/_shared/ai.ts"),
);

/// 구직 관리 공용: AI 프롬프트와 출력 형식 (AI를 부르는 js- 함수 묶음에 함께 올린다)
const PROMPTS: (&str, &str) = (
    "_shared/prompts.ts",
    include_str!("../../../../../supabase/functions/_shared/prompts.ts"),
);

/// 구직 관리 공용: 어댑터 규칙 검사·실행 (수집 함수 묶음에 함께 올린다)
const ADAPTER: (&str, &str) = (
    "_shared/adapter.ts",
    include_str!("../../../../../supabase/functions/_shared/adapter.ts"),
);

/// 구직 관리 공용: 같은 공고 판정 키
const DEDUPE: (&str, &str) = (
    "_shared/dedupe.ts",
    include_str!("../../../../../supabase/functions/_shared/dedupe.ts"),
);

/// 구직 관리 공용: 필터 판정 (처리 함수 묶음에 함께 올린다, D35)
const FILTERS: (&str, &str) = (
    "_shared/filters.ts",
    include_str!("../../../../../supabase/functions/_shared/filters.ts"),
);

/// 구직 관리 공용: 알림 보내기 (15단계에서 js- 함수 묶음에 넣는다)
#[allow(dead_code)]
const NOTIFY: (&str, &str) = (
    "_shared/notify.ts",
    include_str!("../../../../../supabase/functions/_shared/notify.ts"),
);

/// 앱이 배포하는 서버 함수 전체. 단계별로 나누지 않고 매번 이 묶음을 다시 배포한다 (D16).
pub const FUNCTIONS: &[EdgeFunction] = &[
    EdgeFunction {
        slug: "health",
        entrypoint: "health/index.ts",
        files: &[
            (
                "health/index.ts",
                include_str!("../../../../../supabase/functions/health/index.ts"),
            ),
            CORS,
        ],
    },
    EdgeFunction {
        slug: "ai-key-check",
        entrypoint: "ai-key-check/index.ts",
        files: &[
            (
                "ai-key-check/index.ts",
                include_str!("../../../../../supabase/functions/ai-key-check/index.ts"),
            ),
            CORS,
        ],
    },
    EdgeFunction {
        slug: "js-profile",
        entrypoint: "js-profile/index.ts",
        files: &[
            (
                "js-profile/index.ts",
                include_str!("../../../../../supabase/functions/js-profile/index.ts"),
            ),
            CORS,
            AUTH,
            AI,
            PROMPTS,
        ],
    },
    EdgeFunction {
        slug: "js-collect",
        entrypoint: "js-collect/index.ts",
        files: &[
            (
                "js-collect/index.ts",
                include_str!("../../../../../supabase/functions/js-collect/index.ts"),
            ),
            (
                "js-collect/test.ts",
                include_str!("../../../../../supabase/functions/js-collect/test.ts"),
            ),
            CORS,
            AUTH,
            ADAPTER,
            DEDUPE,
        ],
    },
    EdgeFunction {
        slug: "js-process",
        entrypoint: "js-process/index.ts",
        files: &[
            (
                "js-process/index.ts",
                include_str!("../../../../../supabase/functions/js-process/index.ts"),
            ),
            (
                "js-process/steps.ts",
                include_str!("../../../../../supabase/functions/js-process/steps.ts"),
            ),
            (
                "js-process/guard.ts",
                include_str!("../../../../../supabase/functions/js-process/guard.ts"),
            ),
            CORS,
            AUTH,
            AI,
            PROMPTS,
            FILTERS,
        ],
    },
    EdgeFunction {
        slug: "js-gmail",
        entrypoint: "js-gmail/index.ts",
        files: &[
            (
                "js-gmail/index.ts",
                include_str!("../../../../../supabase/functions/js-gmail/index.ts"),
            ),
            (
                "js-gmail/token.ts",
                include_str!("../../../../../supabase/functions/js-gmail/token.ts"),
            ),
            CORS,
            AUTH,
        ],
    },
];

/// 앱의 최신 서버 구조 번호
pub fn latest() -> u32 {
    MIGRATIONS.last().map(|(version, _)| *version).unwrap_or(0)
}

/// 프론트엔드가 앱의 최신 서버 구조 번호를 묻는다 (D24)
#[tauri::command]
pub fn latest_schema_version() -> u32 {
    latest()
}
