/**
 * @jest-environment node
 */
import { findPack, findSkin, RACOIN_PACKS, SKIN_PRICES, skinPrice } from "./catalog";
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

  it("sells the packs at Kazper's 27 Oct prices", () => {
    expect(RACOIN_PACKS.map((p) => [p.id, p.racoins, p.priceCents])).toEqual([
      ["pouch", 500, 499],
      ["bag", 1200, 999],
      ["bin", 2500, 1999],
    ]);
  });

  it("finds a pack whatever case the game's FName sends", () => {
    // The game has a component named "Bag", so FName("bag") prints "Bag".
    expect(findPack("Bag")?.id).toBe("bag");
    expect(findPack("BIN")?.id).toBe("bin");
    expect(findPack("Pouch")?.racoins).toBe(500);
  });

  it("describes every pack within Steam's limit, with its own amount", () => {
    for (const p of RACOIN_PACKS) {
      expect(p.description.length).toBeLessThanOrEqual(128);
      expect(p.description).toContain(p.racoins.toLocaleString("en-US"));
      expect(Number.isInteger(p.itemId) && p.itemId > 0).toBe(true);
    }
  });

  it("prices the skins at Kazper's 27 Oct prices", () => {
    expect(SKIN_PRICES).toEqual({ NightShift: 500, Undercover: 800, NeonAlley: 1200 });
  });

  it("finds a skin in any case and returns the catalog's spelling", () => {
    expect(findSkin("undercover")).toEqual({ id: "Undercover", price: 800 });
    expect(findSkin("NEONALLEY")).toEqual({ id: "NeonAlley", price: 1200 });
    expect(skinPrice("nightshift")).toBe(500);
    expect(findSkin("Moonlight")).toBeUndefined();
    expect(findSkin(42)).toBeUndefined();
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

describe("jimothy regional prices", () => {
  // Fixed, made-up markets: nothing here touches the network.
  const STEP: Record<string, number> = {
    CLP: 100, COP: 100, CRC: 500, IDR: 100, INR: 100, JPY: 100, KRW: 1000,
    KZT: 100, TWD: 100, UAH: 100, UYU: 100, VND: 50000,
  };
  const RATES: Record<string, number> = {
    AED: 3.67, AUD: 1.42, BRL: 5.35, CAD: 1.4, CHF: 0.83, CLP: 990, CNY: 6.7, COP: 3140, CRC: 455,
    EUR: 0.9, GBP: 0.75, HKD: 7.84, ILS: 3.06, IDR: 18160, INR: 95, JPY: 158, KRW: 1330, KWD: 0.31,
    KZT: 456, MXN: 18.7, MYR: 4.09, NOK: 9.33, NZD: 1.76, PEN: 3.45, PHP: 64, PLN: 3.95, QAR: 3.64,
    RUB: 80.6, SAR: 3.75, SGD: 1.28, THB: 33.8, TWD: 32.4, UAH: 45.6, UYU: 40.1, VND: 25800, ZAR: 16.6,
  };

  function expectSane(currency: string, fxRate: number, amounts: number[] | undefined) {
    expect(amounts).toHaveLength(3);
    const list = amounts as number[];
    list.forEach((amount, i) => {
      expect(Number.isInteger(amount)).toBe(true);
      expect(amount % (STEP[currency] ?? 1)).toBe(0);
      // Never more than a rounding hair over the straight conversion.
      expect(amount).toBeLessThanOrEqual(RACOIN_PACKS[i].priceCents * fxRate * 1.02);
      if (i > 0) {
        expect(amount).toBeGreaterThan(list[i - 1]);
        // A bigger pack is never dearer per Racoin.
        expect(amount * RACOIN_PACKS[i - 1].racoins).toBeLessThanOrEqual(list[i - 1] * RACOIN_PACKS[i].racoins);
      }
    });
  }

  it("takes the square root of the price level, clamped to [0.4, 1], and 1 without a figure", async () => {
    const { regionalFactor } = await import("./catalog");
    expect(regionalFactor(undefined)).toBe(1);
    expect(regionalFactor(Number.NaN)).toBe(1);
    expect(regionalFactor(0)).toBe(1);
    expect(regionalFactor(1.12)).toBe(1);
    expect(regionalFactor(0.81)).toBeCloseTo(0.9, 10);
    expect(regionalFactor(0.25)).toBeCloseTo(0.5, 10);
    expect(regionalFactor(0.16)).toBeCloseTo(0.4, 10);
    expect(regionalFactor(0.1)).toBe(0.4); // sqrt 0.316, under the floor
  });

  it("rounds to .99 where prices have cents", async () => {
    const { regionalPrices } = await import("./catalog");
    // Factor sqrt(0.81) = 0.9: 4.99 x 1.4 x 0.9 = 6.29 -> 6.49; 12.59 -> 12.99; 25.19 -> 24.99
    expect(regionalPrices("CAD", { fxRate: 1.4, priceLevel: 0.81 })).toEqual([649, 1299, 2499]);
    // No price level: a straight conversion, 6.99 / 13.99 / 27.99.
    expect(regionalPrices("CAD", { fxRate: 1.4 })).toEqual([699, 1399, 2799]);
  });

  it("rounds whole-unit currencies to natural numbers", async () => {
    const { regionalPrices } = await import("./catalog");
    // Factor sqrt(0.64) = 0.8: JPY 599 / 1,199 / 2,399 -> 600 / 1,200 / 2,400 yen, in hundredths.
    expect(regionalPrices("JPY", { fxRate: 150, priceLevel: 0.64 })).toEqual([60000, 120000, 240000]);
    // KRW 5,389 / 10,789 / 21,589 -> 5,400 / 11,000 / 22,000.
    expect(regionalPrices("KRW", { fxRate: 1350, priceLevel: 0.64 })).toEqual([540000, 1100000, 2200000]);
    // INR ends in 9: factor sqrt(0.25) = 0.5, 4.99 x 88 x 0.5 = 219.6 -> 219.
    expect(regionalPrices("INR", { fxRate: 88, priceLevel: 0.25 })).toEqual([21900, 43900, 87900]);
  });

  it("never charges above the straight conversion or below the 40% floor", async () => {
    const { regionalPrices } = await import("./catalog");
    expect(regionalPrices("CAD", { fxRate: 1.4, priceLevel: 1.6 })).toEqual(regionalPrices("CAD", { fxRate: 1.4 }));
    expect(regionalPrices("INR", { fxRate: 88, priceLevel: 0.05 }))
      .toEqual(regionalPrices("INR", { fxRate: 88, priceLevel: 0.16 }));
    // At the floor: 4.99 x 88 x 0.4 = 175.6 -> 179, never under 40% of straight.
    const floor = regionalPrices("INR", { fxRate: 88, priceLevel: 0.01 }) as number[];
    floor.forEach((amount, i) => expect(amount).toBeGreaterThanOrEqual(RACOIN_PACKS[i].priceCents * 88 * 0.4));
  });

  it("gives every Steam currency a valid, ordered price list at realistic rates", async () => {
    const { regionalPrices, STEAM_CURRENCIES } = await import("./catalog");
    for (const currency of STEAM_CURRENCIES) {
      if (currency === "USD") continue;
      for (const priceLevel of [undefined, 0.05, 0.16, 0.2, 0.35, 0.5, 0.75, 0.9, 1, 1.3]) {
        const fxRate = RATES[currency];
        expectSane(currency, fxRate, regionalPrices(currency, { fxRate, priceLevel }));
      }
    }
  });

  it("returns only valid lists, or none, at any rate", async () => {
    const { regionalPrices, STEAM_CURRENCIES } = await import("./catalog");
    for (const currency of STEAM_CURRENCIES) {
      for (const fxRate of [0.3, 0.9, 1.4, 3.7, 7, 18, 33, 95, 158, 456, 990, 1327, 3143, 18158, 25806]) {
        const amounts = regionalPrices(currency, { fxRate, priceLevel: 0.6 });
        if (amounts) expectSane(currency, fxRate, amounts);
      }
    }
  });

  it("leaves USD alone and falls back to it when a price cannot be worked out", async () => {
    const { localPrice, regionalPrices } = await import("./catalog");
    const market = { fxRate: 1.4, priceLevel: 0.81 };
    expect(RACOIN_PACKS.map((p) => localPrice(p, "USD", market).amount)).toEqual([499, 999, 1999]);
    expect(regionalPrices("USD", { fxRate: 1 })).toBeUndefined();
    const usd = { currency: "USD", amount: 499 };
    expect(localPrice(RACOIN_PACKS[0], "CAD", undefined)).toEqual(usd);
    expect(localPrice(RACOIN_PACKS[0], "CAD", { fxRate: Number.NaN })).toEqual(usd);
    expect(localPrice(RACOIN_PACKS[0], "CAD", { fxRate: 0 })).toEqual(usd);
    expect(localPrice(RACOIN_PACKS[0], "XXX", market)).toEqual(usd);
    expect(localPrice(RACOIN_PACKS[0], undefined, market)).toEqual(usd);
    // VND at a nonsense rate has no price Steam's 500-dong step accepts.
    expect(localPrice(RACOIN_PACKS[0], "VND", { fxRate: 0.3 })).toEqual(usd);
    expect(localPrice(RACOIN_PACKS[1], "CAD", market)).toEqual({ currency: "CAD", amount: 1299 });
  });

  it("lets a hand-set LOCAL_PRICES row win over the computed price", async () => {
    const catalog = await import("./catalog");
    const table = catalog.LOCAL_PRICES as Record<string, readonly [number, number, number]>;
    table.CAD = [699, 1399, 2799];
    table.JPY = [55050, 110000, 220000]; // the pouch breaks Steam's whole-yen step
    try {
      const cad = { fxRate: 1.4, priceLevel: 0.81 };
      expect(catalog.localPrice(RACOIN_PACKS[1], "CAD", cad)).toEqual({ currency: "CAD", amount: 1399 });
      const jpy = { fxRate: 150, priceLevel: 0.64 };
      expect(catalog.localPrice(RACOIN_PACKS[0], "JPY", jpy)).toEqual({ currency: "JPY", amount: 60000 });
      expect(catalog.localPrice(RACOIN_PACKS[1], "JPY", jpy)).toEqual({ currency: "JPY", amount: 110000 });
    } finally {
      delete table.CAD;
      delete table.JPY;
    }
  });
});

describe("jimothy player prices", () => {
  const realFetch = global.fetch;
  afterEach(() => {
    global.fetch = realFetch;
  });

  function feed(rates: Record<string, number>) {
    const fn = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: "success", rates: { USD: 1, ...rates }, time_next_update_unix: Date.now() / 1000 + 3600,
      }),
    });
    global.fetch = fn as unknown as typeof fetch;
    return fn;
  }

  it("prices the wallet and the purchase from the same cached rates", async () => {
    const pricing = await import("./pricing");
    const { PRICE_LEVELS } = await import("./price-levels");
    const { regionalPrices } = await import("./catalog");
    pricing.resetFxCacheForTests();
    const fetchMock = feed({ CAD: 1.4 });
    const prices = await pricing.playerPrices("CAD");
    const expected = regionalPrices("CAD", { fxRate: 1.4, priceLevel: PRICE_LEVELS.CAD?.level }) as number[];
    expect(prices).toEqual(expected.map((amount) => ({ currency: "CAD", amount })));
    expect(await pricing.playerPrice(RACOIN_PACKS[2], "CAD")).toEqual(prices[2]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("charges USD players USD without asking for rates", async () => {
    const pricing = await import("./pricing");
    pricing.resetFxCacheForTests();
    const fetchMock = feed({});
    expect((await pricing.playerPrices("USD")).map((p) => p.amount)).toEqual([499, 999, 1999]);
    expect((await pricing.playerPrices(undefined)).map((p) => p.currency)).toEqual(["USD", "USD", "USD"]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("falls back to USD when the rate feed is down or lacks the currency", async () => {
    const pricing = await import("./pricing");
    pricing.resetFxCacheForTests();
    const error = jest.spyOn(console, "error").mockImplementation(() => {});
    try {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 }) as unknown as typeof fetch;
      expect(await pricing.playerPrices("CAD")).toEqual([
        { currency: "USD", amount: 499 }, { currency: "USD", amount: 999 }, { currency: "USD", amount: 1999 },
      ]);
      pricing.resetFxCacheForTests();
      feed({ EUR: 0.9 });
      expect((await pricing.playerPrices("CAD"))[0]).toEqual({ currency: "USD", amount: 499 });
      expect((await pricing.playerPrices("EUR"))[0].currency).toBe("EUR");
    } finally {
      error.mockRestore();
    }
  });
});
