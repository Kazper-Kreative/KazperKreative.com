import { usd, type Stats } from "@/lib/kazper/data";

// The money and limits Kazper runs on (kazper/limits.py on the runtime), each
// read against his own usage so you can see how long it lasts at his current rate.

export type Provider =
  | { provider: "openrouter"; ok: true; balance_usd: number; purchased_usd: number; used_usd: number;
      key_limit_usd: number | null; key_remaining_usd: number | null; key_resets: string | null; free_tier: boolean }
  | { provider: "railway"; ok: true; plan: string; projected_usd: number; included_usd: number; over_usd: number;
      breakdown_usd: { cpu: number; memory: number; network: number } }
  | { provider: "supabase"; ok: true; project: string; plan: string; db_bytes: number; db_limit_bytes: number }
  | { provider: string; ok: false; error: string };

const NAMES: Record<string, string> = { openrouter: "OpenRouter", railway: "Railway", supabase: "Supabase" };
const ROLES: Record<string, string> = {
  openrouter: "pays for every reply",
  railway: "keeps him running",
  supabase: "holds his memory",
};

const mb = (b: number) => `${(b / 1048576).toFixed(b < 10485760 ? 1 : 0)} MB`;
const pctOf = (part: number, whole: number) => (whole > 0 ? Math.min(100, Math.max(0, (100 * part) / whole)) : 0);

function span(days: number): string {
  if (!isFinite(days)) return "no spend yet to project from";
  if (days > 730) return "years at this rate";
  if (days > 60) return `about ${Math.round(days / 30)} months at this rate`;
  return `about ${Math.max(1, Math.round(days))} days at this rate`;
}

function Meter({ value, warn }: { value: number; warn?: boolean }) {
  return (
    <div className={`kz-progress${warn ? " kz-progress-warn" : ""}`} aria-hidden>
      <span style={{ width: `${Math.max(value, 1.5)}%` }} />
    </div>
  );
}

function Card({ p, s }: { p: Provider; s: Stats }) {
  const head = (
    <div className="kz-limit-head">
      <span className="kz-limit-name">{NAMES[p.provider] ?? p.provider}</span>
      <span className="kz-limit-role dim">{ROLES[p.provider] ?? ""}</span>
    </div>
  );
  if (!p.ok) {
    return (
      <div className="kz-limit">
        {head}
        <p className="dim kz-help">Couldn&apos;t read it just now ({"error" in p ? p.error : "unknown"}).</p>
      </div>
    );
  }

  if (p.provider === "openrouter" && "balance_usd" in p) {
    // Burn rate from his own priced replies: the last 7 days if there were any, else the last 30.
    const perDay = s.cost7d > 0 ? s.cost7d / 7 : s.cost30d / 30;
    const replies = s.avgCost ? Math.floor(p.balance_usd / s.avgCost) : null;
    return (
      <div className="kz-limit">
        {head}
        <div className="kz-limit-value">{usd(p.balance_usd)} <span className="dim">left of {usd(p.purchased_usd)}</span></div>
        <Meter value={pctOf(p.balance_usd, p.purchased_usd)} warn={p.balance_usd < 2} />
        <p className="dim kz-help">
          {replies !== null ? `~${replies.toLocaleString()} more replies at ${usd(s.avgCost!)} each, ` : ""}
          {perDay > 0 ? span(p.balance_usd / perDay) : span(Infinity)}.
          {p.key_limit_usd !== null && p.key_remaining_usd !== null &&
            ` This key is also capped at ${usd(p.key_limit_usd)}/${p.key_resets === "monthly" ? "month" : p.key_resets ?? "period"} (${usd(p.key_remaining_usd)} left).`}
        </p>
      </div>
    );
  }

  if (p.provider === "railway" && "projected_usd" in p) {
    const over = p.over_usd > 0;
    return (
      <div className="kz-limit">
        {head}
        <div className="kz-limit-value">{usd(p.projected_usd)} <span className="dim">projected this month · {usd(p.included_usd)} included</span></div>
        <Meter value={pctOf(p.projected_usd, p.included_usd)} warn={over} />
        <p className="dim kz-help">
          {over
            ? `About ${usd(p.over_usd)} over the ${p.plan} plan's included usage; that's billed on top of the $5 subscription.`
            : `Within the ${p.plan} plan's included usage.`}{" "}
          Memory {usd(p.breakdown_usd.memory)} · CPU {usd(p.breakdown_usd.cpu)} · network {usd(p.breakdown_usd.network)}.
        </p>
      </div>
    );
  }

  if (p.provider === "supabase" && "db_bytes" in p) {
    const perExchange = s.exchanges ? p.db_bytes / s.exchanges : 0;
    return (
      <div className="kz-limit">
        {head}
        <div className="kz-limit-value">{mb(p.db_bytes)} <span className="dim">of {mb(p.db_limit_bytes)} · {p.project}, {p.plan} plan</span></div>
        <Meter value={pctOf(p.db_bytes, p.db_limit_bytes)} warn={p.db_bytes > 0.8 * p.db_limit_bytes} />
        <p className="dim kz-help">
          {pctOf(p.db_bytes, p.db_limit_bytes).toFixed(1)}% used by {s.exchanges} conversations
          {perExchange > 0 && ` (an upper bound of ${mb(perExchange)} each, since Postgres itself takes some of that)`}.
        </p>
      </div>
    );
  }
  return null;
}

export default function ProviderLimits({ providers, s }: { providers: Provider[] | null; s: Stats }) {
  return (
    <section className="kz-panel">
      <h2>Money &amp; limits</h2>
      {providers === null ? (
        <p className="dim kz-help">Couldn&apos;t reach Kazper&apos;s runtime to read balances.</p>
      ) : (
        <div className="kz-limits">
          {providers.map((p) => <Card key={p.provider} p={p} s={s} />)}
        </div>
      )}
    </section>
  );
}
