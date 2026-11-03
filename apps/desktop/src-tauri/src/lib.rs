mod job_search;
mod notifications;
mod plan;
mod server;
mod storage;
mod today;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(server::oauth_listener::OAuthListenerState::default())
        .invoke_handler(tauri::generate_handler![
            storage::load_applications,
            storage::save_applications,
            storage::save_image,
            job_search::load_job_search_local,
            job_search::save_job_search_local,
            notifications::load_notifications,
            notifications::save_notifications,
            plan::load_plan,
            plan::save_plan,
            today::load_today,
            today::save_today,
            server::config::load_server_config,
            server::config::save_server_config,
            server::config::clear_server_connection,
            server::anthropic::check_anthropic_key,
            server::management::check_pat_access,
            server::management::inspect_project,
            server::management::configure_auth,
            server::management::apply_migrations,
            server::management::deploy_functions,
            server::management::set_secrets,
            server::management::ensure_generated_secrets,
            server::management::disable_signup,
            server::management::project_status,
            server::management::restore_project,
            server::oauth_listener::start_oauth_listener,
            server::oauth_listener::wait_oauth_callback,
            server::oauth_listener::cancel_oauth_listener,
            server::credentials::save_refresh_token,
            server::credentials::load_refresh_token,
            server::credentials::delete_refresh_token,
            server::migrations::latest_schema_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
