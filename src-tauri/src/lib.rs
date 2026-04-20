use std::{
    net::{SocketAddr, TcpListener as StdTcpListener},
    path::{Component, PathBuf},
    sync::{Arc, Mutex},
};

use axum::{
    body::{to_bytes, Body},
    extract::{Path, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use mime_guess::from_path;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Emitter, Manager, State as TauriState};
use tauri_plugin_shell::{
    process::{CommandChild, CommandEvent},
    ShellExt,
};
use tokio::{
    fs,
    io::{AsyncReadExt, AsyncWriteExt},
    net::{TcpListener, TcpStream},
    sync::oneshot,
    time::{sleep, timeout, Duration, Instant},
};
use uuid::Uuid;

const RUNTIME_SNIPPET: &str =
    r#"<script>window.__JUNBAN_RUNTIME__={mode:"remote-desktop"};</script>"#;
const DESKTOP_RUNTIME_INIT_SCRIPT: &str = r#"
window.__JUNBAN_RUNTIME_READY__ = window.__TAURI_INTERNALS__.invoke('desktop_runtime_descriptor')
  .then((runtime) => {
    window.__JUNBAN_RUNTIME__ = runtime;
    return runtime;
  });
"#;
const REMOTE_SESSION_COOKIE: &str = "junban_remote_session";
const DESKTOP_API_HOST: &str = "127.0.0.1";
const DESKTOP_BACKEND_START_ATTEMPTS: usize = 3;
const JUNBAN_BACKEND_SERVICE: &str = "junban-backend";
const DESKTOP_SIDECAR_NAME: &str = "junban-node";
const DESKTOP_SIDECAR_ENTRY: &str = "gen/sidecar/backend/server.js";
const DESKTOP_RUNTIME_DESCRIPTOR_CHANGED_EVENT: &str =
    "junban:desktop-runtime-descriptor-changed";

#[derive(Clone)]
struct RemoteWebState {
    resource_dir: PathBuf,
    db_path: PathBuf,
    auth: Arc<Mutex<RemoteAuthState>>,
}

#[derive(Default)]
struct RemoteAuthState {
    password_enabled: bool,
    password_hash: Option<String>,
    active_session_id: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RemoteServerStatus {
    available: bool,
    running: bool,
    port: Option<u16>,
    local_url: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RemoteServerConfigResponse {
    port: u16,
    auto_start: bool,
    password_enabled: bool,
    has_password: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct RemoteSessionStatus {
    authorized: bool,
    requires_password: bool,
    session_locked: bool,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct RemoteServerConfigFile {
    port: u16,
    auto_start: bool,
    password_enabled: bool,
    password_hash: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct RemoteSessionLoginRequest {
    password: String,
}

struct RunningRemoteServer {
    port: u16,
    shutdown: oneshot::Sender<()>,
}

struct RunningDesktopBackend {
    child: CommandChild,
    port: u16,
}

struct DesktopBackendState {
    child: Option<CommandChild>,
    port: Option<u16>,
    runtime: JunbanRuntimeDescriptor,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct DesktopApiRuntimeDescriptor {
    api_base: String,
    health_url: String,
    ready: bool,
    service: String,
    error: Option<String>,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
struct JunbanRuntimeDescriptor {
    mode: String,
    desktop: Option<DesktopApiRuntimeDescriptor>,
}

#[derive(Deserialize)]
struct DesktopBackendHealthResponse {
    ok: bool,
    service: String,
}

#[derive(Default, Clone)]
struct RemoteServerManager {
    inner: Arc<Mutex<Option<RunningRemoteServer>>>,
}

#[derive(Default, Clone)]
struct DesktopBackendManager {
    inner: Arc<Mutex<DesktopBackendState>>,
}

impl Default for DesktopBackendState {
    fn default() -> Self {
        Self {
            child: None,
            port: None,
            runtime: default_runtime_descriptor(),
        }
    }
}

impl DesktopBackendManager {
    fn is_running(&self) -> Result<bool, String> {
        let guard = self
            .inner
            .lock()
            .map_err(|_| "Failed to lock desktop backend state")?;
        Ok(guard.child.is_some())
    }

    fn runtime_descriptor(&self) -> Result<JunbanRuntimeDescriptor, String> {
        let guard = self
            .inner
            .lock()
            .map_err(|_| "Failed to lock desktop backend state")?;
        Ok(guard.runtime.clone())
    }

    fn set_running(&self, port: u16, child: CommandChild) -> Result<JunbanRuntimeDescriptor, String> {
        let mut guard = self
            .inner
            .lock()
            .map_err(|_| "Failed to lock desktop backend state")?;
        let runtime = build_desktop_runtime_descriptor(port);
        guard.port = Some(port);
        guard.runtime = runtime.clone();
        guard.child = Some(child);
        Ok(runtime)
    }

    fn record_startup_failure(
        &self,
        port: Option<u16>,
        error: impl Into<String>,
    ) -> Result<JunbanRuntimeDescriptor, String> {
        let mut guard = self
            .inner
            .lock()
            .map_err(|_| "Failed to lock desktop backend state")?;
        let runtime = build_unready_desktop_runtime_descriptor(port, error.into());
        guard.port = port;
        guard.child = None;
        guard.runtime = runtime.clone();
        Ok(runtime)
    }

    fn mark_unready_if_port_matches(
        &self,
        port: u16,
        error: impl Into<String>,
    ) -> Result<Option<JunbanRuntimeDescriptor>, String> {
        let mut guard = self
            .inner
            .lock()
            .map_err(|_| "Failed to lock desktop backend state")?;
        if guard.port == Some(port) {
            let runtime = build_unready_desktop_runtime_descriptor(Some(port), error.into());
            guard.child = None;
            guard.runtime = runtime.clone();
            return Ok(Some(runtime));
        }
        Ok(None)
    }
}

fn emit_runtime_descriptor_change(app: &AppHandle, runtime: &JunbanRuntimeDescriptor) {
    if let Err(err) = app.emit(DESKTOP_RUNTIME_DESCRIPTOR_CHANGED_EVENT, runtime) {
        eprintln!("[desktop-backend] Failed to emit runtime descriptor change: {err}");
    }
}

fn app_data_root(app: &AppHandle) -> Result<PathBuf, String> {
    let app_data = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Failed to resolve app data directory: {err}"))?;
    Ok(app_data.join("ASF Junban"))
}

fn default_remote_config() -> RemoteServerConfigFile {
    RemoteServerConfigFile {
        port: 4822,
        auto_start: false,
        password_enabled: false,
        password_hash: None,
    }
}

fn build_status(port: Option<u16>, running: bool) -> RemoteServerStatus {
    RemoteServerStatus {
        available: true,
        running,
        port,
        local_url: port.map(|value| format!("http://localhost:{value}")),
    }
}

fn config_response(config: &RemoteServerConfigFile) -> RemoteServerConfigResponse {
    RemoteServerConfigResponse {
        port: config.port,
        auto_start: config.auto_start,
        password_enabled: config.password_enabled,
        has_password: config.password_hash.is_some(),
    }
}

fn db_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_root(app)?.join("junban.db"))
}

fn config_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_root(app)?.join("remote-access.json"))
}

fn resource_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .resource_dir()
        .map_err(|err| format!("Failed to resolve resource directory: {err}"))
}

fn desktop_plugin_dir(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_root(app)?.join("plugins"))
}

fn desktop_markdown_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_root(app)?.join("tasks"))
}

