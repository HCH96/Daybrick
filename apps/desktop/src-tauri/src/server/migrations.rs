//! 앱이 가진 서버 구조 단계(SQL)와 서버 함수 묶음 (R21, D15).
//! 파일 원본은 저장소 `supabase/`에 있고, 빌드 때 `include_str!`로 포함한다.
//! 이 파일의 마지막 단계 번호가 앱의 최신 서버 구조 번호다.
//! 새 기능은 끝에 새 번호를 더하고, 이미 배포한 단계의 SQL은 고치지 않는다 (R27).

/// 서버 구조 단계: (번호, SQL). 번호는 1부터 빠짐없이 차례로.
pub const MIGRATIONS: &[(u32, &str)] = &[(
    1,
    include_str!("../../../../../supabase/migrations/0001_server_setup.sql"),
)];

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
