# System Diagrams — Singto

This document presents the main system diagrams for the Singto scheduling assistant, including the system context, use cases, system architecture, core scheduling workflow, and sequence diagrams for the three core flows.

---

# D1. Context Diagram

The Context Diagram shows Singto as the central system and its interactions with external actors and services.

<p align="left">
  <img src="../../assets/diagrams/D1-context.png" width="500"> </p>

### Main External Entities

| Entity | Interaction with Singto |
|---|---|
| **Organizer** | Creates appointments, reviews suggested dates, and confirms the final appointment |
| **Participants** | Access scheduling sessions and submit their availability |
| **LINE Platform** | Provides the communication channel for interacting with Singto and sharing scheduling links |

---

# D2. Use Case Diagram

The Use Case Diagram describes the main interactions between users and the Singto system.

<p align="left">
  <img src="../../assets/diagrams/D2-usecase.png" width="500"> </p>

### Main Use Cases

1. **Create Appointment** — Organizer creates a new scheduling session.
2. **Set Scheduling Period** — Organizer defines the dates or period for scheduling.
3. **Share Scheduling Link** — Organizer shares the scheduling session with participants.
4. **Submit Availability** — Participants provide their available dates.
5. **View Availability Summary** — Users review collected availability information.
6. **Analyze Availability** — Singto compares participants' availability.
7. **Suggest Best Date** — Singto identifies and presents suitable dates.
8. **Confirm Appointment** — Organizer selects and confirms the final appointment.
9. **Receive Notifications** — Participants receive relevant scheduling reminders or updates.

---

# D3. System Architecture Diagram

The Architecture Diagram shows the major components of Singto and how they communicate.

<p align="left">
  <img src="../../assets/diagrams/D3-architecture.png" width="600"> </p>

### Architecture Components

| Component | Responsibility |
|---|---|
| **LINE Platform** | Provides the group communication channel and integration interface |
| **Web Application** | Provides the user interface for creating appointments, submitting availability, and viewing results |
| **Backend API** | Handles application logic, requests, appointment management, and communication between system components |
| **Scheduling Engine** | Compares participants' availability and identifies suitable date |
| **Notification Service** | Handles scheduling-related reminders and updates |
| **Database** | Stores appointments, participants, availability, and confirmed appointment information |

---

# D4. Activity Diagram — Core Scheduling Workflow

The Activity Diagram describes the main workflow from creating an appointment to confirming the final date.

<p align="left">
  <img src="../../assets/diagrams/D4-activity.png" width="600"> </p>

### Core Workflow

The main Singto workflow is:

**Call Singto → Create an Appointment → Share Availability → Find the Best Date → Confirm the Appointment**

The system collects availability from participants, analyzes the information, and suggests suitable dates. The organizer remains responsible for making the final appointment decision.

---

# D5. Sequence Diagrams

How the parts in D3 talk to each other, message by message, for the three core flows. Each step matches the code: `api/line-webhook.js`, `api/events.js`, `api/line-push-event.js`, `api/events/[id]/*.js` and the pages in `src/pages/`. GitHub draws these from the Mermaid source below.

Every API call checks the caller's LINE ID token with LINE Login before reading or writing anything, and the server, not the page, decides what each role may see (AGENTS.md 5.1 / 5.3).

## D5.1 Create an Event from the LINE Group

The organizer calls the bot, creates the event in the LIFF page, and Singto posts the event card to the group.