fn desktop_sidecar_entry_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(resource_dir(app)?.join(DESKTOP_SIDECAR_ENTRY))
}

fn desktop_api_base(port: u16) -> String {
    format!("http://{DESKTOP_API_HOST}:{port}/api")
}

fn desktop_health_url(port: u16) -> String {
    format!("{}/health", desktop_api_base(port))
}

fn default_runtime_descriptor() -> JunbanRuntimeDescriptor {
    JunbanRuntimeDescriptor {
        mode: "default".into(),
        desktop: None,
    }
}

fn build_desktop_runtime_descriptor(port: u16) -> JunbanRuntimeDescriptor {
    JunbanRuntimeDescriptor {
        mode: "default".into(),
        desktop: Some(DesktopApiRuntimeDescriptor {
            api_base: desktop_api_base(port),
            health_url: desktop_health_url(port),
            ready: true,
            service: JUNBAN_BACKEND_SERVICE.into(),
            error: None,
        }),
    }
}

fn build_unready_desktop_runtime_descriptor(
    port: Option<u16>,
    error: impl Into<String>,
) -> JunbanRuntimeDescriptor {
    JunbanRuntimeDescriptor {
        mode: "default".into(),
        desktop: Some(DesktopApiRuntimeDescriptor {
            api_base: port.map(desktop_api_base).unwrap_or_default(),
            health_url: port.map(desktop_health_url).unwrap_or_default(),
            ready: false,
            service: JUNBAN_BACKEND_SERVICE.into(),
            error: Some(error.into()),
        }),
    }
}

