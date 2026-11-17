// Calendar colours: green / yellow / red / grey (src/lib/calendar.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { getAvailabilityStatus, isHoliday } from "../src/lib/calendar.js";

test("everyone free is green (free)", () => {
  assert.equal(getAvailabilityStatus(4, 4), "free");
});

test("some people free is yellow (partial)", () => {
  assert.equal(getAvailabilityStatus(1, 4), "partial");
  assert.equal(getAvailabilityStatus(3, 4), "partial");
});

test("nobody free is red (busy)", () => {
  assert.equal(getAvailabilityStatus(0, 4), "busy");
});

test("no accepted participants yet has no colour", () => {
  assert.equal(getAvailabilityStatus(0, 0), "");
});

test("weekends and fixed Thai holidays count as holidays", () => {
  assert.equal(isHoliday("2026-10-17"), true); // Saturday
  assert.equal(isHoliday("2026-10-18"), true); // Sunday
  assert.equal(isHoliday("2026-04-13"), true); // Songkran (Monday)
  assert.equal(isHoliday("2026-10-14"), false); // ordinary Wednesday
});
