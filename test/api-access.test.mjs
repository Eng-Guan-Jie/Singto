// Who can see and change what (AGENTS.md 5.1 / 5.3).
// Every request is checked against the LINE user the
// token belongs to, never an ID the client sends.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  EVENT_ID, auth, call, eventWorld, fakeLine, fakeSql, loadApi, members,
} from "./helpers.mjs";

const query = { id: EVENT_ID };

test("no LINE token: 401 and no data", async () => {
  fakeLine(null);
  const sql = fakeSql(eventWorld({ members: members() }));

  for (const file of ["events/[id]/availability.js", "events/[id]/participants.js", "events/[id]/responses.js", "my-events.js"]) {
    const res = await call(loadApi(file, sql), { method: "GET", query, headers: {} });
    assert.equal(res.statusCode, 401, file);
  }
});

test("a participant sees who is free by name, but never other people's LINE IDs", async () => {
  fakeLine("U_PARTICIPANT");
  const handler = loadApi("events/[id]/availability.js", fakeSql(eventWorld({ members: members() })));
  const res = await call(handler, { method: "GET", query, headers: auth });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.role, "participant");
  assert.deepEqual(res.body.availabilityByKey["2026-10-12"].sort(), ["1", "2"]);
  assert.deepEqual(res.body.acceptedPeople.map((p) => p.display_name), ["Org", "Part"]);

  const json = JSON.stringify(res.body);
  assert.ok(!json.includes("U_ORGANIZER"), "organizer LINE ID leaked");
  assert.ok(!json.includes("U_OTHER"), "other member LINE ID leaked");
});

test("someone who has not answered (guest) gets no names or counts", async () => {
  fakeLine("U_STRANGER");
  const sql = fakeSql(eventWorld({ members: members() }));

  const availability = await call(loadApi("events/[id]/availability.js", sql), { method: "GET", query, headers: auth });
  assert.equal(availability.body.role, "guest");
  assert.equal(availability.body.acceptedPeople, undefined);
  assert.equal(availability.body.counts, undefined);

  const responses = await call(loadApi("events/[id]/responses.js", sql), { method: "GET", query, headers: auth });
  assert.deepEqual(responses.body.accepted, []);
  assert.deepEqual(responses.body.declined, []);
});

test("who joins / declined lists carry names only, no LINE IDs", async () => {
  fakeLine("U_PARTICIPANT");
  const res = await call(
    loadApi("events/[id]/responses.js", fakeSql(eventWorld({ members: members() }))),
    { method: "GET", query, headers: auth }
  );
  assert.equal(res.body.myStatus, "accepted");
  assert.deepEqual(res.body.declined, [{ display_name: "Other", picture_url: null }]);
  assert.ok(!JSON.stringify(res.body).includes("U_"));
});

test("only the organizer can edit, delete or confirm", async () => {
  fakeLine("U_PARTICIPANT");
  const body = { idToken: "t", eventName: "Dinner", description: "x", startDate: "2026-10-01", endDate: "2026-10-31" };

  const sql = fakeSql(eventWorld({ members: members() }));
  const edit = await call(loadApi("events/[id].js", sql), { method: "PATCH", query, body });
  const remove = await call(loadApi("events/[id].js", sql), { method: "DELETE", query, headers: auth });
  const confirm = await call(loadApi("events/[id]/confirm.js", sql), {
    method: "POST", query, body: { idToken: "t", dates: ["2026-10-12"] },
  });

  assert.equal(edit.statusCode, 403);
  assert.equal(remove.statusCode, 403);
  assert.equal(confirm.statusCode, 403);
  assert.ok(!sql.calls.some((c) => c.transaction), "something was written");
});

test("the organizer deletes an event with everyone's data, children first", async () => {
  fakeLine("U_ORGANIZER");
  const sql = fakeSql(eventWorld({ members: members() }));
  const res = await call(loadApi("events/[id].js", sql), { method: "DELETE", query, headers: auth });

  assert.equal(res.statusCode, 200);
  const tables = sql.calls.find((c) => c.transaction).transaction.map((t) => t.match(/DELETE FROM (\w+)/)[1]);
  assert.deepEqual(tables, ["availability", "participants", "events"]);
});

test("delete my account removes only the caller's own rows", async () => {
  fakeLine("U_PARTICIPANT");
  const sql = fakeSql(() => []);
  const res = await call(loadApi("account.js", sql), { method: "DELETE", headers: auth });

  assert.equal(res.statusCode, 200);
  const tx = sql.calls.find((c) => c.transaction);
  assert.equal(tx.transaction.length, 3);
});