fn reserve_desktop_port() -> Result<u16, String> {
    let listener = StdTcpListener::bind((DESKTOP_API_HOST, 0))
        .map_err(|err| format!("Failed to reserve desktop backend port: {err}"))?;
    let port = listener
        .local_addr()
        .map_err(|err| format!("Failed to read reserved desktop backend port: {err}"))?
        .port();
    drop(listener);
    Ok(port)
}

fn is_expected_desktop_backend_response(response: &str) -> bool {
    let status_ok = response.starts_with("HTTP/1.1 200") || response.starts_with("HTTP/1.0 200");
    let Some((_, body)) = response.split_once("\r\n\r\n") else {
        return false;
    };

    if !status_ok {
        return false;
    }

    serde_json::from_str::<DesktopBackendHealthResponse>(body.trim())
        .map(|payload| payload.ok && payload.service == JUNBAN_BACKEND_SERVICE)
        .unwrap_or(false)
}

async fn wait_for_desktop_backend(port: u16) -> Result<(), String> {
    let started = Instant::now();
    let timeout_after = Duration::from_secs(12);
    let health_url = desktop_health_url(port);
    let mut last_error: Option<String> = None;

    loop {
        if started.elapsed() >= timeout_after {
            return Err(format!(
                "Timed out waiting for desktop backend on {health_url}{}",
                last_error
                    .as_deref()
                    .map(|err| format!(": {err}"))
                    .unwrap_or_default()
            ));
        }

        match TcpStream::connect((DESKTOP_API_HOST, port)).await {
            Ok(mut stream) => {
                let request = format!(
                    "GET /api/health HTTP/1.1\r\nHost: {DESKTOP_API_HOST}:{port}\r\nConnection: close\r\n\r\n"
                );

                if stream.write_all(request.as_bytes()).await.is_ok() {
                    let mut buffer = Vec::new();
                    if let Ok(Ok(_)) =
                        timeout(Duration::from_millis(750), stream.read_to_end(&mut buffer)).await
                    {
                        let response = String::from_utf8_lossy(&buffer).to_string();
                        if is_expected_desktop_backend_response(&response) {
                            return Ok(());
                        }

                        last_error = Some("health endpoint did not identify Junban backend".into());
                    } else {
                        last_error = Some("health endpoint did not finish responding".into());
                    }
                } else {
                    last_error = Some("failed to write readiness probe to backend socket".into());
                }
            }
            Err(err) => {
                last_error = Some(err.to_string());
            }
        }

        sleep(Duration::from_millis(150)).await;
    }
}

