# Singto – Software Test Plan & UAT Plan

**Project:** Singto – Group Scheduling Assistant
**Version:** 1.0 · **Status:** Proposed Test Plan
**Approach:** Functional, Integration, System, Usability, and User Acceptance Testing (UAT)

> **Before testing**
> - **Verify scope:** Test the participant flow, Best Date logic, and finalization only as far as they are implemented in the current build. Re-check LINE LIFF access and organizer permissions.
> - **Prepare the measurement sheet:** One row per participant, with columns for manual task time, Singto task time, successful tasks, errors, SUS items, TAM items, and qualitative feedback.
> - **Use real evidence:** This is a plan, not a results report. Never invent completion rates, SUS scores, or satisfaction results.
> - **10 users = 10 completed sessions**, not 10 test cases. Each user completes **both** the manual baseline and the Singto scenario.

---

## 1. Introduction

**Purpose:** Verify that Singto works correctly, gives accurate scheduling information, and is understandable and efficient to use, through developer verification and real-user evaluation.

**Overview:** Singto is a web app where organizers create events, participants submit availability through a shared link, and the system shows an overview and suggests suitable dates. Guiding principle: **"Singto suggests, but the human decides."** The organizer confirms the final date.

**Objectives**
1. Verify event creation, availability submission, overview, date suggestion, and finalization.
2. Verify data is stored, retrieved, and displayed consistently.
3. Find defects, usability problems, and unexpected behavior before delivery.
4. Evaluate whether users complete scheduling tasks successfully and efficiently.
5. Measure usability (SUS) and acceptance (TAM).
6. Compare manual scheduling with Singto-assisted scheduling.
7. Collect feedback to prioritize improvements.

---

## 2. Scope

### 2.1 In Scope

| Feature | Coverage |
|---|---|
| Event creation | Title, description, date range; required-field validation; details saved |
| Event access | Correct event opens via shared link or event ID |
| Availability submission | Participants select dates; responses saved |
| Availability overview | Accurate color-coded indicators (Free / Partial / Busy, where implemented) |
| Best Date suggestions | Correct counts and rankings from submitted availability |
| Date finalization | Organizer confirms a date; result saved and displayed |
| Data consistency | Data stays correct after refresh or reopening |
| Error handling | Invalid input, missing/unavailable event IDs, incomplete submissions |
| Usability | Navigation, label clarity, feedback messages, task completion |
| User acceptance | Users find Singto useful and easy to use |

Incomplete features must be marked **Blocked** or **Not Implemented**, never Pass.

### 2.2 Out of Scope (unless fully implemented before the test cycle)
- Production deployment / public release of LINE LIFF integration
- Automated LINE notifications and reminders
- Advanced recurring events
- Calendar integration (e.g., Google Calendar sync)
- Large-scale load / enterprise performance testing
- Formal security certification and penetration testing

Basic security checks (event access, data isolation, unauthorized actions) still apply.

### 2.3 Test Environment
- **App:** Singto web app on the designated test deployment, with its API and database
- **Devices / browsers:** Desktop and mobile; current Chrome and Safari where available
- **Data:** Synthetic events and availability records
- **Participants:** ≥ 10 real users not involved in development (where feasible)
- **Record per session:** deployment version, browser, device type, date

---

## 3. Testing Levels

| Level | Owner | Activities | Expected outcome |
|---|---|---|---|
| **Unit** | Developer | Event input and date-range handling; availability calculation and ranking logic; required-field validation; save/retrieve functions; invalid/missing event IDs | Functions return correct results for valid and invalid inputs |
| **Integration** | Developer / tester | Event created in UI is saved in DB; retrieved event shows correct details; submitted availability appears in overview; Best Date uses latest data; finalization updates event state (if implemented) | Data flows between frontend, API, logic, and DB without loss, duplication, or mis-association |
| **System** | Tester | End-to-end scenarios from creation to finalization; invalid input and error handling; consistency after refresh/reopen; desktop and mobile usability | App meets functional and non-functional requirements for implemented features |
| **UAT** | Project team + real users | Users complete tasks independently; record completion, time, errors, assistance; compare with manual method; collect SUS, TAM, feedback | Evidence of functional suitability, usability, and acceptance to support final delivery |

