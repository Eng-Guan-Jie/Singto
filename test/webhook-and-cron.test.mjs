// The two public endpoints: the LINE webhook must prove the
// request came from LINE, and the clean-up cron must only
// run for Vercel Cron (AGENTS.md 5.1, security checklist 4).
import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { call, fakeLine, fakeSql, loadApi } from "./helpers.mjs";

const SECRET = "test-channel-secret";
const sign = (body) => crypto.createHmac("sha256", SECRET).update(body).digest("base64");

test("webhook rejects missing or wrong signatures", async () => {
  process.env.LINE_CHANNEL_SECRET = SECRET;
  const handler = loadApi("line-webhook.js", fakeSql(() => []));
  const body = JSON.stringify({ events: [] });

  const none = await call(handler, { method: "POST", body, headers: {} });
  const wrong = await call(handler, { method: "POST", body, headers: { "x-line-signature": sign("other") } });

  assert.equal(none.statusCode, 401);
  assert.equal(wrong.statusCode, 401);
});

test("webhook replies with the Create event card when someone types สิงโต", async () => {
  process.env.LINE_CHANNEL_SECRET = SECRET;
  const line = fakeLine(null);
  const handler = loadApi("line-webhook.js", fakeSql(() => []));
  const body = JSON.stringify({
    events: [{
      type: "message",
      replyToken: "reply-1",
      source: { type: "group", groupId: "C-test-group" },
      message: { type: "text", text: "สิงโต ช่วยหน่อย" },
    }],
  });

  const res = await call(handler, { method: "POST", body, headers: { "x-line-signature": sign(body) } });

  assert.equal(res.statusCode, 200);
  assert.equal(line.replies.length, 1);
  assert.equal(line.replies[0].messages[0].type, "flex");
});

test("clean-up refuses to run without CRON_SECRET or with a wrong one", async () => {
  const handler = loadApi("cron/cleanup.js", fakeSql(() => []));

  delete process.env.CRON_SECRET;
  assert.equal((await call(handler, { headers: {} })).statusCode, 500);

  process.env.CRON_SECRET = "cron-secret";
  assert.equal((await call(handler, { headers: { authorization: "Bearer wrong" } })).statusCode, 401);
});

test("clean-up deletes events that ended more than 30 days ago", async () => {
  process.env.CRON_SECRET = "cron-secret";
  const sql = fakeSql((text) =>
    text.includes("FROM events WHERE end_date") ? [{ id: "old-1" }, { id: "old-2" }] : null
  );
  const res = await call(loadApi("cron/cleanup.js", sql), { headers: { authorization: "Bearer cron-secret" } });

  assert.equal(res.statusCode, 200);
  const select = sql.calls.find((c) => c.text?.includes("FROM events WHERE end_date"));
  assert.deepEqual(select.values, [30]);
  const tx = sql.calls.find((c) => c.transaction);
  assert.equal(tx.transaction.length, 3);
});
