# Before / After – MUST Tasks Usability Evaluation

## Evaluation Conditions

This evaluation compares two ways of organizing the same meetup:

- **Before (Manual):** Organizing a meetup manually through a LINE group chat using messages, LINE Poll, and Notes.
- **After (Singto):** Organizing the same meetup using Singto.

| Condition | Evaluation basis | Data label |
|---|---|---|
| Before (Manual) | Analytical reconstruction of the scripted manual workflow (§2) | ESTIMATED |
| After (Singto) | 10 real users, U01–U10, during UAT (7–17 Nov 2026) | REAL |

**Methodological note:** The Before condition is an analytical estimate based on the steps required to complete the manual workflow. Task durations are calculated using the Keystroke-Level Model (KLM; Card, Moran & Newell, 1980), with additional estimated reading and information-search times. These figures represent a modeled baseline rather than direct user observations. The After condition uses actual observations from 10 Singto UAT participants.

---

## 1. After: Singto Results per MUST Task (n = 10, REAL)

| Task | Success | Partial | Failed | Median time (s) | Mean time (s) | Range (s) | Median discovery (s) | Errors | Help requests |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| T1 Create Event | 10/10 | 0 | 0 | 51 | 53.2 | 23–90 | 2 | 0 | 3 |
| T2 Access Event | 10/10 | 0 | 0 | 3 | 4.3 | 2–11 | 1 | 0 | 1 |
| T3 Submit Availability | 9/10 | 1 | 0 | 10.5 | 17.1 | 5–42 | 3 | 1* | 3 |
| T4 View Overview | 8/10 | 2 | 0 | 5 | 15.2 | 3–100 | 2.5 | 0 | 4 |
| T5 Find Best Date | 10/10 | 0 | 0 | 5 | 13.3 | 2–40 | 3 | 0 | 0 |
| T6 Finalize Date | 10/10 | 0 | 0 | 17.5 | 22.0 | 5–61 | 2 | 0 | 1 |
| **All tasks** | **57/60 (95%)** | **3** | **0** | **≈93 per user** | **≈124 per user** | **70–250** | — | **1** | **12** |

\* The single error came from a Quick Select bug that selected dates outside the organizer's available range. See ISS-01 in `issue-log.md`.

### Notes on the data

- Entries recorded as `<5 s` and `<10 s` (U08–U10) are counted at their upper bounds (5 or 10 seconds), making the results slightly conservative.
- U05's View Overview time was not recorded. T4 statistics therefore use n = 9, and U05's per-user total excludes T4.
- Discovery time is missing for T5 in three sessions, so T5 discovery statistics use n = 7.
- Medians are used as the primary comparison because one outlier (U06, T4 = 100 seconds) substantially increases the mean.
- Raw observations: `data/task-observations.csv`.

---

## 2. Before (Manual): Analytical Baseline (ESTIMATED)

The manual baseline represents a typical scenario in which an organizer coordinates a trip through a LINE group chat.

**Scenario assumptions:**

- One organizer uses a smartphone.
- Four friends participate in the group.
- Four candidate dates are considered.
- All participants' availability replies are already present in the chat.
- The organizer must manually read, interpret, organize, and compare the replies.
- The organizer uses LINE messages, Poll, and Notes where appropriate.

The estimated durations are based on individual interaction steps rather than observed participant performance.

### 2.1 Step timings used

| Operator | Meaning | Estimated time |
|---|---|---:|
| K | Typing one character on a Thai phone keyboard | 0.35 s |
| P | One tap (open chat, select input, send, etc.) | 0.5 s |
| M | Mental preparation or decision-making (KLM standard) | 1.35 s |
| Read | Reading one chat message | ≈4 s |
| Check | Checking one friend × date availability cell | ≈2.55 s |

### 2.2 Estimated time per task

| Task (manual equivalent) | Main activities | Estimated time (s) |
|---|---|---:|
| T1 Post the plan | Open chat, prepare message, type approximately 40 characters, send | ≈18 |
| T2 + T3 Reply with availability | Read the question, prepare response, type approximately 13 characters, send | ≈10 |
| T4 Build the overview | Read 5 messages, check 16 friend × date cells, notice Friend C's correction, write a 4-line summary | ≈87 |
| T5 Find the best date | Compare the availability summary and identify the date with the highest attendance | ≈7 |
| T6 Announce the final date | Prepare and send a final message of approximately 30 characters | ≈13 |
| **End-to-end total** | **All six MUST tasks** | **≈135** |

