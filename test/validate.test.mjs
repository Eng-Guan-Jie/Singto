// Event form checks on the server (api/_validate.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { requireApi } from "./helpers.mjs";

const { validateEventInput } = requireApi("_validate.js");

const valid = {
  eventName: "  Dinner  ",
  description: "  At the cafe  ",
  startDate: "2026-10-01",
  endDate: "2026-10-31",
};

test("accepts a normal event and trims text", () => {
  const { error, value } = validateEventInput(valid);
  assert.equal(error, undefined);
  assert.equal(value.eventName, "Dinner");
  assert.equal(value.description, "At the cafe");
});

test("an empty description is saved as null", () => {
  assert.equal(validateEventInput({ ...valid, description: "   " }).value.description, null);
});

test("rejects missing fields", () => {
  assert.match(validateEventInput({ ...valid, eventName: "   " }).error, /required/);
  assert.match(validateEventInput({ ...valid, startDate: "" }).error, /required/);
});

test("rejects a name over 100 characters and a 10,000-character name", () => {
  assert.match(validateEventInput({ ...valid, eventName: "x".repeat(101) }).error, /100 characters/);
  assert.match(validateEventInput({ ...valid, eventName: "x".repeat(10000) }).error, /100 characters/);
  assert.equal(validateEventInput({ ...valid, eventName: "x".repeat(100) }).error, undefined);
});

test("rejects a description over 500 characters", () => {
  assert.match(validateEventInput({ ...valid, description: "x".repeat(501) }).error, /500 characters/);
});

test("rejects dates that do not exist or are badly formatted", () => {
  assert.match(validateEventInput({ ...valid, endDate: "2026-02-30" }).error, /valid/);
  assert.match(validateEventInput({ ...valid, startDate: "10/01/2026" }).error, /valid/);
});

test("rejects an end date before the start date", () => {
  assert.match(validateEventInput({ ...valid, endDate: "2026-09-01" }).error, /after startDate/);
});

test("allows up to one year, rejects longer periods", () => {
  assert.equal(validateEventInput({ ...valid, endDate: "2027-10-01" }).error, undefined);
  assert.match(validateEventInput({ ...valid, endDate: "2028-10-01" }).error, /one year/);
});

test("rejects text fields that are not text", () => {
  assert.match(validateEventInput({ ...valid, eventName: { a: 1 } }).error, /required/);
  assert.match(validateEventInput({ ...valid, description: 42 }).error, /must be text/);
});
