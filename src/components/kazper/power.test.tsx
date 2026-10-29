import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PowerSwitch from "@/components/kazper/PowerSwitch";

function mockPower(start: boolean) {
  const bodies: unknown[] = [];
  let on = start;
  global.fetch = jest.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body ?? "{}"));
    bodies.push(body);
    if (typeof body.on === "boolean") on = body.on;
    return { ok: true, status: 200, json: async () => ({ on, since: null, by: "mason (app)" }) } as Response;
  }) as jest.Mock;
  return bodies;
}

describe("PowerSwitch", () => {
  it("asks before switching Kazper off", async () => {
    const bodies = mockPower(true);
    render(<PowerSwitch />);
    fireEvent.click(await screen.findByText("● On"));
    expect(bodies).toEqual([{}]);
    fireEvent.click(screen.getByText("Off"));
    expect(await screen.findByText("○ Off")).toBeInTheDocument();
    expect(bodies).toEqual([{}, { on: false }]);
  });

  it("switches back on in one tap", async () => {
    const bodies = mockPower(false);
    render(<PowerSwitch />);
    fireEvent.click(await screen.findByText("○ Off"));
    await waitFor(() => expect(screen.getByText("● On")).toBeInTheDocument());
    expect(bodies).toEqual([{}, { on: true }]);
  });
});
