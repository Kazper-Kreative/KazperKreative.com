# Kazper desktop

A small native Windows app (Tauri 2, WebView2) around **https://kazperkreative.com/kazper**.
The UI *is* the live site, so it updates with every site deploy. Reinstall only when this shell changes.

What the shell adds over the browser / PWA:

| | |
|---|---|
| **Ctrl+Alt+K** | Summon or hide Kazper from anywhere |
| **Tray icon** | Closing the window keeps Kazper running; click the tray icon to reopen |
| **Start with Windows** | On by default, starts hidden in the tray; toggle it from the tray menu |
| **Single instance** | Launching again just brings the running window forward |
| **Site lock** | Only kazperkreative.com loads in the window; other links open in your browser |

The page gets **no native API access** (`capabilities/default.json` is empty), so nothing on the
website can touch your PC. Sign in with the **6-digit code** from the email; the link would open
your default browser instead of this window.

## Build

Needs Node, Rust (`rustup`, MSVC toolchain) and the Visual Studio C++ build tools. WebView2 ships with Windows 11.

```powershell
cd kazper-desktop
npm install
npm run build        # → src-tauri/target/release/bundle/{nsis,msi}/
npm run dev          # run without installing
npm run icons        # regenerate icons from ../public/assets/k-mark.png
```

The installer is unsigned, so the first run shows Windows SmartScreen's "unknown publisher":
**More info → Run anyway**. Signing only matters if Kazper is ever distributed.
