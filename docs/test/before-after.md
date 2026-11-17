# Before / After – MUST Tasks

- **Before** = scheduling the same meetup **manually** in a LINE group chat (messages, LINE Poll, Notes)
- **After** = scheduling it **with Singto**

| Condition | Who was measured | Label |
|---|---|---|
| After (Singto) | 10 real users, U01–U10, during UAT (7–17 Nov 2026) | REAL |
| Before (Manual) | Analytical estimate of the scripted manual scenario (§2) | **ESTIMATED – not measured** |

> **Why the Before baseline is estimated:** The UAT sessions recorded only the Singto condition. The requirement for a manual comparison was confirmed after the sessions had finished, so no manual times were measured. The manual times in §2 are an **analytical estimate**: each manual task is broken into steps and given standard step timings, based on the Keystroke-Level Model (Card, Moran & Newell, 1980). They are not observations of users. §2b (team-measured) and §4 (real users) describe how to replace the estimate with measurements.

## 1. After: Singto results per MUST task (n = 10, REAL)

| Task | Success | Partial | Failed | Median time (s) | Mean time (s) | Range (s) | Median discovery (s) | Errors | Help requests |
|---|---|---|---|---|---|---|---|---|---|
| T1 Create Event | 10/10 | 0 | 0 | 51 | 53.2 | 23–90 | 2 | 0 | 3 |
| T2 Access Event | 10/10 | 0 | 0 | 3 | 4.3 | 2–11 | 1 | 0 | 1 |
| T3 Submit Availability | 9/10 | 1 | 0 | 10.5 | 17.1 | 5–42 | 3 | 1* | 3 |
| T4 View Overview | 8/10 | 2 | 0 | 5 | 15.2 | 3–100 | 2.5 | 0 | 4 |
| T5 Find Best Date | 10/10 | 0 | 0 | 5 | 13.3 | 2–40 | 3 | 0 | 0 |
| T6 Finalize Date | 10/10 | 0 | 0 | 17.5 | 22.0 | 5–61 | 2 | 0 | 1 |
| **All tasks** | **57/60 (95%)** | **3** | **0** | **≈ 93 per user** | **≈ 124 per user** | 70–250 | — | **1** | **12** |

