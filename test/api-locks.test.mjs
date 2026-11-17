// After the organizer confirms a date the event is locked:
// no second confirmation, no availability or answer changes,
// and only the description can be edited.
import { test } from "node:test";
import assert from "node:assert/strict";
import { EVENT_ID, auth, call, eventWorld, fakeLine, fakeSql, loadApi, members } from "./helpers.mjs";

const query = { id: EVENT_ID };
const confirmedSql = () => fakeSql(eventWorld({ members: members(), finalized: true }));
const openSql = () => fakeSql(eventWorld({ members: members(), finalized: false }));
const edit = { idToken: "t", eventName: "Dinner", description: "new text", startDate: "2026-10-01", endDate: "2026-10-31" };

test("a date cannot be confirmed twice", async () => {
  fakeLine("U_ORGANIZER");
  const res = await call(loadApi("events/[id]/confirm.js", confirmedSql()), {
    method: "POST", query, body: { idToken: "t", dates: ["2026-10-13"] },
  });
  assert.equal(res.statusCode, 409);
});

test("available days are locked for everyone", async () => {
  for (const user of ["U_PARTICIPANT", "U_ORGANIZER"]) {
    fakeLine(user);
    const sql = confirmedSql();
    const res = await call(loadApi("events/[id]/availability.js", sql), {
      method: "POST", query, body: { idToken: "t", dates: ["2026-10-13"] },
    });
    assert.equal(res.statusCode, 409, user);
    assert.ok(!sql.calls.some((c) => c.transaction), `${user} wrote availability`);
  }
});

test("join / decline answers are locked", async () => {
  fakeLine("U_PARTICIPANT");
  const res = await call(loadApi("events/[id]/participants.js", confirmedSql()), {
    method: "POST", query, body: { idToken: "t", status: "declined" },
  });
  assert.equal(res.statusCode, 409);
});

test("name and dates cannot be edited", async () => {
  fakeLine("U_ORGANIZER");
  for (const change of [{ eventName: "Lunch" }, { endDate: "2026-10-30" }, { startDate: "2026-10-02" }]) {
    const res = await call(loadApi("events/[id].js", confirmedSql()), { method: "PATCH", query, body: { ...edit, ...change } });
    assert.equal(res.statusCode, 409, JSON.stringify(change));
  }
});

test("the description can still be edited, and only the description", async () => {
  fakeLine("U_ORGANIZER");
  const sql = confirmedSql();
  const res = await call(loadApi("events/[id].js", sql), { method: "PATCH", query, body: edit });

  assert.equal(res.statusCode, 200);
  const updates = sql.calls.filter((c) => c.text?.startsWith("UPDATE"));
  assert.equal(updates.length, 1);
  assert.match(updates[0].text, /^UPDATE events SET description = \?/);
});

test("before confirmation the organizer can still change name and dates", async () => {
  fakeLine("U_ORGANIZER");
  const sql = openSql();
  const res = await call(loadApi("events/[id].js", sql), { method: "PATCH", query, body: { ...edit, eventName: "Lunch" } });
  assert.equal(res.statusCode, 200);
  assert.ok(sql.calls.some((c) => c.transaction));
});

test("before confirmation participants can still save their days", async () => {
  fakeLine("U_PARTICIPANT");
  const res = await call(loadApi("events/[id]/availability.js", openSql()), {
    method: "POST", query, body: { idToken: "t", dates: ["2026-10-13"] },
  });
  assert.equal(res.statusCode, 200);
});

test("days outside the scheduling period are rejected", async () => {
  fakeLine("U_PARTICIPANT");
  const res = await call(loadApi("events/[id]/availability.js", openSql()), {
    method: "POST", query, body: { idToken: "t", dates: ["2026-11-05"] },
  });
  assert.equal(res.statusCode, 400);
});