async fn spawn_desktop_backend(
    app: &AppHandle,
    manager: DesktopBackendManager,
    port: u16,
) -> Result<RunningDesktopBackend, String> {
    let entry_path = desktop_sidecar_entry_path(app)?;
    if !entry_path.exists() {
        return Err(format!(
            "Missing bundled desktop backend entrypoint: {}",
            entry_path.display()
        ));
    }

    let working_dir = entry_path
        .parent()
        .ok_or_else(|| "Invalid desktop backend entrypoint path".to_string())?
        .to_path_buf();
    let db_path = db_path(app)?;
    let plugin_dir = desktop_plugin_dir(app)?;
    let markdown_path = desktop_markdown_path(app)?;

    fs::create_dir_all(&plugin_dir)
        .await
        .map_err(|err| format!("Failed to prepare desktop plugin directory: {err}"))?;
    fs::create_dir_all(&markdown_path)
        .await
        .map_err(|err| format!("Failed to prepare desktop markdown directory: {err}"))?;

    let (mut rx, child) = app
        .shell()
        .sidecar(DESKTOP_SIDECAR_NAME)
        .map_err(|err| format!("Failed to configure desktop backend sidecar: {err}"))?
        .arg(&entry_path)
        .current_dir(&working_dir)
        .env("API_PORT", port.to_string())
        .env("DB_PATH", db_path)
        .env("MARKDOWN_PATH", markdown_path)
        .env("PLUGIN_DIR", plugin_dir)
        .env("STORAGE_MODE", "sqlite")
        .spawn()
        .map_err(|err| format!("Failed to start desktop backend sidecar: {err}"))?;

    let manager_for_events = manager.clone();
    let app_for_events = app.clone();
    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event {
                CommandEvent::Stderr(line) => {
                    eprintln!("[desktop-backend] {}", String::from_utf8_lossy(&line));
                }
                CommandEvent::Error(err) => {
                    eprintln!("[desktop-backend] command error: {err}");
                    if let Ok(Some(runtime)) = manager_for_events.mark_unready_if_port_matches(
                        port,
                        format!("Desktop backend command error: {err}"),
                    ) {
                        emit_runtime_descriptor_change(&app_for_events, &runtime);
                    }
                }
                CommandEvent::Terminated(payload) => {
                    let message = format!(
                        "Desktop backend exited with code {:?} signal {:?}",
                        payload.code, payload.signal
                    );
                    if payload.code != Some(0) {
                        eprintln!("[desktop-backend] {message}");
                    }
                    if let Ok(Some(runtime)) = manager_for_events.mark_unready_if_port_matches(port, message)
                    {
                        emit_runtime_descriptor_change(&app_for_events, &runtime);
                    }
                }
                _ => {}
            }
        }
    });

    if let Err(err) = wait_for_desktop_backend(port).await {
        let _ = child.kill();
        return Err(err);
    }

    Ok(RunningDesktopBackend { child, port })
}

async fn start_desktop_backend_internal(
    app: AppHandle,
    manager: DesktopBackendManager,
) -> Result<(), String> {
    if manager.is_running()? {
        return Ok(());
    }

    let mut last_error: Option<String> = None;
    let mut last_port: Option<u16> = None;

    for _attempt in 0..DESKTOP_BACKEND_START_ATTEMPTS {
        let port = match reserve_desktop_port() {
            Ok(port) => port,
            Err(err) => {
                if let Ok(runtime) = manager.record_startup_failure(None, err.clone()) {
                    emit_runtime_descriptor_change(&app, &runtime);
                }
                return Err(err);
            }
        };
        last_port = Some(port);

        match spawn_desktop_backend(&app, manager.clone(), port).await {
            Ok(running) => {
                let runtime = manager.set_running(running.port, running.child)?;
                emit_runtime_descriptor_change(&app, &runtime);
                return Ok(());
            }
            Err(err) => {
                last_error = Some(err);
            }
        }
    }

    let error = last_error.unwrap_or_else(|| "Failed to start desktop backend sidecar".into());
    if let Ok(runtime) = manager.record_startup_failure(last_port, error.clone()) {
        emit_runtime_descriptor_change(&app, &runtime);
    }
    Err(error)
}

async fn load_remote_config(app: &AppHandle) -> Result<RemoteServerConfigFile, String> {
    let path = config_path(app)?;
    match fs::read(path).await {
        Ok(bytes) => serde_json::from_slice(&bytes)
            .map_err(|err| format!("Failed to parse remote access config: {err}")),
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => Ok(default_remote_config()),
        Err(err) => Err(format!("Failed to read remote access config: {err}")),
    }
}

async fn save_remote_config(
    app: &AppHandle,
    config: &RemoteServerConfigFile,
) -> Result<(), String> {
    let path = config_path(app)?;
    let Some(parent) = path.parent() else {
        return Err("Invalid remote access config path".into());
    };

    fs::create_dir_all(parent)
        .await
        .map_err(|err| format!("Failed to prepare remote access config directory: {err}"))?;
    let bytes = serde_json::to_vec_pretty(config)
        .map_err(|err| format!("Failed to serialize remote access config: {err}"))?;
    fs::write(path, bytes)
        .await
        .map_err(|err| format!("Failed to write remote access config: {err}"))
}