---

## 4. Functional Test Cases

Record each result as **Pass**, **Fail**, or **Blocked**.

| ID | Scenario | Steps | Expected result |
|---|---|---|---|
| TC-01 | Create valid event | Enter title, description, start/end date; submit | Event created; correct details shown |
| TC-02 | Missing required info | Leave a required field empty; submit | Submission blocked or validation message shown |
| TC-03 | Invalid date range | End date earlier than start date | Range rejected or correction requested |
| TC-04 | Open valid event | Open via ID or shared link | Correct event details displayed |
| TC-05 | Open invalid event | Use nonexistent or malformed ID | Error / unavailable message; no crash |
| TC-06 | Submit availability | Open event, select dates, save | Availability saved and retrievable |
| TC-07 | Incomplete availability | Save without required fields | Validated per requirements |
| TC-08 | Availability overview | Submit for multiple participants; open organizer overview | Overview matches each participant's saved responses |
| TC-09 | Best Date calculation | Submit predefined dataset; view suggestions | Suggestions and counts match expected results |
| TC-10 | Change availability | Update a response (if editing supported) | Update reflected in overview and suggestions |
| TC-11 | Finalize date | Organizer selects and confirms a suggested date | Date saved and shown as confirmed (if implemented) |
| TC-12 | Refresh / reopen | Save data, refresh, reopen event | Saved data remains correct |
| TC-13 | Data isolation | Open two different events and compare | Each event shows only its own data |
| TC-14 | Unauthorized action | Try organizer-only action as participant/unauthorized user (where roles enforced) | Action prevented or handled per access-control rules |

> TC-10 and TC-11 depend on update and finalization being implemented. If unavailable, mark **Blocked** and report the gap. Never pass a test based on a mockup or simulated interaction.

---

## 5. User Acceptance Testing

### 5.1 Scenario
Participants coordinate a group meeting using **both** a manual method and Singto, with the same event details, participant group, date range, and availability information.

### 5.2 Tasks

| ID | Task | Completion criteria |
|---|---|---|
| UAT-01 | Create a meeting event | Correct title, description, date range |
| UAT-02 | Share the event / open the participant link | Correct event accessible to intended participants |
| UAT-03 | Submit availability | Availability saved |
| UAT-04 | Review group availability | Identifies suitable, partially suitable, and unsuitable dates |
| UAT-05 | Identify the best date | Chosen date matches criteria and displayed data |
| UAT-06 | Confirm final date (organizer) | Date finalized (if implemented) |

No step-by-step help. The facilitator may explain the scenario and give neutral clarification, but **all assistance must be recorded**.

### 5.3 Manual Baseline
Use a conventional method (e.g., shared availability table or standardized chat-based scenario) with the same requirements and information.

**Record for both conditions:** total completion time, tasks completed, incorrect date selections, data-entry/interpretation errors, assistance requests, participant-reported difficulty.

**Reduce learning effects:** use equivalent but different scenarios for each condition, and randomize or counterbalance method order where feasible.

### 5.4 Session Procedure
1. Explain purpose, duration, and voluntary participation
2. Obtain informed consent; explain data handling
3. Collect only relevant, minimal participant information
4. Run manual scenario; record performance
5. Run Singto scenario; record performance
6. SUS questionnaire
7. TAM questionnaire
8. Short interview (difficulties, useful features, improvements)
9. Thank participant; store results under a pseudonymous ID

Target: **≥ 10 completed sessions**, each covering both conditions. Recruit extras to replace incomplete sessions.

---

## 6. Participants & Session Design

**Recruitment criteria:** age 18+; experience arranging meetings or group activities; can use a supported browser on desktop or mobile; not involved in developing Singto. Mix digitally comfortable and less technical users where feasible.

