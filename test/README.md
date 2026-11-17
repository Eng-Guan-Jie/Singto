# Automated Tests

Our own tests for Singto's logic and API rules. They run with
Node's built-in test runner (no extra packages), use a fake
database and a fake LINE, and need no secrets, so they never
touch real data.

```bash
npm test
```

GitHub Actions runs them on every push and pull request
([`.github/workflows/ci.yml`](../.github/workflows/ci.yml)).

## What is tested

| File | Checks | Tests |
|---|---|---|
| [`best-date.test.mjs`](best-date.test.mjs) | Best Date: single day, 2 and 3 consecutive days (only people free on every day count), holidays only, who is / is not free, no suggestion when nobody picked days, people who picked no days count as not free | 8 |
| [`calendar.test.mjs`](calendar.test.mjs) | Calendar colours (everyone / some / nobody free) and Thai holiday detection | 5 |
| [`validate.test.mjs`](validate.test.mjs) | Event form checks: required fields, name ≤ 100 and description ≤ 500 characters (a 10,000-character name is rejected), real dates only, end after start, period ≤ 1 year | 9 |
| [`api-access.test.mjs`](api-access.test.mjs) | No LINE token → 401; participants see names but never other people's LINE IDs; people who have not answered see nothing; only the organizer can edit, delete or confirm; deletes remove child rows first; "delete my account" | 7 |
| [`api-locks.test.mjs`](api-locks.test.mjs) | After the date is confirmed: no second confirmation, no availability or answer changes, only the description can be edited; before confirmation everything still works; days outside the period are rejected | 8 |
| [`webhook-and-cron.test.mjs`](webhook-and-cron.test.mjs) | LINE webhook rejects missing/wrong signatures and replies to "สิงโต"; the 30-day clean-up refuses to run without the right `CRON_SECRET` and deletes only expired events | 4 |
| [`ai-eval.test.mjs`](ai-eval.test.mjs) | Best Date evaluation for [`docs/final/ai-logic.md`](../docs/final/ai-logic.md): the controlled dataset P01–P04 and cases AI-01 … AI-07, plus processing time | 8 |
| **Total** | | **49** |

[`helpers.mjs`](helpers.mjs) holds the fake database, fake LINE
and fake request/response used by the API tests.

## Last run

18 Nov 2026, Node 20.19: **49 passed, 0 failed** ([`docs/final/evidence/npm-test.log`](../docs/final/evidence/npm-test.log)).

To check the tests can fail, we switched off the "confirm only
once" rule in `api/events/[id]/confirm.js` on purpose: the test
"a date cannot be confirmed twice" failed, and passed again
once the rule was restored.

## Not covered

- The React pages (layout, buttons) — checked by hand in a
  phone-sized browser and in the user sessions (`docs/test/`).
- Real LINE and real Neon — the tests use fakes; the real
  services were tested end to end in LINE groups.
