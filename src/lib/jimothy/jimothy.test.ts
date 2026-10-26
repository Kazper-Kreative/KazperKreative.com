/**
 * @jest-environment node
 */
import { findPack, RACOIN_PACKS, skinPrice } from "./catalog";
import { issueSession, readSession } from "./session";
import { isSandbox, purchaseLanguage } from "./steam";

const STEAM_ID = "76561198000000001";

describe("jimothy session tokens", () => {
  beforeAll(() => {
    process.env.STEAM_PUBLISHER_KEY = "test-publisher-key";
  });

  it("round-trips a token to its Steam id", () => {
    const { token } = issueSession(STEAM_ID);
    expect(readSession(token)).toBe(STEAM_ID);
  });

  it("rejects a token for someone else's id", () => {
    const { token } = issueSession(STEAM_ID);
    const [, expires, signature] = token.split(".");
    expect(readSession(`76561198000000002.${expires}.${signature}`)).toBeNull();
  });

  it("rejects a token signed under another key", () => {
    const { token } = issueSession(STEAM_ID);
    process.env.STEAM_PUBLISHER_KEY = "rotated";
    expect(readSession(token)).toBeNull();
    process.env.STEAM_PUBLISHER_KEY = "test-publisher-key";
  });

  it("expires", () => {
    const now = Date.now();
    const { token, expires } = issueSession(STEAM_ID, now);
    expect(readSession(token, now)).toBe(STEAM_ID);
    expect(readSession(token, expires * 1000 + 1)).toBeNull();
  });

  it("rejects junk", () => {
    expect(readSession(undefined)).toBeNull();
    expect(readSession("")).toBeNull();
    expect(readSession("a.b.c")).toBeNull();
    expect(readSession(`${STEAM_ID}.9999999999`)).toBeNull();
  });
});

describe("jimothy catalog", () => {
  it("never reuses a Steam item id", () => {
    const ids = RACOIN_PACKS.map((p) => p.itemId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives a bonus for the bigger packs", () => {
    const perDollar = RACOIN_PACKS.map((p) => p.racoins / p.priceCents);
    for (let i = 1; i < perDollar.length; i++) expect(perDollar[i]).toBeGreaterThan(perDollar[i - 1]);
  });

  it("finds packs by id only", () => {
    expect(findPack("pouch")?.racoins).toBe(500);
    expect(findPack("nope")).toBeUndefined();
    expect(findPack(1001)).toBeUndefined();
  });

  it("sells nothing that is not priced", () => {
    expect(skinPrice("Moonlight")).toBeUndefined();
    expect(skinPrice(undefined)).toBeUndefined();
  });
});

describe("jimothy steam settings", () => {
  it("stays in the sandbox unless told exactly otherwise", () => {
    delete process.env.STEAM_MTX_SANDBOX;
    expect(isSandbox()).toBe(true);
    process.env.STEAM_MTX_SANDBOX = "false";
    expect(isSandbox()).toBe(true);
    process.env.STEAM_MTX_SANDBOX = "0";
    expect(isSandbox()).toBe(false);
    delete process.env.STEAM_MTX_SANDBOX;
  });

  it("falls back to English for languages Steam does not take", () => {
    expect(purchaseLanguage("fr")).toBe("fr");
    expect(purchaseLanguage("xx")).toBe("en");
    expect(purchaseLanguage(undefined)).toBe("en");
  });
});

describe("jimothy steam responses", () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  function answer(body: unknown) {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => body }) as unknown as typeof fetch;
  }

  it("accepts AuthenticateUserTicket's shape, which has no top-level result", async () => {
    process.env.STEAM_PUBLISHER_KEY = "test-publisher-key";
    answer({ response: { params: { result: "OK", steamid: "76561198000000001" } } });
    const { authenticateTicket } = await import("./steam");
    await expect(authenticateTicket("00112233445566778899")).resolves.toBe("76561198000000001");
  });

  it("rejects a ticket Steam refuses", async () => {
    answer({ response: { error: { errorcode: 101, errordesc: "Invalid ticket" } } });
    const { authenticateTicket } = await import("./steam");
    await expect(authenticateTicket("00112233445566778899")).rejects.toThrow();
  });

  it("rejects a purchase call whose result is not OK", async () => {
    answer({ response: { result: "Failure", params: {}, error: { errorcode: 3 } } });
    const { finalizeTxn } = await import("./steam");
    await expect(finalizeTxn("100001")).rejects.toThrow();
  });
});

describe("jimothy local prices", () => {
  it("charges USD where the table has no row", async () => {
    const { localPrice, RACOIN_PACKS } = await import("./catalog");
    expect(localPrice(RACOIN_PACKS[0], "GBP")).toEqual({ currency: "USD", amount: 499 });
    expect(localPrice(RACOIN_PACKS[0], undefined)).toEqual({ currency: "USD", amount: 499 });
  });

  it("uses a valid row and ignores one that breaks Steam's steps", async () => {
    const catalog = await import("./catalog");
    const table = catalog.LOCAL_PRICES as Record<string, readonly [number, number, number]>;
    table.GBP = [429, 849, 1699];
    table.JPY = [55050, 110000, 220000]; // 550.50 yen: not a whole-yen step
    table.XXX = [100, 200, 300]; // not a Steam currency
    try {
      expect(catalog.localPrice(catalog.RACOIN_PACKS[1], "GBP")).toEqual({ currency: "GBP", amount: 849 });
      expect(catalog.localPrice(catalog.RACOIN_PACKS[0], "JPY")).toEqual({ currency: "USD", amount: 499 });
      expect(catalog.localPrice(catalog.RACOIN_PACKS[1], "JPY")).toEqual({ currency: "JPY", amount: 110000 });
      expect(catalog.localPrice(catalog.RACOIN_PACKS[0], "XXX")).toEqual({ currency: "USD", amount: 499 });
    } finally {
      delete table.GBP;
      delete table.JPY;
      delete table.XXX;
    }
  });

  it("reads the player's currency from GetUserInfo, and gives up quietly", async () => {
    process.env.STEAM_PUBLISHER_KEY = "test-publisher-key";
    const realFetch = global.fetch;
    try {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true, json: async () => ({ response: { result: "OK", params: { currency: "EUR", country: "DE" } } }),
      }) as unknown as typeof fetch;
      const { userCurrency } = await import("./steam");
      await expect(userCurrency("76561198000000001")).resolves.toBe("EUR");
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 }) as unknown as typeof fetch;
      await expect(userCurrency("76561198000000001")).resolves.toBeUndefined();
    } finally {
      global.fetch = realFetch;
    }
  });
});
