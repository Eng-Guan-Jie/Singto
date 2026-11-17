# Singto – Group Scheduling Assistant

## Project Overview

Singto is a LINE-integrated group scheduling assistant that helps users
coordinate appointments with multiple participants through a web-based
application.

Instead of manually collecting and comparing everyone's availability
through group chats, Singto allows participants to submit their available
dates and times through a shared scheduling link. The system summarizes
the group's availability and suggests suitable dates and times for the  
organizer to review and confirm.

## Problem Statement

Groups currently rely on chat-based communication such as LINE or
Messenger to coordinate appointments. The organizer often needs to
manually collect and compare each participant's availability. Responses
may arrive at different times or be missed, causing repeated discussions,
follow-ups, and scattered scheduling information.

## Target Users

- Friends and social groups
- Classmates and university students
- Coworkers
- Family members
- Community or activity groups

The system supports two main roles:

- **Organizer** — creates the appointment, shares the scheduling link,
  reviews suggested dates, and confirms the appointment.
- **Participant** — accesses the shared link and submits availability.

## Core Workflow

**Call Singto → Create an Appointment → Share Availability → Find the Best Date → Confirm the Appointment → Receive Reminder**

## Key Features

- Appointment Creation
- Availability Submission
- Availability Collection & Summary
- Availability Analysis
- Best Date Suggestion
- Appointment Confirmation
- LINE Integration
- Scheduling Reminder
- Responsive Web Interface

## Live System

- **Web app (LIFF):** https://singto-eight.vercel.app
- Singto runs inside LINE: people open it from the bot's cards in a LINE group, not by typing the URL.

## Test Account

Singto has **no usernames or passwords**. Everyone signs in with their own LINE account through LINE Login (LIFF), so there is no test password in this repository, and there must never be one.

To try the system with any LINE account:

1. Add the Singto bot as a friend: **LINE ID `@TODO`** (or scan the QR code in LINE Developers Console → Messaging API tab).
2. Create a LINE group with at least one other person and invite the bot. It greets the group.
3. Type **สิงโต** (or `singto`) in the group. The bot replies with a **สร้างนัด** (Create event) card.
4. Create an event. Its card is posted in the group; members tap **เลือกวันที่ว่าง** to join and pick their free days.
5. As the organizer, open **Overview**, check **Best Date**, then **Finalize Date** to post the "date confirmed" card.

> The LINE Login channel must be **Published** (or the tester added as a channel tester) for people outside the team to sign in.

## Tech Stack

| Part | Technology |
|---|---|
| Web pages | React 19 + Vite, React Router, LINE LIFF SDK |
| API | Vercel Serverless Functions (Node.js, CommonJS) in `api/` |
| Database | Neon PostgreSQL (`@neondatabase/serverless`) |
| Messaging | LINE Messaging API (bot webhook, Flex Message cards) |
| Hosting | Vercel (static site + functions + daily cron) |

## Project Structure

```
api/                      Serverless API (one file per route)
  events.js               POST create event
  events/[id].js          GET / PATCH / DELETE one event
  events/[id]/            availability, participants, responses, confirm
  my-events.js            the signed-in user's events
  account.js              DELETE "delete my account"
  line-webhook.js         LINE bot webhook (replies to "สิงโต")
  line-push-event.js      post the event card to the group
  cron/cleanup.js         daily 30-day data clean-up
  _auth.js _db.js ...     shared helpers (LINE token check, DB, validation)
src/
  pages/                  CreateEvent, Participant, Overview, ConfirmDate,
                          EventDetails, MyEvents, Privacy, DeleteAccount
  components/             shared UI (header menu, month nav, legends)
  lib/                    LIFF, i18n (Thai/English), calendar, Best Date
db/migrations/            SQL to run on the database, in order
docs/                     requirements, design, test, final deliverables
```

## Run It Yourself

