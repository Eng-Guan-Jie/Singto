# Sync Solutions — Agent Instructions

This file is the source of truth for any AI coding agent (Claude Code, Cursor,
Aider, Copilot, etc.) working in this repo. Read it fully before writing code,
especially anything touching **user accounts, events, availability, group
sharing, or personal data**.

---

## 1. Project Overview
<!-- TODO: fill in — one paragraph on what Sync Solutions does and who it's for -->

## 2. Stack & Architecture
<!-- TODO: frontend, backend, database, auth provider, hosting -->

## 3. Setup / Common Commands
<!-- TODO: install, run dev server, run tests, lint, build, deploy -->

## 4. Code Style
<!-- TODO: naming conventions, formatting, folder structure conventions -->

---

## 5. Compliance Rules — MANDATORY for any feature touching accounts, events, availability, or personal data

These derive from Thailand's PDPA, the Computer Crime Act §26, and the
Electronic Transactions Act (§9, §26, §28) — see `rule.md` for the full legal
source, and the course's W2 (AI Ethics, PDPA & IT Law) material for the
underlying reasoning. Organized by feature area so they map to actual PRs,
not statutes. **If you're unsure whether a rule applies, stop and ask a
human rather than guessing.**

> **Course AI policy:** a human is always responsible. AI does not get a
> free pass — and neither does this project. Ethics/legal duties are
> requirements to implement now, not a disclaimer to bolt on at the end.

### 5.1 Accounts & personal data
- Collect only the minimum needed for scheduling (name, phone, email) —
  never add a field "in case it's useful later."
- Never collect sensitive personal data (health, religion, biometric, etc.)
  unless a specific feature explicitly requires it and it's legally
  permitted. Flag this to a human before implementing — do not add such a
  field silently.
- Record a lawful basis for any personal-data collection: consent, or
  necessity to perform the scheduling service the user signed up for.
- If consent is the basis: obtain it before processing, and support
  withdrawal where legally applicable.
- Support user requests to correct or delete their personal data.
- Don't retain personal data longer than necessary — deleted accounts or
  obsolete records must be securely deleted or anonymized.
- Never use personal data for a purpose outside the original one (e.g.
  marketing) without a separate lawful basis.
- Encrypt personal data in transit and at rest; personal data must only be
  visible to users with a legitimate need to access it — enforce this at the
  API/query layer, not just by hiding it in the UI.

### 5.2 Availability & manual data entry
- If a user manually enters availability or location (instead of syncing an
  external calendar/contacts), store **exactly** what they entered. Don't
  infer, enrich, or collect additional personal data from it.

### 5.3 Sharing data across group members
- When showing one member's availability/contact info to other members,
  expose only what's necessary for scheduling — e.g. "Busy," not the event
  title, location, or notes, unless the owner has explicitly shared those
  details.

### 5.4 Audit logging (Computer Crime Act §26)
- Any authenticated action must be logged with **who** (user id or role —
  not necessarily a real name on screen), **when** (timestamp, timezone
  stated), and **what** (login / save / export / delete / other action) —
  enough to investigate later, and IP where applicable.
- Log these specific actions tied to the authenticated account: login;
  creating, editing, or cancelling an event; confirming attendance;
  changing permissions; exporting data.
- Retain this access/traffic log for **at least 90 days** — this is a
  specific statutory minimum under §26, not just "follow retention policy."
  Treat the access-log feature as core/Must-have in the same sprint as the
  workflow it logs, not a later nice-to-have.
- Never write passwords, auth tokens, API keys, session secrets, or similar
  credentials to logs or plaintext, anywhere.
- Logs must be protected against unauthorized modification or deletion, and
  readable only by authorized admins/services — not regular users.

### 5.5 Terms of Service / Privacy Policy acceptance (ETA §9 / §26)
- A "user clicked OK/I agree" is only a valid electronic signature under
  §9's reliability test if it (1) identifies the signer and shows their
  intent to agree, and (2) uses a method reliable enough for what's at
  stake. "They clicked OK" with no timestamp, no record of which version of
  the text they saw, and no user id **fails** this test — don't ship a
  consent checkbox that can't answer those three things.
- Record every acceptance event: user identifier, timestamp, and the
  document version accepted.
- When the ToS/Privacy Policy is updated, create a **new** acceptance record
  for the new version — never overwrite a previous acceptance record.
- Acceptance records must be append-only / protected against alteration.

### 5.6 Electronic confirmations
- Availability selections or attendance confirmations are normal app actions
  unless a feature is explicitly meant to create a legal obligation.
- If a confirmation is auto-generated by the system (e.g. auto-confirm after
  no response), it must be distinguishable in the data model from a
  confirmation the user explicitly made (e.g. `confirmed_by: "system_auto"`
  vs `"user"`).
- Don't build a custom certificate authority / PKI system for stronger
  identity verification (ETA §28) — that's a separate, heavily regulated
  business activity (§§32–34 licensing) that's out of scope for this
  project. If a feature seems to need it, use an existing identity/e-
  signature provider instead of building one, and flag it to a human first.

### 5.7 Before you implement — quick checklist
Run through this before writing any feature code:
1. Does this touch personal data? → apply 5.1 (minimization, lawful basis,
   deletion, encryption, access control).
2. Does it touch authentication, or create/edit/cancel/confirm/permission
   actions? → add an audit log per 5.4.
3. Does it share data between group members? → expose the minimum per 5.3.
4. Does it add a new data field? → check if it's sensitive personal data per
   5.1 before adding it.
5. Does it touch ToS/Privacy Policy or confirmations? → apply 5.5 / 5.6.

If a requested feature seems to require violating any rule above, say so
explicitly and propose a compliant alternative instead of implementing it
as asked.

---

## 6. AI Product Behavior Rules — apply if this product uses AI/ML features
(e.g. smart scheduling suggestions, auto-matching, an AI assistant/chatbot,
ranking of people or slots). Skip this section if the product has no AI
component. Derived from ETDA's six Thai AI ethics principles, applied as
testable rules rather than abstract values.

- **A human stays the decision-maker.** AI never alone decides something
  that affects a person's standing (e.g. who gets a slot, whose event takes
  priority) — there must be a human override path.
- **Explainable & owned.** Every AI-driven suggestion/decision needs a
  named responsible role, not "the model" — and should be explainable to
  the affected user, not a black-box score.
- **No silent ranking of people.** If a feature ranks or scores people
  (e.g. prioritizing whose availability "wins"), it needs an explicit
  review rule — don't ship unreviewed ranking of people.
- **Reliability is logged, not assumed.** Log AI outputs/errors and give
  users a feedback channel — hallucinations or bad suggestions are defects
  to catch, not edge cases to ignore.
- **Fail gracefully without the model.** If the AI feature or its backing
  service is down, the core scheduling workflow must still work without it
  — don't make AI a single point of failure for a non-AI task.
- **Fairness check before shipping.** Before shipping any AI feature that
  affects different users differently, check it doesn't systematically
  disadvantage a group you didn't test against.