fn sanitize_relative_path(requested: &str) -> Option<PathBuf> {
    let mut clean = PathBuf::new();
    for component in PathBuf::from(requested).components() {
        match component {
            Component::Normal(segment) => clean.push(segment),
            Component::CurDir => {}
            _ => return None,
        }
    }
    Some(clean)
}

async fn read_static_file(path: PathBuf) -> Option<Vec<u8>> {
    fs::read(path).await.ok()
}

fn hash_password(password: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(password.as_bytes());
    let digest = hasher.finalize();
    digest.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn parse_session_cookie(headers: &HeaderMap) -> Option<String> {
    let raw_cookie = headers.get(header::COOKIE)?.to_str().ok()?;
    raw_cookie.split(';').map(str::trim).find_map(|cookie| {
        cookie
            .strip_prefix(&format!("{REMOTE_SESSION_COOKIE}="))
            .map(str::to_string)
    })
}

fn session_cookie_header(session_id: &str) -> Option<HeaderValue> {
    HeaderValue::from_str(&format!(
        "{REMOTE_SESSION_COOKIE}={session_id}; Path=/; HttpOnly; SameSite=Lax"
    ))
    .ok()
}

fn build_session_status(auth: &RemoteAuthState, session_id: Option<&str>) -> RemoteSessionStatus {
    let matches_current = auth
        .active_session_id
        .as_deref()
        .zip(session_id)
        .is_some_and(|(active, incoming)| active == incoming);

    RemoteSessionStatus {
        authorized: matches_current,
        requires_password: auth.password_enabled,
        session_locked: auth.active_session_id.is_some() && !matches_current,
    }
}

fn build_json_response<T: Serialize>(payload: &T, set_cookie: Option<HeaderValue>) -> Response {
    let mut response = Json(payload).into_response();
    if let Some(cookie) = set_cookie {
        response.headers_mut().insert(header::SET_COOKIE, cookie);
    }
    response
}

fn ensure_remote_session(
    auth: &mut RemoteAuthState,
    headers: &HeaderMap,
) -> (RemoteSessionStatus, Option<HeaderValue>) {
    let session_cookie = parse_session_cookie(headers);

    if let Some(active_session_id) = auth.active_session_id.as_deref() {
        if session_cookie.as_deref() == Some(active_session_id) {
            return (build_session_status(auth, session_cookie.as_deref()), None);
        }
        return (build_session_status(auth, session_cookie.as_deref()), None);
    }

    if auth.password_enabled {
        return (build_session_status(auth, session_cookie.as_deref()), None);
    }

    let new_session_id = Uuid::new_v4().to_string();
    auth.active_session_id = Some(new_session_id.clone());
    let cookie = session_cookie_header(&new_session_id);
    (build_session_status(auth, Some(&new_session_id)), cookie)
}

fn is_remote_request_authorized(state: &RemoteWebState, headers: &HeaderMap) -> bool {
    let session_cookie = parse_session_cookie(headers);
    let Ok(auth) = state.auth.lock() else {
        return false;
    };

    auth.active_session_id
        .as_deref()
        .zip(session_cookie.as_deref())
        .is_some_and(|(active, incoming)| active == incoming)
}

async fn serve_index(state: &RemoteWebState) -> Response {
    let index_path = state.resource_dir.join("dist").join("index.html");
    match fs::read_to_string(index_path).await {
        Ok(html) => {
            let injected = if html.contains("</head>") {
                html.replace("</head>", &format!("{RUNTIME_SNIPPET}</head>"))
            } else {
                format!("{RUNTIME_SNIPPET}{html}")
            };
            (
                [(
                    header::CONTENT_TYPE,
                    HeaderValue::from_static("text/html; charset=utf-8"),
                )],
                injected,
            )
                .into_response()
        }
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Missing bundled frontend assets",
        )
            .into_response(),
    }
}

async fn serve_asset_file(full_path: PathBuf) -> Response {
    match read_static_file(full_path.clone()).await {
        Some(bytes) => {
            let mime = from_path(full_path).first_or_octet_stream();
            (
                [(
                    header::CONTENT_TYPE,
                    HeaderValue::from_str(mime.as_ref())
                        .unwrap_or(HeaderValue::from_static("application/octet-stream")),
                )],
                bytes,
            )
                .into_response()
        }
        None => (StatusCode::NOT_FOUND, "Not found").into_response(),
    }
}

