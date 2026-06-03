/* ===========================================================================
   The Crossing — English draughts (American checkers) rules library.
   Pure, side-effect-free. Loaded BOTH in the page (window.CheckersRules) and
   in the engine Worker (self.CheckersRules via importScripts).

   Rules implemented (English / American):
   - 8x8, dark squares only, 12 men each.
   - Men move/capture diagonally FORWARD only; kings move/capture one step in
     ANY diagonal direction (non-flying kings).
   - Capturing is MANDATORY; multi-jumps must continue with the same piece.
   - A man that reaches the king row is crowned and its move ENDS (even if more
     jumps would otherwise be available).
   - A side with no legal move loses.

   Board codes (Array(64), index = row*8 + col, row 0 at the top):
     0 empty/unused · 1 white man · 2 white king · 3 black man · 4 black king
   White moves UP (toward row 0) and crowns on row 0.
   Black moves DOWN (toward row 7) and crowns on row 7.
   =========================================================================== */
(function (global) {
  const EMPTY = 0, WM = 1, WK = 2, BM = 3, BK = 4;
  const isWhite = (c) => c === WM || c === WK;
  const isKing = (c) => c === WK || c === BK;
  const colorOf = (c) => (c === EMPTY ? null : (isWhite(c) ? "w" : "b"));
  const rc = (i) => [i >> 3, i & 7];
  const idx = (r, c) => r * 8 + c;
  const onBoard = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
  const dark = (r, c) => ((r + c) & 1) === 1;
  const numberOf = (i) => { const [r, c] = rc(i); return r * 4 + (c >> 1) + 1; };

  const MAP_OUT = { 0: "-", 1: "w", 2: "W", 3: "b", 4: "B" };
  const MAP_IN = { "-": 0, w: 1, W: 2, b: 3, B: 4 };

  function initFen() {
    const b = new Array(64).fill(EMPTY);
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      if (!dark(r, c)) continue;
      if (r < 3) b[idx(r, c)] = BM;
      else if (r > 4) b[idx(r, c)] = WM;
    }
    return encode(b, "w");
  }
  function encode(b, turn) { let s = ""; for (let i = 0; i < 64; i++) s += MAP_OUT[b[i]]; return s + " " + turn; }
  function decode(fen) {
    const sp = fen.split(" "), bs = sp[0], turn = sp[1];
    const b = new Array(64);
    for (let i = 0; i < 64; i++) b[i] = MAP_IN[bs[i]];
    return { b, turn };
  }

  const KING_DIRS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const manDirs = (color) => (color === "w" ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]);
  const dirsFor = (code) => (isKing(code) ? KING_DIRS : manDirs(colorOf(code)));
  const promoRow = (color) => (color === "w" ? 0 : 7);

  // Recursively collect maximal jump sequences for the piece that started at
  // `origin` (now virtually at `cur`). Captured squares stay on the board for
  // the scan; we track them in `caps` so they can't be re-used.
  function collectJumps(b, cur, code, caps, path, out, turn, origin) {
    const [r, c] = rc(cur);
    for (const [dr, dc] of dirsFor(code)) {
      const mr = r + dr, mc = c + dc, lr = r + 2 * dr, lc = c + 2 * dc;
      if (!onBoard(lr, lc)) continue;
      const mid = idx(mr, mc), land = idx(lr, lc);
      if (caps.indexOf(mid) >= 0) continue;
      const midCode = b[mid];
      if (midCode === EMPTY || colorOf(midCode) === turn) continue; // must hop an enemy
      if (b[land] !== EMPTY && land !== origin) continue;           // landing must be clear
      const promo = !isKing(code) && lr === promoRow(turn);
      const newCaps = caps.concat(mid);
      const newPath = (path.length ? path : [origin]).concat(land);
      if (promo) { out.push({ from: origin, to: land, caps: newCaps, path: newPath, promo: true }); continue; }
      const before = out.length;
      collectJumps(b, land, code, newCaps, newPath, out, turn, origin);
      if (out.length === before) out.push({ from: origin, to: land, caps: newCaps, path: newPath, promo: false });
    }
  }

  function genMoves(state) {
    const b = state.b, turn = state.turn;
    const jumps = [];
    for (let i = 0; i < 64; i++) {
      const code = b[i];
      if (code === EMPTY || colorOf(code) !== turn) continue;
      collectJumps(b, i, code, [], [], jumps, turn, i);
    }
    if (jumps.length) return jumps; // capture is mandatory
    const simples = [];
    for (let i = 0; i < 64; i++) {
      const code = b[i];
      if (code === EMPTY || colorOf(code) !== turn) continue;
      const [r, c] = rc(i);
      for (const [dr, dc] of dirsFor(code)) {
        const nr = r + dr, nc = c + dc;
        if (!onBoard(nr, nc)) continue;
        const j = idx(nr, nc);
        if (b[j] === EMPTY) {
          const promo = !isKing(code) && nr === promoRow(turn);
          simples.push({ from: i, to: j, caps: [], path: [i, j], promo });
        }
      }
    }
    return simples;
  }

  function apply(state, move) {
    const b = state.b.slice();
    const code = b[move.from];
    b[move.from] = EMPTY;
    for (let k = 0; k < move.caps.length; k++) b[move.caps[k]] = EMPTY;
    b[move.to] = move.promo ? (colorOf(code) === "w" ? WK : BK) : code;
    return { b, turn: state.turn === "w" ? "b" : "w" };
  }

  // White-relative static evaluation (centipawn-ish; one man ~= 100).
  function evaluate(state) {
    const b = state.b; let s = 0;
    for (let i = 0; i < 64; i++) {
      const code = b[i]; if (!code) continue;
      const [r, c] = rc(i);
      const w = isWhite(code), king = isKing(code);
      let v = king ? 185 : 100;
      if (!king) v += (w ? (7 - r) : r) * 4;        // advancement toward crowning
      if (c >= 2 && c <= 5) v += 4;                  // central files
      if (!king && ((w && r === 7) || (!w && r === 0))) v += 8; // hold the back row
      s += w ? v : -v;
    }
    return s;
  }

  function notation(move) {
    if (!move) return "";
    if (move.caps.length) return move.path.map(numberOf).join("x");
    return numberOf(move.from) + "-" + numberOf(move.to);
  }
  // moves are "the same" for matching if endpoints + capture count line up
  function sameMove(a, b) {
    return a && b && a.from === b.from && a.to === b.to && a.caps.length === b.caps.length;
  }

  const api = {
    EMPTY, WM, WK, BM, BK,
    isWhite, isKing, colorOf, rc, numberOf,
    initFen, encode, decode, genMoves, apply, evaluate, notation, sameMove,
  };
  global.CheckersRules = api;
})(typeof self !== "undefined" ? self : this);
