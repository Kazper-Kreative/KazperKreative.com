/* ===========================================================================
   The Crossing — checkers engine (Web Worker).
   Iterative-deepening alpha-beta (negamax) over CheckersRules, with a time
   budget per request. Drives both the opponent (weaker tiers via shorter time
   + "randomness" near-best jitter) and the coach (full strength, randomness 0).

   Protocol:
     in : { cmd:'analyze'|'play', fen, timeMs, randomness }
     out: { type:'ready' }  on load
          { type:'result', best:<move|null>, scoreWhite:<int|null>, pv:<string> }
   Move objects are the plain {from,to,caps,path,promo} from CheckersRules and
   pass through structured clone unchanged.
   =========================================================================== */
importScripts("/lab-assets/checkers/rules.js");
const R = self.CheckersRules;
const MATE = 100000;
const now = () => performance.now();

class Timeout {}

// negamax from the side-to-move's perspective.
function search(state, depth, ply, alpha, beta, deadline) {
  if (now() > deadline) throw new Timeout();
  const moves = R.genMoves(state);
  if (moves.length === 0) return -(MATE - ply); // side to move has lost
  const forced = moves[0].caps.length > 0;
  if (depth <= 0 && !forced) {
    const e = R.evaluate(state);
    return state.turn === "w" ? e : -e;
  }
  if (ply > 64) { const e = R.evaluate(state); return state.turn === "w" ? e : -e; }
  let best = -Infinity;
  for (let i = 0; i < moves.length; i++) {
    const ns = R.apply(state, moves[i]);
    const nd = forced ? depth : depth - 1; // capture extension (forced lines)
    const score = -search(ns, nd, ply + 1, -beta, -alpha, deadline);
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

function bestMove(state, timeMs, randomness) {
  const root = R.genMoves(state);
  if (root.length === 0) return { best: null, scoreWhite: null, pv: "" };
  const forcedRoot = root[0].caps.length > 0;
  const deadline = now() + timeMs;

  let order = root.slice();
  let completed = { best: order[0], score: 0, results: order.map((m) => ({ m, s: 0 })) };

  try {
    for (let depth = 1; depth <= 40; depth++) {
      let alpha = -Infinity;
      let localBest = null, localScore = -Infinity;
      const results = [];
      for (let i = 0; i < order.length; i++) {
        const m = order[i];
        const ns = R.apply(state, m);
        const nd = forcedRoot ? depth : depth - 1;
        const s = -search(ns, nd, 1, -Infinity, -alpha, deadline);
        results.push({ m, s });
        if (s > localScore) { localScore = s; localBest = m; }
        if (s > alpha) alpha = s;
      }
      // reorder by this depth's scores so the next iteration prunes harder
      results.sort((a, b) => b.s - a.s);
      order = results.map((r) => r.m);
      completed = { best: localBest, score: localScore, results };
      if (localScore > MATE - 200 || localScore < -(MATE - 200)) break; // forced result found
    }
  } catch (e) {
    if (!(e instanceof Timeout)) throw e; // keep last fully/partly completed depth
  }

  // weaker tiers: pick randomly among moves within `randomness` cp of the best
  let chosen = completed.best;
  if (randomness > 0 && completed.results && completed.results.length > 1) {
    const near = completed.results.filter((r) => completed.score - r.s <= randomness);
    if (near.length) chosen = near[Math.floor(Math.random() * near.length)].m;
  }
  const scoreWhite = state.turn === "w" ? completed.score : -completed.score;
  return { best: chosen, scoreWhite, pv: R.notation(completed.best) };
}

self.onmessage = (e) => {
  const msg = e.data || {};
  if (msg.cmd === "analyze" || msg.cmd === "play") {
    let res;
    try {
      const state = R.decode(msg.fen);
      res = bestMove(state, msg.timeMs || 500, msg.randomness || 0);
    } catch (err) {
      res = { best: null, scoreWhite: null, pv: "" };
    }
    self.postMessage({ type: "result", best: res.best, scoreWhite: res.scoreWhite, pv: res.pv });
  }
};

self.postMessage({ type: "ready" });
