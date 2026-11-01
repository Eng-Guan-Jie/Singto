# Singto – Security Checklist

Security checks for Singto, the LINE group scheduling assistant (LIFF frontend + Vercel serverless `api/` + Neon PostgreSQL).
Review this list before every release to UAT/production and whenever auth, API routes, or environment variables change.

**Legend:** `[x]` verified · `[ ]` not yet verified / not done

| # | Area | Risk if missed |
|---|------|----------------|
| 1 | Authentication (LINE ID token) | Anyone can call the API as any user |
| 2 | Authorization (event ownership) | Users edit or confirm other people's events |
| 3 | Secrets & environment separation | Leaked tokens, dev traffic hitting production data |
| 4 | LINE webhook signature | Forged webhook events trigger bot actions |
| 5 | Input validation & SQL injection | Database tampering or data leaks |
| 6 | Personal data & dependencies | Over-collected user data, known-vulnerable packages |

---

## 1. Authentication – verify the LINE ID token on the server

Every API request that acts on behalf of a user must prove who the user is with a LINE ID token, checked on the backend.

- [ ] Every route in `api/` (except the public webhook) reads the token from the `Authorization: Bearer <idToken>` header.
- [ ] The token is verified server-side via `verifyLineIdToken()` in `api/_auth.js` (LINE `/oauth2/v2.1/verify` with our `client_id`).
- [ ] The user ID used in queries comes from the **verified token's `sub`**, never from `req.body`, query string, or the frontend.
- [ ] Missing, expired, or invalid tokens return `401` and no data.
- [ ] The dev-only bypass (`dev:` tokens) works only when **both** `DEV_AUTH_BYPASS === "true"` **and** `VERCEL_ENV === "development"`.

**How to verify**
1. Call any protected endpoint without a token → expect `401`.
2. Call it with a made-up token (e.g. `Bearer abc`) → expect `401`.
3. On the production/UAT URL, send `Bearer dev:U_test` → expect `401`.
4. Send a valid token for user A with `userId` of user B in the body → the action is still performed as A (or rejected).

---

## 2. Authorization – users can only touch what they own

A valid login is not enough; each action must check the user's role in that event.

- [ ] Only the **organizer** of an event can edit event details, confirm the final date, or delete the event.
- [ ] A participant can only create/update **their own** availability for an event.
- [ ] Event data is only returned to members of the LINE group/event it belongs to.
- [ ] Event IDs are unguessable (UUID / random), not sequential numbers.

**How to verify**
1. Log in as a participant (or `?devUser=U_bob` in local dev) and try to confirm a date on an event created by `U_dev_organizer` → expect `403`.
2. As user B, try to overwrite user A's availability by changing the user field in the request → expect `403` or no effect.
3. Request `GET /api/events/<id>` for an event you are not part of → expect `403`/`404`.

---

## 3. Secrets & environment separation

- [ ] `LINE_CHANNEL_SECRET`, `LINE_CHANNEL_ACCESS_TOKEN`, and `DATABASE_URL` are stored only in Vercel Environment Variables / `.env.local`, never in source code.
- [ ] `.env`, `.env.local`, and `.env.*.local` are listed in `.gitignore`, and `git log -p | grep -i -E "secret|token|DATABASE_URL"` shows no committed values.
- [ ] No server secret uses the `VITE_` prefix (anything `VITE_*` is bundled into the public frontend).
- [ ] Local development uses a **separate Neon branch** database, not the production/UAT database.
- [ ] `API_BASE` in development does **not** point at `https://singto-eight.vercel.app`; local runs use `vercel dev` with `API_BASE = ""`.
- [ ] LINE push messages are skipped (logged only) when the dev bypass is on.

**How to verify**
1. Search the repo: `grep -rn -E "channelSecret|accessToken|postgres(ql)?://" src api` → no hard-coded values.
2. Build the frontend (`npm run build`) and search `dist/` for the channel secret or DB URL → no matches.
3. Run locally and create an event → it appears in the dev Neon branch only, not in production.

---

## 4. LINE webhook signature verification

The bot webhook is public, so every request must be proven to come from LINE.

- [ ] The webhook handler verifies the `x-line-signature` header: HMAC-SHA256 of the **raw request body** using `LINE_CHANNEL_SECRET`, Base64-encoded, compared with a timing-safe comparison.
- [ ] Requests with a missing or wrong signature return `401`/`403` and are not processed.
- [ ] The raw body is used for the signature (body parsing does not change it before verification).

**How to verify**
1. `curl -X POST <webhook-url> -H "Content-Type: application/json" -d '{"events":[]}'` with no signature → rejected.
2. Same request with a random `x-line-signature` → rejected.
3. Use **Verify** in the LINE Developers Console → succeeds.

---

## 5. Input validation & SQL injection

- [ ] All database queries use parameterized queries / tagged templates (e.g. `sql\`... WHERE id = ${id}\``), never string concatenation.
- [ ] Request bodies are validated: required fields, types, max lengths (event title, notes), and date ranges (start ≤ end, reasonable limits).
- [ ] User-provided text shown in LINE Flex bubbles or the LIFF UI is treated as text (no `dangerouslySetInnerHTML`).
- [ ] Error responses do not expose stack traces, SQL, or internal details.

**How to verify**
1. Create an event titled `'; DROP TABLE events; --` → saved as plain text, table intact.
2. Send a 10,000-character title → rejected with `400`.
3. Send an end date earlier than the start date → rejected with `400`.
4. `grep -rn "dangerouslySetInnerHTML" src` → no matches (or each one reviewed).

---

## 6. Personal data & dependencies

- [ ] Only the LINE data Singto needs is stored (user ID, display name). No email, phone, or extra profile data.
- [ ] Audit logging and personal-data rules in `AGENTS.md` are followed for create/update/confirm actions.
- [ ] Test/UAT participants are informed what data is collected.
- [ ] `npm audit --omit=dev` shows no high/critical vulnerabilities; CI (`.github/workflows/ci.yml`) runs it.

**How to verify**
1. Inspect the users/participants table schema → only required columns.
2. Run `npm audit --omit=dev` → 0 high/critical.

---

## Review log

| Date | Reviewer | Items checked | Notes |
|------|----------|---------------|-------|