| Item | Approach |
|---|---|
| Minimum sample | 10 completed sessions |
| Format | Individual moderated usability session |
| Duration | 25–35 min |
| Conditions | Manual vs. Singto-assisted |
| Data | Task logs, observation notes, SUS, TAM, qualitative feedback |
| Privacy | Pseudonymous IDs, minimal personal data |
| Purpose | Exploratory usability and acceptance evaluation |

A sample of 10 is suitable for finding common usability issues and initial feedback, but **not** for broad statistical generalization.

---

## 7. Evaluation Metrics

### 7.1 Task Completion Rate (per method)
$$\text{Completion Rate} = \frac{\text{Tasks Completed Successfully}}{\text{Total Tasks Attempted}} \times 100$$
A task succeeds only if the participant meets its criteria without the evaluator doing it for them.

### 7.2 Task Completion Time
Record seconds from task start to completion. Report median and mean per method.
$$\text{Time Reduction} = \frac{T_{\text{manual}} - T_{\text{Singto}}}{T_{\text{manual}}} \times 100$$
Use the **median** for *T* when the sample is small or times are skewed. A positive value means Singto was faster.

### 7.3 Task Error Rate
Count predefined errors (incorrect availability entries, wrong date selections, failed submissions). Report total errors and errors per participant for each method. Define categories **before** testing and apply them consistently.

### 7.4 System Usability Scale (SUS)
Standard 10-item SUS, 5-point scale (Strongly Disagree → Strongly Agree), completed after using Singto.

**Scoring:** odd items → response − 1; even items → 5 − response; sum × 2.5 → score 0–100.
SUS is a score, **not a percentage**. Report mean and SD (optionally median). ~68 is a common historical reference for average usability; interpretation depends on context.

### 7.5 Technology Acceptance Model (TAM)
5-point agreement scale. Report the mean per construct; higher = more positive.

| Construct | Items |
|---|---|
| **Perceived Usefulness (PU)** | PU1: Singto helps me coordinate group schedules more efficiently. PU2: Singto makes it easier to identify a suitable meeting date. PU3: Singto improves the overall process of arranging group meetings. PU4: Singto is useful for coordinating appointments with multiple participants. |
| **Perceived Ease of Use (PEOU)** | PEOU1: Learning to use Singto is easy for me. PEOU2: The steps required to use Singto are clear and understandable. PEOU3: I find Singto easy to navigate. PEOU4: It is easy for me to complete scheduling tasks using Singto. |
| **Behavioral Intention (BI, optional)** | BI1: I would use Singto for future group scheduling. BI2: I would recommend Singto to people who frequently coordinate group meetings. |

These are project-specific adaptations, not a verbatim validated TAM instrument. For formal publication, use an established instrument and document adaptations.

### 7.6 Qualitative Feedback
1. Which part of Singto was easiest to use?
2. Which part was confusing or difficult?
3. Did the Best Date suggestions help you decide? Why or why not?
4. What would you change to make Singto more useful?
5. Would you use Singto for a real group meeting? Why or why not?

### 7.7 Before-and-After Comparison

| Metric | Manual | Singto | Comparison |
|---|---|---|---|
| Task completion rate | Actual | Actual | Percentage-point difference |
| Median completion time | Actual | Actual | % time reduction |
| Mean errors per participant | Actual | Actual | Absolute difference |
| Assistance requests | Actual | Actual | Absolute difference |
| SUS score | N/A | Actual | vs. usability benchmarks |
| TAM usefulness (PU) | N/A | Actual | Mean PU |
| TAM ease of use (PEOU) | N/A | Actual | Mean PEOU |
| Behavioral intention (BI) | N/A | Actual, if included | Mean BI |

Fill in only after all sessions are complete. **Do not enter assumed results.**

---

## 8. Schedule

