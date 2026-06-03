/* ===========================================================================
   The Lab — shared arcade helpers (window.LabArcade).
   Tiny, dependency-free utilities reused by every arcade game so each game file
   stays small: high-score persistence, a frosted result overlay, keyboard/swipe
   input, and a delta-timed rAF loop. Loaded once, browser-cached across games.
   =========================================================================== */
window.LabArcade = (function () {
  const HS = {
    get(k) {
      try { return parseInt(localStorage.getItem("lab_hs_" + k) || "0", 10) || 0; }
      catch (e) { return 0; }
    },
    // store a new high (higher = better); returns the resulting best
    set(k, v) {
      try {
        const cur = this.get(k);
        if (v > cur) localStorage.setItem("lab_hs_" + k, String(v));
        return Math.max(v, cur);
      } catch (e) { return v; }
    },
    getTime(k) {
      try { const v = localStorage.getItem("lab_bt_" + k); return v ? parseInt(v, 10) : null; }
      catch (e) { return null; }
    },
    // store a new best time (lower = better); returns the resulting best
    setTime(k, v) {
      try {
        const cur = this.getTime(k);
        if (cur == null || v < cur) { localStorage.setItem("lab_bt_" + k, String(v)); return v; }
        return cur;
      } catch (e) { return v; }
    },
  };

  // Arrow keys + WASD → up/down/left/right; space → flap; enter → enter.
  function keys(handler) {
    const map = {
      ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
      w: "up", a: "left", s: "down", d: "right",
      W: "up", A: "left", S: "down", D: "right",
      " ": "flap", Spacebar: "flap", Enter: "enter",
    };
    const h = (e) => {
      const dir = map[e.key];
      if (!dir) return;
      if (dir !== "enter") e.preventDefault();
      handler(dir, e);
    };
    window.addEventListener("keydown", h, { passive: false });
    return () => window.removeEventListener("keydown", h);
  }

  // Swipe (or tap) on an element → 'up'|'down'|'left'|'right'|'tap'.
  function swipe(el, handler) {
    let sx = 0, sy = 0, active = false;
    const start = (e) => { const t = e.touches ? e.touches[0] : e; sx = t.clientX; sy = t.clientY; active = true; };
    const end = (e) => {
      if (!active) return; active = false;
      const t = e.changedTouches ? e.changedTouches[0] : e;
      const dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) < 24 && Math.abs(dy) < 24) { handler("tap"); return; }
      handler(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
    };
    el.addEventListener("touchstart", start, { passive: true });
    el.addEventListener("touchend", end, { passive: true });
    return () => { el.removeEventListener("touchstart", start); el.removeEventListener("touchend", end); };
  }

  // Delta-timed requestAnimationFrame loop. fn(dt, now). Returns { stop }.
  function loop(fn) {
    let raf = 0, last = 0, running = true;
    const step = (t) => {
      if (!running) return;
      const dt = last ? Math.min((t - last) / 1000, 0.05) : 0;
      last = t;
      fn(dt, t);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return { stop() { running = false; cancelAnimationFrame(raf); } };
  }

  // Frosted result overlay inside a position:relative host. Returns { hide }.
  function overlay(host, opts) {
    opts = opts || {};
    let ov = host.querySelector(":scope > .overlay");
    if (!ov) { ov = document.createElement("div"); ov.className = "overlay"; host.appendChild(ov); }
    ov.innerHTML =
      '<div class="overlay-card">' +
      (opts.tag ? `<span class="tag ${opts.tagClass || "great"}">${opts.tag}</span>` : "") +
      `<h3>${opts.title || ""}</h3>` +
      (opts.sub ? `<p class="dim">${opts.sub}</p>` : "") +
      (opts.btn ? `<button class="btn primary ov-btn">${opts.btn}</button>` : "") +
      "</div>";
    ov.classList.add("show");
    const hide = () => ov.classList.remove("show");
    if (opts.btn) ov.querySelector(".ov-btn").addEventListener("click", () => { hide(); if (opts.onBtn) opts.onBtn(); });
    return { hide };
  }

  function sfx(name) {
    try { if (window.LabAudio && window.LabAudio[name]) window.LabAudio[name](); } catch (e) { /* ignore */ }
  }

  function loadScripts(srcs, done) {
    let i = 0;
    (function next() {
      if (i >= srcs.length) { done(); return; }
      const s = document.createElement("script");
      s.src = srcs[i++]; s.onload = next; s.onerror = next;
      document.head.appendChild(s);
    })();
  }

  /* Shared 1v1 plumbing for the 2-player games (Trine/Cascade/Enclosure/Darts).
     Wraps LabMP (Supabase Realtime) + a standard MP panel so each game only
     supplies its own move serialization + apply logic. */
  const mp = {
    active() { try { return new URLSearchParams(location.search).get("mp") === "1"; } catch (e) { return false; } },
    room() { try { return new URLSearchParams(location.search).get("room") || ""; } catch (e) { return ""; } },
    inviteUrl() { try { return window.parent.location.href; } catch (e) { return location.href; } },
    startUrl(slug) {
      const id = Math.random().toString(36).slice(2, 8);
      try { window.parent.location.href = window.parent.location.pathname + "?room=" + id; }
      catch (e) { location.href = "/lab/" + slug + "?room=" + id; }
    },
    exitUrl(slug) {
      try { window.parent.location.href = window.parent.location.pathname; }
      catch (e) { location.href = "/lab/" + slug; }
    },
    // Load transport + join the room. on = { status, seat(role,opp), opponent(opp), move(p), control(p) }
    join(opts) {
      loadScripts(["/lab-assets/_shared/supabase.js", "/lab-assets/_shared/lab-multiplayer.js"], () => {
        const on = opts.on || {};
        window.LabMP.join({
          game: opts.game, room: mp.room(), on: {
            onStatus: (s) => on.status && on.status(s),
            onAssign: (role, opp) => on.seat && on.seat(role, opp),
            onOpponent: (opp) => on.opponent && on.opponent(opp),
            onMove: (p) => on.move && on.move(p),
            onControl: (p) => on.control && on.control(p),
          },
        });
        if (opts.ready) opts.ready();
      });
    },
    send(move, ply) { try { if (window.LabMP) window.LabMP.sendMove(move, ply); } catch (e) { /* ignore */ } },
    control(t, data) { try { if (window.LabMP) window.LabMP.sendControl(t, data); } catch (e) { /* ignore */ } },
    // Render the standard MP panel into host; returns setters.
    panel(host, opts) {
      opts = opts || {};
      host.innerHTML =
        '<div class="mp-head"><span class="mp-dot" id="aDot"></span><span id="aRole">1v1 Match</span></div>' +
        '<p class="mp-status" id="aStatus">Connecting…</p>' +
        '<div class="mp-invite"><input id="aLink" readonly aria-label="Invite link"><button class="btn" id="aCopy">Copy</button></div>' +
        '<div class="btns"><button class="btn" id="aResign">Resign</button><button class="btn" id="aRematch">Rematch</button></div>' +
        '<button class="btn" id="aLeave">Leave match</button>';
      const q = (s) => host.querySelector(s);
      q("#aLink").value = mp.inviteUrl();
      q("#aCopy").addEventListener("click", () => {
        try { navigator.clipboard.writeText(mp.inviteUrl()); q("#aCopy").textContent = "Copied"; setTimeout(() => { q("#aCopy").textContent = "Copy"; }, 1200); } catch (e) { /* ignore */ }
        sfx("ui");
      });
      q("#aResign").addEventListener("click", () => { sfx("ui"); opts.onResign && opts.onResign(); });
      q("#aRematch").addEventListener("click", () => { sfx("ui"); opts.onRematch && opts.onRematch(); });
      q("#aLeave").addEventListener("click", () => { sfx("ui"); mp.exitUrl(opts.slug); });
      return {
        setRole: (t) => { q("#aRole").textContent = t; },
        setStatus: (t) => { q("#aStatus").textContent = t; },
        setDot: (on, spec) => { q("#aDot").className = "mp-dot" + (on ? " on" : "") + (spec ? " spec" : ""); },
      };
    },
  };

  return { hs: HS, keys, swipe, loop, overlay, sfx, loadScripts, mp };
})();
