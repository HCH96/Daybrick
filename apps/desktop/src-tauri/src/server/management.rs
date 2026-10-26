//! Supabase 관리 API(`api.supabase.com/v1`) 호출.
//! PAT는 호출마다 인자로만 받고 저장하지 않는다 (D11). 오류는 원인 종류 코드만 돌려준다 (R18).
//! 4단계: PAT 접근 확인(R13), 빈 프로젝트 검사(R14). 5단계 이후 SQL 적용·함수 배포 등을 더한다.

use serde::Serialize;
use serde_json::Value;

use super::http;

const API_BASE: &str = "https://api.supabase.com/v1";

/// 프로젝트 ref는 소문자·숫자만 (주소에 그대로 넣으므로 다른 글자를 막는다)
fn valid_ref(project_ref: &str) -> Result<&str, String> {
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
