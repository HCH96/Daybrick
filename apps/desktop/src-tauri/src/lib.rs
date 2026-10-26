mod server;
mod storage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            storage::load_applications,
            storage::save_applications,
            storage::save_image,
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
            server::migrations::latest_schema_version
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