### 2.3 Limitations of the manual baseline

The estimates are based on a controlled scenario and do not include all difficulties that may occur during real-world coordination.

**Waiting time**

The scenario assumes that all participants have already replied. In actual group coordination, organizers may need to wait hours or days for responses and send reminders to participants who have not replied.

**Increasing group size**

The time required to compile availability increases with the number of participants and candidate dates.

For example, with 8 friends and a 14-day availability period, the organizer may need to inspect 112 friend × date combinations.

Using the same estimated checking time:

112 × 2.55 seconds = 285.6 seconds.

This is approximately 5 minutes of checking alone, excluding reading, correcting, and summarizing information. A practical rounded estimate is approximately 5–6 minutes for the overview task.

By comparison, Singto automatically organizes submitted availability into an overview, so the viewing task does not require manually checking each individual response.

**Potential errors**

The manual workflow relies on the organizer correctly interpreting and remembering messages. Late corrections may be overlooked.

For example, Friend C initially reports availability for 9, 12, and 13 December, then later adds 19 and 20 December. Missing this correction could cause the organizer to select a date with fewer available participants.

---

## 3. Before vs After Comparison

The following comparison uses the analytical manual baseline and the actual Singto UAT median times.

| Task | Before (Manual, ESTIMATED) | After (Singto, REAL median) | Change |
|---|---:|---:|---:|
| T1 Create Event / Post plan | ≈18 s | 51 s | +183% (slower) |
| T2 + T3 Access and submit availability | ≈10 s | 13.5 s | +35% (slower) |
| T4 View Overview / Build overview | ≈87 s | 5 s | −94% |
| T5 Find Best Date | ≈7 s | 5 s | −29% |
| T6 Finalize Date | ≈13 s | 17.5 s | +35% (slower) |
| **End-to-end** | **≈135 s** | **≈93 s** | **≈−31%** |
| T4 at 8 friends × 14 days | ≈5–6 min | ≈5 s | Approximately −98% to −99% |

*Percentage change = (After − Before) / Before × 100%. A negative percentage indicates that Singto is faster.*

### 3.1 Interpretation

The comparison indicates that Singto's primary benefit is reducing the effort required to organize and interpret participants' availability.

**Tasks where manual coordination is faster**

- **T1 Create Event:** The estimated manual process takes approximately 18 seconds, while creating an event in Singto takes a median of 51 seconds. This suggests that completing an event form introduces additional setup time compared with sending a simple chat message.
- **T2 + T3 Access and submit availability:** The combined Singto median is approximately 13.5 seconds, compared with the estimated 10 seconds for the manual equivalent.
- **T6 Finalize Date:** Sending a final message manually is estimated to take 13 seconds, compared with 17.5 seconds in Singto.

**Tasks where Singto provides the greatest benefit**

- **T4 View Overview:** Manual coordination requires reading messages, checking individual availability, and compiling the results. This is estimated to take approximately 87 seconds, compared with a 5-second Singto median.
- **T5 Find Best Date:** Singto presents the availability information in an organized format, reducing the effort needed to identify the date with the highest attendance.

Combined, T4 and T5 take approximately 94 seconds in the estimated manual workflow, compared with approximately 10 seconds in Singto.

**Overall result**

The estimated manual workflow takes approximately 135 seconds, while the Singto workflow takes approximately 93 seconds based on the sum of the task medians.

This represents an estimated reduction of approximately 31% in end-to-end task time.

However, the results should be interpreted as indicative rather than definitive because the Before and After conditions use different evidence sources: an analytical estimate for manual coordination and real-user observations for Singto.

---

## 4. Manual Scenario Script and Baseline Assumptions

This section defines the manual workflow used to construct the estimated baseline.

### 4.1 Scenario setup

The scenario represents a trip planned between **Monday 7 December and Sunday 20 December 2026**.

The organizer is available every day and must identify the date when the greatest number of friends can attend.

The LINE group contains the organizer and four friends.

The following messages represent the availability information available to the organizer:

**Friend A:**

"I'm free 8, 9, 12, 13, 19 and 20 Dec"

**Friend B:**

"Weekdays only 15–16 work for me, plus the 12th and 19th"

**Friend C:**

