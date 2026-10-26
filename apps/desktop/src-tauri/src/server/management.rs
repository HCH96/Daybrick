//! Supabase 관리 API(`api.supabase.com/v1`) 호출.
//! PAT는 호출마다 인자로만 받고 저장하지 않는다 (D11). 오류는 원인 종류 코드만 돌려준다 (R18).
//! 4단계: PAT 접근 확인(R13), 빈 프로젝트 검사(R14).
//! 5단계: 인증 설정, 서버 구조 적용, 서버 함수 배포, 비밀값 등록 (R15, R16, R26).
//! 6단계: 첫 로그인 뒤 새 가입 막기 (R29, D12).
//! 7단계: 프로젝트 상태 읽기, 일시정지 재개 (R42, R43).

use serde::Serialize;
use serde_json::Value;

use super::{http, migrations};

const API_BASE: &str = "https://api.supabase.com/v1";

/// 프로젝트 ref는 소문자·숫자만 (주소에 그대로 넣으므로 다른 글자를 막는다)
pub(super) fn valid_ref(project_ref: &str) -> Result<&str, String> {
    let ok = !project_ref.is_empty() && project_ref.chars().all(|c| c.is_ascii_lowercase() || c.is_ascii_digit());
    if ok {
        Ok(project_ref)
    } else {
        Err(http::ERR_NOT_FOUND.to_string())
    }
}

fn project_url(project_ref: &str, tail: &str) -> Result<String, String> {
    Ok(format!("{API_BASE}/projects/{}{tail}", valid_ref(project_ref)?))
}

/// PAT로 이 프로젝트를 읽을 수 있는지 본다 (R13).
/// 401은 틀리거나 만료된 토큰, 403·404는 이 프로젝트에 권한이 없는 토큰이다.
#[tauri::command]
pub async fn check_pat_access(pat: String, project_ref: String) -> Result<(), String> {
    let response = http::client()?
        .get(project_url(&project_ref, "")?)
        .bearer_auth(pat.trim())
        .send()
        .await
        .map_err(http::network_error)?;
    http::check_status(response).map(|_| ())
}

/// 빈 프로젝트 검사 결과 (R14)
#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProjectInspection {
    /// Daybrick 구조 번호 테이블(`daybrick_schema_versions`)이 있는지
    pub has_schema_table: bool,
    /// public 스키마에 있는 Daybrick 것이 아닌 테이블 수
    pub other_tables: u32,
}

const INSPECT_SQL: &str = "select \
  exists(select 1 from pg_tables where schemaname = 'public' and tablename = 'daybrick_schema_versions') as has_schema_table, \
  (select count(*) from pg_tables where schemaname = 'public' and tablename not like 'daybrick\\_%')::int as other_tables";

/// SQL을 실행하고 결과 행 목록을 돌려준다 (`POST /v1/projects/{ref}/database/query`)
async fn run_query(pat: &str, project_ref: &str, sql: &str) -> Result<Vec<Value>, String> {
    let response = http::client()?
        .post(project_url(project_ref, "/database/query")?)
        .bearer_auth(pat.trim())
        .json(&serde_json::json!({ "query": sql }))
        .send()
        .await
        .map_err(http::network_error)?;
    let body: Value = http::check_status(response)?
        .json()
        .await
        .map_err(|_| http::ERR_BAD_RESPONSE.to_string())?;
    match body {
        Value::Array(rows) => Ok(rows),
        _ => Err(http::ERR_BAD_RESPONSE.to_string()),
    }
}

/// 구조 번호 테이블 유무와 다른 테이블 수를 읽는다 (R14)
#[tauri::command]
pub async fn inspect_project(pat: String, project_ref: String) -> Result<ProjectInspection, String> {
    let rows = run_query(&pat, &project_ref, INSPECT_SQL).await?;
    let row = rows.first().ok_or_else(|| http::ERR_BAD_RESPONSE.to_string())?;
    let has_schema_table = row.get("has_schema_table").and_then(Value::as_bool);
    let other_tables = row.get("other_tables").and_then(Value::as_u64);
    match (has_schema_table, other_tables) {
        (Some(has_schema_table), Some(other)) => Ok(ProjectInspection {
            has_schema_table,
            other_tables: u32::try_from(other).unwrap_or(u32::MAX),
        }),
        _ => Err(http::ERR_BAD_RESPONSE.to_string()),
    }
}

