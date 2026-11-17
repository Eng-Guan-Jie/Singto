// Best Date evaluation for docs/final/ai-logic.md §4.
//
// Runs the controlled dataset (P01–P04, 21–25 Nov 2026) and
// test cases AI-01 … AI-07 exactly as written in that
// document, and checks the app's output against the
// expected answers worked out by hand there.
//
//   npm test                         (all tests)
//   node --test test/ai-eval.test.mjs   (this file only)
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BEST_DATE_FILTERS,
  findBestOptions,
  summarizeDates,
} from "../src/lib/bestDate.js";

const filter = (value) => BEST_DATE_FILTERS.find((f) => f.value === value);

// ai-logic.md §4.1: event 21–25 Nov 2026, P01–P04 accepted.
const PERIOD = ["2026-11-21", "2026-11-22", "2026-11-23", "2026-11-24", "2026-11-25"];
const FREE = {
  P01: ["2026-11-21", "2026-11-22", "2026-11-23", "2026-11-24", "2026-11-25"],
  P02: ["2026-11-21", "2026-11-22", "2026-11-23"],
  P03: ["2026-11-21", "2026-11-22", "2026-11-24"],
  P04: ["2026-11-21", "2026-11-24", "2026-11-25"],
};

const people = Object.keys(FREE).map((key) => ({ key, display_name: key }));

const availability = {};
for (const [person, days] of Object.entries(FREE)) {
  for (const day of days) (availability[day] ||= []).push(person);
}

const count = (dates) => summarizeDates(dates, availability, people).available;
const best = (value) =>
  findBestOptions(PERIOD, filter(value), availability, people).map(
    (o) => `${o.dates.join("+")} ${o.available}/${o.total}`
  );

// ---------- §4.2 expected results ----------

test("§4.2 Single Date counts and recommendation (AI-01)", () => {
  assert.deepEqual(PERIOD.map((d) => count([d])), [4, 3, 2, 3, 2]);
  assert.deepEqual(best("single"), ["2026-11-21 4/4"]);
});

test("§4.2 Two Days counts and recommendation (AI-02)", () => {
  const pairs = [0, 1, 2, 3].map((i) => PERIOD.slice(i, i + 2));
  assert.deepEqual(pairs.map(count), [3, 2, 1, 2]);
  assert.deepEqual(best("two-days"), ["2026-11-21+2026-11-22 3/4"]);
});

test("§4.2 Three Days counts and recommendation (AI-03)", () => {
  const triples = [0, 1, 2].map((i) => PERIOD.slice(i, i + 3));
  assert.deepEqual(triples.map(count), [2, 1, 1]);
  assert.deepEqual(best("three-days"), ["2026-11-21+2026-11-22+2026-11-23 2/4"]);
});

test("§4.2 Holiday filter: only the weekend is considered (AI-04)", () => {
  // 21 Nov (Sat) 4/4 and 22 Nov (Sun) 3/4: the top one is returned.
  assert.deepEqual(best("holiday"), ["2026-11-21 4/4"]);
});

// ---------- §4.3 additional test cases ----------

test("AI-05 equal highest counts: every tied candidate is returned", () => {
  const tied = { ...availability, "2026-11-24": ["P01", "P02", "P03", "P04"] };
  const options = findBestOptions(PERIOD, filter("single"), tied, people);
  assert.deepEqual(options.map((o) => o.dates[0]), ["2026-11-21", "2026-11-24"]);
});

test("AI-06 no available participants: empty recommendation list", () => {
  assert.deepEqual(findBestOptions(PERIOD, filter("single"), {}, people), []);
});

test("AI-07 accepted participant without submitted days stays in the total", () => {
  const withP05 = [...people, { key: "P05", display_name: "P05" }];
  const [top] = findBestOptions(PERIOD, filter("single"), availability, withP05);
  assert.equal(top.available, 4);
  assert.equal(top.total, 5);
  assert.equal(top.status, "partial");
});

// ---------- §5.1 processing time ----------

test("processing time: 30 people × 1 year, all four filters", (t) => {
  const year = Array.from({ length: 366 }, (_, i) =>
    new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10)
  );
  const crowd = Array.from({ length: 30 }, (_, i) => ({ key: `U${i}`, display_name: `U${i}` }));
  const big = {};
  year.forEach((day, d) => {
    big[day] = crowd.filter((_, i) => (d + i) % 3 !== 0).map((p) => p.key);
  });

  const started = performance.now();
  for (const f of BEST_DATE_FILTERS) findBestOptions(year, f, big, crowd);
  const ms = performance.now() - started;

  t.diagnostic(`all four filters, 30 people x 366 days: ${ms.toFixed(1)} ms`);
  assert.ok(ms < 1000, `took ${ms} ms`);
});