async fn serve_app_root(State(state): State<RemoteWebState>) -> Response {
    serve_index(&state).await
}

async fn serve_app_path(
    Path(requested_path): Path<String>,
    State(state): State<RemoteWebState>,
) -> Response {
    let Some(relative_path) = sanitize_relative_path(&requested_path) else {
        return (StatusCode::BAD_REQUEST, "Invalid path").into_response();
    };

    let wants_asset = relative_path
        .file_name()
        .and_then(|name| name.to_str())
        .is_some_and(|name| name.contains('.'));

    if !wants_asset {
        return serve_index(&state).await;
    }

    let full_path = state.resource_dir.join("dist").join(relative_path);
    serve_asset_file(full_path).await
}

async fn remote_health() -> impl IntoResponse {
    (StatusCode::OK, "ok")
}

async fn remote_session_status(
    State(state): State<RemoteWebState>,
    headers: HeaderMap,
) -> Response {
    let Ok(mut auth) = state.auth.lock() else {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to lock remote session state",
        )
            .into_response();
    };

    let (status, set_cookie) = ensure_remote_session(&mut auth, &headers);
    build_json_response(&status, set_cookie)
}

async fn remote_session_login(
    State(state): State<RemoteWebState>,
    headers: HeaderMap,
    Json(payload): Json<RemoteSessionLoginRequest>,
) -> Response {
    let Ok(mut auth) = state.auth.lock() else {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to lock remote session state",
        )
            .into_response();
    };

    let current_cookie = parse_session_cookie(&headers);
    if let Some(active_session_id) = auth.active_session_id.as_deref() {
        if current_cookie.as_deref() == Some(active_session_id) {
            let status = build_session_status(&auth, current_cookie.as_deref());
            return build_json_response(&status, None);
        }
        return (
            StatusCode::CONFLICT,
            "Another remote browser session is already connected",
        )
            .into_response();
    }

    if !auth.password_enabled {
        let new_session_id = Uuid::new_v4().to_string();
        auth.active_session_id = Some(new_session_id.clone());
        let status = build_session_status(&auth, Some(&new_session_id));
        return build_json_response(&status, session_cookie_header(&new_session_id));
    }

    let Some(expected_hash) = auth.password_hash.as_deref() else {
        return (
            StatusCode::UNAUTHORIZED,
            "Password protection is not configured",
        )
            .into_response();
    };

    if hash_password(payload.password.trim()) != expected_hash {
        return (StatusCode::UNAUTHORIZED, "Incorrect password").into_response();
    }

    let new_session_id = Uuid::new_v4().to_string();
    auth.active_session_id = Some(new_session_id.clone());
    let status = build_session_status(&auth, Some(&new_session_id));
    build_json_response(&status, session_cookie_header(&new_session_id))
}

async fn get_db(State(state): State<RemoteWebState>, headers: HeaderMap) -> Response {
    if !is_remote_request_authorized(&state, &headers) {
        return (StatusCode::UNAUTHORIZED, "Remote session is not authorized").into_response();
    }

    match fs::read(&state.db_path).await {
        Ok(bytes) => (
            [(
                header::CONTENT_TYPE,
                HeaderValue::from_static("application/octet-stream"),
            )],
            bytes,
        )
            .into_response(),
        Err(err) if err.kind() == std::io::ErrorKind::NotFound => {
            StatusCode::NOT_FOUND.into_response()
        }
        Err(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Failed to read database").into_response(),
    }
}

async fn put_db(State(state): State<RemoteWebState>, headers: HeaderMap, body: Body) -> Response {
    if !is_remote_request_authorized(&state, &headers) {
        return (StatusCode::UNAUTHORIZED, "Remote session is not authorized").into_response();
    }

    let Ok(bytes) = to_bytes(body, usize::MAX).await else {
        return (StatusCode::BAD_REQUEST, "Invalid request body").into_response();
    };

    let Some(parent) = state.db_path.parent() else {
        return (StatusCode::INTERNAL_SERVER_ERROR, "Invalid database path").into_response();
    };

    if fs::create_dir_all(parent).await.is_err() {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to prepare database directory",
        )
            .into_response();
    }

    match fs::write(&state.db_path, bytes).await {
        Ok(_) => StatusCode::NO_CONTENT.into_response(),
        Err(_) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            "Failed to write database",
        )
            .into_response(),
    }
}

