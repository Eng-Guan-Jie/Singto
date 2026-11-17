# Issue Log – Singto UAT

Repository: [Eng-Guan-Jie/Singto](https://github.com/Eng-Guan-Jie/Singto). Commit hashes link to the fix on `main`.

**Severity scale**

| Severity | Meaning |
|---|---|
| Critical | Blocks a MUST task or corrupts data. No workaround |
| High | Causes wrong results or Partial/Failed tasks for several users |
| Medium | Causes confusion, extra steps or help requests, but users can recover |
| Low | Cosmetic issue or minor friction |

**Status:** `Fixed` · `Partly fixed` · `Fixed – commit not identified` · `Open` · `Won't fix`
**Retest:** `Pass` · `Fail` · `Pending` (fixed, not yet retested) · `—` (not fixed yet)

## Summary (as of 18 Nov 2026)

| Status | Count | Issues |
|---|---|---|
| Fixed, with commit | 2 | ISS-03, ISS-14 |
| Partly fixed, with commit | 1 | ISS-12 |
| Fixed per facilitator notes, commit not identified | 2 | ISS-01, ISS-02 |
| Open | 9 | ISS-04 – ISS-11, ISS-13 |
| **Total** | **14** | 0 Critical · 4 High · 6 Medium · 4 Low |

## 1. Defects and usability issues

| ID | Issue | Task | Users affected | Severity | Status | Fix commit | Retest |
|---|---|---|---|---|---|---|---|
| ISS-01 | **Quick Select also selects dates outside the organizer's date range** | T3 | U08 | High | Fixed – commit not identified | ⚠️ see note A | Pending |
| ISS-02 | **Calendar dates don't look tappable.** Users didn't realise they could select dates (no affordance) | T3 | U06 (Partial) | High | Fixed – commit not identified | ⚠️ see note B | Pending |
| ISS-03 | **The meaning of yellow is unclear.** The legend doesn't explain the in-between state | T4 | U03, U04, U05, U09, U10 (5/10) | High | Fixed | [`05b7b57`](https://github.com/Eng-Guan-Jie/Singto/commit/05b7b57) Explain each calendar colour in the legend | Pending |
| ISS-04 | **The Availability Overview doesn't update in real time.** The organizer must reopen or refresh to see new submissions | T4 | U04, U05, U08 (3/10) | High | Open | — | — |
| ISS-05 | **The "Schedule period" / start–end date label is misread** as the fixed dates of the meetup instead of the range to poll | T1 | U02, U04, U05, U08 (4/10) | Medium | Open | — | — |
| ISS-06 | **No easy way back to the full overview** after opening a day's details or applying the Best Date filter (no back button, tapping the date again does nothing) | T4, T5 | U02, U06 | Medium | Open | — | — |
| ISS-07 | **Single-day vs multi-day choice at Finalize is confusing.** Users suggest moving it to Create Event | T6 | U08, U09 | Medium | Open | — | — |
| ISS-08 | **Reminder before the event day is not sent.** It was in the design but missed in implementation | T6 | U03 | Medium | Open | — | — |
| ISS-09 | **A withdrawal after finalization is not announced in LINE.** The count drops in the app only | T6 | U03 | Medium | Open | — (see note C) | — |
| ISS-10 | **LIFF load time of about 3–5 s, with a laggy feel** | T1, T2 | U01, U04, U05, U07, U09 (5/10) | Medium | Open | — | — |
| ISS-11 | **Unclear next step after selecting availability** (no clear "Submit / Done" cue) | T3 | U07 | Low | Open | — | — |
| ISS-12 | **The event entry point is hard to find.** The user asked where to tap, and older events get buried in the chat | T2 | U07, U08 | Low | Partly fixed | [`34e82e3`](https://github.com/Eng-Guan-Jie/Singto/commit/34e82e3) Add on-going and archived events to the profile menu | Pending |
| ISS-13 | **The "Quick Select" label is not self-explanatory** | T3 | U03 | Low | Open | — | — |
| ISS-14 | **The final-date LINE message shows only the attendee count**, not who is going | T6 | U03 | Low | Fixed | [`2b903fa`](https://github.com/Eng-Guan-Jie/Singto/commit/2b903fa) Show who joins and who declined on the confirmed card and a details page · [`7a36489`](https://github.com/Eng-Guan-Jie/Singto/commit/7a36489) Redesign the confirmed card with joined and declined panels | Pending |

### Notes on fix commits

- **A – ISS-01:** The UAT sheet marks this as fixed, but no commit after the 15 Nov session touches Quick Select. The range check in `handleQuickSelect` (`src/pages/Overview/Overview.jsx`) dates from [`e1ce773`](https://github.com/Eng-Guan-Jie/Singto/commit/e1ce773) on 6 Oct. Possible explanations: the fix is uncommitted or on another machine, or the build used in the session was older than `main`. **Ask the developer, then fill in the hash or change the status to Open.**
- **B – ISS-02:** Marked as fixed on the UAT sheet. The closest commit, [`f5e0ca2`](https://github.com/Eng-Guan-Jie/Singto/commit/f5e0ca2) "Show grey days until someone responds" on 4 Nov, comes **before** the 12 Nov session, so it may not be the fix. **Confirm with the developer.**
- **C – ISS-09:** [`2b903fa`](https://github.com/Eng-Guan-Jie/Singto/commit/2b903fa) now lists decliners on the confirmed card. However, LINE messages are pushed only on invitation and confirmation (`sendInvitation`, `sendConfirmation`), so a later withdrawal is still not announced.
- **ISS-03:** U10's session was on 17 Nov, the same day as the fix, and still raised the issue. It probably ran on the build before `05b7b57` was deployed.

### Suggested fixes for open issues

| ID | Suggested fix |
|---|---|
| ISS-04 | Refetch on window focus and every N seconds, or subscribe to changes |
| ISS-05 | Rename to "Dates to choose from" or "Poll date range", with helper text: *"Friends will pick the days they're free within this range."* |
| ISS-06 | Tapping the selected date again resets to the full overview, plus an explicit "← Back to overview" / "Clear filter" button |
| ISS-07 | Ask "Is this a one-day or multi-day plan?" in Create Event |
| ISS-08 | Scheduled push to the group the day before the finalized date |
| ISS-09 | Push a short update to the group (or refresh the confirmed card) when someone changes from joined to declined |
| ISS-10 | Profile the LIFF init and first API call, add a skeleton loader, and defer non-critical requests |
| ISS-11 | Sticky "Submit availability" button with a confirmation toast |
| ISS-13 | Rename to "Select all / Weekends / Every …" or add a one-line hint |

## 2. Enhancement requests (backlog)

| ID | Request | Users | Priority | Status |
|---|---|---|---|---|
| ENH-01 | Voting / finalize-by deadline, so participants know when the organizer will lock the date | U01, U03 | Should | Open |
| ENH-02 | Show **who** is free on each date (to participants as well as the organizer) | U03 | Should | Partly done: who joined/declined is shown for the confirmed date ([`2b903fa`](https://github.com/Eng-Guan-Jie/Singto/commit/2b903fa)). Per-date "who is free" is not yet shown |
| ENH-03 | Best Date summary on the participant view | U05 | Should | Done: [`b5aedde`](https://github.com/Eng-Guan-Jie/Singto/commit/b5aedde) Show Best Date to participants |
| ENH-04 | "Cancel attendance" after a date is finalized | U02, U03 | Should | Open |
| ENH-05 | Thai language UI | U04 | Should | Done: [`b083245`](https://github.com/Eng-Guan-Jie/Singto/commit/b083245) Add Thai language following the LINE app setting · [`3e36aee`](https://github.com/Eng-Guan-Jie/Singto/commit/3e36aee) Add TH/EN language switch (9 Nov, after U04's 7 Nov session) |
| ENH-06 | "Maybe" availability option | U05 | Could | Open |
| ENH-07 | Google Calendar sync / integration | U02, U09 | Could | Open |
| ENH-08 | "Clear all selections" button | U10 | Could | Open |
| ENH-09 | Attach a link or image to an event | U01 | Could | Open |
| ENH-10 | More descriptive product name | U01 | Won't (this iteration) | Consider a tagline instead |

## 3. Retest log

Run each scenario on the current production build, then fill in the date, tester and result. Each takes about 2 minutes.

| Issue | Scenario | Expected | Date | Tester | Result |
|---|---|---|---|---|---|
| ISS-01 | Organizer sets a 7-day range in the middle of a month. Participant taps Quick Select → All Day, then Weekends | Only dates inside the range are selected | | | Not run yet |
| ISS-02 | A person who hasn't seen Singto opens a new event as a participant | Selects a date without help, within 10 s | | | Not run yet |
| ISS-03 | Open the Overview with at least one partly-available date | The legend explains green, yellow and red in words | | | Not run yet |
| ISS-12 | Create two events in the same group, then open the profile menu | Both events are listed under on-going | | | Not run yet |
| ISS-14 | Finalize a date with 2 joined and 1 declined | The LINE confirmed card shows who joined and who declined | | | Not run yet |
| ENH-03 | Open the event as a participant after 3 people have responded | Best Date summary is visible | | | Not run yet |
| ENH-05 | Switch the LINE app language to Thai, then use the TH/EN toggle | UI follows the LINE language and the toggle switches it | | | Not run yet |
