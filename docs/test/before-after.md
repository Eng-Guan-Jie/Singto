# Before / After – MUST Tasks

- **Before** = scheduling the same meetup **manually** in a LINE group chat (messages, polls, notes)
- **After** = scheduling it **with Singto**

> ⚠️ **Status: the "Before" (manual) baseline was not recorded during UAT.** The session sheets only contain Singto measurements. The "Before" columns below are left as `TBD` and must be filled in before submission. See [§3](#3-how-to-collect-the-before-baseline).

## 1. After: Singto results per MUST task (n = 10)

| Task | Success | Partial | Failed | Median time (s) | Mean time (s) | Range (s) | Median discovery (s) | Errors | Help requests |
|---|---|---|---|---|---|---|---|---|---|
| T1 Create Event | 10/10 | 0 | 0 | 51 | 53.2 | 23–90 | 2 | 0 | 3 |
| T2 Access Event | 10/10 | 0 | 0 | 3 | 4.3 | 2–11 | 1 | 0 | 1 |
| T3 Submit Availability | 9/10 | 1 | 0 | 10.5 | 17.1 | 5–42 | 3 | 1* | 3 |
| T4 View Overview | 8/10 | 2 | 0 | 5 | 15.2 | 3–100 | 2.5 | 0 | 4 |
| T5 Find Best Date | 10/10 | 0 | 0 | 5 | 13.3 | 2–40 | 3 | 0 | 0 |
| T6 Finalize Date | 10/10 | 0 | 0 | 17.5 | 22.0 | 5–61 | 2 | 0 | 1 |
| **All tasks** | **57/60 (95%)** | **3** | **0** | **≈ 93 per user** | **≈ 124 per user** | 70–250 | — | **1** | **12** |

\* The single error came from a Quick Select bug (selected dates outside the organizer's range). The bug is now fixed. See ISS-01 in [issue-log.md](issue-log.md).

**Notes on the data**
- `<5 s` and `<10 s` entries (U08–U10) are counted at their upper bound (5 or 10 s), so these figures are slightly pessimistic.
- U05's View Overview time was not recorded. The T4 statistics use n = 9, and U05's per-user total excludes T4.
- Discovery time is missing for T5 in 3 sessions, so T5 discovery uses n = 7.
- Medians are the headline figure because one outlier (U06, T4 = 100 s) skews the mean.

## 2. Before vs After comparison (fill in once the manual baseline is collected)

| Task (manual equivalent) | Metric | Before (Manual) | After (Singto) | Change |
|---|---|---|---|---|
| T1 Create Event (post the plan and date range in chat) | Success rate | TBD | 100% | TBD |
| | Median time (s) | TBD | 51 | TBD |
| | Help requests | TBD | 3 | TBD |
| T2 + T3 Access & submit availability (reply in chat / vote in a LINE poll) | Success rate | TBD | 95% | TBD |
| | Median time (s) | TBD | 3 + 10.5 | TBD |
| | Errors | TBD | 1 | TBD |
| T4 View Overview (read back through the chat to see who is free) | Success rate | TBD | 80% | TBD |
| | Median time (s) | TBD | 5 | TBD |
| | Errors (wrongly read availability) | TBD | 0 | TBD |
| T5 Find Best Date (work out the common free date by hand) | Success rate | TBD | 100% | TBD |
| | Median time (s) | TBD | 5 | TBD |
| | Errors (wrong date picked) | TBD | 0 | TBD |
| T6 Finalize Date (announce the date in chat) | Success rate | TBD | 100% | TBD |
| | Median time (s) | TBD | 17.5 | TBD |
| **End-to-end** | Median total time (s) | TBD | ≈ 93 | TBD |

## 3. How to collect the "Before" baseline

Ready-to-run protocol (about 10 minutes per user). It can be run with the same U01–U10 participants, or with new participants coded U11+.

1. Create a LINE group with the participant and 3–4 team members who play "friends" with **scripted availability** (the same availability used in the Singto scenario).
2. Give the same scenario: *"Arrange a trip for this group within the period X–Y."*
3. The participant uses **only LINE chat features** (messages, LINE Poll, Notes, Album).
4. Time and record the same metrics per task as in [test-plan.md](test-plan.md) §6.1.
   - **Success** for T5 = the participant names the date that the scripted availability makes objectively best.
   - **Error** = a wrong date is chosen, or someone's availability is misread.
5. **Counterbalance the order:** half the participants do Manual → Singto, half do Singto → Manual, to cancel out learning effects.
6. Add rows to [data/task-observations.csv](data/task-observations.csv) with a `condition` column (`manual` / `singto`), then fill in §2.
