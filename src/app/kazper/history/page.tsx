import Link from "next/link";
import LocalTime from "@/components/kazper/LocalTime";
import Markdown from "@/components/kazper/Markdown";
import { searchExchanges, type Exchange } from "@/lib/kazper/data";

const PAGE = 25;

function label(ex: Exchange): string {
  if (ex.kind === "briefing") return "☀️ Briefing";
  if (ex.kind === "review") return "🔁 Weekly review";
  return ex.user_text;
}

// Every conversation Kazper has had, searchable with the same full-text index
// he uses himself (history_search). ?id=N jumps to one exchange.
export default async function KazperHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; before?: string; id?: string }>;
}) {
  const { q = "", before, id } = await searchParams;
  const focus = id ? Number(id) : undefined;
  const beforeId = focus ? focus + 1 : before ? Number(before) : undefined;
  const rows = await searchExchanges(focus ? "" : q, beforeId, PAGE);
  const older = rows.length === PAGE ? rows[rows.length - 1].id : null;

  return (
    <div className="kz-page">
      <h1 className="kz-h">History</h1>
      <form className="kz-add" action="/kazper/history">
        <input name="q" defaultValue={q} placeholder='Search everything — keywords, "a phrase", -exclude' />
        <button className="btn btn-primary" type="submit">Search</button>
      </form>
      {(q || focus) && (
        <p className="dim kz-help">
          {focus ? `Showing #${focus} and earlier.` : `${rows.length}${older ? "+" : ""} results for “${q}”.`}{" "}
          <Link href="/kazper/history">Clear</Link>
        </p>
      )}

      <ul className="kz-history">
        {rows.map((ex) => (
          <li key={ex.id}>
            <details open={ex.id === focus}>
              <summary>
                <span className="kz-row-id mono">#{ex.id}</span>
                <span className="kz-history-q">{label(ex)}</span>
                <span className="kz-meta">
                  <LocalTime iso={ex.created_at} />
                  {ex.channel === "discord" ? " · Discord" : " · App"}
                </span>
              </summary>
              <div className="kz-history-body">
                {ex.kind === "chat" && <p className="kz-history-asked"><b>You:</b> {ex.user_text}</p>}
                <Markdown text={ex.reply_text} />
                {ex.cost_usd !== null && <p className="kz-meta mono">${Number(ex.cost_usd).toFixed(4)}</p>}
              </div>
            </details>
          </li>
        ))}
        {rows.length === 0 && <li className="kz-row-empty dim">Nothing found.</li>}
      </ul>

      {older && (
        <Link className="btn btn-ghost" href={`/kazper/history?${new URLSearchParams({ ...(q && !focus ? { q } : {}), before: String(older) })}`}>
          Older
        </Link>
      )}
    </div>
  );
}
