# Singto – Before and After Comparison

## 1. Comparison Table

| Item | Before | After | Change | Measured with | Evidence |
|---|---|---|---|---|---|
| Appointment Creation | Organizers coordinate appointment details through group chat and communicate the scheduling period manually. | Organizers can create an appointment and define its scheduling period through Singto. | Provides a centralized appointment creation process instead of relying entirely on chat messages. | Task Completion Rate, Task Completion Time, Task Error Rate. | `src/pages/CreateEvent/CreateEvent.jsx`; `api/events.js`; `test/validate.test.mjs` |
| Availability Collection | Organizers ask participants to provide their available dates through group chat. Responses may be scattered across messages or delayed. | Participants access the shared event link and submit their available dates through Singto. | Centralizes availability submissions in one event. | Availability Submission Completion Rate, Task Completion Time, Error Count. | `src/pages/Participant/Participant.jsx`; `api/events/[id]/availability.js`; `test/api-access.test.mjs`; `test/api-locks.test.mjs` |
| Availability Overview | Organizers manually review and compare participants' responses. | Singto provides an availability summary and visual overview of participants' availability. | Reduces the need to manually organize and compare individual responses. | Task Completion Time, Task Error Rate, User Feedback. | `src/pages/Overview/Overview.jsx`; `src/components/ColorLegend.jsx`; `api/events/[id]/availability.js`; `test/calendar.test.mjs` |
| Best Date Suggestion (Algorithmic Scheduling) | Organizers manually compare available dates to identify dates that accommodate the group. | Singto calculates availability counts and suggests the date or consecutive date ranges with the highest number of available accepted participants. | Automates availability comparison and candidate ranking using deterministic, rule-based logic. | Availability Calculation Correctness, Recommendation Rule Conformance, Test Case Pass Rate, Processing Time. | `src/lib/bestDate.js`; `src/pages/Overview/Overview.jsx`; `src/lib/calendar.js`; `test/best-date.test.mjs`; `test/ai-eval.test.mjs` |
| Appointment Confirmation | The organizer communicates the selected date through group chat and waits for the group to acknowledge it. | The organizer can review and confirm the selected date through Singto. Confirmed events are protected against further availability and scheduling changes. | Provides a dedicated confirmation step and locks relevant event information after confirmation. | Finalization Task Completion Rate, Task Completion Time, API Test Results. | `src/pages/ConfirmDate/ConfirmDate.jsx`; `api/events/[id]/confirm.js`; `test/api-locks.test.mjs` |
| LINE Integration | Scheduling discussions and updates take place in LINE, but availability information is handled manually through messages. | Singto integrates with LINE and provides a web-based scheduling workflow connected to the LINE platform. | Connects the scheduling process with the group's existing communication platform. | Event Sharing Success Rate, Access Success Rate, Integration Test Results. | `src/lib/liff.js`; `api/line-webhook.js`; `api/line-push-event.js`; `test/webhook-and-cron.test.mjs` |
| User Interface | Participants and organizers rely on chat messages to communicate and track scheduling information. | Singto provides dedicated organizer and participant interfaces with a responsive web layout. | Provides a more structured interface for managing scheduling activities. | SUS, TAM Perceived Ease of Use, Navigation Confusion, User Feedback. | `src/pages/`; `src/components/`; `src/index.css`; manual UI testing and UAT evidence pending |
| Security and Data Protection | Scheduling information is communicated through group messages without a centralized application-level access-control workflow. | Singto implements authentication and authorization checks, participant data restrictions, event ownership rules, and API validation. | Adds application-level controls to protect event information and restrict unauthorized actions. | Authentication and Authorization Test Pass Rate, Input Validation Test Results, Security Test Results. | `test/api-access.test.mjs`; `test/api-locks.test.mjs`; `test/validate.test.mjs`; `test/webhook-and-cron.test.mjs` |
| Automated Quality Testing | Scheduling operations and comparisons are performed manually by organizers. | Singto includes an automated test suite covering scheduling logic, calendar rules, validation, API access, event locking, LINE webhook signatures, and scheduled cleanup. | Introduces repeatable automated verification of core application rules and API behavior. | Automated Test Pass Rate, Test Coverage by Feature, Regression Test Results. | `test/`; `test/README.md`; `.github/workflows/ci.yml` |

## 2. AI / Algorithm Comparison