Weeks 9–11: testing and Beta Gate · Week 12: real-user validation · Weeks 13–14: improvements and delivery. Fill in calendar dates per the academic schedule.

| Week | Activities | Deliverables |
|---|---|---|
| 9 | Review requirements, confirm scope, prepare test cases and synthetic data, verify environment | Approved test plan and test cases |
| 10 | Unit, integration, and initial system tests; log and prioritize defects | Test execution log, defect list |
| 11 | System regression, verify fixes, internal UAT pilot, Beta Gate review | Regression results, UAT-ready build |
| 12 | Recruit and run ≥ 10 user sessions; collect task, SUS, TAM, interview data | User testing records, questionnaires |
| 13 | Analyze results; prioritize issues; implement feasible improvements | Evaluation report, improvement backlog |
| 14 | Retest critical fixes, finalize documentation and limitations, prepare delivery | Final test report, project handover |

**Per-session timing:** intro and consent 3 min · manual task 5–7 · Singto task 5–7 · SUS + TAM 5–7 · interview 5–8 → **23–32 min total**. Allow buffer for technical issues and note-taking.

---

## 9. Defect Management

### 9.1 Severity

| Severity | Description | Example |
|---|---|---|
| Critical | Core workflow unavailable, or data exposed across users/events | Accessing another event's private availability without authorization |
| High | Major feature gives wrong results or blocks the workflow | Best Date consistently suggests the wrong date |
| Medium | Wrong in limited scenarios, or significant usability problem | Indicators wrong for certain combinations |
| Low | Minor visual/wording/layout issue; task still completable | Unclear or misaligned nonessential label |

### 9.2 Defect Report Fields
ID and title · environment and version · preconditions and steps to reproduce · expected result · actual result · severity and priority · screenshot/log · owner and status · retest result.

### 9.3 Retest & Regression
After a fix, rerun the failed case and related regression tests covering event creation, availability storage, overview calculations, suggestions, and finalization.

---

## 10. Entry & Exit Criteria

**Entry:** test deployment accessible · core functionality available · test accounts and synthetic data ready · requirements and expected results documented · test cases and UAT tasks ready · known limitations recorded.

**Exit:**
- All applicable test cases executed; results and Blocked cases documented
- Critical defects resolved and retested
- High defects resolved, or accepted with documented justification
- ≥ 10 real-user sessions completed
- Manual-vs-Singto results analyzed; SUS and TAM calculated
- Feedback and improvement priorities documented
- Remaining limitations and risks included in the final report

Meeting these criteria supports a readiness decision; it does not guarantee the system is defect-free.

---

## 11. Risks & Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Incomplete features | Some cases can't run | Confirm implementation first; mark Blocked |
| Unstable deployment | Interrupted sessions, lost results | Smoke-test before each session; keep a session log |
| Too few participants | Sample below minimum | Recruit > 10; schedule backups |
| Learning effects | Better performance on the second method | Equivalent scenarios; counterbalance order |
| Inconsistent test data | Results not comparable | Predefined datasets; identical criteria |
| Biased responses | Overly positive feedback | Stress feedback is voluntary and has no consequences |
| Privacy concerns | Data exposure | Synthetic events, pseudonymous IDs, minimal personal data |

---

## 12. Deliverables
1. Approved test plan
2. Functional test case inventory and execution log
3. Defect and retest report
4. UAT task-completion records (≥ 10 sessions)
5. Manual-vs-Singto performance comparison
6. SUS and TAM results
7. Qualitative feedback summary
8. Prioritized improvement recommendations
9. Final testing summary and readiness assessment

---

## 13. Conclusion
Functional, integration, and system testing verify that the implemented workflow behaves correctly; UAT with ≥ 10 real users assesses whether Singto improves scheduling performance and user experience. Combining task results, SUS, TAM, and qualitative feedback lets the team find defects, evaluate practical value, and prioritize improvements.

**Final principle:** Singto should be judged not only on whether its features work, but on whether real users can coordinate group schedules with it accurately, efficiently, and confidently.
