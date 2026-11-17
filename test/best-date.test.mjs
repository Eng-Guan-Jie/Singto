// Best Date: which day(s) the most people are free on
// (src/lib/bestDate.js). This is the "smart" part of Singto:
// a counting rule, not a trained model, so the expected
// answer for each case can be worked out by hand.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BEST_DATE_FILTERS,
  findBestOptions,
  summarizeDates,
} from "../src/lib/bestDate.js";

const filter = (value) => BEST_DATE_FILTERS.find((f) => f.value === value);

// 3 people (keys "1", "2", "3") over one week.
const people = [
  { key: "1", display_name: "A" },
  { key: "2", display_name: "B" },
  { key: "3", display_name: "C" },
];
const availability = {
  "2026-10-12": ["1", "2", "3"], // Mon: everyone
  "2026-10-13": ["1", "2"], // Tue
  "2026-10-14": ["1", "2", "3"], // Wed: everyone
  "2026-10-17": ["3"], // Sat
  "2026-10-18": ["1", "3"], // Sun
};
const week = [
  "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15",
  "2026-10-16", "2026-10-17", "2026-10-18",
];

const dates = (options) => options.map((o) => o.dates.join("+"));

test("single day: every day where everyone is free, in date order", () => {
  const options = findBestOptions(week, filter("single"), availability, people);
  assert.deepEqual(dates(options), ["2026-10-12", "2026-10-14"]);
  assert.ok(options.every((o) => o.available === 3 && o.status === "free"));
});

test("two consecutive days: only people free on BOTH days count", () => {
  const options = findBestOptions(week, filter("two-days"), availability, people);
  assert.deepEqual(dates(options), [
    "2026-10-12+2026-10-13",
    "2026-10-13+2026-10-14",
  ]);
  assert.ok(options.every((o) => o.available === 2 && o.total === 3));
});

test("three consecutive days", () => {
  const options = findBestOptions(week, filter("three-days"), availability, people);
  assert.deepEqual(dates(options), ["2026-10-12+2026-10-13+2026-10-14"]);
  assert.equal(options[0].status, "partial");
});

test("holidays only: weekends and Thai holidays", () => {
  // 13 Oct is a Thai public holiday; the weekend days follow.
  const options = findBestOptions(week, filter("holiday"), availability, people);
  assert.deepEqual(dates(options), ["2026-10-13", "2026-10-18"]);
});

test("names: who is and is not free on the picked days", () => {
  const summary = summarizeDates(["2026-10-12", "2026-10-13"], availability, people);
  assert.deepEqual(summary.availablePeople.map((p) => p.display_name), ["A", "B"]);
  assert.deepEqual(summary.unavailablePeople.map((p) => p.display_name), ["C"]);
});

test("nobody has picked days yet: no suggestion", () => {
  assert.deepEqual(findBestOptions(week, filter("single"), {}, people), []);
});

test("a period shorter than the filter gives no suggestion", () => {
  const twoDays = ["2026-10-12", "2026-10-13"];
  assert.deepEqual(findBestOptions(twoDays, filter("three-days"), availability, people), []);
});

test("people who accepted but picked no days count as not free", () => {
  const withSilent = [...people, { key: "4", display_name: "D" }];
  const [best] = findBestOptions(week, filter("single"), availability, withSilent);
  assert.equal(best.available, 3);
  assert.equal(best.total, 4);
  assert.equal(best.status, "partial");
});
