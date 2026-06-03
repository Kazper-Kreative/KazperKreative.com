/* ===========================================================================
   The Lab — 1v1 multiplayer transport (Supabase Realtime).
   Loads after /lab/_shared/supabase.js (exposes window.supabase). Exposes
   window.LabMP. Per-room PUBLIC channel using Broadcast (moves/control) +
   Presence (who's here / color assignment). No DB tables or RLS — works with
   the anon key out of the box. Everything is wrapped so a transport failure
   never throws into the game loop.

   Color assignment is deterministic on both clients: presences sorted by
   online_at (tiebreak playerId) → 1st = white ('w'), 2nd = black ('b'),
   3rd+ = spectator. Re-evaluated on every presence change so it converges.
   =========================================================================== */
window.LabMP = (function () {
  // Same public values as src/lib/supabase/client.ts (anon key is RLS-safe).
  const URL = "https://lenbcecnvjaylhigtlfl.supabase.co";
  const ANON =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlbmJjZWNudmpheWxoaWd0bGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAzNTY2OTUsImV4cCI6MjA5NTkzMjY5NX0.ShfgNYlLAXicgIkJSTw0m6ZJXRbCLEdyIlPBBtl1yBg";

  let client = null, channel = null, playerId = null;
  let cbs = {};
  let state = { role: null, opponent: false, players: [] };

  function rid() { return Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 6); }

  function newRoom() { return Math.random().toString(36).slice(2, 8); }

  function join(opts) {
    opts = opts || {};
    cbs = opts.on || {};
    playerId = rid();
    try {
      if (!window.supabase || !window.supabase.createClient) { cbs.onStatus && cbs.onStatus("error"); return; }
      if (!client) client = window.supabase.createClient(URL, ANON, { realtime: { params: { eventsPerSecond: 20 } } });
      const topic = "lab:mp:" + opts.game + ":" + opts.room;
      channel = client.channel(topic, { config: { presence: { key: playerId }, broadcast: { self: false } } });
      channel.on("presence", { event: "sync" }, recompute);
      channel.on("presence", { event: "join" }, recompute);
      channel.on("presence", { event: "leave" }, recompute);
      channel.on("broadcast", { event: "move" }, function (m) { cbs.onMove && cbs.onMove(m.payload); });
      channel.on("broadcast", { event: "control" }, function (m) { cbs.onControl && cbs.onControl(m.payload); });
      channel.subscribe(async function (status) {
        if (status === "SUBSCRIBED") {
          try { await channel.track({ online_at: Date.now(), pid: playerId, name: opts.name || "" }); } catch (e) { /* ignore */ }
          cbs.onStatus && cbs.onStatus("connected");
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          cbs.onStatus && cbs.onStatus("error");
        }
      });
    } catch (e) { cbs.onStatus && cbs.onStatus("error"); }
  }

  function recompute() {
    if (!channel) return;
    let players = [];
    try {
      const st = channel.presenceState();
      const list = [];
      Object.keys(st).forEach(function (k) {
        (st[k] || []).forEach(function (meta) {
          list.push({ pid: meta.pid || k, online_at: meta.online_at || 0, name: meta.name || "" });
        });
      });
      const seen = {};
      list.forEach(function (p) { if (!seen[p.pid]) { seen[p.pid] = 1; players.push(p); } });
      players.sort(function (a, b) { return (a.online_at - b.online_at) || (a.pid < b.pid ? -1 : a.pid > b.pid ? 1 : 0); });
    } catch (e) { return; }

    const idx = players.findIndex(function (p) { return p.pid === playerId; });
    const role = idx === 0 ? "w" : idx === 1 ? "b" : "spectator";
    const white = players[0], black = players[1];
    const opponent = (role === "w" && !!black) || (role === "b" && !!white);

    const prevRole = state.role, prevOpp = state.opponent;
    state = { role: role, opponent: opponent, players: players };
    if (role !== prevRole) cbs.onAssign && cbs.onAssign(role, opponent, players);
    if (opponent !== prevOpp) cbs.onOpponent && cbs.onOpponent(opponent, players);
  }

  function sendMove(move, ply) {
    if (!channel) return;
    try { channel.send({ type: "broadcast", event: "move", payload: { move: move, ply: ply, pid: playerId } }); } catch (e) { /* ignore */ }
  }
  function sendControl(t, data) {
    if (!channel) return;
    try { channel.send({ type: "broadcast", event: "control", payload: { t: t, data: data || null, pid: playerId } }); } catch (e) { /* ignore */ }
  }
  function leave() {
    try { if (channel && client) client.removeChannel(channel); } catch (e) { /* ignore */ }
    channel = null;
  }
  function inviteUrl() {
    try { return window.parent.location.href; } catch (e) { return location.href; }
  }

  return {
    join: join, sendMove: sendMove, sendControl: sendControl, leave: leave,
    inviteUrl: inviteUrl, newRoom: newRoom,
    role: function () { return state.role; },
    opponentPresent: function () { return state.opponent; },
    players: function () { return state.players; },
    myId: function () { return playerId; },
  };
})();