```mermaid
sequenceDiagram
    autonumber
    actor O as Organizer
    participant G as LINE group
    participant W as api/line-webhook
    participant P as LIFF page (React)
    participant A as Singto API (Vercel)
    participant V as LINE Login (verify)
    participant D as Neon DB
    participant M as LINE Messaging API

    O->>G: types "สิงโต"
    G->>W: POST webhook event + x-line-signature
    W->>W: check HMAC-SHA256 signature
    W->>M: reply with "สร้างนัด" card (reply token)
    M-->>G: card shown in the group
    O->>P: taps สร้างนัด (/create-event?lineChatId=...)
    P->>P: liff.init(), get LINE ID token
    O->>P: fills name, description, period
    P->>A: POST /api/events (idToken, fields)
    A->>V: verify ID token
    V-->>A: LINE user id, name, picture
    A->>A: validate input (name max 100, period max 1 year)
    A->>D: INSERT event + organizer as accepted
    D-->>A: event id
    A-->>P: 201 Created
    P->>A: POST /api/line-push-event (eventId, idToken)
    A->>V: verify ID token
    A->>D: caller is organizer? read responders
    A->>M: push "เลือกวันที่ว่าง" card
    M-->>G: event card appears
    P->>P: open Overview
```

## D5.2 Participant Answers and Picks Available Days

A member opens the event card, accepts, and saves the days they are free. Once the date is confirmed, every link opens the read-only Event Details page instead.

```mermaid
sequenceDiagram
    autonumber
    actor U as Participant
    participant G as LINE group
    participant P as LIFF Participant page
    participant A as Singto API (Vercel)
    participant V as LINE Login (verify)
    participant D as Neon DB
    participant M as LINE Messaging API

    U->>G: taps เลือกวันที่ว่าง on the event card
    G->>P: opens /participant?eventId=...
    P->>A: GET /api/events/:id
    A->>D: read event
    A-->>P: name, period, confirmed dates
    alt date already confirmed
        P->>P: go to Event Details (read only)
    else event still open
        P->>A: GET participants, availability, responses (Bearer token)
        A->>V: verify ID token
        A->>D: read own row, counts, who is free
        A-->>P: data for this role (no other LINE IDs)
        U->>P: taps เข้าร่วม
        P->>A: POST /api/events/:id/participants (accepted)
        A->>V: verify ID token
        A->>D: insert or update own row
        opt first answer from this person
            A->>M: push card with new response count
        end
        A-->>P: saved
        U->>P: taps free days, then บันทึก
        P->>A: POST /api/events/:id/availability (dates)
        A->>V: verify ID token
        A->>A: caller accepted? dates inside period?
        A->>D: transaction: delete old days, insert new days
        A-->>P: saved
        P->>P: show Overview colours and Best Date
    end
```

## D5.3 Organizer Confirms the Date

Best Date is computed in the page with fixed counting rules (no AI model); the organizer decides. A date can be confirmed only once, after which the event is locked.

```mermaid
sequenceDiagram
    autonumber
    actor O as Organizer
    participant P as LIFF Overview / Confirm Date
    participant A as Singto API (Vercel)
    participant V as LINE Login (verify)
    participant D as Neon DB
    participant M as LINE Messaging API
    participant G as LINE group

    O->>P: opens Overview
    P->>A: GET event, participants, availability
    A->>D: read everyone's answers and days
    A-->>P: who is free on each date
    P->>P: Best Date rules suggest dates (no AI model)
    O->>P: taps สรุปวันนัด, picks date(s), adds note
    P->>A: POST /api/events/:id/confirm (dates, note, notify)
    A->>V: verify ID token
    A->>D: caller is organizer? already confirmed?
    alt already confirmed
        A-->>P: 409 date already confirmed
    else not confirmed yet
        A->>D: UPDATE event: finalized dates, finalized_by user
        A->>M: push "ได้วันนัดแล้ว!" card (who joins / declined)
        M-->>G: confirmed card appears
        A-->>P: confirmed and notified
        P->>P: open Event Details (event now locked)
    end
```

---

# Diagram Relationships

| Diagram | Focus | Main Question |
|---|---|---|
| **D1 Context** | System boundary | Who/what interacts with Singto? |
| **D2 Use Case** | User interactions | What can each actor do? |
| **D3 Architecture** | System structure | How are the technical components connected? |
| **D4 Activity** | Process flow | How does the scheduling process work step by step? |
| **D5 Sequence** | Message order between components | Which part calls which, in what order, for each core flow? |

Together, these diagrams provide a consistent view of Singto from the external system context to the internal architecture and core user workflow.