/// 응답 본문을 보지 않고 성공 여부만 보는 SQL 실행 (여러 문을 한 요청으로 보낼 때)
async fn run_statement(pat: &str, project_ref: &str, sql: &str) -> Result<(), String> {
    let response = http::client()?
        .post(project_url(project_ref, "/database/query")?)
        .bearer_auth(pat.trim())
        .json(&serde_json::json!({ "query": sql }))
        .send()
        .await
        .map_err(http::network_error)?;
    http::check_status(response).map(|_| ())
}

/// 로그인 결과를 받는 앱의 리디렉션 주소 (127.0.0.1 임시 포트, D13). 포트 와일드카드가 통하는지는 추측.
const REDIRECT_ALLOW: &str = "http://127.0.0.1:*/**";

/// 인증 설정: Google 로그인 켜기(클라이언트 ID·비밀값), 이메일 로그인 끄기, 리디렉션 허용 주소 추가 (R15 1단계).
/// 새 가입 막기(`disable_signup`)는 건드리지 않아 다시 실행해도 켠 상태가 유지된다 (D12).
#[tauri::command]
pub async fn configure_auth(
    pat: String,
    project_ref: String,
    google_client_id: String,
    google_client_secret: String,
) -> Result<(), String> {
    let url = project_url(&project_ref, "/config/auth")?;
    let current: Value = http::check_status(
        http::client()?
            .get(&url)
            .bearer_auth(pat.trim())
            .send()
            .await
            .map_err(http::network_error)?,
    )?
    .json()
    .await
    .map_err(|_| http::ERR_BAD_RESPONSE.to_string())?;

    // 이미 있는 허용 주소는 그대로 두고 앱 주소만 더한다 (R16)
    let existing = current.get("uri_allow_list").and_then(Value::as_str).unwrap_or("");
    let mut allow: Vec<&str> = existing.split(',').map(str::trim).filter(|s| !s.is_empty()).collect();
    if !allow.contains(&REDIRECT_ALLOW) {
        allow.push(REDIRECT_ALLOW);
    }

    let body = serde_json::json!({
        "external_google_enabled": true,
        "external_google_client_id": google_client_id.trim(),
        "external_google_secret": google_client_secret.trim(),
        "external_email_enabled": false,
        "uri_allow_list": allow.join(","),
    });
    let response = http::client()?
        .patch(&url)
        .bearer_auth(pat.trim())
        .json(&body)
        .send()
        .await
        .map_err(http::network_error)?;
    http::check_status(response).map(|_| ())
}

/// 서버의 지금 구조 번호 (구조 기록 테이블이 없으면 0)
async fn current_schema_version(pat: &str, project_ref: &str) -> Result<u32, String> {
    let rows = run_query(pat, project_ref, INSPECT_SQL).await?;
    let has_table = rows
        .first()
        .and_then(|row| row.get("has_schema_table"))
        .and_then(Value::as_bool)
        .ok_or_else(|| http::ERR_BAD_RESPONSE.to_string())?;
    if !has_table {
        return Ok(0);
    }
    let rows = run_query(
        pat,
        project_ref,
        "select coalesce(max(version), 0)::int as version from public.daybrick_schema_versions",
    )
    .await?;
    let version = rows
        .first()
        .and_then(|row| row.get("version"))
        .and_then(Value::as_u64)
        .ok_or_else(|| http::ERR_BAD_RESPONSE.to_string())?;
    Ok(u32::try_from(version).unwrap_or(u32::MAX))
}

/// 서버 구조 적용 결과: 적용 전 번호와 적용 뒤 번호
#[derive(Serialize)]
pub struct AppliedMigrations {
    pub from: u32,
    pub to: u32,
}

/// 서버의 지금 번호 다음부터 앱의 최신 번호까지 차례로 적용한다 (R22).
/// 시작 번호는 프론트가 넘기지 않고 매번 서버에서 읽는다 (실패 뒤 다시 시도해도 성공한 단계를 건너뜀).
/// 단계마다 `begin; SQL; 번호 기록; commit;`을 한 요청으로 보내, 실패하면 그 단계는 적용 전으로 돌아가고
/// 번호는 성공한 단계까지만 오른다 (R26, D16).
#[tauri::command]
pub async fn apply_migrations(pat: String, project_ref: String) -> Result<AppliedMigrations, String> {
    let from = current_schema_version(&pat, &project_ref).await?;
    let app_version = env!("CARGO_PKG_VERSION");
    let mut to = from;
    for (version, sql) in migrations::MIGRATIONS.iter().filter(|(v, _)| *v > from) {
        let statement = format!(
            "begin;\n{sql}\ninsert into public.daybrick_schema_versions (version, app_version) \
             values ({version}, '{app_version}') on conflict (version) do nothing;\ncommit;"
        );
        run_statement(&pat, &project_ref, &statement).await?;
        to = *version;
    }
    Ok(AppliedMigrations { from, to })
}

