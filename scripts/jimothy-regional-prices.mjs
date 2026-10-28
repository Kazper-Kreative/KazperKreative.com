// Jimothy's Racoin packs, priced in every Steam currency from today's data.
//
//   node scripts/jimothy-regional-prices.mjs [--write] [--out <path-without-extension>]
//
// Fetches today's exchange rates (open.er-api.com) and the World Bank's latest
// price levels, then prices the packs with the same arithmetic the store uses
// (src/lib/jimothy/catalog.ts, run directly: Node 24 strips its types).
//
//   --write  refresh src/lib/jimothy/price-levels.ts, the World Bank snapshot
//            the store prices from. Yearly data: run it when the Bank
//            publishes a new year (its ICP update, usually mid-year).
//   --out    also save the table as <path>.md and <path>.csv.
//
// The store itself fetches only the exchange rates at run time.

import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  CURRENCY_ECONOMY, LOCAL_PRICES, RACOIN_PACKS, STEAM_CURRENCIES, localPrice, regionalFactor,
} from "../src/lib/jimothy/catalog.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const write = args.includes("--write");
const outIndex = args.indexOf("--out");
const out = outIndex >= 0 ? args[outIndex + 1] : undefined;

const FIRST_YEAR = 2015;
const thisYear = new Date().getUTCFullYear();

