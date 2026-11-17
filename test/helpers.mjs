// Shared helpers for the API tests.
//
// The API files are CommonJS and talk to Neon through
// api/_db.js and to LINE through fetch. The tests swap in
// a fake database and a fake LINE, so they run offline
// with no secrets and never touch real data.

import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API_DIR = path.join(ROOT, "api");

export const EVENT_ID = "11111111-1111-1111-1111-111111111111";

/*
 * Fake `sql` tagged template. `route(text, values)` returns
 * the rows for a query; every query is recorded in `calls`.
 * Queries passed to sql.transaction are recorded too.
 */
export function fakeSql(route) {
  const calls = [];

  const sql = (strings, ...values) => {
    const text = strings.join("?").replace(/\s+/g, " ").trim();
    const query = { text, values };
    calls.push(query);

    return {
      ...query,
      then: (resolve, reject) =>
        Promise.resolve(route(text, values) || []).then(resolve, reject),
    };
  };

  sql.transaction = async (queries) => {
    calls.push({ transaction: queries.map((q) => q.text) });
    return queries.map((q) => route(q.text, q.values) || [{ id: 1 }]);
  };

  sql.calls = calls;
  return sql;
}

/*
 * Fake LINE: token verification answers as `lineUserId`
 * (or rejects when it is null); pushes are counted.
 */
export function fakeLine(lineUserId) {
  const line = { pushes: [], replies: [] };

  globalThis.fetch = async (url, options = {}) => {
    const href = String(url);

    if (href.includes("/oauth2/v2.1/verify")) {
      return lineUserId
        ? { ok: true, json: async () => ({ sub: lineUserId, name: "Tester" }) }
        : { ok: false, status: 400, json: async () => ({ error_description: "invalid" }) };
    }

    if (href.includes("/members/count")) {
      return { ok: true, json: async () => ({ count: 5 }) };
    }

    if (href.includes("/message/reply")) {
      line.replies.push(JSON.parse(options.body));
      return { ok: true, json: async () => ({}), text: async () => "" };
    }

    if (href.includes("/message/push")) {
      line.pushes.push(JSON.parse(options.body));
      return { ok: true, json: async () => ({}) };
    }

    return { ok: false, status: 404, json: async () => ({}) };
  };

  return line;
}

/* Load an API file fresh, with `sql` as its database. */
export function loadApi(file, sql) {
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(API_DIR)) delete require.cache[key];
  }

  const dbPath = path.join(API_DIR, "_db.js");
  require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: sql };

  process.env.LINE_LOGIN_CHANNEL_ID = "test-login-channel";
  process.env.LINE_CHANNEL_ACCESS_TOKEN = "test-access-token";
  process.env.LIFF_ID = "test-liff-id";

  return require(path.join(API_DIR, file));
}

export const requireApi = (file) => require(path.join(API_DIR, file));

/* Minimal Vercel-style response object. */
export function fakeRes() {
  return {
    statusCode: 200,
    body: undefined,
    headers: {},
    setHeader(name, value) {
      this.headers[name] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    end() {
      return this;
    },
  };
}

export async function call(handler, req) {
  const res = fakeRes();
  await handler({ headers: {}, query: {}, ...req }, res);
  return res;
}

/* A row from the events table, as getEventRole reads it. */
export const eventRow = (overrides = {}) => ({
  id: EVENT_ID,
  event_name: "Dinner",
  start_date: new Date("2026-10-01T00:00:00Z"),
  end_date: new Date("2026-10-31T00:00:00Z"),
  line_chat_id: "C-test-group",
  organizer_line_user_id: "U_ORGANIZER",
  finalized_date: null,
  ...overrides,
});

/*
 * A small event in the fake database:
 * members: { LINE user id: { id, status, name, days: [...] } }
 */
export function eventWorld({ members, finalized = false }) {
  return (text, values) => {
    if (text.includes("FROM events WHERE id")) {
      return [
        eventRow({
          finalized_date: finalized ? new Date("2026-10-12T00:00:00Z") : null,
        }),
      ];
    }

    if (text.startsWith("SELECT event_name FROM events")) {
      return [{ event_name: "Dinner" }];
    }

    if (text.startsWith("SELECT id, status FROM participants")) {
      const member = members[values[1]];
      return member ? [{ id: member.id, status: member.status }] : [];
    }

    if (text.includes("FROM availability a")) {
      return Object.entries(members)
        .filter(([, m]) => m.status === "accepted")
        .flatMap(([lineUserId, m]) =>
          (m.days || []).map((day) => ({
            available_date: new Date(`${day}T00:00:00Z`),
            participant_id: m.id,
            line_user_id: lineUserId,
          }))
        );
    }

    if (text.startsWith("SELECT id, display_name, picture_url FROM participants")) {
      return Object.values(members)
        .filter((m) => m.status === "accepted")
        .map((m) => ({ id: m.id, display_name: m.name, picture_url: null }));
    }

    if (text.startsWith("SELECT display_name, picture_url, status FROM participants")) {
      return Object.values(members).map((m) => ({
        display_name: m.name,
        picture_url: null,
        status: m.status,
      }));
    }

    if (text.startsWith("SELECT display_name, picture_url FROM participants")) {
      const organizer = members.U_ORGANIZER;
      return organizer ? [{ display_name: organizer.name, picture_url: null }] : [];
    }

    if (text.startsWith("UPDATE events SET description")) {
      return [{ id: EVENT_ID, description: values[0] }];
    }

    return [];
  };
}

// The usual cast: organizer, one participant, one other.
export const members = () => ({
  U_ORGANIZER: { id: 1, status: "accepted", name: "Org", days: ["2026-10-12"] },
  U_PARTICIPANT: { id: 2, status: "accepted", name: "Part", days: ["2026-10-12", "2026-10-13"] },
  U_OTHER: { id: 3, status: "declined", name: "Other" },
});

export const auth = { authorization: "Bearer test-token" };