\* The single error came from a Quick Select bug (selected dates outside the organizer's range). See ISS-01 in [issue-log.md](issue-log.md).

**Notes on the data**
- `<5 s` and `<10 s` entries (U08–U10) are counted at their upper bound (5 or 10 s), so these figures are slightly pessimistic.
- U05's View Overview time was not recorded. The T4 statistics use n = 9, and U05's per-user total excludes T4.
- Discovery time is missing for T5 in 3 sessions, so T5 discovery uses n = 7.
- Medians are the headline figure because one outlier (U06, T4 = 100 s) skews the mean.
- Raw data: [data/task-observations.csv](data/task-observations.csv).

## 2. Before (Manual): analytical estimate – ESTIMATED, not measured

These estimates are for the scripted manual scenario in §3 (organizer on a phone, 4 friends, 4 candidate dates, everyone's replies already in the chat).

**Step timings used**

| Operator | Meaning | Time |
|---|---|---|
| K | Typing one character on a phone keyboard (Thai) | 0.35 s |
| P | One tap (open chat, tap input, send) | 0.5 s |
| M | Mental preparation (deciding what to do or write) | 1.35 s (KLM standard) |
| Read | Reading one chat message | ≈ 4 s |
| Check | Looking up one friend × date cell in the chat | M + 1.2 s ≈ 2.55 s |

**Estimate per task**

| Task (manual equivalent) | Steps | Estimated time (s) |
|---|---|---|
| T1 Post the plan in chat | 2 taps, 2 M, type ≈ 40 characters, send | ≈ 18 |
| T2+T3 Reply with own availability | Read question, M, type ≈ 13 characters, 2 taps | ≈ 10 |
| T4 Build the overview (who is free on which date) | Read 5 messages, check 16 friend × date cells, notice Friend C's correction (≈ 5 s), write a 4-line list (≈ 60 characters) | ≈ 87 |
| T5 Find the best date | Scan the list, 2 M | ≈ 7 |
| T6 Announce the final date | Tap, M, type ≈ 30 characters, send | ≈ 13 |
| **End-to-end** | | **≈ 134** |

**What the estimate leaves out (so it favours manual)**
- **Waiting time.** In the script, all replies are already in the chat. In real life, the organizer waits hours or days and chases people who haven't replied. Singto removes the need to compile the replies, but not the wait.
- **Scaling.** T4 grows with *friends × dates*. With 8 friends and a 14-day period (112 cells), the same model gives **≈ 6 min** for T4 alone. Singto's Overview takes the same few seconds regardless of group size.
- **Errors.** The model assumes no mistakes. Friend C's late correction ("19 and 20 are fine too") is easy to miss. Missing it removes the only 4/4 date, so the organizer would pick a 3/4 date instead.

## 2b. Before (Manual) results – TEAM-measured (optional, replaces §2 when collected)

Fill in one row per team member after running the scenario in §3. Record the time in seconds. Completion is S (Success), P (Partial) or F (Failed).

| Tester | Date | T1 Post plan | T2+T3 Reply availability | T4 Build overview | T5 Find best date | T6 Announce final | Total (s) | Errors | Correct best date? |
|---|---|---|---|---|---|---|---|---|---|
| TEAM-01 | | s / S | s / S | s / S | s / S | s / S | | | Y / N |
| TEAM-02 | | | | | | | | | |
| TEAM-03 | | | | | | | | | |
| TEAM-04 | | | | | | | | | |

## 2c. Before vs After comparison

| Task | Before (Manual, **ESTIMATED**) | After (Singto, REAL median) | Change |
|---|---|---|---|
| T1 Create Event | ≈ 18 s | 51 s | **+183%** (slower) |
| T2 + T3 Access & submit availability | ≈ 10 s | 13.5 s (3 + 10.5) | +35% (slower) |
| T4 View Overview | ≈ 87 s | 5 s | **−94%** |
| T5 Find Best Date | ≈ 7 s | 5 s | −29% |
| T6 Finalize Date | ≈ 13 s | 17.5 s | +35% (slower) |
| **End-to-end** | **≈ 134 s** | **≈ 93 s** | **≈ −31%** |
| T4 at 8 friends × 14 days | ≈ 6 min | ≈ 5 s (independent of group size) | ≈ −99% |

*Change* = (After − Before) / Before × 100%. A negative change means Singto is faster.

**Reading the comparison.** Singto is *slower* to set up (T1), because filling in a form takes longer than typing one chat message. Its gain is in the work that grows with group size: compiling everyone's availability and finding the common date (T4 + T5 ≈ 94 s → ≈ 10 s). The comparison mixes an estimate with measurements, so treat the percentages as indicative, not exact.

## 3. Manual scenario script (TEAM baseline)

About 10 minutes per tester. You need one facilitator with a stopwatch and one tester. The tester must not be the person who wrote this script.

**Setup.** Create a LINE group containing the tester and the facilitator. Before starting, the facilitator pastes the four "friend" messages below into the group, **in this order**. These are the same as the Singto scenario: a trip within **Mon 7 – Sun 20 Dec 2026**, and the organizer is free every day.

> **Friend A:** I'm free 8, 9, 12, 13, 19 and 20 Dec
> **Friend B:** weekdays only 15–16 work for me, plus the 12th and 19th
> **Friend C:** free 9, 12, 13 👍
> **Friend D:** 10, 13, 14, 19, 20 ok
> **Friend C:** oh wait, 19 and 20 are fine too

**Answer key (for the facilitator only):**

| Date | A | B | C | D | Free |
|---|---|---|---|---|---|
| Sat 12 Dec | ✓ | ✓ | ✓ | – | 3/4 |
| Sun 13 Dec | ✓ | – | ✓ | ✓ | 3/4 |
| **Sat 19 Dec** | ✓ | ✓ | ✓ | ✓ | **4/4 ← best date** |
| Sun 20 Dec | ✓ | – | ✓ | ✓ | 3/4 |
| Other dates | | | | | ≤ 2/4 |

**Tasks.** Give the tester one task at a time. Start the timer when the task is given and stop it when the "done" condition is met.

| Task | Prompt to the tester | Done when |
|---|---|---|
| T1 | "Post a message asking the group which days they're free between 7 and 20 Dec." | Message is sent |
| T2+T3 | "Reply with your own availability. You are free every day." | Reply is sent |
| T4 | "Write down which friends are free on 12, 13, 19 and 20 Dec." | List is complete. Each wrong ✓/– cell counts as 1 error |
| T5 | "Which day should the trip be?" | Tester names a date. **Success = 19 Dec**, any other date = Failed |
| T6 | "Announce the final date to the group." | Announcement is sent |

**Recording rules.** Use the same rules as UAT: give no hints, count every help request, and record a task as Failed (with its time) if the tester gives up.

## 4. Ready-to-run plan: manual baseline with real users

Before the final presentation, rerun §3 with real users so the comparison is REAL vs REAL.

1. Invite 3–5 of U01–U10 (or new participants coded U11+). Each session is a 10-minute LINE call.
2. Run the same script and answer key as §3.
3. Because these users have already used Singto, record the order as *Singto → Manual*. New participants should alternate the order.
4. Add the rows to [data/task-observations.csv](data/task-observations.csv) with a `condition` column (`manual` / `singto`), then replace the TEAM column in §2 with these results.