async function json(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

/** { economy: { year: value } } for one World Bank indicator. */
async function indicator(id, economies) {
  const url = `https://api.worldbank.org/v2/country/${economies.join(";")}/indicator/${id}` +
    `?format=json&date=${FIRST_YEAR}:${thisYear}&per_page=5000`;
  const body = await json(url);
  const rows = Array.isArray(body) && Array.isArray(body[1]) ? body[1] : [];
  const byEconomy = {};
  for (const r of rows) {
    if (typeof r.value !== "number") continue;
    (byEconomy[r.countryiso3code] ??= {})[r.date] = r.value;
  }
  return byEconomy;
}

/** The latest year both series have, and their ratio a / b. */
function latestRatio(a = {}, b = {}) {
  const years = Object.keys(a).filter((y) => y in b).sort().reverse();
  return years.length ? { level: a[years[0]] / b[years[0]], year: Number(years[0]) } : undefined;
}

const fx = await json("https://open.er-api.com/v6/latest/USD");
if (fx.result !== "success") throw new Error("open.er-api.com: " + fx.result);

const economies = [...new Set(Object.values(CURRENCY_ECONOMY))];
const [ppp, fcrf, gdpUsd, gdpPpp] = await Promise.all([
  indicator("PA.NUS.PPP", economies),
  indicator("PA.NUS.FCRF", economies),
  // Aggregates (the euro area) have no PPP factor: their price level is
  // GDP in US$ over GDP in PPP$, which is the same ratio.
  indicator("NY.GDP.MKTP.CD", ["EMU"]),
  indicator("NY.GDP.MKTP.PP.CD", ["EMU"]),
]);

const levels = {};
const notes = {};
for (const [currency, economy] of Object.entries(CURRENCY_ECONOMY)) {
  const found = economy === "EMU"
    ? latestRatio(gdpUsd.EMU, gdpPpp.EMU)
    : latestRatio(ppp[economy], fcrf[economy]);
  if (found) levels[currency] = { level: Math.round(found.level * 10000) / 10000, year: found.year };
  else notes[currency] = `no World Bank price level for ${economy}`;
}

const currencies = [...STEAM_CURRENCIES].sort();
const first = ["CAD", "EUR", "GBP", "AUD"];
const ordered = [...first, ...currencies.filter((c) => !first.includes(c))];

const fmt = (amount) => (amount / 100).toFixed(2);
const rows = ordered.map((currency) => {
  const rate = currency === "USD" ? 1 : fx.rates?.[currency];
  const lv = levels[currency];
  const market = typeof rate === "number" ? { fxRate: rate, priceLevel: lv?.level } : undefined;
  const prices = RACOIN_PACKS.map((p) => localPrice(p, currency, market));
  let note = "";
  if (currency === "USD") note = "base price";
  else if (!market) note = "no exchange rate: charged USD";
  else if (LOCAL_PRICES[currency]) note = "hand-set LOCAL_PRICES row";
  else if (!lv) note = (notes[currency] ?? "no World Bank figure") + ": straight conversion";
  else if (lv.level > 1) note = `price level ${lv.level.toFixed(3)} clamped to 1`;
  else if (lv.level < 0.35) note = `price level ${lv.level.toFixed(3)} clamped to 0.35`;
  if (prices.some((p) => p.currency !== currency)) note = (note ? note + "; " : "") + "fell back to USD";
  return {
    currency,
    rate: rate ?? "",
    factor: currency === "USD" ? 1 : regionalFactor(lv?.level),
    year: lv?.year ?? "",
    pouch: prices[0], bag: prices[1], bin: prices[2],
    straightBag: typeof rate === "number" ? fmt(RACOIN_PACKS[1].priceCents * rate) : "",
    note,
  };
});

const header = ["Currency", "USD rate", "Factor", "WB year", "Pouch (500)", "Bag (1,200)", "Bin (2,500)",
  "Bag straight conversion", "Bag vs straight", "Note"];
const priceCell = (p, currency) => fmt(p.amount) + (p.currency !== currency ? " USD" : "");
const table = rows.map((r) => [
  r.currency,
  r.rate === "" ? "" : String(Number(r.rate.toPrecision(6))),
  r.factor.toFixed(3),
  String(r.year),
  priceCell(r.pouch, r.currency), priceCell(r.bag, r.currency), priceCell(r.bin, r.currency),
  r.straightBag,
  r.straightBag && r.bag.currency === r.currency ? `${Math.round((r.bag.amount / 100 / Number(r.straightBag)) * 100)}%` : "",
  r.note,
]);

const stamp = `Exchange rates: open.er-api.com, ${fx.time_last_update_utc}. ` +
  `Price levels: World Bank PA.NUS.PPP / PA.NUS.FCRF (euro area: NY.GDP.MKTP.CD / NY.GDP.MKTP.PP.CD), ` +
  `clamped to [0.35, 1]. Prices are what Steam would be charged, in the player's currency.`;
const md = [
  "# Jimothy Racoin packs: regional prices",
  "",
  stamp,
  "",
  "| " + header.join(" | ") + " |",
  "|" + header.map(() => "---").join("|") + "|",
  ...table.map((r) => "| " + r.join(" | ") + " |"),
  "",
].join("\n");
const csvCell = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const csv = [header, ...table].map((r) => r.map(csvCell).join(",")).join("\n") + "\n";

console.log(md);
if (out) {
  writeFileSync(out + ".md", md);
  writeFileSync(out + ".csv", csv);
  console.log(`saved ${out}.md and ${out}.csv`);
}

if (write) {
  const lines = Object.keys(levels).sort().map((c) =>
    `  ${c}: { level: ${levels[c].level}, year: ${levels[c].year} },`);
  const file = [
    "// Generated by scripts/jimothy-regional-prices.mjs --write; do not edit by hand.",
    `// World Bank price levels (PPP conversion factor / market exchange rate), as of ${new Date().toISOString().slice(0, 10)}.`,
    "// Unclamped: regionalFactor() in catalog.ts clamps them. A currency missing",
    "// here is priced at a straight conversion.",
    "",
    "export const PRICE_LEVELS: Readonly<Record<string, { level: number; year: number }>> = {",
    ...lines,
    "};",
    "",
  ].join("\r\n");
  writeFileSync(join(root, "src/lib/jimothy/price-levels.ts"), file);
  console.log("wrote src/lib/jimothy/price-levels.ts");
}