Singto's Best Date feature is a deterministic, rule-based scheduling function rather than a machine-learning or generative AI model.

| Item | Before | After | Change | Measured with | Evidence |
|---|---|---|---|---|---|
| AI-assisted Scheduling / Best Date Algorithm | The organizer manually compares participants' availability to find suitable dates. | Singto uses deterministic rules to calculate availability counts, evaluate single-day and consecutive date ranges, apply holiday filtering, and return all candidates with the highest availability count. | Automates the comparison and ranking process. It does not use model training or LLM inference. | Availability Calculation Correctness, Recommendation Rule Conformance, Test Case Pass Rate, Processing Time. | `src/lib/bestDate.js`; `src/pages/Overview/Overview.jsx`; `test/best-date.test.mjs`; `test/ai-eval.test.mjs` |

### Algorithm Evaluation Results

The automated evaluation includes a controlled dataset with four accepted participants (P01–P04) over 7–17 November 2026.

The evaluation checks:
- Single-date availability counts and recommendations.
- Consecutive two-day and three-day recommendations.
- Holiday filtering.
- Equal highest availability counts.
- No-availability scenarios.
- Accepted participants who have not submitted availability.
- Processing time for 30 participants across 366 days using all four filters.

According to `test/README.md`, the automated evaluation is included in the project's 49-test suite, with the documented run reporting **49 passed and 0 failed**.

Evidence: `test/ai-eval.test.mjs`; `test/README.md`.

## 3. Measurement and Evidence Status

The comparison describes the intended improvement from manual group scheduling to the Singto-assisted workflow. Functional implementation and automated test results provide evidence of system behavior, while user testing is needed to establish actual improvements in usability and scheduling efficiency.

The project evaluation uses the following measures:

- **Task Performance:** Task Completion Rate, Task Completion Time, Task Error Rate, and Assistance Requests.
- **Usability:** System Usability Scale (SUS).
- **User Acceptance:** Technology Acceptance Model (TAM), including Perceived Usefulness and Perceived Ease of Use.
- **Comparative Evaluation:** Manual scheduling versus Singto-assisted scheduling using the same scenario and availability information.
- **Algorithm Evaluation:** Compare actual Best Date outputs with independently calculated expected results using a controlled test dataset.
- **Automated Testing:** Test Pass Rate and regression test results.

### Current Evidence Status

| Evidence | Status |
|---|---|
| Source code for appointment creation and availability submission | Available in the submitted project source |
| Source code for availability overview and Best Date calculation | Available in the submitted project source |
| Source code for appointment confirmation | Available in the submitted project source |
| LINE integration source code | Available in the submitted project source |
| Controlled Best Date evaluation dataset | Implemented in `test/ai-eval.test.mjs` |
| Best Date algorithm test cases | Implemented in `test/best-date.test.mjs` and `test/ai-eval.test.mjs` |
| Automated test suite | 49 tests across 7 test files, according to `test/README.md` |
| Last documented automated test run | 18 November 2026: 49 passed, 0 failed, according to `test/README.md` |
| Automated test execution log (`npm-test.log`) | Referenced by README; include the actual log in the final evidence folder |
| GitHub Actions CI integration | Documented in `test/README.md`; workflow file referenced at `.github/workflows/ci.yml` |
| Manual-versus-Singto user testing results | Pending UAT |
| SUS and TAM results | Pending UAT |
| Scheduled reminder implementation and delivery evidence | Not established by the submitted source ZIP |

**Important:** The automated test results demonstrate that the documented test cases passed in the recorded run. They do not establish improvements in real-world scheduling time, user satisfaction, or usability. Those outcomes must be measured through UAT.

## 4. Overall Comparison

Singto transforms group scheduling from a largely manual, chat-based process into a more structured workflow. It centralizes appointment creation, availability submission, availability comparison, date suggestions, and appointment confirmation.

Its Best Date feature automates availability comparison through deterministic scheduling rules. The controlled evaluation and automated test suite provide evidence that the implemented recommendation rules behave as expected in the tested scenarios.

The project also includes automated checks for API access control, event locking, input validation, calendar rules, and LINE webhook behavior.

The organizer remains responsible for reviewing and confirming the final date. The effectiveness of Singto in improving real-world scheduling efficiency and user experience will be evaluated through manual-versus-Singto user testing, SUS, and TAM.