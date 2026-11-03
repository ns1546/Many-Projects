use tauri::{command, State};
use std::sync::Arc;
use tokio::sync::Mutex;
use moviebox_tui::service::MovieBoxService;
use moviebox_tui::providers::models::{CatalogItem, MediaDetails, ProviderKind, Release};
use moviebox_tui::providers::ReleaseProvider;

struct AppState {
    service: Arc<MovieBoxService>,
}

#[command]
async fn search(
    state: State<'_, AppState>,
    query: String,
    provider: String,
    page: usize,
) -> Result<Vec<CatalogItem>, String> {
    let p = ProviderKind::parse(&provider).unwrap_or(ProviderKind::MovieBox);
    state
        .service
        .search_typed(p, &query, page)
        .await
        .map_err(|e| e.to_string())
}

#[command]
async fn get_details(
    state: State<'_, AppState>,
    id: String,
    provider: String,
) -> Result<MediaDetails, String> {
    let p = ProviderKind::parse(&provider).unwrap_or(ProviderKind::MovieBox);
    state
        .service
        .details_typed(p, &id)
        .await
        .map_err(|e| e.to_string())
}

#[command]
async fn get_streams(
    state: State<'_, AppState>,
    id: String,
    provider: String,
    season: usize,
    episode: usize,
) -> Result<Vec<Release>, String> {
    let p = ProviderKind::parse(&provider).unwrap_or(ProviderKind::MovieBox);
    match p {
        ProviderKind::MovieBox => state.service.client.episode_streams(&id, season, episode).await.map_err(|e| e.to_string()),
        _ => Err("Provider stream fetching not fully implemented in UI backend".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let service = Arc::new(MovieBoxService::new());

    tauri::Builder::default()
        .manage(AppState { service })
        .invoke_handler(tauri::generate_handler![search, get_details, get_streams])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while building tauri application");
}
