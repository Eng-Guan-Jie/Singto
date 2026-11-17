# Singto – Before and After Comparison

## 1. Comparison Table

| Item | Before | After | Change | Measured with | Evidence |
|---|---|---|---|---|---|
| Appointment Creation | Organizers coordinate appointment details through group chat and communicate the scheduling period manually. | Organizers can create an appointment and define its scheduling period through Singto. | Provides a centralized appointment creation process instead of relying entirely on chat messages. | Task Completion Rate, Task Completion Time, Task Error Rate. | `src/pages/CreateEvent/CreateEvent.jsx`; `api/events.js` |
| Availability Collection | Organizers ask participants to provide their available dates through group chat. Responses may be scattered across messages or delayed. | Participants access the shared event link and submit their available dates through Singto. | Centralizes availability submissions in one event. | Availability Submission Completion Rate, Task Completion Time, Error Count. | `src/pages/Participant/Participant.jsx`; `api/events/[id]/availability.js` |
| Availability Overview | Organizers manually review and compare participants' responses. | Singto provides an availability summary and visual overview of participants' availability. | Reduces the need to manually organize and compare individual responses. | Task Completion Time, Task Error Rate, User Feedback. | `src/pages/Overview/Overview.jsx`; `src/components/ColorLegend.jsx`; `api/events/[id]/availability.js` |
| Best Date Suggestion (Algorithmic Scheduling) | Organizers manually compare available dates to identify dates that accommodate the group. | Singto calculates availability counts and suggests the date or consecutive date ranges with the highest number of available accepted participants. | Automates availability comparison and candidate ranking using deterministic, rule-based logic. | Availability Calculation Correctness, Recommendation Rule Conformance, Processing Time, Manual-versus-Singto Task Completion Time. | `src/pages/Overview/Overview.jsx`; `src/lib/bestDate.js`; `src/lib/calendar.js` |
| Appointment Confirmation | The organizer communicates the selected date through group chat and waits for the group to acknowledge it. | The organizer can review and confirm the selected date through Singto. | Provides a dedicated confirmation step within the scheduling workflow. | Finalization Task Completion Rate, Task Completion Time, Task Error Rate. | `src/pages/ConfirmDate/ConfirmDate.jsx`; `api/events/[id]/confirm.js`; `db/migrations/001_event_finalization.sql` |
| LINE Integration | Scheduling discussions and updates take place in LINE, but availability information is handled manually through messages. | Singto integrates with LINE and provides a web-based scheduling workflow connected to the LINE platform. | Connects the scheduling process with the group's existing communication platform. | Event Sharing Success Rate, Access Success Rate, Integration Test Results. | `src/lib/liff.js`; `api/line-webhook.js`; `api/line-push-event.js` |
| User Interface | Participants and organizers rely on chat messages to communicate and track scheduling information. | Singto provides dedicated organizer and participant interfaces with a responsive web layout. | Provides a more structured interface for managing scheduling activities. | SUS, TAM Perceived Ease of Use, Navigation Confusion, User Feedback. | `src/pages/`; `src/components/`; `src/index.css` |
| Scheduling Reminder | Organizers need to remind participants or the group manually through chat. | Pre-appointment reminders are part of the proposed project workflow, but the uploaded source code does not establish a complete scheduled reminder implementation. | Intended to reduce manual reminder work; implementation and delivery need to be verified before claiming this improvement. | Reminder Delivery Success Rate, Reminder Timing Accuracy, Integration Test Results. | `docs/00-proposal.md`; implementation evidence pending. |

## 2. AI / Algorithm Comparison

Singto's Best Date feature should be described as an algorithmic scheduling function rather than a machine-learning or generative AI model.

| Item | Before | After | Change | Measured with | Evidence |
|---|---|---|---|---|---|
| AI-assisted Scheduling / Best Date Algorithm | The organizer manually compares participants' availability to find suitable dates. | Singto uses deterministic rules to calculate availability counts, evaluate candidate date ranges, and return all candidates with the highest availability count. | Automates the comparison and ranking process. It does not use model training or LLM inference. | Availability Calculation Correctness, Recommendation Rule Conformance, Test Case Pass Rate, Processing Time, Manual-versus-Singto Task Completion Time. | `src/lib/bestDate.js`; `src/pages/Overview/Overview.jsx`; `api/events/[id]/availability.js`; proposed evaluation dataset in `ai-logic.md`. |

## 3. Measurement and Evidence Status

The comparison describes the intended improvement from manual group scheduling to the Singto-assisted workflow. However, qualitative changes should not be presented as proven performance improvements until user testing has been completed.

The project Test Plan defines the following evaluation approach:

- **Task Performance:** Task Completion Rate, Task Completion Time, Task Error Rate, and Assistance Requests.
- **Usability:** System Usability Scale (SUS).
- **User Acceptance:** Technology Acceptance Model (TAM), including Perceived Usefulness and Perceived Ease of Use.
- **Comparative Evaluation:** Manual scheduling versus Singto-assisted scheduling using the same scenario and availability information.
- **Algorithm Evaluation:** Compare actual Best Date outputs with independently calculated expected results using a controlled test dataset.

### Current Evidence Status

| Evidence | Status |
|---|---|
| Source code for appointment creation and availability submission | Available in the submitted project ZIP |
| Source code for availability overview and Best Date calculation | Available in the submitted project ZIP |
| Source code for appointment confirmation | Available in the submitted project ZIP |
| LINE integration source code | Available in the submitted project ZIP |
| Controlled Best Date evaluation dataset | Proposed in `ai-logic.md`; execution pending |
| Algorithm test results and recorded outputs | Pending execution |
| Manual-versus-Singto user testing results | Pending UAT |
| SUS and TAM results | Pending UAT |
| Scheduled reminder implementation and delivery evidence | Not established by the submitted source ZIP |

**Important:** The project Test Plan is a proposed evaluation plan, not a completed results report. No numerical improvement, accuracy percentage, time reduction, or user satisfaction score should be reported until the corresponding tests have been conducted.

## 4. Overall Comparison

Singto transforms group scheduling from a largely manual, chat-based process into a more structured workflow. It centralizes appointment creation, availability submission, availability comparison, date suggestions, and appointment confirmation.

Its Best Date feature automates the comparison of participants' availability through deterministic scheduling rules. The system supports the organizer's decision rather than making the final appointment decision automatically.

The effectiveness of these improvements will be evaluated through controlled algorithm tests and user acceptance testing, comparing manual scheduling with the Singto-assisted process.