async fn start_remote_server_internal(
    app: AppHandle,
    manager: Arc<Mutex<Option<RunningRemoteServer>>>,
    port: u16,
) -> Result<RemoteServerStatus, String> {
    if port == 0 {
        return Err("Port must be between 1 and 65535".into());
    }

    {
        let guard = manager
            .lock()
            .map_err(|_| "Failed to lock remote server state")?;
        if let Some(server) = guard.as_ref() {
            if server.port == port {
                return Ok(build_status(Some(port), true));
            }
            return Err("Remote server is already running on another port. Stop it first.".into());
        }
    }

    let config = load_remote_config(&app).await?;
    let state = RemoteWebState {
        resource_dir: resource_dir(&app)?,
        db_path: db_path(&app)?,
        auth: Arc::new(Mutex::new(RemoteAuthState {
            password_enabled: config.password_enabled,
            password_hash: config.password_hash,
            active_session_id: None,
        })),
    };

    let listener = TcpListener::bind(SocketAddr::from(([0, 0, 0, 0], port)))
        .await
        .map_err(|err| format!("Failed to bind remote server port {port}: {err}"))?;
    let actual_port = listener
        .local_addr()
        .map_err(|err| format!("Failed to read remote server address: {err}"))?
        .port();

    let router = Router::new()
        .route("/", get(serve_app_root))
        .route("/_junban/health", get(remote_health))
        .route("/_junban/session", get(remote_session_status))
        .route("/_junban/session/login", post(remote_session_login))
        .route("/_junban/db", get(get_db).put(put_db))
        .route("/{*path}", get(serve_app_path))
        .with_state(state);

    let (shutdown_tx, shutdown_rx) = oneshot::channel::<()>();
    let manager_inner = manager.clone();
    tauri::async_runtime::spawn(async move {
        let result = axum::serve(listener, router)
            .with_graceful_shutdown(async move {
                let _ = shutdown_rx.await;
            })
            .await;

        if result.is_err() {
            eprintln!("remote server exited unexpectedly");
        }

        if let Ok(mut guard) = manager_inner.lock() {
            if guard
                .as_ref()
                .is_some_and(|server| server.port == actual_port)
            {
                *guard = None;
            }
        }
    });

    let mut guard = manager
        .lock()
        .map_err(|_| "Failed to lock remote server state")?;
    *guard = Some(RunningRemoteServer {
        port: actual_port,
        shutdown: shutdown_tx,
    });

    Ok(build_status(Some(actual_port), true))
}

#[tauri::command]
fn desktop_runtime_descriptor(
    manager: TauriState<DesktopBackendManager>,
) -> Result<JunbanRuntimeDescriptor, String> {
    manager.runtime_descriptor()
}

#[tauri::command]
fn remote_server_status(manager: TauriState<RemoteServerManager>) -> RemoteServerStatus {
    let guard = manager
        .inner
        .lock()
        .expect("remote server manager lock poisoned");
    match guard.as_ref() {
        Some(server) => build_status(Some(server.port), true),
        None => build_status(None, false),
    }
}

#[tauri::command]
async fn remote_server_get_config(app: AppHandle) -> Result<RemoteServerConfigResponse, String> {
    Ok(config_response(&load_remote_config(&app).await?))
}

#[tauri::command]
async fn remote_server_update_config(
    app: AppHandle,
    port: u16,
    auto_start: bool,
    password_enabled: bool,
    password: Option<String>,
) -> Result<RemoteServerConfigResponse, String> {
    if port == 0 {
        return Err("Port must be between 1 and 65535".into());
    }

    let mut config = load_remote_config(&app).await?;
    config.port = port;
    config.auto_start = auto_start;
    config.password_enabled = password_enabled;

    if password_enabled {
        if let Some(next_password) = password
            .as_deref()
            .map(str::trim)
            .filter(|value| !value.is_empty())
        {
            config.password_hash = Some(hash_password(next_password));
        } else if config.password_hash.is_none() {
            return Err("Set a password before enabling password protection".into());
        }
    } else {
        config.password_hash = None;
    }

    save_remote_config(&app, &config).await?;
    Ok(config_response(&config))
}

