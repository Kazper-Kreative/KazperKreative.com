// Kazper's desktop shell: a native window around https://kazperkreative.com/kazper.
//
// The UI is the live site, so it updates with every site deploy; this shell only
// adds what a browser tab can't: a tray icon, a global hotkey (Ctrl+Alt+K),
// start-with-Windows (hidden in the tray), a single instance, and a lock that
// keeps the window on Kazper's own site (other links open in your browser).
// The page gets no native API access (see capabilities/default.json).
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;

use tauri::menu::{CheckMenuItem, Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager, Url, WebviewUrl, WebviewWindowBuilder, WindowEvent};
use tauri_plugin_autostart::{MacosLauncher, ManagerExt};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_opener::OpenerExt;

const HOME: &str = "https://kazperkreative.com/kazper";
const ALLOWED_HOST: &str = "kazperkreative.com";
const HIDDEN_ARG: &str = "--hidden"; // passed by the autostart entry

fn summon(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.unminimize();
        let _ = w.show();
        let _ = w.set_focus();
    }
}

fn toggle(app: &AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let up = w.is_visible().unwrap_or(false) && w.is_focused().unwrap_or(false);
        if up {
            let _ = w.hide();
        } else {
            summon(app);
        }
    }
}

/// Only Kazper's own site (and in-page/about: URLs) may load in the window.
fn allowed(url: &Url) -> bool {
    match url.scheme() {
        "https" => url.host_str() == Some(ALLOWED_HOST),
        "about" | "data" | "blob" => true,
        _ => false,
    }
}

fn main() {
    let hotkey = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::ALT), Code::KeyK);

    tauri::Builder::default()
        // Must come first: a second launch just brings the running Kazper forward.
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| summon(app)))
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec![HIDDEN_ARG])))
        .plugin(tauri_plugin_opener::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    if shortcut == &hotkey && event.state() == ShortcutState::Pressed {
                        toggle(app);
                    }
                })
                .build(),
        )
        .setup(move |app| {
            let handle = app.handle().clone();
            let start_hidden = std::env::args().any(|a| a == HIDDEN_ARG);

            // First run: start with Windows (hidden in the tray). After that the tray toggle decides.
            let marker = app.path().app_config_dir()?.join("first-run-done");
            if !marker.exists() {
                let _ = app.autolaunch().enable();
                if let Some(dir) = marker.parent() {
                    let _ = fs::create_dir_all(dir);
                }
                let _ = fs::write(&marker, b"1");
            }

            let opener = handle.clone();
            let window = WebviewWindowBuilder::new(app, "main", WebviewUrl::External(HOME.parse().unwrap()))
                .title("Kazper")
                .inner_size(460.0, 800.0)
                .min_inner_size(360.0, 520.0)
                .visible(!start_hidden)
                .on_navigation(move |url| {
                    if allowed(url) {
                        return true;
                    }
                    // Anything else (a link in a reply, an email thread) opens in your normal browser.
                    if matches!(url.scheme(), "https" | "http" | "mailto") {
                        let _ = opener.opener().open_url(url.as_str(), None::<&str>);
                    }
                    false
                })
                .build()?;

            // Closing the window keeps Kazper running in the tray.
            let w = window.clone();
            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    let _ = w.hide();
                }
            });

            // Tray: click to open; menu to toggle autostart or quit.
            let open = MenuItem::with_id(app, "open", "Open Kazper   Ctrl+Alt+K", true, None::<&str>)?;
            let autostart = CheckMenuItem::with_id(
                app, "autostart", "Start with Windows", true,
                app.autolaunch().is_enabled().unwrap_or(false), None::<&str>,
            )?;
            let quit = MenuItem::with_id(app, "quit", "Quit Kazper", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open, &autostart, &quit])?;
            let autostart_item = autostart.clone();
            TrayIconBuilder::with_id("kazper")
                .icon(app.default_window_icon().cloned().expect("app icon"))
                .tooltip("Kazper (Ctrl+Alt+K)")
                .menu(&menu)
                .show_menu_on_left_click(false)
                .on_menu_event(move |app, event| match event.id().as_ref() {
                    "open" => summon(app),
                    "autostart" => {
                        let manager = app.autolaunch();
                        let on = manager.is_enabled().unwrap_or(false);
                        let _ = if on { manager.disable() } else { manager.enable() };
                        let _ = autostart_item.set_checked(manager.is_enabled().unwrap_or(!on));
                    }
                    "quit" => app.exit(0),
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button: MouseButton::Left, button_state: MouseButtonState::Up, .. } = event {
                        summon(tray.app_handle());
                    }
                })
                .build(app)?;

            // If another app already owns Ctrl+Alt+K, keep running without the hotkey.
            if let Err(e) = app.global_shortcut().register(hotkey) {
                eprintln!("Ctrl+Alt+K unavailable: {e}");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Kazper");
}
