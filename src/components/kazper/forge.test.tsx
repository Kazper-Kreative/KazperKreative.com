import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ForgeBoard from "@/components/kazper/ForgeBoard";
import { forgeRouteAllowed, type ForgeJob, type ForgeStatus } from "@/lib/kazper/forge";

const job = (over: Partial<ForgeJob>): ForgeJob => ({
  id: "20261029-211112-8b14", repo: "Kazper-Kreative/dingdong-sandbox", task: "Add multiply()", status: "pr_open",
  created_at: "2026-10-29T21:11:12Z", updated_at: "2026-10-29T21:11:23Z", branch: "forge/x",
  pr_url: "https://github.com/Kazper-Kreative/dingdong-sandbox/pull/3", summary: "Added multiply.", error: "",
  cost_usd: 0.0029, steps: 7, gates: [], approved_at: "", ...over,
});

const status: ForgeStatus = { halted: null, budget: { spent_usd: 0.004, cap_usd: 50, left_usd: 49.996 }, queued: 0, running: null,
  instructor: { mode: "every", clean_streak: 3, goal: 20, exam_passed: false, reviewed: 3, setting: "auto" } };

function mockFetch(responses: Record<string, unknown> = {}) {
  const calls: { url: string; method: string; body: unknown }[] = [];
  global.fetch = jest.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    const path = String(url).replace("/api/kazper/forge/", "").split("?")[0];
    calls.push({ url: String(url), method: init?.method ?? "GET", body: JSON.parse(String(init?.body ?? "{}")) });
    const res = responses[path] ?? (path === "status" ? status : path === "jobs" ? { jobs: [] } : {});
    return { ok: true, status: 200, json: async () => res } as Response;
  }) as jest.Mock;
  return calls;
}

describe("forgeRouteAllowed", () => {
  it("allows only the forge calls the app needs", () => {
    expect(forgeRouteAllowed("GET", "status")).toBe(true);
    expect(forgeRouteAllowed("POST", "jobs/20261029-211112-8b14/approve")).toBe(true);
    expect(forgeRouteAllowed("POST", "jobs/20261029-211112-8b14/deny")).toBe(true);
    expect(forgeRouteAllowed("GET", "jobs/20261029-211112-8b14/logs")).toBe(true);
    expect(forgeRouteAllowed("POST", "status")).toBe(false);
    expect(forgeRouteAllowed("GET", "jobs/../../etc")).toBe(false);
    expect(forgeRouteAllowed("POST", "jobs/x/delete")).toBe(false);
    expect(forgeRouteAllowed("GET", "health")).toBe(false);
    expect(forgeRouteAllowed("POST", "exam")).toBe(true);
  });
});

describe("ForgeBoard", () => {
  it("shows spend, jobs and a PR link", () => {
    mockFetch();
    render(<ForgeBoard initialStatus={status} initialJobs={[job({})]} />);
    expect(screen.getByText("$0.0040")).toBeInTheDocument();
    expect(screen.getByText("of $50.00 cap")).toBeInTheDocument();
    expect(screen.getByText("Add multiply()")).toBeInTheDocument();
    expect(screen.getByText("Waiting for CI")).toBeInTheDocument();
    expect(screen.getByText("Every PR")).toBeInTheDocument();
    expect(screen.getByText("3/20 clean ships · exam not yet")).toBeInTheDocument();
    expect(screen.getByText("PR ↗")).toHaveAttribute("href", job({}).pr_url);
  });

  it("approves a gated job only after confirming", async () => {
    const gated = job({ status: "awaiting_approval", gates: ["schema migration"] });
    const calls = mockFetch({ jobs: { jobs: [gated] } });
    render(<ForgeBoard initialStatus={status} initialJobs={[gated]} />);
    expect(screen.getByText("schema migration")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Approve"));
    expect(calls.filter((c) => c.method === "POST")).toHaveLength(0);
    fireEvent.click(screen.getByText("Yes, approve"));
    await waitFor(() => expect(calls.some((c) => c.url.endsWith(`jobs/${gated.id}/approve`))).toBe(true));
  });

  it("denies with a reason", async () => {
    const gated = job({ status: "awaiting_approval", gates: ["deletes data"] });
    const calls = mockFetch({ jobs: { jobs: [gated] } });
    render(<ForgeBoard initialStatus={status} initialJobs={[gated]} />);
    fireEvent.click(screen.getByText("Deny"));
    fireEvent.change(screen.getByPlaceholderText(/Why not/), { target: { value: "not yet" } });
    fireEvent.click(screen.getByText("Deny and close PR"));
    await waitFor(() => {
      const deny = calls.find((c) => c.url.endsWith(`jobs/${gated.id}/deny`));
      expect(deny?.body).toEqual({ reason: "not yet" });
    });
  });

  it("halts only after confirming, and shows Resume when halted", async () => {
    const calls = mockFetch({ status: { ...status, halted: "the kill switch is on" } });
    render(<ForgeBoard initialStatus={status} initialJobs={[]} />);
    fireEvent.click(screen.getByText("🛑 Stop everything"));
    expect(calls.filter((c) => c.method === "POST")).toHaveLength(0);
    fireEvent.click(screen.getByText("Yes, halt it"));
    await waitFor(() => expect(calls.find((c) => c.url.endsWith("/halt"))?.body).toEqual({ on: true }));
    expect(await screen.findByText("Resume")).toBeInTheDocument();
  });

  it("shows the latest exam and starts a new one", async () => {
    const calls = mockFetch({
      exam: { running: null, pass_mark: 0.9, tasks: 12, latest: { at: "2026-10-29T23:30:00Z", score: 0.9167,
        passed: true, cost_usd: 0.041, model: "z-ai/glm-5.3",
        tasks: [{ name: "01-slugify", passed: true }, { name: "05-roman", passed: false }] } },
    });
    render(<ForgeBoard initialStatus={status} initialJobs={[]} />);
    expect(await screen.findByText("92%")).toBeInTheDocument();
    expect(screen.getByText("✓ slugify")).toBeInTheDocument();
    expect(screen.getByText("✗ roman")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Run the exam again"));
    await waitFor(() => expect(calls.some((c) => c.method === "POST" && c.url.endsWith("/exam"))).toBe(true));
  });

  it("starts a job on a dingdong repo", async () => {
    const calls = mockFetch();
    render(<ForgeBoard initialStatus={status} initialJobs={[]} />);
    fireEvent.change(screen.getByLabelText("Task"), { target: { value: "Add divide()" } });
    fireEvent.click(screen.getByText("Start job"));
    await waitFor(() => expect(calls.find((c) => c.method === "POST" && c.url.endsWith("/jobs"))?.body)
      .toEqual({ repo: "Kazper-Kreative/dingdong-sandbox", task: "Add divide()" }));
  });
});