"Free 9, 12, 13 👍"

**Friend D:**

"10, 13, 14, 19, 20 ok"

**Friend C (later correction):**

"Oh wait, 19 and 20 are fine too"

### 4.2 Answer key

| Date | Friend A | Friend B | Friend C | Friend D | Available |
|---|---|---|---|---|---|
| Sat 12 Dec | ✓ | ✓ | ✓ | – | 3/4 |
| Sun 13 Dec | ✓ | – | ✓ | ✓ | 3/4 |
| Sat 19 Dec | ✓ | ✓ | ✓ | ✓ | **4/4 – Best date** |
| Sun 20 Dec | ✓ | – | ✓ | ✓ | 3/4 |
| Other dates | | | | | ≤2/4 |

**Correct answer: Saturday, 19 December 2026.**

### 4.3 Manual tasks

| Task | Activity | Completion criteria |
|---|---|---|
| T1 Post the plan | Send a message asking the group which dates they are available between 7 and 20 December. | Message is sent |
| T2 + T3 Reply with availability | Read the request and respond with personal availability. | Reply is sent |
| T4 Build the overview | Identify which friends are available on 12, 13, 19, and 20 December. | Availability summary is complete |
| T5 Find the best date | Compare the four candidate dates and select the date with the highest attendance. | Correct date identified |
| T6 Announce the final date | Send a message announcing the selected date. | Announcement is sent |

### 4.4 Baseline calculation rules

The estimated manual task times follow these assumptions:

1. Each interaction is divided into smaller actions, including tapping, typing, reading, and mental preparation.
2. Typing time is calculated using the estimated time per character.
3. Reading time is estimated based on the number of messages.
4. Availability-checking time is calculated using the number of friend × date combinations.
5. The final date is selected by comparing the number of available participants.
6. Waiting time for responses is excluded from the controlled scenario.

These assumptions provide a consistent basis for comparing the manual coordination workflow with Singto.

---

## 5. Recommendations and Future Evaluation

The results suggest that Singto's strongest usability advantage is its ability to reduce the manual work involved in collecting, organizing, and comparing availability.

The following improvements are recommended:

| Area | Observation | Recommendation |
|---|---|---|
| Event creation | Setup takes longer than sending a simple LINE message. | Simplify the event creation form and reduce unnecessary input. |
| Availability submission | One error occurred due to Quick Select selecting dates outside the organizer's range. | Fix the date-selection validation issue (ISS-01). |
| Overview | Singto substantially reduces the time required to compile availability. | Preserve the current overview design and improve its clarity. |
| Date selection | Users can identify the best date quickly. | Maintain clear visual indicators for the date with the highest attendance. |
| Finalization | Sending the final date is slightly slower than manual messaging. | Consider making the final announcement process more direct. |

### Future validation

To strengthen the comparison, the analytical manual baseline can be validated through additional usability sessions.

A future evaluation should:

1. Recruit 3–5 participants from the existing UAT group or recruit new participants.
2. Use the same manual scenario and answer key described in Section 4.
3. Record completion times, task success, errors, and requests for assistance.
4. For existing Singto participants, account for the order effect by conducting the manual condition after the Singto condition.
5. For new participants, alternate the order of the two conditions.
6. Compare the resulting manual observations with the existing Singto UAT dataset.

Once direct manual observations are available, the estimated baseline can be replaced with measured results.

---

## 6. Overall Conclusion

The usability evaluation indicates that Singto can make group meetup scheduling more efficient, particularly when multiple participants and candidate dates are involved.

Although the initial event creation and final announcement steps take slightly longer in Singto than their estimated manual equivalents, Singto significantly reduces the effort involved in organizing participants' availability and identifying the best date.

The estimated end-to-end comparison shows a reduction from approximately 135 seconds in the manual workflow to approximately 93 seconds in Singto, representing an indicative improvement of around 31%.

The most significant improvement is observed in the overview task, where Singto reduces the need for manually reading messages, checking individual availability, and compiling results.

**In conclusion, Singto's main value is not necessarily making every individual action faster, but reducing the coordination and information-processing effort required to organize a group meetup.**

*Evaluation limitation: The manual baseline is estimated, while Singto results are based on real-user UAT observations. Therefore, the comparison demonstrates an indicative usability advantage and should not be interpreted as a controlled experimental measurement of improvement.*