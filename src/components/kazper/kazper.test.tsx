import "@testing-library/jest-dom";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import KazperChat from "@/components/kazper/KazperChat";
import Markdown from "@/components/kazper/Markdown";
import type { Exchange } from "@/lib/kazper/data";

jest.mock("next/navigation", () => ({ useRouter: () => ({ refresh: jest.fn() }) }));
const deleteEq = jest.fn().mockResolvedValue({ error: null });
jest.mock("@/lib/supabase/client", () => ({
  getSupabase: () => ({ from: () => ({ delete: () => ({ eq: deleteEq }) }) }),
}));

beforeAll(() => {
  window.scrollTo = jest.fn() as unknown as typeof window.scrollTo;
});

const history: Exchange[] = [
  { id: 3, created_at: "2026-10-27T20:00:00Z", kind: "chat", channel: "discord", user_text: "hi from discord",
    reply_text: "**hey** there", cost_usd: 0.0012 },
  { id: 4, created_at: "2026-10-27T21:00:00Z", kind: "briefing", channel: "discord",
    user_text: "[Scheduled] Morning briefing time. Use your tools…", reply_text: "- one\n- two", cost_usd: null },
];

function mockFetch(responses: Record<string, unknown>) {
  const calls: { url: string; body: unknown }[] = [];
  global.fetch = jest.fn(async (url: RequestInfo | URL, init?: RequestInit) => {
    const key = String(url).split("/").pop()!;
    calls.push({ url: String(url), body: JSON.parse(String(init?.body ?? "{}")) });
    const res = responses[key];
    const status = (res as { __status?: number })?.__status ?? 200;
    return { ok: status < 400, status, json: async () => res } as Response;
  }) as jest.Mock;
  return calls;
}

describe("Markdown", () => {
  it("renders lists, bold and code without injecting HTML", () => {
    const { container } = render(<Markdown text={"**Due** today:\n- `ship` it\n- <img src=x onerror=alert(1)>"} />);
    expect(container.querySelector("strong")).toHaveTextContent("Due");
    expect(container.querySelectorAll("li")).toHaveLength(2);
    expect(container.querySelector("code")).toHaveTextContent("ship");
    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent("<img src=x onerror=alert(1)>");
  });
});

describe("KazperChat", () => {
  it("shows the shared Discord history with labels", () => {
    mockFetch({});
    render(<KazperChat initial={history} />);
    expect(screen.getByText("hi from discord")).toBeInTheDocument();
    expect(screen.getAllByText("via Discord")).toHaveLength(2);
    expect(screen.getByText("☀️ Briefing")).toBeInTheDocument();
    expect(screen.getByText("hey")).toBeInTheDocument();
  });

  it("sends a message and shows the reply, tools and a deletable note", async () => {
    const calls = mockFetch({
      chat: { exchange_id: 9, reply: "Found it.", error: null, kind: "chat", tools: ["history_search", "gmail_search"],
        notes: [{ id: 21, text: "My accountant is Dana" }], usage: { cost_usd: 0.0005 } },
    });
    render(<KazperChat initial={history} />);
    fireEvent.change(screen.getByPlaceholderText("Message Kazper…"), { target: { value: "what did Dana say?" } });
    fireEvent.keyDown(screen.getByPlaceholderText("Message Kazper…"), { key: "Enter" });

    await screen.findByText("Found it.");
    expect(calls[0]).toEqual({ url: "/api/kazper/chat", body: { text: "what did Dana say?" } });
    expect(screen.getByText("searched history")).toBeInTheDocument();
    expect(screen.getByText("checked gmail")).toBeInTheDocument();
    expect(screen.getByText(/Noted #21: My accountant is Dana/)).toBeInTheDocument();

    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Delete" })));
    expect(deleteEq).toHaveBeenCalledWith("id", 21);
    expect(screen.getByText(/Deleted #21/)).toBeInTheDocument();
  });

  it("puts the draft back and offers retry when the runtime fails", async () => {
    mockFetch({ chat: { __status: 502, error: "Couldn't reach Kazper's runtime." } });
    render(<KazperChat initial={[]} />);
    fireEvent.change(screen.getByPlaceholderText("Message Kazper…"), { target: { value: "hello?" } });
    fireEvent.click(screen.getByRole("button", { name: "Send" }));

    await screen.findByText("Couldn't reach Kazper's runtime.");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Message Kazper…")).toHaveValue("hello?");
  });

  it("rates replies and sends fixes as corrections", async () => {
    const calls = mockFetch({ feedback: { ok: true, note: { id: 30, text: "Keep it short" } } });
    render(<KazperChat initial={history} />);
    await act(async () => fireEvent.click(screen.getAllByRole("button", { name: "Good reply" })[0]));
    expect(calls[0].body).toEqual({ exchange_id: 3, kind: "good" });

    fireEvent.click(screen.getAllByRole("button", { name: "Fix" })[0]);
    fireEvent.change(screen.getByPlaceholderText("What should Kazper have said?"), { target: { value: "Shorter." } });
    await act(async () => fireEvent.click(screen.getByRole("button", { name: "Save fix" })));
    expect(calls[1].body).toEqual({ exchange_id: 3, kind: "correction", correction: "Shorter." });
    await waitFor(() => expect(screen.getByText(/Noted #30: Keep it short/)).toBeInTheDocument());
  });

  it("shows an empty review as a notice, not a message", async () => {
    mockFetch({ review: { exchange_id: null, reply: "Nothing to review.", error: null, kind: "review", notes: [],
      tools: [], usage: null } });
    render(<KazperChat initial={[]} />);
    fireEvent.click(screen.getByRole("button", { name: /Review my feedback/ }));
    await screen.findByText("Nothing to review.");
    expect(screen.queryByRole("button", { name: "Retry" })).toBeNull();
  });
});
