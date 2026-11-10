mod background;
mod calendar;
mod job_search;
mod notifications;
mod plan;
mod server;
mod storage;
mod sync;
mod today;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // 중복 실행 막기 (R19): 다른 플러그인보다 먼저 등록해야 한다.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            background::show_main_window(app);
        }))
        .plugin(tauri_plugin_opener::init())
        // 자동 시작 (R13, R15): 로그인 때 --autostart 인자를 붙여 켠다.
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![background::autostart::AUTOSTART_ARG]),
        ))
        // 자동 업데이트 (auto-update D1): Rust에서만 쓰고 프론트 권한은 열지 않는다.
        .plugin(tauri_plugin_updater::Builder::new().build())
        .on_window_event(background::on_window_event)
        .setup(|app| {
            background::setup(app.handle())?;
            Ok(())
        })
        .manage(server::oauth_listener::OAuthListenerState::default())
        .manage(background::quit::QuitState::default())
        .invoke_handler(tauri::generate_handler![
            background::quit::show_main_window,
            background::quit::hide_main_window,
            background::quit::quit_app,
            background::quit::ack_quit_request,
            background::app_settings::load_app_settings,
            background::app_settings::mark_close_notice_seen,
            background::autostart::autostart_status,
            background::autostart::set_autostart,
            storage::load_applications,
            storage::save_applications,
            storage::save_image,
            job_search::load_job_search_local,
            job_search::save_job_search_local,
            notifications::load_notifications,
            notifications::save_notifications,
            plan::load_plan,
            plan::save_plan,
            calendar::load_calendar,
            calendar::save_calendar,
            today::load_today,
            today::save_today,
            sync::load_sync_state,
            sync::save_sync_state,
            sync::write_sync_backup,
            sync::has_sync_backups,
            sync::open_sync_backup_dir,
            sync::sync_device_name,
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