You need: Node.js 22, a [Neon](https://neon.tech) database, a [Vercel](https://vercel.com) account and a [LINE Developers](https://developers.line.biz/console/) account.

### 1. Install

```bash
git clone https://github.com/Eng-Guan-Jie/Singto.git
cd Singto
npm install
```

### 2. Database (Neon)

1. Create a Neon project and copy its pooled connection string (`DATABASE_URL`).
2. Create the base tables `events`, `participants` and `availability` (see [Database](#database)).
3. Run the migrations in `db/migrations/` **in order** in the Neon SQL editor:
   - `001_event_finalization.sql` – columns for the confirmed date
   - `002_allow_no_organizer.sql` – lets "Delete account" keep events without an organizer

### 3. LINE channels (one Provider)

**LINE Login channel → LIFF app**
- Endpoint URL: your site **root**, e.g. `https://your-project.vercel.app/` (pages are opened as `https://liff.line.me/<LIFF_ID>/<page>`)
- Scopes: `openid`, `profile`
- Copy the **Channel ID** (`LINE_LOGIN_CHANNEL_ID`) and **LIFF ID** (`LIFF_ID`, `VITE_LIFF_ID`).

**Messaging API channel (the bot)**
- Webhook URL: `https://your-project.vercel.app/api/line-webhook`, **Use webhook** on
- Allow the bot to join group chats; turn **off** auto-reply and greeting messages
- Copy the **Channel secret** and issue a **Channel access token (long-lived)**.

### 4. Environment variables

Copy [`.env.example`](.env.example) and fill in real values. It lists every variable with where to find it.

```bash
cp .env.example .env.local
```

On Vercel, add the same variables under **Settings → Environment Variables** (Production). Never commit `.env` or `.env.local`.

### 5. Deploy (Vercel)

1. Import the GitHub repository in Vercel (framework: **Vite**; `vercel.json` sets the build and routes).
2. Add the environment variables from step 4, then deploy.
3. In LINE Developers Console, press **Verify** on the bot's Webhook URL. It should say Success.
4. The daily clean-up in `vercel.json` (`/api/cron/cleanup`, 03:00 Thailand time) runs once `CRON_SECRET` is set.

Every push to `main` deploys to production. GitHub Actions (`.github/workflows/ci.yml`) builds every push and pull request.

### Local development

```bash
npm run dev       # web pages at http://localhost:5173
npm run build     # production build into dist/
npm run preview   # serve the production build
npm test          # run the automated tests (no secrets needed)
```

- In development mode the pages call the **deployed** API (`https://singto-eight.vercel.app`), so `npm run dev` needs no database or LINE secrets on your machine.
- LINE Login only returns to the LIFF app's Endpoint URL. To sign in on your own machine, expose it with a tunnel (for example `ngrok http 5173`), make a separate development LIFF app whose Endpoint URL is the tunnel URL, and put that LIFF ID in `VITE_LIFF_ID` in `.env.local`.

## Database

| Table | Main columns | Used for |
|---|---|---|
| `events` | `id` (uuid), `event_name`, `description`, `start_date`, `end_date`, `line_chat_id`, `organizer_line_user_id`, `status`, `created_at`, `finalized_date`, `finalized_dates`, `finalization_note`, `finalized_at`, `finalized_by` | one row per event |
| `participants` | `id`, `event_id`, `line_user_id`, `display_name`, `picture_url`, `status` (`accepted` / `declined`), `submitted_at`, `joined_at`; unique (`event_id`, `line_user_id`) | who answered the invitation |
| `availability` | `event_id`, `participant_id`, `available_date` | the days each person is free |

The `finalized_*` columns come from `db/migrations/001_event_finalization.sql`. The SQL that creates the three base tables is not in this repository yet; export it from Neon (`pg_dump --schema-only`) into `db/schema.sql`.

## Documentation

### Requirements
- Product Backlog: [`docs/01-requirements/backlog.md`](docs/01-requirements/backlog.md)
- Project Proposal: [`docs/00-proposal.md`](docs/00-proposal.md)

### Design
- Feature List: [`docs/02-design/feature-list.md`](docs/02-design/feature-list.md)
- User Journey: [`docs/02-design/user-journey.md`](docs/02-design/user-journey.md)
- Design System: [`docs/02-design/design-system.md`](docs/02-design/design-system.md)
- Prototype: [`docs/02-design/prototype.md`](docs/02-design/prototype.md)
- Diagrams: [`docs/02-design/diagrams.md`](docs/02-design/diagrams.md)

### Testing
- Automated tests (`npm test`, also run by GitHub Actions on every push): [`test/`](test/) — what each file checks is in [`test/README.md`](test/README.md)
- Test Plan, session logs, before/after, issue log, questionnaire results: [`docs/test/`](docs/test/)

### Compliance and Security
- PDPA and legal rules: [`rule.md`](rule.md)
- Rules for AI coding agents: [`AGENTS.md`](AGENTS.md), [`CLAUDE.md`](CLAUDE.md)
- Security checklist: [`docs/security-checklist.md`](docs/security-checklist.md)
- Privacy policy shown to users: `/privacy` in the app ([`src/pages/Privacy/policyContent.js`](src/pages/Privacy/policyContent.js))

### Final Deliverables
- [`docs/final/`](docs/final/)

## User Research

The project is based on user research with people who regularly coordinate
group activities.

Key findings include:

- Different schedules make it difficult to find a suitable date.
- Availability information can become scattered across chat messages.
- Delayed or missing responses create additional follow-up work.
- Groups may need multiple rounds of discussion before reaching a decision.
- Users prefer a simple, mobile-friendly scheduling process with minimal steps.

## Project Status

Academic project. Live at https://singto-eight.vercel.app.

---

**Singto – Making group scheduling simpler, clearer, and less repetitive.**