/// 앱이 가진 서버 함수를 모두 배포한다 (JWT 확인 켬, R35). 같은 이름이면 새 내용으로 바뀐다 (D16).
/// 원본 파일은 멀티파트 `file` 칸에 `supabase/functions/` 기준 경로를 파일 이름으로 붙여 보낸다.
#[tauri::command]
pub async fn deploy_functions(pat: String, project_ref: String) -> Result<(), String> {
    let base = project_url(&project_ref, "/functions/deploy")?;
    for function in migrations::FUNCTIONS {
        let metadata = serde_json::json!({
            "entrypoint_path": function.entrypoint,
            "name": function.slug,
            "verify_jwt": true,
        });
        let mut form = reqwest::multipart::Form::new().text("metadata", metadata.to_string());
        for (path, content) in function.files {
            let part = reqwest::multipart::Part::text(*content)
                .file_name(*path)
                .mime_str("application/typescript")
                .map_err(|_| http::ERR_BAD_RESPONSE.to_string())?;
            form = form.part("file", part);
        }
        let response = http::client()?
            .post(format!("{base}?slug={}", function.slug))
            .bearer_auth(pat.trim())
            .multipart(form)
            .send()
            .await
            .map_err(http::network_error)?;
        http::check_status(response)?;
    }
    Ok(())
}

/// 서버 함수 비밀값 등록 (R15 4단계). 같은 이름이 있으면 새 값으로 바뀐다.
/// 값은 요청 본문에만 싣고 오류에는 넣지 않는다 (R18).
#[tauri::command]
pub async fn set_secrets(
    pat: String,
    project_ref: String,
    anthropic_key: String,
    google_client_id: String,
    google_client_secret: String,
) -> Result<(), String> {
    let body = serde_json::json!([
        { "name": "ANTHROPIC_API_KEY", "value": anthropic_key.trim() },
        { "name": "GOOGLE_CLIENT_ID", "value": google_client_id.trim() },
        { "name": "GOOGLE_CLIENT_SECRET", "value": google_client_secret.trim() },
    ]);
    let response = http::client()?
        .post(project_url(&project_ref, "/secrets")?)
        .bearer_auth(pat.trim())
        .json(&body)
        .send()
        .await
        .map_err(http::network_error)?;
    http::check_status(response).map(|_| ())
}

/// 새 가입 막기(`disable_signup`)를 켠다: 자동 세팅에서 처음 로그인한 계정 하나만 남긴다 (R29, D12).
/// 다른 인증 설정은 건드리지 않는다.
#[tauri::command]
pub async fn disable_signup(pat: String, project_ref: String) -> Result<(), String> {
    let response = http::client()?
        .patch(project_url(&project_ref, "/config/auth")?)
        .bearer_auth(pat.trim())
        .json(&serde_json::json!({ "disable_signup": true }))
        .send()
        .await
        .map_err(http::network_error)?;
    http::check_status(response).map(|_| ())
}

/// 프로젝트 상태 글자를 읽는다 (`GET /v1/projects/{ref}`의 `status`, 예: `ACTIVE_HEALTHY`, `INACTIVE`, `RESTORING`, `COMING_UP`).
/// 일시정지 프로젝트는 `INACTIVE`로 온다고 보았다 (추측, 실제 일시정지 프로젝트로 확인하지 못함).
#[tauri::command]
pub async fn project_status(pat: String, project_ref: String) -> Result<String, String> {
    let body: Value = http::check_status(
        http::client()?
            .get(project_url(&project_ref, "")?)
            .bearer_auth(pat.trim())
            .send()
            .await
            .map_err(http::network_error)?,
    )?
    .json()
    .await
    .map_err(|_| http::ERR_BAD_RESPONSE.to_string())?;
    body.get("status")
        .and_then(Value::as_str)
        .map(str::to_string)
        .ok_or_else(|| http::ERR_BAD_RESPONSE.to_string())
}

/// 일시정지된 프로젝트 재개를 요청한다 (`POST /v1/projects/{ref}/restore`, R42).
/// 요청은 바로 끝나고 서버는 1~2분 뒤 켜진다. 켜졌는지는 프론트가 접속 확인으로 본다 (R43).
#[tauri::command]
pub async fn restore_project(pat: String, project_ref: String) -> Result<(), String> {
    let response = http::client()?
        .post(project_url(&project_ref, "/restore")?)
        .bearer_auth(pat.trim())
        .json(&serde_json::json!({}))
        .send()
        .await
        .map_err(http::network_error)?;
    http::check_status(response).map(|_| ())
}