#[tauri::command]
async fn remote_server_start(
    app: AppHandle,
    manager: TauriState<'_, RemoteServerManager>,
    port: u16,
) -> Result<RemoteServerStatus, String> {
    start_remote_server_internal(app, manager.inner.clone(), port).await
}

#[tauri::command]
fn remote_server_stop(
    manager: TauriState<RemoteServerManager>,
) -> Result<RemoteServerStatus, String> {
    let mut guard = manager
        .inner
        .lock()
        .map_err(|_| "Failed to lock remote server state")?;
    if let Some(server) = guard.take() {
        let _ = server.shutdown.send(());
    }

    Ok(build_status(None, false))
}

pub fn run() {
    tauri::Builder::default()
        .append_invoke_initialization_script(DESKTOP_RUNTIME_INIT_SCRIPT)
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .manage(DesktopBackendManager::default())
        .manage(RemoteServerManager::default())
        .invoke_handler(tauri::generate_handler![
            desktop_runtime_descriptor,
            remote_server_status,
            remote_server_get_config,
            remote_server_update_config,
            remote_server_start,
            remote_server_stop
        ])
        .setup(|app| {
            if !tauri::is_dev() {
                let manager = DesktopBackendManager {
                    inner: app.state::<DesktopBackendManager>().inner.clone(),
                };
                if let Err(err) = tauri::async_runtime::block_on(start_desktop_backend_internal(
                    app.handle().clone(),
                    manager,
                )) {
                    eprintln!("[desktop-backend] startup failed: {err}");
                }
            }

            let handle = app.handle().clone();
            let manager = app.state::<RemoteServerManager>().inner.clone();
            tauri::async_runtime::spawn(async move {
                match load_remote_config(&handle).await {
                    Ok(config) if config.auto_start => {
                        let _ = start_remote_server_internal(handle, manager, config.port).await;
                    }
                    _ => {}
                }
            });
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("Failed to build ASF Junban.")
        .run(|_app, _event| {});
}

#[cfg(test)]
mod tests {
    use super::{
        build_desktop_runtime_descriptor, build_unready_desktop_runtime_descriptor,
        is_expected_desktop_backend_response, JUNBAN_BACKEND_SERVICE,
    };

    #[test]
    fn accepts_junban_health_contract() {
        let response = format!(
            "HTTP/1.1 200 OK\r\ncontent-type: application/json\r\n\r\n{{\"ok\":true,\"service\":\"{}\"}}",
            JUNBAN_BACKEND_SERVICE
        );

        assert!(is_expected_desktop_backend_response(&response));
    }

    #[test]
    fn rejects_generic_http_200_responses() {
        let response = "HTTP/1.1 200 OK\r\ncontent-type: text/plain\r\n\r\nok";

        assert!(!is_expected_desktop_backend_response(response));
    }

    #[test]
    fn runtime_descriptor_carries_actual_api_base() {
        let runtime = build_desktop_runtime_descriptor(53123);
        let desktop = runtime.desktop.expect("desktop descriptor should exist");

        assert_eq!(runtime.mode, "default");
        assert_eq!(desktop.api_base, "http://127.0.0.1:53123/api");
        assert_eq!(desktop.health_url, "http://127.0.0.1:53123/api/health");
        assert!(desktop.ready);
        assert_eq!(desktop.error, None);
    }

    #[test]
    fn failed_runtime_descriptor_stays_in_default_mode_with_error() {
        let runtime = build_unready_desktop_runtime_descriptor(Some(53123), "boom");
        let desktop = runtime.desktop.expect("desktop descriptor should exist");

        assert_eq!(runtime.mode, "default");
        assert_eq!(desktop.api_base, "http://127.0.0.1:53123/api");
        assert_eq!(desktop.health_url, "http://127.0.0.1:53123/api/health");
        assert!(!desktop.ready);
        assert_eq!(desktop.error.as_deref(), Some("boom"));
    }
}
