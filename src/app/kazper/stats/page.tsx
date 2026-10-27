import { stats, usd } from "@/lib/kazper/data";

// What Kazper costs and how much he's learned. Same numbers as !stats on Discord.
export default async function KazperStatsPage() {
  const s = await stats();
  const examples = s.good + s.corrections;
  const pct = Math.min(100, Math.round((100 * examples) / s.datasetGoal));
  const maxDay = Math.max(...s.daily.map((d) => d.cost), 0);

  const tiles: { label: string; value: string; sub?: string }[] = [
    { label: "Last 7 days", value: usd(s.cost7d) },
    { label: "Last 30 days", value: usd(s.cost30d), sub: `${s.replies30d} replies` },
    { label: "Per reply", value: s.avgCost === null ? "—" : usd(s.avgCost), sub: "average" },
    { label: "Conversations", value: String(s.exchanges), sub: `${s.discord} Discord · ${s.web} app` },
  ];

  return (
    <div className="kz-page">
      <h1 className="kz-h">Stats</h1>

      <div className="kz-tiles">
        {tiles.map((t) => (
          <div key={t.label} className="kz-tile">
            <span className="kz-tile-label">{t.label}</span>
            <span className="kz-tile-value">{t.value}</span>
            {t.sub && <span className="kz-tile-sub dim">{t.sub}</span>}
          </div>
        ))}
      </div>

      <section className="kz-panel">
        <h2>Daily cost · last 30 days</h2>
        {s.daily.length === 0 ? (
          <p className="dim kz-help">No priced replies yet. Costs appear once replies come through OpenRouter.</p>
        ) : (
          <div className="kz-chart" role="img" aria-label="Daily cost over the last 30 days">
            {s.daily.map((d) => (
              <div key={d.day} className="kz-chart-col" title={`${d.day}: ${usd(d.cost)} · ${d.replies} replies`}>
                <span style={{ height: `${maxDay ? Math.max(4, (100 * d.cost) / maxDay) : 4}%` }} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="kz-panel">
        <h2>Learning</h2>
        <dl className="kz-dl">
          <div><dt>👍 / 👎</dt><dd>{s.good} / {s.bad}</dd></div>
          <div><dt>Corrections</dt><dd>{s.corrections}</dd></div>
          <div><dt>Pushbacks</dt><dd>{s.redirects}</dd></div>
          <div><dt>Facts from you</dt><dd>{s.facts}</dd></div>
          <div><dt>📝 His notes</dt><dd>{s.notes}</dd></div>
          <div><dt>Pointers</dt><dd>{s.pointers}</dd></div>
        </dl>
        <div className="kz-progress" aria-label={`Fine-tune dataset ${pct}%`}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="dim kz-help">
          Fine-tune dataset: {examples}/{s.datasetGoal} rated examples (👍 + corrections). Rate replies to grow it.
        </p>
      </section>
    </div>
  );
}
