// Shown the instant a tab is tapped, inside the shell, while the server fetches
// that tab's data (Supabase, and Google via the runtime for Calendar). Without it
// the old tab stays on screen until everything arrives, so taps feel ignored.
export default function KazperLoading() {
  return (
    <div className="kz-page" aria-busy="true" aria-label="Loading">
      <div className="kz-thinking"><span /><span /><span /></div>
    </div>
  );
}
