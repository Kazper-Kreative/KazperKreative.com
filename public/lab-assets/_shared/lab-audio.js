/* ===========================================================================
   The Lab — procedural Web Audio  (no files; fully synthesized)
   Ethereal ambient drone + ghostly SFX for the training apps.
   Exposes window.LabAudio. Lazy AudioContext (created/resumed on first user
   gesture, per autoplay policy). Mute + volume persist to localStorage.
   Everything is wrapped so a failure never throws into the game loop.
   =========================================================================== */
window.LabAudio = (function () {
  let ctx, master, reverb, ambient = null;
  let muted = false, vol = 0.55;
  const LS_M = "lab_audio_muted", LS_V = "lab_audio_vol";

  function _load() {
    try {
      muted = localStorage.getItem(LS_M) === "1";
      const v = parseFloat(localStorage.getItem(LS_V));
      if (!isNaN(v)) vol = Math.min(1, Math.max(0, v));
    } catch (e) { /* ignore */ }
  }
  function _persist() {
    try { localStorage.setItem(LS_M, muted ? "1" : "0"); localStorage.setItem(LS_V, String(vol)); }
    catch (e) { /* ignore */ }
  }

  function _impulse(dur, decay) {
    const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay);
    }
    return buf;
  }

  function init() {
    if (ctx) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : vol * 0.9;
      master.connect(ctx.destination);
      reverb = ctx.createConvolver();
      reverb.buffer = _impulse(2.8, 2.4);
      const wet = ctx.createGain(); wet.gain.value = 0.5;
      reverb.connect(wet); wet.connect(master);
      return true;
    } catch (e) { return false; }
  }
  function _ensure() {
    if (!ctx && !init()) return false;
    if (ctx.state === "suspended") { try { ctx.resume(); } catch (e) { /* ignore */ } }
    return true;
  }
  const _now = () => ctx.currentTime;

  function tone(o) {
    if (!_ensure()) return;
    o = o || {};
    const t = _now() + (o.when || 0);
    const dur = o.dur || 0.4, gain = o.gain || 0.18, atk = o.attack || 0.01;
    const osc = ctx.createOscillator();
    osc.type = o.type || "sine";
    osc.frequency.setValueAtTime(o.freq || 440, t);
    if (o.detune) osc.detune.value = o.detune;
    if (o.slideTo) osc.frequency.exponentialRampToValueAtTime(o.slideTo, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + atk);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(master);
    const sr = o.sendReverb == null ? 0.35 : o.sendReverb;
    if (sr > 0 && reverb) { const s = ctx.createGain(); s.gain.value = sr; g.connect(s); s.connect(reverb); }
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  function noise(o) {
    if (!_ensure()) return;
    o = o || {};
    const t = _now() + (o.when || 0), dur = o.dur || 0.3, gain = o.gain || 0.14;
    const n = Math.floor(ctx.sampleRate * dur), buf = ctx.createBuffer(1, n, ctx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const f = ctx.createBiquadFilter(); f.type = o.type || "highpass"; f.frequency.value = o.freq || 1200; f.Q.value = o.q || 0.7;
    const g = ctx.createGain(); g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    const sr = o.sendReverb == null ? 0.3 : o.sendReverb;
    if (sr > 0 && reverb) { const s = ctx.createGain(); s.gain.value = sr; g.connect(s); s.connect(reverb); }
    src.start(t); src.stop(t + dur + 0.02);
  }

  /* evolving ambient drone */
  function ambientStart() {
    if (!_ensure() || ambient || muted) return;
    try {
      const base = 55; // A1
      const g = ctx.createGain(); g.gain.value = 0.0001; g.connect(master);
      if (reverb) { const rg = ctx.createGain(); rg.gain.value = 0.45; g.connect(rg); rg.connect(reverb); }
      const filt = ctx.createBiquadFilter(); filt.type = "lowpass"; filt.frequency.value = 360; filt.Q.value = 5; filt.connect(g);
      const oscs = [];
      [base, base * 1.004, base * 1.5, base * 2 * 0.997].forEach((f, i) => {
        const o = ctx.createOscillator(); o.type = i % 2 ? "sine" : "triangle"; o.frequency.value = f; o.connect(filt); o.start(); oscs.push(o);
      });
      const lfo = ctx.createOscillator(); lfo.frequency.value = 0.05;
      const lg = ctx.createGain(); lg.gain.value = 240; lfo.connect(lg); lg.connect(filt.frequency); lfo.start();
      g.gain.exponentialRampToValueAtTime(0.06, _now() + 4);
      ambient = { g, oscs, lfo };
    } catch (e) { /* ignore */ }
  }
  function ambientStop() {
    if (!ambient) return;
    const a = ambient; ambient = null;
    try {
      a.g.gain.exponentialRampToValueAtTime(0.0001, _now() + 1.4);
      setTimeout(() => { a.oscs.forEach((o) => { try { o.stop(); } catch (e) {} }); try { a.lfo.stop(); } catch (e) {} }, 1600);
    } catch (e) { /* ignore */ }
  }

  /* ---- SFX ---- */
  function select() { tone({ freq: 880, dur: 0.5, gain: 0.10, detune: 5, sendReverb: 0.5 }); tone({ freq: 1320, dur: 0.4, gain: 0.04, when: 0.02, sendReverb: 0.6 }); }
  function move()   { noise({ dur: 0.22, gain: 0.09, type: "bandpass", freq: 1700, q: 0.6, sendReverb: 0.35 }); tone({ freq: 180, type: "triangle", dur: 0.16, gain: 0.15, slideTo: 120, sendReverb: 0.2 }); }
  function capture(){ noise({ dur: 0.42, gain: 0.15, type: "lowpass", freq: 900, q: 1, sendReverb: 0.5 }); tone({ freq: 130, type: "sawtooth", dur: 0.42, gain: 0.11, slideTo: 68, sendReverb: 0.4 }); tone({ freq: 196, dur: 0.42, gain: 0.05, detune: -14, sendReverb: 0.5 }); }
  function check()  { tone({ freq: 330, type: "square", dur: 0.18, gain: 0.07, sendReverb: 0.3 }); tone({ freq: 247, type: "square", dur: 0.3, gain: 0.08, when: 0.16, sendReverb: 0.4 }); }
  function win()    { [392, 494, 587, 784].forEach((f, i) => tone({ freq: f, dur: 0.9, gain: 0.12, when: i * 0.12, sendReverb: 0.7 })); }
  function lose()   { [330, 277, 196].forEach((f, i) => tone({ freq: f, dur: 1.0, gain: 0.11, when: i * 0.15, sendReverb: 0.7 })); }
  function ui()     { tone({ freq: 660, dur: 0.12, gain: 0.05, sendReverb: 0.2 }); }
  function promote(){ [523, 659, 784, 1047].forEach((f, i) => tone({ freq: f, dur: 0.7, gain: 0.10, when: i * 0.07, sendReverb: 0.6 })); }
  function point()  { tone({ freq: 1046, dur: 0.14, gain: 0.07, sendReverb: 0.3 }); tone({ freq: 1568, dur: 0.1, gain: 0.04, when: 0.04, sendReverb: 0.35 }); }
  function crash()  { noise({ dur: 0.3, gain: 0.16, type: "lowpass", freq: 700, q: 1, sendReverb: 0.4 }); tone({ freq: 150, type: "sawtooth", dur: 0.34, gain: 0.12, slideTo: 60, sendReverb: 0.35 }); }

  /* ---- controls ---- */
  function setMuted(m) {
    muted = !!m;
    if (master) master.gain.setTargetAtTime(muted ? 0 : vol * 0.9, _now(), 0.05);
    if (muted) ambientStop();
    _persist();
  }
  function toggleMute() { setMuted(!muted); return muted; }
  function isMuted() { return muted; }
  function setVolume(v) {
    vol = Math.min(1, Math.max(0, v));
    if (master && !muted) master.gain.setTargetAtTime(vol * 0.9, _now(), 0.05);
    _persist();
  }
  function getVolume() { return vol; }

  function mountControls(el) {
    if (!el) return;
    el.classList.add("audio-ctl");
    el.innerHTML = "";
    const btn = document.createElement("button"); btn.type = "button"; btn.title = "Toggle sound";
    const slider = document.createElement("input");
    slider.type = "range"; slider.min = "0"; slider.max = "1"; slider.step = "0.01"; slider.value = String(vol); slider.title = "Volume";
    const sync = () => { btn.textContent = muted ? "🔇" : "🔊"; btn.classList.toggle("on", !muted); slider.value = String(vol); };
    btn.addEventListener("click", () => { _ensure(); toggleMute(); if (!muted) ambientStart(); sync(); });
    slider.addEventListener("input", () => {
      _ensure(); const v = parseFloat(slider.value); setVolume(v);
      if (v > 0 && muted) setMuted(false);
      if (!muted) ambientStart(); sync();
    });
    el.appendChild(btn); el.appendChild(slider); sync();
  }

  /* start the soundscape on the first user gesture (if not muted) */
  function _firstGesture() {
    try { if (_ensure() && !muted) ambientStart(); } catch (e) { /* ignore */ }
    window.removeEventListener("pointerdown", _firstGesture);
    window.removeEventListener("keydown", _firstGesture);
  }
  window.addEventListener("pointerdown", _firstGesture);
  window.addEventListener("keydown", _firstGesture);

  _load();
  return {
    init, ambientStart, ambientStop,
    select, move, capture, check, win, lose, ui, promote, point, crash,
    setMuted, toggleMute, isMuted, setVolume, getVolume, mountControls,
  };
})();
