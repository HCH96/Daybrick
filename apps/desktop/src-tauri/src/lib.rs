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
            server::config::clear_server_connection
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
